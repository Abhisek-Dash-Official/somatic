import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import SubscriptionPlan from "@/models/SubscriptionPlan";

export async function GET() {
  try {
    await connectDB();

    const plans = await SubscriptionPlan.find({ is_active: true })
      .sort({ duration_days: 1 })
      .lean();

    return NextResponse.json({ plans });
  } catch (error) {
    console.error("Subscription plans error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription plans." },
      { status: 500 },
    );
  }
}
