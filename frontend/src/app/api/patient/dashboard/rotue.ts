import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Consultation from "@/models/Consultation";
import Feedback from "@/models/Feedback";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const userId = session.user.id;

    const recentConsultations = await Consultation.find({ patient_id: userId })
      .sort({ created_at: -1 })
      .limit(5)
      .lean();

    const recentFeedbacks = await Feedback.find({ reported_by_user_id: userId })
      .sort({ created_at: -1 })
      .limit(3)
      .lean();

    const totalConsultations = await Consultation.countDocuments({
      patient_id: userId,
    });
    const activeConsultations = await Consultation.countDocuments({
      patient_id: userId,
      status: { $in: ["pending_review", "in_review"] },
    });

    const upcomingFollowUp = await Consultation.findOne({
      patient_id: userId,
      "doctor_final_prescription.next_follow_up": { $gte: new Date() },
    })
      .sort({ "doctor_final_prescription.next_follow_up": 1 })
      .lean();

    return NextResponse.json(
      {
        consultations: recentConsultations,
        feedbacks: recentFeedbacks,
        stats: {
          total: totalConsultations,
          active: activeConsultations,
        },
        nextFollowUp:
          upcomingFollowUp?.doctor_final_prescription?.next_follow_up || null,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 },
    );
  }
}
