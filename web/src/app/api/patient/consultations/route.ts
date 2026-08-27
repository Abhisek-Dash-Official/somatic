import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Consultation from "@/models/Consultation";
import Department from "@/models/Department";
import { createSystemLog } from "@/lib/logger";

const PYTHON_BACKEND_URL =
  process.env.PYTHON_BACKEND_URL || "http://localhost:8000";
const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    const activeDepartments = await Department.find({ is_active: true })
      .select("_id name")
      .lean();

    const deptListForAI = activeDepartments.map((d) => ({
      id: d._id.toString(),
      name: d.name,
    }));

    const pyResponse = await fetch(
      `${PYTHON_BACKEND_URL}/api/analyze-symptoms`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-secret": INTERNAL_SECRET as string,
        },
        body: JSON.stringify({
          age: parsedAge,
          weight_kg: parsedWeight,
          symptoms_raw_text,
          preferred_prescription_language:
            preferred_prescription_language || "English",
          available_departments: deptListForAI,
        }),
      },
    );

    if (!pyResponse.ok) {
      throw new Error("Failed to generate AI draft from Python backend");
    }
    const aiDraft = await pyResponse.json();

    const newConsultation = await Consultation.create({
      patient_id: session.user.id,
      assigned_department_id: aiDraft.assigned_department_id || null, // Seedha ID save hoga
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
        is_emergency: aiDraft.is_emergency,
        chief_complaints: aiDraft.chief_complaints,
        ayurvedic_hints: aiDraft.ayurvedic_hints,
        ai_summary_and_advice: aiDraft.ai_summary_and_advice,
      },
    });

    await createSystemLog({
      actor_id: session.user.id,
      actor_role: session.user.role,
      action_type: "CREATE_CONSULTATION",
      target_id: newConsultation._id.toString(),
      details: {
        is_emergency: aiDraft.is_emergency,
        assigned_dept_id: aiDraft.assigned_department_id,
      },
    });

    return NextResponse.json(
      { message: "Consultation created successfully", id: newConsultation._id },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Consultation API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 },
    );
  }
}
