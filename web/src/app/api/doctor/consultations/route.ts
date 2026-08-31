import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Consultation from "@/models/Consultation";
import User from "@/models/User";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "doctor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await dbConnect();

    const doctor = await User.findById(session.user.id)
      .select("doctor_info")
      .lean();

    if (!doctor || !doctor.doctor_info?.department_id) {
      return NextResponse.json(
        { error: "Doctor department not configured. Please contact admin." },
        { status: 403 },
      );
    }

    const doctorDeptId = doctor.doctor_info.department_id;

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const query = {
      status: { $ne: "completed" },
      $or: [
        {
          assigned_department_id: doctorDeptId,
          status: "pending_review",
        },
        {
          claimed_by_doctor_id: session.user.id,
        },
      ],
    };

    const total = await Consultation.countDocuments(query);
    const consultations = await Consultation.find(query)
      .select(
        "_id status created_at patient_input.age ai_draft.chief_complaints ai_draft.is_emergency",
      )
      .sort({ "ai_draft.is_emergency": -1, status: -1, created_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json(
      {
        consultations,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
