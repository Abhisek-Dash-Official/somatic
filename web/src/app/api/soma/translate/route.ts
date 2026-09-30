import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Subscription from "@/models/Subscription";
import SubscriptionPlan from "@/models/SubscriptionPlan";
import SystemSetting from "@/models/SystemSetting";
import AiUsage from "@/models/AiUsage";
import ChatConversation from "@/models/ChatConversation";
import ChatMessage from "@/models/ChatMessage";

const PYTHON_BACKEND_URL =
  process.env.PYTHON_BACKEND_URL || "http://localhost:8000";
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    if (!INTERNAL_API_SECRET) {
      console.error("INTERNAL_API_SECRET is missing.");
      return NextResponse.json(
        { error: "AI service configuration error." },
        { status: 500 },
      );
    }

    await connectDB();

    const body = await req.json();
    const text = typeof body.text === "string" ? body.text.trim() : "";
    const targetLanguage =
      typeof body.target_language === "string"
        ? body.target_language.trim()
        : "";
    const conversationId =
      typeof body.conversation_id === "string" ? body.conversation_id : null;

    if (!text)
      return NextResponse.json({ error: "Text is required." }, { status: 400 });
    if (!targetLanguage)
      return NextResponse.json(
        { error: "Target language is required." },
        { status: 400 },
      );
    if (text.length > 5000)
      return NextResponse.json({ error: "Text is too long." }, { status: 400 });
    if (targetLanguage.length > 50)
      return NextResponse.json(
        { error: "Invalid target language." },
        { status: 400 },
      );
    if (conversationId && !/^[0-9a-fA-F]{24}$/.test(conversationId))
      return NextResponse.json(
        { error: "Invalid conversation ID." },
        { status: 400 },
      );

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
          error:
            "An active SOMATIC subscription is required to use SOMA AI Translation.",
        },
        { status: 403 },
      );
    }

    const plan = await SubscriptionPlan.findById(subscription.plan_id)
      .select("supported_features")
      .lean();

    if (!plan?.supported_features?.includes("soma_ai_translation")) {
      return NextResponse.json(
        {
          error:
            "Your current subscription does not include SOMA AI Translation.",
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

    let conversation = null;

    if (conversationId) {
      conversation = await ChatConversation.findOne({
        _id: conversationId,
        user_id: session.user.id,
        is_archived: false,
      });

      if (!conversation)
        return NextResponse.json(
          { error: "Conversation not found." },
          { status: 404 },
        );

      const isTranslationConversation =
        conversation.summary?.startsWith("[translation]") ||
        conversation.title?.startsWith("Translate to ");

      if (!isTranslationConversation) {
        return NextResponse.json(
          { error: "This conversation cannot be used for translation." },
          { status: 400 },
        );
      }
    }

    const settings = await SystemSetting.findOne({})
      .select("ai_model_config")
      .lean();
    const model =
      settings?.ai_model_config?.current_model || "openai/gpt-oss-120b";

    const pythonResponse = await fetch(
      `${PYTHON_BACKEND_URL}/api/translate-batch`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-secret": INTERNAL_API_SECRET,
        },
        body: JSON.stringify({
          texts: { text },
          target_language: targetLanguage,
          ai_model_override: model,
        }),
        cache: "no-store",
      },
    );

    if (!pythonResponse.ok) {
      const errorText = await pythonResponse.text();
      console.error("SOMA translation Python service error:", errorText);
      return NextResponse.json(
        { error: "SOMA AI translation service is currently unavailable." },
        { status: 502 },
      );
    }

    const translatedData = await pythonResponse.json();
    const translatedText =
      typeof translatedData.text === "string"
        ? translatedData.text.trim()
        : typeof translatedData.translated_text === "string"
          ? translatedData.translated_text.trim()
          : "";

    if (!translatedText)
      return NextResponse.json(
        { error: "Translation could not be generated." },
        { status: 502 },
      );

    const tokensPrompt = Number(translatedData.tokens_prompt || 0);
    const tokensCompletion = Number(translatedData.tokens_completion || 0);
    const tokensTotal = Number(translatedData.tokens_total || 0);
    const responseTimeSec = Number(translatedData.response_time_sec || 0);

    if (!conversation) {
      conversation = await ChatConversation.create({
        user_id: session.user.id,
        title:
          text.length > 60
            ? `Translate to ${targetLanguage}: ${text.slice(0, 40)}...`
            : `Translate to ${targetLanguage}: ${text}`,
        summary: `[translation] ${targetLanguage}`,
        last_message_at: new Date(),
      });
    }

    await ChatMessage.create({
      conversation_id: conversation._id,
      user_id: session.user.id,
      role: "user",
      content: `[Translate to ${targetLanguage}]\n\n${text}`,
    });

    await ChatMessage.create({
      conversation_id: conversation._id,
      user_id: session.user.id,
      role: "assistant",
      content: translatedText,
    });

    conversation.last_message_at = new Date();
    await conversation.save();

    await AiUsage.create({
      user_id: session.user.id,
      subscription_id: subscription._id,
      feature: "soma_ai_translation",
      ai_model: translatedData.ai_model || model,
      tokens_prompt: tokensPrompt,
      tokens_completion: tokensCompletion,
      tokens_total: tokensTotal,
      response_time_sec: responseTimeSec,
      reference_id: conversation._id,
    });

    if (tokensTotal > 0) {
      await Subscription.updateOne(
        { _id: subscription._id, user_id: session.user.id },
        { $inc: { tokens_used: tokensTotal } },
      );
    }

    return NextResponse.json(
      {
        translated_text: translatedText,
        target_language: targetLanguage,
        ai_model: translatedData.ai_model || model,
        tokens_prompt: tokensPrompt,
        tokens_completion: tokensCompletion,
        tokens_total: tokensTotal,
        response_time_sec: responseTimeSec,
      },
      { headers: { "X-Conversation-Id": conversation._id.toString() } },
    );
  } catch (error) {
    console.error("SOMA translation API error:", error);
    return NextResponse.json(
      { error: "Failed to process SOMA AI translation." },
      { status: 500 },
    );
  }
}
