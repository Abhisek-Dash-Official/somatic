import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Subscription from "@/models/Subscription";
import SubscriptionPlan from "@/models/SubscriptionPlan";
import SystemSetting from "@/models/SystemSetting";
import ChatConversation from "@/models/ChatConversation";
import ChatMessage from "@/models/ChatMessage";
import AiUsage from "@/models/AiUsage";

const PYTHON_BACKEND_URL =
  process.env.PYTHON_BACKEND_URL || "http://localhost:8000";

const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (!INTERNAL_API_SECRET) {
      console.error("INTERNAL_API_SECRET is missing.");
      return NextResponse.json(
        { error: "AI service configuration error." },
        { status: 500 },
      );
    }

    await connectDB();

    const body = await req.json();

    const message = typeof body.message === "string" ? body.message.trim() : "";

    const conversationId =
      typeof body.conversation_id === "string" ? body.conversation_id : null;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 },
      );
    }

    if (message.length > 5000) {
      return NextResponse.json(
        { error: "Message is too long." },
        { status: 400 },
      );
    }

    const subscription = await Subscription.findOne({
      user_id: session.user.id,
      status: "active",
      end_date: { $gt: new Date() },
    })
      .sort({ end_date: -1 })
      .lean();

    if (!subscription) {
      return NextResponse.json(
        {
          error: "An active SOMATIC subscription is required to use SOMA AI.",
        },
        { status: 403 },
      );
    }

    const plan = await SubscriptionPlan.findById(subscription.plan_id)
      .select("supported_features")
      .lean();

    if (!plan?.supported_features?.includes("soma_ai")) {
      return NextResponse.json(
        {
          error: "Your current subscription does not include SOMA AI.",
        },
        { status: 403 },
      );
    }

    const remainingTokens = Math.max(
      Number(subscription.token_limit || 0) -
        Number(subscription.tokens_used || 0),
      0,
    );

    if (remainingTokens <= 0) {
      return NextResponse.json(
        {
          error:
            "Your SOMA AI token limit has been exhausted. Please renew your subscription.",
        },
        { status: 403 },
      );
    }

    let conversation;

    if (conversationId) {
      conversation = await ChatConversation.findOne({
        _id: conversationId,
        user_id: session.user.id,
        is_archived: false,
      });

      if (!conversation) {
        return NextResponse.json(
          { error: "Conversation not found." },
          { status: 404 },
        );
      }
    } else {
      conversation = await ChatConversation.create({
        user_id: session.user.id,
        title: message.length > 60 ? `${message.slice(0, 57)}...` : message,
        summary: "",
        last_message_at: new Date(),
      });
    }

    const recentMessages = await ChatMessage.find({
      conversation_id: conversation._id,
      user_id: session.user.id,
    })
      .sort({ created_at: -1 })
      .limit(20)
      .lean();

    recentMessages.reverse();

    await ChatMessage.create({
      conversation_id: conversation._id,
      user_id: session.user.id,
      role: "user",
      content: message,
    });

    const settings = await SystemSetting.findOne({})
      .select("ai_model_config")
      .lean();

    const model =
      settings?.ai_model_config?.current_model || "openai/gpt-oss-120b";

    const systemPrompt = settings?.ai_model_config?.system_prompt?.trim() || "";

    const messagesForAI = [
      ...recentMessages.map((item) => ({
        role: item.role,
        content: item.content,
      })),
      {
        role: "user",
        content: message,
      },
    ];

    const pythonResponse = await fetch(`${PYTHON_BACKEND_URL}/api/soma-chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": INTERNAL_API_SECRET,
      },
      body: JSON.stringify({
        messages: messagesForAI,
        conversation_summary: conversation.summary || "",
        ai_model_override: model,
        custom_system_prompt: systemPrompt || null,
      }),
      cache: "no-store",
    });

    if (!pythonResponse.ok || !pythonResponse.body) {
      const errorText = await pythonResponse.text();

      console.error("SOMA Python service error:", errorText);

      return NextResponse.json(
        { error: "SOMA AI service is currently unavailable." },
        { status: 502 },
      );
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    let assistantContent = "";
    let usageData: {
      ai_model: string;
      tokens_prompt: number;
      tokens_completion: number;
      tokens_total: number;
      response_time_sec: number;
      conversation_summary: string;
    } | null = null;

    const stream = new ReadableStream({
      async start(controller) {
        const reader = pythonResponse.body!.getReader();
        let buffer = "";

        const processEvent = (event: any) => {
          if (event.type === "delta") {
            assistantContent += event.content || "";
          }

          if (event.type === "done") {
            usageData = {
              ai_model: event.ai_model || model,
              tokens_prompt: Number(event.tokens_prompt || 0),
              tokens_completion: Number(event.tokens_completion || 0),
              tokens_total: Number(event.tokens_total || 0),
              response_time_sec: Number(event.response_time_sec || 0),
              conversation_summary:
                typeof event.conversation_summary === "string"
                  ? event.conversation_summary.trim()
                  : "",
            };
          }

          if (event.type === "error") {
            console.error("SOMA AI stream error:", event.message);
          }

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
          );
        };

        try {
          while (true) {
            const { value, done } = await reader.read();

            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;

              const raw = line.slice(6).trim();

              if (!raw) continue;

              try {
                processEvent(JSON.parse(raw));
              } catch (error) {
                console.error("Invalid SOMA SSE event:", error);
              }
            }
          }

          buffer += decoder.decode();

          if (buffer.startsWith("data: ")) {
            const raw = buffer.slice(6).trim();

            if (raw) {
              try {
                processEvent(JSON.parse(raw));
              } catch (error) {
                console.error("Invalid final SOMA SSE event:", error);
              }
            }
          }

          if (assistantContent.trim()) {
            await ChatMessage.create({
              conversation_id: conversation._id,
              user_id: session.user.id,
              role: "assistant",
              content: assistantContent.trim(),
            });
          }

          if (usageData) {
            const summary = usageData.conversation_summary;

            if (summary) {
              conversation.summary = summary;
            }

            conversation.last_message_at = new Date();
            await conversation.save();

            await AiUsage.create({
              user_id: session.user.id,
              subscription_id: subscription._id,
              feature: "soma_ai",
              ai_model: usageData.ai_model,
              tokens_prompt: usageData.tokens_prompt,
              tokens_completion: usageData.tokens_completion,
              tokens_total: usageData.tokens_total,
              response_time_sec: usageData.response_time_sec,
              reference_id: conversation._id,
            });

            if (usageData.tokens_total > 0) {
              await Subscription.updateOne(
                {
                  _id: subscription._id,
                  user_id: session.user.id,
                },
                {
                  $inc: {
                    tokens_used: usageData.tokens_total,
                  },
                },
              );
            }
          } else {
            await ChatConversation.updateOne(
              {
                _id: conversation._id,
                user_id: session.user.id,
              },
              {
                $set: {
                  last_message_at: new Date(),
                },
              },
            );
          }

          controller.close();
        } catch (error) {
          console.error("SOMA stream processing error:", error);

          try {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "error",
                  message:
                    "Something went wrong while processing the response.",
                })}\n\n`,
              ),
            );
            controller.close();
          } catch {
            controller.error(error);
          }
        } finally {
          reader.releaseLock();
        }
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
        "X-Conversation-Id": conversation._id.toString(),
      },
    });
  } catch (error) {
    console.error("SOMA chat API error:", error);

    return NextResponse.json(
      { error: "Failed to process SOMA AI request." },
      { status: 500 },
    );
  }
}
