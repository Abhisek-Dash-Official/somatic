import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import SubscriptionPlan from "@/models/SubscriptionPlan";
import Subscription from "@/models/Subscription";
import Transaction from "@/models/Transaction";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await connectDB();

    const { plan_id } = await req.json();

    if (!plan_id) {
      return NextResponse.json({ error: "Plan is required." }, { status: 400 });
    }

    const plan = await SubscriptionPlan.findOne({
      _id: plan_id,
      is_active: true,
    });

    if (!plan) {
      return NextResponse.json(
        { error: "Subscription plan not found." },
        { status: 404 },
      );
    }

    const activeSubscription = await Subscription.findOne({
      user_id: session.user.id,
      status: "active",
      end_date: { $gt: new Date() },
    });

    if (activeSubscription) {
      return NextResponse.json(
        {
          error:
            "You already have an active subscription. Please wait until it expires before purchasing another plan.",
        },
        { status: 409 },
      );
    }

    const amount = Math.round(Number(plan.price) * 100);

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid subscription price." },
        { status: 400 },
      );
    }

    const subscription = await Subscription.create({
      user_id: session.user.id,
      plan_id: plan._id,
      plan_name: plan.name,
      status: "pending",
      price: plan.price,
      currency: plan.currency,
      token_limit: plan.token_limit,
      tokens_used: 0,
    });

    const transaction = await Transaction.create({
      user_id: session.user.id,
      transaction_type: "subscription",
      reference_id: subscription._id,
      amount: plan.price,
      currency: plan.currency,
      status: "created",
      payment_gateway: "razorpay",
    });

    const order = await razorpay.orders.create({
      amount,
      currency: plan.currency,
      receipt: transaction._id.toString(),
      notes: {
        subscription_id: subscription._id.toString(),
        transaction_id: transaction._id.toString(),
        user_id: session.user.id,
        plan_id: plan._id.toString(),
      },
    });

    transaction.gateway_order_id = order.id;
    await transaction.save();

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
      subscription_id: subscription._id,
      transaction_id: transaction._id,
      plan: {
        name: plan.name,
      },
    });
  } catch (error) {
    console.error("Create subscription order error:", error);

    return NextResponse.json(
      { error: "Failed to create payment order." },
      { status: 500 },
    );
  }
}
