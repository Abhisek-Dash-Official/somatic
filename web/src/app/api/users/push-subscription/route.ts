import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import PushSubscription from "@/models/PushSubscription";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { endpoint, keys, userAgent, deviceName } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json(
        { message: "Invalid push subscription" },
        { status: 400 },
      );
    }

    await connectDB();

    const userId = new mongoose.Types.ObjectId(session.user.id);

    const subscription = await PushSubscription.findOneAndUpdate(
      { endpoint },
      {
        user_id: userId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        user_agent: userAgent,
        device_name: deviceName,
        is_active: true,
        last_used_at: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    return NextResponse.json({
      message: "Push notifications enabled",
      subscription_id: subscription._id,
    });
  } catch (error) {
    console.error("POST /api/users/push-subscription error:", error);

    return NextResponse.json(
      { message: "Failed to save push subscription" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json(
        { message: "Endpoint is required" },
        { status: 400 },
      );
    }

    await connectDB();

    await PushSubscription.updateOne(
      {
        user_id: new mongoose.Types.ObjectId(session.user.id),
        endpoint,
      },
      {
        $set: {
          is_active: false,
        },
      },
    );

    return NextResponse.json({
      message: "Push notifications disabled",
    });
  } catch (error) {
    console.error("DELETE /api/users/push-subscription error:", error);

    return NextResponse.json(
      { message: "Failed to disable push notifications" },
      { status: 500 },
    );
  }
}
