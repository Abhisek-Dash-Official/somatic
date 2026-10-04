import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import InsurancePolicy from "@/models/InsurancePolicy";
import Transaction from "@/models/Transaction";
import SystemLog from "@/models/SystemLog";
import { fetchRazorpayPayment, verifyRazorpaySignature } from "@/lib/payment";
import { getGracePeriodEnd, getNextPaymentDate } from "@/lib/insurance";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "patient") {
      return NextResponse.json(
        { error: "Only patients can verify insurance payments" },
        { status: 403 },
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid insurance policy ID" },
        { status: 400 },
      );
    }

    const body = await req.json();

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Payment verification details are required" },
        { status: 400 },
      );
    }

    await dbConnect();

    const policy = await InsurancePolicy.findOne({
      _id: id,
      user_id: session.user.id,
    }).populate("plan_id");

    if (!policy) {
      return NextResponse.json(
        { error: "Insurance policy not found" },
        { status: 404 },
      );
    }

    const transaction = await Transaction.findOne({
      user_id: session.user.id,
      transaction_type: "insurance_premium",
      reference_id: policy._id,
      gateway_order_id: razorpay_order_id,
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Payment transaction not found" },
        { status: 404 },
      );
    }

    if (transaction.status === "paid") {
      return NextResponse.json({
        message: "Payment has already been verified",
        transaction_id: transaction._id,
        policy_status: policy.status,
      });
    }

    if (!["created", "pending"].includes(transaction.status)) {
      return NextResponse.json(
        { error: "This transaction cannot be verified" },
        { status: 400 },
      );
    }

    const validSignature = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    );

    if (!validSignature) {
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 },
      );
    }

    const payment = await fetchRazorpayPayment(razorpay_payment_id);

    if (payment.order_id !== transaction.gateway_order_id) {
      return NextResponse.json(
        { error: "Payment does not belong to this transaction" },
        { status: 400 },
      );
    }

    if (payment.amount !== Math.round(transaction.amount * 100)) {
      return NextResponse.json(
        { error: "Payment amount does not match the transaction" },
        { status: 400 },
      );
    }

    if (payment.currency !== transaction.currency) {
      return NextResponse.json(
        { error: "Payment currency does not match the transaction" },
        { status: 400 },
      );
    }

    if (payment.status !== "captured") {
      return NextResponse.json(
        { error: "Payment has not been captured successfully" },
        { status: 400 },
      );
    }

    const plan = policy.plan_id as any;

    if (!plan) {
      return NextResponse.json(
        { error: "Insurance plan not found" },
        { status: 404 },
      );
    }

    const policyTermYears = Number(plan.policy_term_years);

    if (!Number.isFinite(policyTermYears) || policyTermYears <= 0) {
      return NextResponse.json(
        { error: "Invalid insurance policy term" },
        { status: 400 },
      );
    }

    const metadata = (transaction.metadata || {}) as Record<string, any>;

    const paymentPurpose =
      metadata.payment_purpose ||
      (policy.status === "active" ? "renewal_premium" : "initial_premium");

    if (
      !["initial_premium", "renewal_premium", "revival"].includes(
        paymentPurpose,
      )
    ) {
      return NextResponse.json(
        { error: "Invalid payment purpose" },
        { status: 400 },
      );
    }

    const paymentDate = new Date();
    const currentPaymentCount = Number(policy.premium_payments_completed || 0);
    const paymentCount = currentPaymentCount + 1;

    let policyStartDate = policy.start_date
      ? new Date(policy.start_date)
      : paymentDate;

    let policyExpiryDate = policy.expiry_date
      ? new Date(policy.expiry_date)
      : paymentDate;

    if (paymentPurpose === "initial_premium") {
      policyStartDate = paymentDate;
      policyExpiryDate = new Date(paymentDate);
      policyExpiryDate.setFullYear(
        policyExpiryDate.getFullYear() + policyTermYears,
      );
    }

    if (
      (paymentPurpose === "renewal_premium" || paymentPurpose === "revival") &&
      (!policy.expiry_date || paymentDate >= new Date(policy.expiry_date))
    ) {
      return NextResponse.json(
        { error: "This insurance policy term has ended" },
        { status: 400 },
      );
    }

    const nextPaymentDate = getNextPaymentDate(
      paymentDate,
      plan.premium_frequency,
    );

    const policyNumber =
      policy.policy_number ||
      `SOM-${paymentDate.getTime()}-${policy._id
        .toString()
        .slice(-6)
        .toUpperCase()}`;

    transaction.gateway_payment_id = razorpay_payment_id;
    transaction.gateway_signature = razorpay_signature;
    transaction.status = "paid";
    transaction.paid_at = paymentDate;
    await transaction.save();

    policy.status = "active";
    policy.policy_number = policyNumber;
    policy.start_date = policyStartDate;
    policy.expiry_date = policyExpiryDate;
    policy.last_payment_at = paymentDate;
    policy.premium_payments_completed = paymentCount;

    if (nextPaymentDate < policyExpiryDate) {
      policy.next_payment_due_at = nextPaymentDate;
      policy.grace_period_ends_at = getGracePeriodEnd(nextPaymentDate);
    } else {
      policy.next_payment_due_at = undefined;
      policy.grace_period_ends_at = undefined;
    }

    if (paymentPurpose === "revival") {
      policy.lapsed_at = undefined;
      policy.revival_requested_at = undefined;
      policy.revival_approved_at = undefined;
    }

    await policy.save();

    await SystemLog.create({
      actor_id: session.user.id,
      actor_role: session.user.role,
      action_type: "INSURANCE_PAYMENT_VERIFIED",
      target_id: policy._id,
      details: {
        transaction_id: transaction._id,
        policy_number: policy.policy_number,
        payment_purpose: paymentPurpose,
        payment_id: razorpay_payment_id,
        amount: transaction.amount,
        premium_payment_number: paymentCount,
      },
    });

    return NextResponse.json({
      message:
        paymentPurpose === "revival"
          ? "Insurance policy revived successfully"
          : "Insurance payment verified successfully",
      transaction_id: transaction._id,
      payment_purpose: paymentPurpose,
      policy: {
        _id: policy._id,
        policy_number: policy.policy_number,
        status: policy.status,
        start_date: policy.start_date,
        expiry_date: policy.expiry_date,
        last_payment_at: policy.last_payment_at,
        next_payment_due_at: policy.next_payment_due_at,
        grace_period_ends_at: policy.grace_period_ends_at,
        premium_payments_completed: policy.premium_payments_completed,
      },
    });
  } catch (error) {
    console.error("Insurance payment verification error:", error);

    return NextResponse.json(
      { error: "Failed to verify insurance payment" },
      { status: 500 },
    );
  }
}
