import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Subscription from "@/models/Subscription";
import SubscriptionPlan from "@/models/SubscriptionPlan";
import Transaction from "@/models/Transaction";
import {
  fetchRazorpayOrder,
  fetchRazorpayPayment,
  verifyRazorpaySignature,
} from "@/lib/payment";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      await req.json();

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Invalid payment response." },
        { status: 400 },
      );
    }

    await connectDB();

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

    if (!["created", "pending"].includes(transaction.status)) {
      return NextResponse.json(
        {
          error: `Transaction cannot be verified from ${transaction.status} state.`,
        },
        { status: 400 },
      );
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

    if (subscription.status !== "pending") {
      return NextResponse.json(
        { error: "Subscription is no longer pending payment." },
        { status: 409 },
      );
    }

    const plan = await SubscriptionPlan.findById(subscription.plan_id);

    if (!plan || !plan.is_active) {
      return NextResponse.json(
        { error: "Subscription plan is no longer available." },
        { status: 404 },
      );
    }

    if (transaction.gateway_order_id !== razorpay_order_id) {
      return NextResponse.json(
        { error: "Razorpay order mismatch." },
        { status: 400 },
      );
    }

    const signatureValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    );

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

    const [razorpayOrder, razorpayPayment] = await Promise.all([
      fetchRazorpayOrder(razorpay_order_id),
      fetchRazorpayPayment(razorpay_payment_id),
    ]);

    const expectedAmount = Math.round(Number(transaction.amount) * 100);
    const orderAmount = Number(razorpayOrder.amount);
    const paymentAmount = Number(razorpayPayment.amount);

    if (
      razorpayOrder.currency !== transaction.currency ||
      razorpayPayment.currency !== transaction.currency ||
      !Number.isFinite(orderAmount) ||
      !Number.isFinite(paymentAmount) ||
      orderAmount !== expectedAmount ||
      paymentAmount !== expectedAmount
    ) {
      transaction.status = "failed";
      transaction.failed_at = new Date();
      transaction.failure_reason = "Payment amount or currency mismatch.";
      await transaction.save();

      return NextResponse.json(
        { error: "Payment amount does not match subscription amount." },
        { status: 400 },
      );
    }

    if (String(razorpayPayment.order_id) !== String(razorpay_order_id)) {
      transaction.status = "failed";
      transaction.failed_at = new Date();
      transaction.failure_reason =
        "Payment does not belong to the provided Razorpay order.";
      await transaction.save();

      return NextResponse.json(
        { error: "Payment does not belong to this order." },
        { status: 400 },
      );
    }

    if (razorpayPayment.status !== "captured") {
      transaction.status = "failed";
      transaction.failed_at = new Date();
      transaction.failure_reason = `Razorpay payment status: ${razorpayPayment.status}`;
      await transaction.save();

      return NextResponse.json(
        { error: "Payment has not been captured." },
        { status: 400 },
      );
    }

    const planPrice = Number(plan.price);

    if (
      !Number.isFinite(planPrice) ||
      planPrice <= 0 ||
      Math.round(planPrice * 100) !== expectedAmount
    ) {
      transaction.status = "failed";
      transaction.failed_at = new Date();
      transaction.failure_reason =
        "Subscription plan price changed after order creation.";
      await transaction.save();

      return NextResponse.json(
        { error: "Subscription amount is no longer valid." },
        { status: 409 },
      );
    }

    const durationDays = Number(plan.duration_days);

    if (!Number.isFinite(durationDays) || durationDays < 1) {
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
    transaction.metadata = {
      ...((transaction.metadata as Record<string, unknown>) || {}),
      payment_status: "captured",
      verified_at: now.toISOString(),
    };

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
