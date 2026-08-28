import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Department from "@/models/Department";
import Consultation from "@/models/Consultation";
import Feedback from "@/models/Feedback";
import SystemLog from "@/models/SystemLog";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 },
      );
    }

    await dbConnect();

    const [
      totalDepartments,
      totalActiveDepartments,
      totalPatients,
      totalAdmins,
      totalDoctors,
      totalActiveDoctors,
      totalPendingReview,
      totalUnderReview,
      totalResolved,
      totalUnresolvedEmergency,
      totalFeedbacks,
      totalPendingFeedbacks,
      totalResolvedFeedbacks,
      aiMetricsData,
      departmentResolutionData,
      recentLogsData,
    ] = await Promise.all([
      Department.countDocuments(),
      Department.countDocuments({ is_active: true }),
      User.countDocuments({ role: "patient", is_delete: false }),
      User.countDocuments({ role: "admin", is_delete: false }),
      User.countDocuments({ role: "doctor", is_delete: false }),
      User.countDocuments({
        role: "doctor",
        "doctor_info.is_accepting_cases": true,
        is_ban: false,
        is_delete: false,
      }),
      Consultation.countDocuments({ status: "pending_review" }),
      Consultation.countDocuments({ status: "in_review" }),
      Consultation.countDocuments({ status: "completed" }),
      Consultation.countDocuments({
        "ai_draft.is_emergency": true,
        status: { $ne: "completed" },
      }),
      Feedback.countDocuments(),
      Feedback.countDocuments({ status: "Open" }),
      Feedback.countDocuments({ status: "Resolved" }),
      SystemLog.aggregate([
        { $match: { action_type: "CREATE_CONSULTATION" } },
        {
          $group: {
            _id: null,
            avgPromptTokens: { $avg: "$details.tokens_prompt" },
            avgCompletionTokens: { $avg: "$details.tokens_completion" },
            avgResponseTime: { $avg: "$details.response_time_sec" },
          },
        },
      ]),
      Consultation.aggregate([
        { $match: { status: "completed", resolved_at: { $exists: true } } },
        {
          $group: {
            _id: "$assigned_department_id",
            avgTimeMs: { $avg: { $subtract: ["$resolved_at", "$created_at"] } },
          },
        },
        {
          $lookup: {
            from: "departments",
            localField: "_id",
            foreignField: "_id",
            as: "department",
          },
        },
        { $unwind: { path: "$department", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            name: { $ifNull: ["$department.name", "Unassigned"] },
            avgTimeSec: { $divide: ["$avgTimeMs", 1000] },
          },
        },
        { $sort: { avgTimeSec: 1 } },
      ]),
      SystemLog.find()
        .sort({ timestamp: -1 })
        .limit(10)
        .populate("actor_id", "username")
        .select("timestamp action_type actor_role actor_id details target_id")
        .lean(),
    ]);

    const aiMetrics = aiMetricsData[0] || {
      avgPromptTokens: 0,
      avgCompletionTokens: 0,
      avgResponseTime: 0,
    };

    return NextResponse.json({
      departments: {
        total: totalDepartments,
        active: totalActiveDepartments,
        resolutionTimes: departmentResolutionData,
      },
      users: {
        patients: totalPatients,
        admins: totalAdmins,
        doctors: totalDoctors,
        activeDoctors: totalActiveDoctors,
      },
      consultations: {
        pendingReview: totalPendingReview,
        underReview: totalUnderReview,
        resolved: totalResolved,
        unresolvedEmergency: totalUnresolvedEmergency,
      },
      feedbacks: {
        total: totalFeedbacks,
        pending: totalPendingFeedbacks,
        resolved: totalResolvedFeedbacks,
      },
      ai: {
        avgPromptTokens: aiMetrics.avgPromptTokens,
        avgCompletionTokens: aiMetrics.avgCompletionTokens,
        avgResponseTime: aiMetrics.avgResponseTime,
      },
      recentLogs: recentLogsData,
    });
  } catch (error: any) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard metrics" },
      { status: 500 },
    );
  }
}
