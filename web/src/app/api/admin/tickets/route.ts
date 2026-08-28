import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Feedback from "@/models/Feedback";
import User from "@/models/User";
import SystemLog from "@/models/SystemLog";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    await dbConnect();
    User;

    const tickets = await Feedback.find()
      .populate("reported_by_user_id", "username email role")
      .sort({ status: 1, created_at: -1 })
      .lean();

    return NextResponse.json({ success: true, tickets });
  } catch (error: any) {
    console.error("Admin Tickets GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    const { ticketId, status } = await req.json();
    if (!ticketId || !status) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    await dbConnect();

    const ticket = await Feedback.findById(ticketId);
    if (!ticket) {
      return NextResponse.json(
        { success: false, message: "Ticket not found" },
        { status: 404 },
      );
    }

    const oldStatus = ticket.status;
    ticket.status = status;
    await ticket.save();

    await SystemLog.create({
      actor_id: session.user.id,
      actor_role: session.user.role,
      action_type: "UPDATE_TICKET_STATUS",
      target_id: ticket._id,
      details: {
        ticket_type: ticket.ticket_type,
        old_status: oldStatus,
        new_status: status,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Ticket status updated",
    });
  } catch (error: any) {
    console.error("Admin Tickets PATCH Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
