import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Subscription from "@/models/Subscription";
import SubscriptionPlan from "@/models/SubscriptionPlan";

export async function GET() {
  try {
    SubscriptionPlan;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await connectDB();

    const subscription = await Subscription.findOne({
      user_id: session.user.id,
      status: "active",
      end_date: { $gt: new Date() },
    })
      .sort({ end_date: -1 })
      .populate({
        path: "plan_id",
        select: "features supported_features",
      })
      .lean();

    if (!subscription) {
      return NextResponse.json({ subscription: null });
    }

    return NextResponse.json({
      subscription: {
        ...subscription,
        features: subscription.plan_id?.features || [],
        supported_features: subscription.plan_id?.supported_features || [],
      },
    });
  } catch (error) {
    console.error("Current subscription error:", error);

    return NextResponse.json(
      { error: "Failed to fetch subscription." },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await connectDB();

    const subscription = await Subscription.findOne({
      user_id: session.user.id,
      status: "active",
      end_date: { $gt: new Date() },
    }).sort({ end_date: -1 });

    if (!subscription) {
      return NextResponse.json(
        { error: "No active subscription found." },
        { status: 404 },
      );
    }

    subscription.status = "cancelled";
    await subscription.save();

    return NextResponse.json({
      success: true,
      message: "Your subscription has been cancelled successfully.",
    });
  } catch (error) {
    console.error("Cancel subscription error:", error);

    return NextResponse.json(
      { error: "Failed to cancel subscription." },
      { status: 500 },
    );
  }
}
