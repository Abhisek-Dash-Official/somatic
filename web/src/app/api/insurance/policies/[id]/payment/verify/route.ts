import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import crypto from "crypto";
import Razorpay from "razorpay";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import InsurancePolicy from "@/models/InsurancePolicy";
import Transaction from "@/models/Transaction";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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
    const body = await _req.json();
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

    if (policy.status !== "payment_pending") {
      if (policy.status === "active") {
        return NextResponse.json({
          message: "Insurance policy is already active",
          policy: {
            _id: policy._id,
            policy_number: policy.policy_number,
            status: policy.status,
            start_date: policy.start_date,
            expiry_date: policy.expiry_date,
          },
        });
      }

      return NextResponse.json(
        { error: "Insurance policy is not awaiting payment" },
        { status: 400 },
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

    if (transaction.status !== "created" && transaction.status !== "pending") {
      return NextResponse.json(
        { error: "This transaction cannot be verified" },
        { status: 400 },
      );
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    const keyId = process.env.RAZORPAY_KEY_ID;

    if (!secret || !keyId) {
      return NextResponse.json(
        { error: "Payment gateway is not configured" },
        { status: 500 },
      );
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 },
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: secret,
    });

    const payment = await razorpay.payments.fetch(razorpay_payment_id);

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

    if (
      !Number.isFinite(Number(plan.policy_term_years)) ||
      Number(plan.policy_term_years) <= 0
    ) {
      return NextResponse.json(
        { error: "Invalid insurance policy term" },
        { status: 400 },
      );
    }

    const startDate = new Date();
    const expiryDate = new Date(startDate);
    expiryDate.setFullYear(
      expiryDate.getFullYear() + Number(plan.policy_term_years),
    );

    const policyNumber = `SOM-${startDate.getTime()}-${policy._id
      .toString()
      .slice(-6)
      .toUpperCase()}`;

    transaction.gateway_payment_id = razorpay_payment_id;
    transaction.gateway_signature = razorpay_signature;
    transaction.status = "paid";
    transaction.paid_at = new Date();
    await transaction.save();

    policy.status = "active";
    policy.policy_number = policyNumber;
    policy.start_date = startDate;
    policy.expiry_date = expiryDate;
    await policy.save();

    return NextResponse.json({
      message: "Insurance payment verified successfully",
      transaction_id: transaction._id,
      policy: {
        _id: policy._id,
        policy_number: policy.policy_number,
        status: policy.status,
        start_date: policy.start_date,
        expiry_date: policy.expiry_date,
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
