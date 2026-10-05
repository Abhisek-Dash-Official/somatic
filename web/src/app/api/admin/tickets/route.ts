import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Feedback from "@/models/Feedback";
import User from "@/models/User";
import SystemLog from "@/models/SystemLog";
import { notifyUser } from "@/lib/notification";

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

    const { ticketId, status, notifyMessage } = await req.json();

    if (!ticketId || !status) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    if (!["Open", "Resolved"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid ticket status" },
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

    if (oldStatus === status) {
      return NextResponse.json(
        { success: false, message: `Ticket is already ${status}` },
        { status: 400 },
      );
    }

    if (status === "Resolved") {
      if (typeof notifyMessage !== "string" || !notifyMessage.trim()) {
        return NextResponse.json(
          {
            success: false,
            message: "Please write a message before resolving the ticket",
          },
          { status: 400 },
        );
      }

      ticket.admin_response = notifyMessage.trim();
    }

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

    if (status === "Resolved") {
      await notifyUser({
        sender_id: session.user.id,
        recipient_id: ticket.reported_by_user_id.toString(),
        type: "support_ticket_resolved",
        title: "Support Ticket Resolved",
        message: notifyMessage.trim(),
        priority: "normal",
        action_url: "/support",
        reference_id: ticket._id.toString(),
        reference_type: "feedback",
      });
    }

    return NextResponse.json({
      success: true,
      message: `Ticket marked as ${status}`,
      ticket: {
        _id: ticket._id,
        status: ticket.status,
        admin_response: ticket.admin_response,
      },
    });
  } catch (error: any) {
    console.error("Admin Tickets PATCH Error:", error);

    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
