import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Consultation from "@/models/Consultation";
import User from "@/models/User";
import Department from "@/models/Department";

export async function GET(req: Request) {
  Department;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "doctor") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 },
      );
    }

    await dbConnect();
    const doctorId = session.user.id;

    const doctor = await User.findById(doctorId)
      .populate("doctor_info.department_id", "name")
      .select("doctor_info")
      .lean();

    const doctorDeptId = doctor?.doctor_info?.department_id?._id;
    const departmentName =
      (doctor?.doctor_info?.department_id as any)?.name || "General";

    const totalMyCases = await Consultation.countDocuments({
      claimed_by_doctor_id: doctorId,
    });
    const myCompleted = await Consultation.countDocuments({
      claimed_by_doctor_id: doctorId,
      status: "completed",
    });

    const pendingQuery = {
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

    const deptPending = await Consultation.countDocuments(pendingQuery);

    const activeCases = await Consultation.find({
      $or: [
        pendingQuery,
        { status: "in_review", claimed_by_doctor_id: doctorId },
      ],
    })
      .select(
        "_id status created_at ai_draft.is_emergency ai_draft.chief_complaints patient_input.age claimed_by_doctor_id assigned_department_id",
      )
      .sort({ "ai_draft.is_emergency": -1, status: -1, created_at: -1 })
      .limit(10)
      .lean();

    return NextResponse.json(
      {
        stats: {
          total: totalMyCases,
          pending: deptPending,
          completed: myCompleted,
        },
        activeCases,
        isAcceptingCases: doctor?.doctor_info?.is_accepting_cases ?? false,
        departmentName,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Doctor Dashboard API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
