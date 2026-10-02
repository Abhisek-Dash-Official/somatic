import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Consultation from "@/models/Consultation";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session?.user?.id ||
      !["doctor", "assistant_doctor"].includes(session.user.role)
    ) {
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

    const [
      totalMyCases,
      pendingMyCases,
      inReviewMyCases,
      completedMyCases,
      emergencyMyCases,
      departmentPending,
      departmentEmergency,
      activeCases,
    ] = await Promise.all([
      Consultation.countDocuments({ claimed_by_doctor_id: doctorId }),
      Consultation.countDocuments({
        claimed_by_doctor_id: doctorId,
        status: "pending_review",
      }),
      Consultation.countDocuments({
        claimed_by_doctor_id: doctorId,
        status: "in_review",
      }),
      Consultation.countDocuments({
        claimed_by_doctor_id: doctorId,
        status: "completed",
      }),
      Consultation.countDocuments({
        claimed_by_doctor_id: doctorId,
        "ai_draft.is_emergency": true,
        status: { $ne: "completed" },
      }),
      doctorDeptId
        ? Consultation.countDocuments({
            assigned_department_id: doctorDeptId,
            status: "pending_review",
            claimed_by_doctor_id: { $exists: false },
          })
        : 0,
      doctorDeptId
        ? Consultation.countDocuments({
            assigned_department_id: doctorDeptId,
            status: "pending_review",
            "ai_draft.is_emergency": true,
            claimed_by_doctor_id: { $exists: false },
          })
        : 0,
      Consultation.find({
        $or: [
          { claimed_by_doctor_id: doctorId, status: { $ne: "completed" } },
          ...(doctorDeptId
            ? [
                {
                  assigned_department_id: doctorDeptId,
                  status: "pending_review",
                  claimed_by_doctor_id: { $exists: false },
                },
              ]
            : []),
        ],
      })
        .select(
          "_id status created_at ai_draft.is_emergency ai_draft.chief_complaints patient_input.age claimed_by_doctor_id assigned_department_id",
        )
        .sort({ "ai_draft.is_emergency": -1, created_at: -1 })
        .limit(10)
        .lean(),
    ]);

    return NextResponse.json(
      {
        stats: {
          total: totalMyCases,
          pending: pendingMyCases,
          in_review: inReviewMyCases,
          completed: completedMyCases,
          emergency: emergencyMyCases,
          department_pending: departmentPending,
          department_emergency: departmentEmergency,
        },
        activeCases,
        isAcceptingCases: doctor?.doctor_info?.is_accepting_cases ?? false,
        departmentName,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Doctor Dashboard API Error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
