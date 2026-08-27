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
    const consultation = await Consultation.findById(id).lean();

    if (!consultation)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    // SECURITY CHECK: Can this doctor view this case?
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
    const { action, ai_draft, doctor_final_prescription } = body;

    await dbConnect();

    const doctor = await User.findById(session.user.id)
      .select("doctor_info")
      .lean();
    const consultation = await Consultation.findById(id);

    if (!consultation)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    // SECURITY CHECK for modifications
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

    // ACTION: COMPLETE
    if (action === "complete" && isClaimedByMe) {
      consultation.ai_draft = ai_draft;
      consultation.doctor_final_prescription = doctor_final_prescription;
      consultation.status = "completed";
      consultation.resolved_at = new Date();
      await consultation.save();

      await createSystemLog({
        actor_id: session.user.id,
        actor_role: "doctor",
        action_type: "COMPLETE_CONSULTATION",
        target_id: id,
        details: {
          has_medicines: doctor_final_prescription.medicines.length > 0,
        },
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
