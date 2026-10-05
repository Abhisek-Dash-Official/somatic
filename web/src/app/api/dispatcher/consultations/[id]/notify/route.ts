import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import Consultation from "@/models/Consultation";
import User from "@/models/User";
import { notifyUser } from "@/lib/notification";
import { authOptions } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "dispatcher") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const count = Number(body.count);

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid consultation ID." },
        { status: 400 },
      );
    }

    if (!Number.isInteger(count) || count < 1 || count > 20) {
      return NextResponse.json(
        { error: "Doctor count must be an integer between 1 and 20." },
        { status: 400 },
      );
    }

    await connectDB();

    const consultation = await Consultation.findById(id)
      .select("_id assigned_department_id claimed_by_doctor_id status")
      .lean();

    if (!consultation) {
      return NextResponse.json(
        { error: "Consultation not found." },
        { status: 404 },
      );
    }

    if (consultation.status === "completed") {
      return NextResponse.json(
        { error: "This consultation has already been completed." },
        { status: 400 },
      );
    }

    if (consultation.claimed_by_doctor_id) {
      const doctor = await User.findOne({
        _id: consultation.claimed_by_doctor_id,
        role: "doctor",
        is_delete: false,
        is_ban: false,
      })
        .select("_id username")
        .lean();

      if (!doctor) {
        return NextResponse.json(
          { error: "The claimed doctor is no longer available." },
          { status: 404 },
        );
      }

      await notifyUser({
        sender_id: session.user.id,
        recipient_id: doctor._id.toString(),
        type: "consultation_reminder",
        title: "Consultation Requires Attention",
        message:
          "A consultation assigned to you is still awaiting resolution. Please resolve it or release the case.",
        priority: consultation.status === "in_review" ? "high" : "normal",
        action_url: `/doctor/consultations/${consultation._id}`,
        reference_id: consultation._id.toString(),
        reference_type: "Consultation",
      });

      return NextResponse.json({
        success: true,
        notified_count: 1,
        doctor_ids: [doctor._id],
        message: `${doctor.username} has been notified to resolve or release the consultation.`,
        claimed: true,
      });
    }

    if (!consultation.assigned_department_id) {
      return NextResponse.json(
        { error: "No department is assigned to this consultation." },
        { status: 400 },
      );
    }

    const doctors = await User.aggregate([
      {
        $match: {
          role: "doctor",
          "doctor_info.department_id": consultation.assigned_department_id,
          "doctor_info.is_accepting_cases": true,
          is_delete: false,
          is_ban: false,
        },
      },
      { $sample: { size: count } },
      { $project: { _id: 1, username: 1 } },
    ]);

    if (!doctors.length) {
      return NextResponse.json(
        { error: "No new eligible doctors are available to notify." },
        { status: 404 },
      );
    }

    const notifications = await Promise.all(
      doctors.map((doctor) =>
        notifyUser({
          sender_id: session.user.id,
          recipient_id: doctor._id.toString(),
          type: "consultation_reminder",
          title: "Consultation Available",
          message:
            "A consultation is waiting for doctor review. Please claim and resolve the case.",
          priority: "normal",
          action_url: `/doctor/consultations/${consultation._id}`,
          reference_id: consultation._id.toString(),
          reference_type: "Consultation",
        }),
      ),
    );

    return NextResponse.json({
      success: true,
      notified_count: notifications.length,
      doctor_ids: doctors.map((doctor) => doctor._id),
      message: `${notifications.length} doctor${notifications.length === 1 ? "" : "s"} notified successfully.`,
      claimed: false,
    });
  } catch (error) {
    console.error("Dispatcher Consultation Notification Error:", error);

    return NextResponse.json(
      { error: "Failed to notify doctors." },
      { status: 500 },
    );
  }
}
