import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Consultation from "@/models/Consultation";
import SystemSetting from "@/models/SystemSetting";
import Department from "@/models/Department";
import Subscription from "@/models/Subscription";
import AiUsage from "@/models/AiUsage";
import FreeAiQuota from "@/models/FreeAiQuota";
import { createSystemLog } from "@/lib/logger";

const PYTHON_BACKEND_URL =
  process.env.PYTHON_BACKEND_URL || "http://localhost:8000";

const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET;

const FREE_CONSULTATION_TOKEN_LIMIT = Number(
  process.env.FREE_CONSULTATION_TOKEN_LIMIT || 10_000,
);

const getMonthPeriod = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();

  return {
    periodStart: new Date(year, month, 1),
    periodEnd: new Date(year, month + 1, 1),
  };
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!INTERNAL_SECRET) {
      console.error("INTERNAL_API_SECRET is not configured.");

      return NextResponse.json(
        { error: "AI service configuration error." },
        { status: 500 },
      );
    }

    const body = await req.json();

    const {
      age,
      weight_kg,
      symptoms_raw_text,
      preferred_prescription_language,
      attachments,
    } = body;

    const parsedAge = Number(age);

    if (isNaN(parsedAge) || parsedAge < 0 || parsedAge > 120) {
      return NextResponse.json(
        { error: "Please provide a valid age between 0 and 120." },
        { status: 400 },
      );
    }

    const parsedWeight = Number(weight_kg);

    if (isNaN(parsedWeight) || parsedWeight <= 0 || parsedWeight > 300) {
      return NextResponse.json(
        { error: "Please provide a valid weight." },
        { status: 400 },
      );
    }

    if (!symptoms_raw_text || symptoms_raw_text.trim() === "") {
      return NextResponse.json(
        { error: "Symptoms are required." },
        { status: 400 },
      );
    }

    await dbConnect();

    const now = new Date();

    const activeSubscription = await Subscription.findOne({
      user_id: session.user.id,
      status: "active",
      end_date: { $gte: now },
      supported_features: "consultation_analysis",
    })
      .sort({ end_date: -1 })
      .lean();

    let quotaType: "free" | "subscription" = "free";
    let subscriptionId: any = undefined;
    let tokensUsedBefore = 0;
    let tokenLimit = FREE_CONSULTATION_TOKEN_LIMIT;
    let freeQuota: any = null;

    if (activeSubscription) {
      const subscriptionTokensUsed = activeSubscription.tokens_used || 0;
      const subscriptionTokenLimit = activeSubscription.token_limit || 0;

      if (subscriptionTokensUsed < subscriptionTokenLimit) {
        quotaType = "subscription";
        subscriptionId = activeSubscription._id;
        tokensUsedBefore = subscriptionTokensUsed;
        tokenLimit = subscriptionTokenLimit;
      }
    }

    if (!subscriptionId) {
      const { periodStart, periodEnd } = getMonthPeriod(now);

      freeQuota = await FreeAiQuota.findOne({
        user_id: session.user.id,
        feature: "consultation_analysis",
      });

      if (!freeQuota) {
        freeQuota = await FreeAiQuota.create({
          user_id: session.user.id,
          feature: "consultation_analysis",
          token_limit: FREE_CONSULTATION_TOKEN_LIMIT,
          tokens_used: 0,
          period_start: periodStart,
          period_end: periodEnd,
        });
      } else if (freeQuota.period_end <= now) {
        freeQuota = await FreeAiQuota.findOneAndUpdate(
          {
            _id: freeQuota._id,
            period_end: { $lte: now },
          },
          {
            $set: {
              token_limit: FREE_CONSULTATION_TOKEN_LIMIT,
              tokens_used: 0,
              period_start: periodStart,
              period_end: periodEnd,
            },
          },
          { new: true },
        );
      }

      if (!freeQuota) {
        return NextResponse.json(
          { error: "Unable to initialize free AI quota." },
          { status: 500 },
        );
      }

      tokensUsedBefore = freeQuota.tokens_used || 0;
      tokenLimit = freeQuota.token_limit;

      if (tokensUsedBefore >= tokenLimit) {
        return NextResponse.json(
          {
            error:
              "You have reached your free monthly AI consultation limit of 10,000 tokens.",
          },
          { status: 403 },
        );
      }
    }

    const systemSetting = await SystemSetting.findOne()
      .select("ai_model_config")
      .lean();

    const aiModel = systemSetting?.ai_model_config?.current_model;
    const aiSystemPrompt = systemSetting?.ai_model_config?.system_prompt;

    if (!aiModel) {
      return NextResponse.json(
        {
          error: "AI model is not configured in system settings.",
        },
        { status: 500 },
      );
    }

    const activeDepartments = await Department.find({
      is_active: true,
    })
      .select("_id name")
      .lean();

    const deptListForAI = activeDepartments.map((department) => ({
      id: department._id.toString(),
      name: department.name,
    }));

    const pyResponse = await fetch(
      `${PYTHON_BACKEND_URL}/api/analyze-symptoms`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-secret": INTERNAL_SECRET,
        },
        body: JSON.stringify({
          age: parsedAge,
          weight_kg: parsedWeight,
          symptoms_raw_text,
          ai_model_override: aiModel,
          custom_system_prompt: aiSystemPrompt,
          available_departments: deptListForAI,
        }),
      },
    );

    if (!pyResponse.ok) {
      const errorText = await pyResponse.text();
      console.error("Python AI backend error:", errorText);
      throw new Error("Failed to generate AI draft from Python backend");
    }

    const aiDraft = await pyResponse.json();
    const tokensPrompt = Number(aiDraft.tokens_prompt || 0);
    const tokensCompletion = Number(aiDraft.tokens_completion || 0);
    const tokensTotal =
      Number(aiDraft.tokens_total || 0) || tokensPrompt + tokensCompletion;

    if (quotaType === "subscription") {
      if (tokensUsedBefore + tokensTotal > tokenLimit) {
        return NextResponse.json(
          {
            error:
              "The AI response exceeded your remaining subscription token limit.",
          },
          { status: 403 },
        );
      }
    } else {
      if (tokensUsedBefore + tokensTotal > tokenLimit) {
        return NextResponse.json(
          {
            error:
              "The AI response exceeded your remaining free monthly token limit.",
          },
          { status: 403 },
        );
      }
    }

    const newConsultation = await Consultation.create({
      patient_id: session.user.id,
      assigned_department_id: aiDraft.assigned_department_id || null,
      status: "pending_review",

      patient_input: {
        age: parsedAge,
        weight_kg: parsedWeight,
        symptoms_raw_text,
        preferred_prescription_language:
          preferred_prescription_language || "English",
        attachments: Array.isArray(attachments) ? attachments : [],
      },

      ai_draft: {
        translated_symptoms: aiDraft.translated_symptoms,
        is_emergency: aiDraft.is_emergency,
        chief_complaints: aiDraft.chief_complaints,
        suggested_medicines: aiDraft.suggested_medicines || [],
        ayurvedic_hints: aiDraft.ayurvedic_hints,
        ai_summary_and_advice: aiDraft.ai_summary_and_advice,
      },
    });

    await AiUsage.create({
      user_id: session.user.id,
      ...(subscriptionId ? { subscription_id: subscriptionId } : {}),
      feature: "consultation_analysis",
      ai_model: aiModel,
      tokens_prompt: tokensPrompt,
      tokens_completion: tokensCompletion,
      tokens_total: tokensTotal,
      response_time_sec: Number(aiDraft.response_time_sec || 0),
      reference_id: newConsultation._id,
    });

    if (subscriptionId) {
      await Subscription.updateOne(
        {
          _id: subscriptionId,
          tokens_used: {
            $lte: tokenLimit - tokensTotal,
          },
        },
        {
          $inc: {
            tokens_used: tokensTotal,
          },
        },
      );
    } else {
      await FreeAiQuota.updateOne(
        {
          _id: freeQuota._id,
          tokens_used: {
            $lte: tokenLimit - tokensTotal,
          },
        },
        {
          $inc: {
            tokens_used: tokensTotal,
          },
        },
      );
    }

    await createSystemLog({
      actor_id: session.user.id,
      actor_role: session.user.role,
      action_type: "CREATE_CONSULTATION",
      target_id: newConsultation._id.toString(),
      details: {
        is_emergency: aiDraft.is_emergency,
        assigned_dept_id: aiDraft.assigned_department_id,
        ai_model: aiModel,
        tokens_prompt: tokensPrompt,
        tokens_completion: tokensCompletion,
        tokens_total: tokensTotal,
        response_time_sec: aiDraft.response_time_sec || 0,
        ai_status: aiDraft.ai_status,
        quota_type: quotaType,
        subscription_id: subscriptionId?.toString() || null,
        token_limit: tokenLimit,
        tokens_used_before: tokensUsedBefore,
      },
    });

    return NextResponse.json(
      {
        message: "Consultation created successfully",
        id: newConsultation._id,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Consultation API Error:", error);

    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
