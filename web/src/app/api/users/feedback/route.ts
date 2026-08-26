import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Feedback from "@/models/Feedback";
import { createSystemLog } from "@/lib/logger";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const feedbacks = await Feedback.find({
      reported_by_user_id: session.user.id,
    })
      .sort({ created_at: -1 })
      .lean();

    return NextResponse.json({ feedbacks }, { status: 200 });
  } catch (error: any) {
    console.error("Feedback API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to submit feedback." },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { ticket_type, message } = body;

    if (!message || message.trim() === "") {
      return NextResponse.json(
        { error: "Message cannot be empty." },
        { status: 400 },
      );
    }

    await dbConnect();

    const newFeedback = await Feedback.create({
      reported_by_user_id: session.user.id,
      ticket_type: ticket_type || "General Support",
      message: message.trim(),
    });

    await createSystemLog({
      actor_id: session.user.id,
      actor_role: session.user.role,
      action_type: "CREATE_TICKET",
      target_id: newFeedback._id.toString(),
      details: { ticket_type: newFeedback.ticket_type },
    });

    return NextResponse.json(
      {
        message: "Feedback submitted successfully!",
        ticketId: newFeedback._id,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Feedback API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 },
    );
  }
}
