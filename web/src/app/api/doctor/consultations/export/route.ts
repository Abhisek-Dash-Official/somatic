import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Consultation from "@/models/Consultation";
import User from "@/models/User";
import SystemLog from "@/models/SystemLog";
import { createSystemLog } from "@/lib/logger";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "doctor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await dbConnect();
    const doctorId = session.user.id;

    const doctor = await User.findById(doctorId).select("doctor_info").lean();
    const doctorDeptId = doctor?.doctor_info?.department_id;

    const query = {
      $or: [
        { assigned_department_id: doctorDeptId, status: "pending_review" },
        { claimed_by_doctor_id: doctorId },
      ],
    };

    const consultations = await Consultation.find(query)
      .populate("patient_id", "username email")
      .populate("claimed_by_doctor_id", "username email")
      .populate("assigned_department_id", "name")
      .sort({ created_at: -1 })
      .lean();

    const consultationIds = consultations.map((c) => c._id);
    const systemLogs = await SystemLog.find({
      target_id: { $in: consultationIds },
    }).lean();

    const logsMap = new Map();
    systemLogs.forEach((log) => {
      if (!logsMap.has(log.target_id.toString())) {
        logsMap.set(log.target_id.toString(), []);
      }
      logsMap.get(log.target_id.toString()).push({
        action_type: log.action_type,
        actor_id: log.actor_id,
        created_at: log.created_at,
        details: log.details,
      });
    });

    const enrichedConsultations = consultations.map((c) => ({
      ...c,
      system_logs: logsMap.get(c._id.toString()) || [],
    }));

    await createSystemLog({
      actor_id: session.user.id,
      actor_role: "doctor",
      action_type: "EXPORT_CONSULTATIONS_CSV",
      target_id: session.user.id,
      details: {
        message:
          "Doctor exported consultation history and system audit logs to CSV.",
      },
    });

    return NextResponse.json(
      { consultations: enrichedConsultations },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Export API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
