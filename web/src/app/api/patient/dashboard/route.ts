import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Consultation from "@/models/Consultation";
import Feedback from "@/models/Feedback";
import LabBooking from "@/models/LabBooking";
import Order from "@/models/Order";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const userId = session.user.id;

    const [
      recentConsultations,
      recentFeedbacks,
      totalConsultations,
      activeConsultations,
      completedConsultations,
      upcomingFollowUp,
      labBookings,
      activeLabBookings,
      orders,
      activeOrders,
    ] = await Promise.all([
      Consultation.find({ patient_id: userId })
        .sort({ created_at: -1 })
        .limit(5)
        .lean(),

      Feedback.find({ reported_by_user_id: userId })
        .sort({ created_at: -1 })
        .limit(3)
        .lean(),

      Consultation.countDocuments({ patient_id: userId }),

      Consultation.countDocuments({
        patient_id: userId,
        status: { $in: ["pending_review", "in_review"] },
      }),

      Consultation.countDocuments({
        patient_id: userId,
        status: "completed",
      }),

      Consultation.findOne({
        patient_id: userId,
        "doctor_final_prescription.next_follow_up": { $gte: new Date() },
      })
        .sort({ "doctor_final_prescription.next_follow_up": 1 })
        .lean(),

      LabBooking.find({ patient_id: userId })
        .sort({ created_at: -1 })
        .limit(3)
        .select(
          "booking_number status scheduled_date scheduled_slot tests total_amount",
        )
        .lean(),

      LabBooking.countDocuments({
        patient_id: userId,
        status: {
          $in: [
            "booked",
            "collection_scheduled",
            "sample_collected",
            "processing",
            "report_ready",
          ],
        },
      }),

      Order.find({ user_id: userId })
        .sort({ created_at: -1 })
        .limit(3)
        .select("total_amount payment_status order_status created_at")
        .lean(),

      Order.countDocuments({
        user_id: userId,
        order_status: { $nin: ["delivered", "cancelled"] },
      }),
    ]);

    return NextResponse.json(
      {
        consultations: recentConsultations,
        feedbacks: recentFeedbacks,
        labs: labBookings,
        orders,
        stats: {
          total: totalConsultations,
          active: activeConsultations,
          completed: completedConsultations,
          activeLabs: activeLabBookings,
          activeOrders,
        },
        nextFollowUp:
          upcomingFollowUp?.doctor_final_prescription?.next_follow_up || null,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Patient Dashboard API Error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
