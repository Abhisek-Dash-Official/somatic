import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Notification from "@/models/Notification";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = new mongoose.Types.ObjectId(session.user.id);

    if (searchParams.get("count") === "true") {
      const count = await Notification.countDocuments({
        recipient_id: userId,
        is_read: false,
      });
      return NextResponse.json({ unread_count: count });
    }

    const page = Math.max(Number(searchParams.get("page")) || 1, 1);
    const limit = Math.min(
      Math.max(Number(searchParams.get("limit")) || 20, 1),
      50,
    );
    const unreadOnly = searchParams.get("unread") === "true";

    const filter: Record<string, unknown> = { recipient_id: userId };
    if (unreadOnly) filter.is_read = false;

    const [notifications, total, unread_count] = await Promise.all([
      Notification.find(filter)
        .sort({ created_at: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ recipient_id: userId, is_read: false }),
    ]);

    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
      unread_count,
    });
  } catch (error) {
    console.error("GET /api/notifications error:", error);
    return NextResponse.json(
      { message: "Failed to fetch notifications" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await connectDB();

    const body = await request.json();
    const { notificationId, markAll } = body;
    const userId = new mongoose.Types.ObjectId(session.user.id);

    if (markAll === true) {
      const result = await Notification.updateMany(
        { recipient_id: userId, is_read: false },
        { $set: { is_read: true, read_at: new Date() } },
      );

      return NextResponse.json({
        message: "All notifications marked as read",
        updated: result.modifiedCount,
        unread_count: 0,
      });
    }

    if (!notificationId || !mongoose.Types.ObjectId.isValid(notificationId)) {
      return NextResponse.json(
        { message: "Valid notificationId is required" },
        { status: 400 },
      );
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient_id: userId },
      { $set: { is_read: true, read_at: new Date() } },
      { new: true },
    ).lean();

    if (!notification)
      return NextResponse.json(
        { message: "Notification not found" },
        { status: 404 },
      );

    const unread_count = await Notification.countDocuments({
      recipient_id: userId,
      is_read: false,
    });

    return NextResponse.json({
      message: "Notification marked as read",
      notification,
      unread_count,
    });
  } catch (error) {
    console.error("PATCH /api/notifications error:", error);
    return NextResponse.json(
      { message: "Failed to update notification" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = new mongoose.Types.ObjectId(session.user.id);

    if (searchParams.get("all") === "true") {
      const result = await Notification.deleteMany({ recipient_id: userId });

      return NextResponse.json({
        message: "All notifications deleted",
        deleted: result.deletedCount || 0,
        unread_count: 0,
      });
    }

    const notificationId = searchParams.get("id");

    if (!notificationId || !mongoose.Types.ObjectId.isValid(notificationId)) {
      return NextResponse.json(
        { message: "Valid notification id is required" },
        { status: 400 },
      );
    }

    const notification = await Notification.findOne({
      _id: notificationId,
      recipient_id: userId,
    }).select("is_read");

    if (!notification) {
      return NextResponse.json(
        { message: "Notification not found" },
        { status: 404 },
      );
    }

    await Notification.deleteOne({
      _id: notificationId,
      recipient_id: userId,
    });

    const unread_count = await Notification.countDocuments({
      recipient_id: userId,
      is_read: false,
    });

    return NextResponse.json({
      message: "Notification deleted",
      deleted: 1,
      was_unread: !notification.is_read,
      unread_count,
    });
  } catch (error) {
    console.error("DELETE /api/notifications error:", error);
    return NextResponse.json(
      { message: "Failed to delete notification" },
      { status: 500 },
    );
  }
}
