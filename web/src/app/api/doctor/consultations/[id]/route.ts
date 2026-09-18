import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Consultation from "@/models/Consultation";
import User from "@/models/User";
import { createSystemLog } from "@/lib/logger";

type Props = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Props) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "doctor")
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { id } = await params;
    await dbConnect();

    const doctor = await User.findById(session.user.id)
      .select("doctor_info")
      .lean();

    const consultation = await Consultation.findById(id)
      .populate("patient_id", "username email contact_no patient_info")
      .lean();

    if (!consultation)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isClaimedByMe =
      consultation.claimed_by_doctor_id?.toString() === session.user.id;
    const isPendingInMyDept =
      consultation.status === "pending_review" &&
      consultation.assigned_department_id?.toString() ===
        doctor?.doctor_info?.department_id?.toString();

    if (!isClaimedByMe && !isPendingInMyDept) {
      return NextResponse.json(
        {
          error:
            "Forbidden: This case belongs to another department or doctor.",
        },
        { status: 403 },
      );
    }

    return NextResponse.json(consultation, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request, { params }: Props) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "doctor")
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { id } = await params;
    const body = await req.json();
    const { action, ai_draft, doctor_final_prescription, ambulance_dispatch } =
      body;

    await dbConnect();

    const doctor = await User.findById(session.user.id)
      .select("doctor_info")
      .lean();
    const consultation = await Consultation.findById(id);

    if (!consultation)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isClaimedByMe =
      consultation.claimed_by_doctor_id?.toString() === session.user.id;
    const isPendingInMyDept =
      consultation.status === "pending_review" &&
      consultation.assigned_department_id?.toString() ===
        doctor?.doctor_info?.department_id?.toString();

    if (!isClaimedByMe && !isPendingInMyDept) {
      return NextResponse.json(
        { error: "Forbidden: You cannot modify this case." },
        { status: 403 },
      );
    }

    // ACTION: CLAIM
    if (action === "claim" && consultation.status === "pending_review") {
      consultation.status = "in_review";
      consultation.claimed_by_doctor_id = session.user.id;
      await consultation.save();

      await createSystemLog({
        actor_id: session.user.id,
        actor_role: "doctor",
        action_type: "CLAIM_CONSULTATION",
        target_id: id,
        details: { message: "Doctor viewed and claimed the case." },
      });
      return NextResponse.json(
        { message: "Case claimed successfully", status: "in_review" },
        { status: 200 },
      );
    }

    // ACTION: RELEASE / CANCEL CLAIM
    if (
      action === "release" &&
      isClaimedByMe &&
      consultation.status === "in_review"
    ) {
      consultation.status = "pending_review";
      consultation.claimed_by_doctor_id = null;
      await consultation.save();

      await createSystemLog({
        actor_id: session.user.id,
        actor_role: "doctor",
        action_type: "RELEASE_CONSULTATION",
        target_id: id,
        details: {
          message:
            "Doctor cancelled claim and released case back to department queue.",
        },
      });
      return NextResponse.json(
        { message: "Case released successfully", status: "pending_review" },
        { status: 200 },
      );
    }

    // ACTION: COMPLETE
    if (action === "complete" && isClaimedByMe) {
      const targetLang =
        consultation.patient_input?.preferred_prescription_language ||
        "English";

      let trans_instructions: string | null = null;
      let trans_summary: string | null = null;
      let trans_ayurveda: string | null = null;

      console.log(`[TRANSLATION CHECK] Patient Language is: ${targetLang}`);

      if (targetLang.toLowerCase() !== "english") {
        console.log(
          `[TRANSLATION START] Sending BATCH translation for ${targetLang}...`,
        );

        const textsToTranslate: Record<string, string> = {};
        if (doctor_final_prescription.instructions)
          textsToTranslate.instructions =
            doctor_final_prescription.instructions;
        if (ai_draft.ai_summary_and_advice)
          textsToTranslate.summary = ai_draft.ai_summary_and_advice;
        if (ai_draft.ayurvedic_hints)
          textsToTranslate.ayurveda = ai_draft.ayurvedic_hints;

        if (Object.keys(textsToTranslate).length > 0) {
          try {
            const res = await fetch(
              `${process.env.PYTHON_BACKEND_URL || "http://localhost:8000"}/api/translate-batch`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "x-internal-secret":
                    process.env.INTERNAL_API_SECRET ||
                    "my_super_secret_key_123",
                },
                body: JSON.stringify({
                  texts: textsToTranslate,
                  target_language: targetLang,
                }),
              },
            );

            if (res.ok) {
              const translatedData = await res.json();
              trans_instructions = translatedData.instructions || null;
              trans_summary = translatedData.summary || null;
              trans_ayurveda = translatedData.ayurveda || null;
              console.log("[TRANSLATION SUCCESS] Batch translation done!");
            }
          } catch (e) {
            console.error("[TRANSLATION ERROR] Batch API failed:", e);
          }
        }
      }

      consultation.ai_draft.ai_summary_and_advice =
        ai_draft.ai_summary_and_advice;
      consultation.ai_draft.ayurvedic_hints = ai_draft.ayurvedic_hints;
      consultation.ai_draft.chief_complaints = ai_draft.chief_complaints;
      consultation.ai_draft.is_emergency = ai_draft.is_emergency;

      if (trans_summary)
        consultation.ai_draft.translated_ai_summary_and_advice = trans_summary;
      if (trans_ayurveda)
        consultation.ai_draft.translated_ayurvedic_hints = trans_ayurveda;

      consultation.doctor_final_prescription = {
        ...doctor_final_prescription,
        translated_instructions: trans_instructions,
      };

      if (ambulance_dispatch) {
        consultation.ambulance_dispatch = ambulance_dispatch;
      }

      consultation.status = "completed";
      consultation.resolved_at = new Date();
      await consultation.save();

      await createSystemLog({
        actor_id: session.user.id,
        actor_role: "doctor",
        action_type: "COMPLETE_CONSULTATION",
        target_id: id,
      });

      return NextResponse.json(
        { message: "Consultation completed successfully" },
        { status: 200 },
      );
    }

    return NextResponse.json(
      { error: "Invalid action or permission denied" },
      { status: 400 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
