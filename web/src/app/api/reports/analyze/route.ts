import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Subscription from "@/models/Subscription";
import SubscriptionPlan from "@/models/SubscriptionPlan";
import SystemSetting from "@/models/SystemSetting";
import AiUsage from "@/models/AiUsage";

const PYTHON_BACKEND_URL =
  process.env.PYTHON_BACKEND_URL || "http://localhost:8000";
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET;

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (!INTERNAL_API_SECRET) {
      console.error("[REPORT] INTERNAL_API_SECRET is missing.");
      return NextResponse.json(
        { error: "AI service configuration error." },
        { status: 500 },
      );
    }

    await connectDB();

    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "A medical report file is required." },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: "Only PDF, JPEG, PNG, and WebP medical reports are supported.",
        },
        { status: 400 },
      );
    }

    if (file.size <= 0) {
      return NextResponse.json(
        { error: "The uploaded file is empty." },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "The report must be smaller than 20 MB." },
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
          error:
            "An active SOMATIC subscription is required to analyze medical reports.",
        },
        { status: 403 },
      );
    }

    const plan = await SubscriptionPlan.findById(subscription.plan_id)
      .select("supported_features is_active")
      .lean();

    if (!plan) {
      return NextResponse.json(
        { error: "Subscription plan not found." },
        { status: 403 },
      );
    }

    if (!plan.is_active) {
      return NextResponse.json(
        { error: "Your subscription plan is currently inactive." },
        { status: 403 },
      );
    }

    const supportsReportAnalysis = (plan.supported_features || []).some(
      (feature: string) => feature.toLowerCase() === "medical_report_analysis",
    );

    if (!supportsReportAnalysis) {
      return NextResponse.json(
        {
          error:
            "Your current subscription does not include medical report analysis.",
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
            "Your AI token limit has been exhausted. Please renew your subscription.",
        },
        { status: 403 },
      );
    }

    const settings = await SystemSetting.findOne({})
      .select("ai_model_config")
      .lean();

    const model =
      settings?.ai_model_config?.current_model || "openai/gpt-oss-120b";

    const pythonFormData = new FormData();
    pythonFormData.append("file", file, file.name);
    pythonFormData.append("ai_model_override", model);

    const pythonResponse = await fetch(
      `${PYTHON_BACKEND_URL}/api/analyze-medical-report`,
      {
        method: "POST",
        headers: {
          "x-internal-secret": INTERNAL_API_SECRET,
        },
        body: pythonFormData,
        cache: "no-store",
      },
    );

    const result = await pythonResponse.json().catch(() => null);

    if (!pythonResponse.ok) {
      return NextResponse.json(
        {
          error:
            result?.detail ||
            "Medical report analysis service is currently unavailable.",
        },
        { status: 502 },
      );
    }

    const tokensPrompt = Number(result?.tokens_prompt || 0);
    const tokensCompletion = Number(result?.tokens_completion || 0);
    const tokensTotal = Number(
      result?.tokens_total || tokensPrompt + tokensCompletion,
    );
    const responseTimeSec = Number(result?.response_time_sec || 0);
    const aiModel = result?.ai_model || model;

    await AiUsage.create({
      user_id: session.user.id,
      subscription_id: subscription._id,
      feature: "medical_report_analysis",
      ai_model: aiModel,
      tokens_prompt: tokensPrompt,
      tokens_completion: tokensCompletion,
      tokens_total: tokensTotal,
      response_time_sec: responseTimeSec,
    });

    if (tokensTotal > 0) {
      await Subscription.updateOne(
        {
          _id: subscription._id,
          user_id: session.user.id,
        },
        {
          $inc: {
            tokens_used: tokensTotal,
          },
        },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        ai_model: undefined,
        tokens_prompt: undefined,
        tokens_completion: undefined,
        tokens_total: undefined,
        response_time_sec: undefined,
      },
    });
  } catch (error) {
    console.error("[REPORT] FATAL ERROR:", error);
    console.error(
      "[REPORT] ERROR MESSAGE:",
      error instanceof Error ? error.message : error,
    );
    console.error(
      "[REPORT] ERROR STACK:",
      error instanceof Error ? error.stack : "No stack",
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to analyze the medical report.",
      },
      { status: 500 },
    );
  }
}
