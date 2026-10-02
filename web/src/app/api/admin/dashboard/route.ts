import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Department from "@/models/Department";
import Consultation from "@/models/Consultation";
import Feedback from "@/models/Feedback";
import SystemLog from "@/models/SystemLog";
import Transaction from "@/models/Transaction";
import LabBooking from "@/models/LabBooking";
import Subscription from "@/models/Subscription";
import InsuranceClaim from "@/models/InsuranceClaim";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 },
      );
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const requestedRange = Number(searchParams.get("range") || 30);
    const range = [7, 30, 90].includes(requestedRange) ? requestedRange : 30;

    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - (range - 1));
    startDate.setHours(0, 0, 0, 0);

    const [
      totalPatients,
      totalAdmins,
      totalDoctors,
      activeDoctors,
      totalUsers,
      totalDepartments,
      activeDepartments,
      pendingConsultations,
      underReviewConsultations,
      completedConsultations,
      emergencyConsultations,
      totalFeedbacks,
      openFeedbacks,
      resolvedFeedbacks,
      pendingLabs,
      collectionLabs,
      processingLabs,
      readyLabs,
      completedLabs,
      activeSubscriptions,
      expiringSubscriptions,
      totalClaims,
      pendingClaims,
      approvedClaims,
      paidTransactions,
      revenueData,
      userTrend,
      consultationTrend,
      labTrend,
      departmentData,
      recentLogs,
    ] = await Promise.all([
      User.countDocuments({ role: "patient", is_delete: false }),
      User.countDocuments({ role: "admin", is_delete: false }),
      User.countDocuments({
        role: { $in: ["doctor", "assistant_doctor"] },
        is_delete: false,
      }),
      User.countDocuments({
        role: { $in: ["doctor", "assistant_doctor"] },
        "doctor_info.is_accepting_cases": true,
        is_ban: false,
        is_delete: false,
      }),
      User.countDocuments({ is_delete: false }),
      Department.countDocuments(),
      Department.countDocuments({ is_active: true }),
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
      LabBooking.countDocuments({ status: "booked" }),
      LabBooking.countDocuments({ status: "collection_scheduled" }),
      LabBooking.countDocuments({
        status: { $in: ["sample_collected", "processing"] },
      }),
      LabBooking.countDocuments({ status: "report_ready" }),
      LabBooking.countDocuments({ status: "completed" }),
      Subscription.countDocuments({ status: "active" }),
      Subscription.countDocuments({
        status: "active",
        end_date: {
          $gte: now,
          $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        },
      }),
      InsuranceClaim.countDocuments(),
      InsuranceClaim.countDocuments({
        status: { $in: ["submitted", "under_review"] },
      }),
      InsuranceClaim.countDocuments({ status: "approved" }),
      Transaction.countDocuments({
        status: "paid",
        created_at: { $gte: startDate },
      }),
      Transaction.aggregate([
        {
          $match: {
            status: "paid",
            created_at: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
            average: { $avg: "$amount" },
          },
        },
      ]),
      User.aggregate([
        {
          $match: {
            is_delete: false,
            created_at: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$created_at" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Consultation.aggregate([
        {
          $match: {
            created_at: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$created_at" },
            },
            total: { $sum: 1 },
            completed: {
              $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      LabBooking.aggregate([
        {
          $match: {
            created_at: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$created_at" },
            },
            total: { $sum: 1 },
            completed: {
              $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Consultation.aggregate([
        {
          $group: {
            _id: "$assigned_department_id",
            total: { $sum: 1 },
            pending: {
              $sum: { $cond: [{ $eq: ["$status", "pending_review"] }, 1, 0] },
            },
            inReview: {
              $sum: { $cond: [{ $eq: ["$status", "in_review"] }, 1, 0] },
            },
            completed: {
              $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
            },
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
        {
          $unwind: {
            path: "$department",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 0,
            name: { $ifNull: ["$department.name", "Unassigned"] },
            total: 1,
            pending: 1,
            inReview: 1,
            completed: 1,
          },
        },
        { $sort: { total: -1 } },
        { $limit: 8 },
      ]),
      SystemLog.find()
        .sort({ timestamp: -1 })
        .limit(12)
        .populate("actor_id", "username email")
        .select("timestamp action_type actor_role actor_id details target_id")
        .lean(),
    ]);

    const revenue = revenueData[0] || { total: 0, average: 0 };

    const transactionTrend = await Transaction.aggregate([
      {
        $match: {
          status: "paid",
          created_at: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$created_at" },
          },
          revenue: { $sum: "$amount" },
          transactions: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const dailyMap = new Map<
      string,
      {
        users: number;
        consultations: number;
        completedConsultations: number;
        labs: number;
        completedLabs: number;
        revenue: number;
        transactions: number;
      }
    >();

    for (let i = 0; i < range; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const key = date.toISOString().slice(0, 10);

      dailyMap.set(key, {
        users: 0,
        consultations: 0,
        completedConsultations: 0,
        labs: 0,
        completedLabs: 0,
        revenue: 0,
        transactions: 0,
      });
    }

    for (const item of userTrend) {
      if (dailyMap.has(item._id)) dailyMap.get(item._id)!.users = item.count;
    }

    for (const item of consultationTrend) {
      if (dailyMap.has(item._id)) {
        dailyMap.get(item._id)!.consultations = item.total;
        dailyMap.get(item._id)!.completedConsultations = item.completed;
      }
    }

    for (const item of labTrend) {
      if (dailyMap.has(item._id)) {
        dailyMap.get(item._id)!.labs = item.total;
        dailyMap.get(item._id)!.completedLabs = item.completed;
      }
    }

    for (const item of transactionTrend) {
      if (dailyMap.has(item._id)) {
        dailyMap.get(item._id)!.revenue = item.revenue;
        dailyMap.get(item._id)!.transactions = item.transactions;
      }
    }

    const daily = Array.from(dailyMap.entries()).map(([date, values]) => ({
      date,
      ...values,
    }));

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const [todayRevenueData, todayUsers, todayConsultations] =
      await Promise.all([
        Transaction.aggregate([
          {
            $match: {
              status: "paid",
              created_at: { $gte: todayStart },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$amount" },
            },
          },
        ]),
        User.countDocuments({
          is_delete: false,
          created_at: { $gte: todayStart },
        }),
        Consultation.countDocuments({ created_at: { $gte: todayStart } }),
      ]);

    return NextResponse.json({
      range,
      overview: {
        totalUsers,
        totalPatients,
        totalDoctors,
        activeDoctors,
        totalAdmins,
        totalDepartments,
        activeDepartments,
      },
      consultations: {
        pending: pendingConsultations,
        inReview: underReviewConsultations,
        completed: completedConsultations,
        emergency: emergencyConsultations,
      },
      labs: {
        booked: pendingLabs,
        collectionScheduled: collectionLabs,
        processing: processingLabs,
        reportReady: readyLabs,
        completed: completedLabs,
      },
      feedback: {
        total: totalFeedbacks,
        open: openFeedbacks,
        resolved: resolvedFeedbacks,
      },
      subscriptions: {
        active: activeSubscriptions,
        expiringSoon: expiringSubscriptions,
      },
      insurance: {
        totalClaims,
        pendingClaims,
        approvedClaims,
      },
      finance: {
        revenue: revenue.total || 0,
        averageTransaction: revenue.average || 0,
        transactions: paidTransactions,
        todayRevenue: todayRevenueData[0]?.total || 0,
      },
      today: {
        users: todayUsers,
        consultations: todayConsultations,
      },
      daily,
      departments: departmentData,
      recentLogs,
    });
  } catch (error) {
    console.error("Admin Dashboard API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard metrics" },
      { status: 500 },
    );
  }
}
