import crypto from "crypto";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Subscription from "@/models/Subscription";
import SubscriptionPlan from "@/models/SubscriptionPlan";
import Transaction from "@/models/Transaction";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await connectDB();

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      await req.json();

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Invalid payment response." },
        { status: 400 },
      );
    }

    const transaction = await Transaction.findOne({
      user_id: session.user.id,
      gateway_order_id: razorpay_order_id,
      transaction_type: "subscription",
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found." },
        { status: 404 },
      );
    }

    if (transaction.status === "paid") {
      return NextResponse.json({
        success: true,
        message: "Payment already verified.",
      });
    }

    const subscription = await Subscription.findOne({
      _id: transaction.reference_id,
      user_id: session.user.id,
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found." },
        { status: 404 },
      );
    }

    const plan = await SubscriptionPlan.findById(subscription.plan_id);

    if (!plan) {
      return NextResponse.json(
        { error: "Subscription plan not found." },
        { status: 404 },
      );
    }

    if (transaction.gateway_order_id !== razorpay_order_id) {
      return NextResponse.json(
        { error: "Razorpay order mismatch." },
        { status: 400 },
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      console.error("RAZORPAY_KEY_SECRET is missing.");

      return NextResponse.json(
        { error: "Payment configuration error." },
        { status: 500 },
      );
    }

    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${transaction.gateway_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const expected = Buffer.from(generatedSignature, "utf8");
    const received = Buffer.from(razorpay_signature, "utf8");

    const signatureValid =
      expected.length === received.length &&
      crypto.timingSafeEqual(expected, received);

    if (!signatureValid) {
      transaction.status = "failed";
      transaction.failed_at = new Date();
      transaction.failure_reason = "Invalid Razorpay payment signature.";

      await transaction.save();

      return NextResponse.json(
        { error: "Payment verification failed." },
        { status: 400 },
      );
    }

    const durationDays = Number(plan.duration_days);

    if (!Number.isFinite(durationDays) || durationDays < 1) {
      console.error("Invalid plan duration:", plan.duration_days);

      return NextResponse.json(
        { error: "Invalid subscription plan duration." },
        { status: 500 },
      );
    }

    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + durationDays);

    transaction.gateway_payment_id = razorpay_payment_id;
    transaction.gateway_signature = razorpay_signature;
    transaction.status = "paid";
    transaction.paid_at = now;

    subscription.status = "active";
    subscription.start_date = now;
    subscription.end_date = endDate;
    subscription.tokens_used = 0;

    await Promise.all([transaction.save(), subscription.save()]);

    return NextResponse.json({
      success: true,
      message: "Subscription activated successfully.",
      subscription: {
        id: subscription._id,
        name: subscription.plan_name,
        start_date: subscription.start_date,
        end_date: subscription.end_date,
      },
    });
  } catch (error) {
    console.error("Subscription payment verification error:", error);

    return NextResponse.json(
      { error: "Failed to verify payment." },
      { status: 500 },
    );
  }
}
