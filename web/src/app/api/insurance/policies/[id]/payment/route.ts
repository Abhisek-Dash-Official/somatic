import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import InsurancePolicy from "@/models/InsurancePolicy";
import Transaction from "@/models/Transaction";
import SystemLog from "@/models/SystemLog";
import Razorpay from "razorpay";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "patient") {
      return NextResponse.json(
        { error: "Only patients can make insurance payments" },
        { status: 403 },
      );
    }

    const { id } = await params;

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

    if (policy.status !== "approved" && policy.status !== "payment_pending") {
      return NextResponse.json(
        { error: "This insurance policy is not ready for payment" },
        { status: 400 },
      );
    }

    const plan = policy.plan_id as any;

    if (!plan || !plan.is_active) {
      return NextResponse.json(
        { error: "Insurance plan is no longer active" },
        { status: 400 },
      );
    }

    const existingTransaction = await Transaction.findOne({
      user_id: session.user.id,
      transaction_type: "insurance_premium",
      reference_id: policy._id,
    });

    if (existingTransaction?.status === "paid") {
      return NextResponse.json(
        { error: "Insurance premium has already been paid" },
        { status: 409 },
      );
    }

    if (
      existingTransaction?.status === "created" ||
      existingTransaction?.status === "pending"
    ) {
      return NextResponse.json({
        message: "Payment order already exists",
        transaction_id: existingTransaction._id,
        razorpay_order_id: existingTransaction.gateway_order_id,
        amount: Math.round(existingTransaction.amount * 100),
        currency: existingTransaction.currency,
        key_id: process.env.RAZORPAY_KEY_ID,
        plan_name: plan.name,
      });
    }

    const amount = Number(plan.premium_amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid insurance premium amount" },
        { status: 400 },
      );
    }

    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorpayKeyId || !razorpayKeySecret) {
      return NextResponse.json(
        { error: "Payment gateway is not configured" },
        { status: 500 },
      );
    }

    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });

    const transaction = await Transaction.create({
      user_id: session.user.id,
      transaction_type: "insurance_premium",
      reference_id: policy._id,
      amount,
      currency: "INR",
      status: "created",
      payment_gateway: "razorpay",
      metadata: {
        policy_id: policy._id,
        plan_id: plan._id,
        plan_name: plan.name,
      },
    });

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: transaction._id.toString(),
      notes: {
        transaction_id: transaction._id.toString(),
        policy_id: policy._id.toString(),
        user_id: session.user.id,
        transaction_type: "insurance_premium",
      },
    });

    transaction.gateway_order_id = razorpayOrder.id;
    transaction.status = "pending";
    await transaction.save();

    policy.status = "payment_pending";
    await policy.save();

    await SystemLog.create({
      actor_id: session.user.id,
      actor_role: session.user.role,
      action_type: "INSURANCE_PAYMENT_ORDER_CREATED",
      target_id: policy._id,
      details: {
        transaction_id: transaction._id,
        razorpay_order_id: razorpayOrder.id,
        amount,
        currency: "INR",
      },
    });

    return NextResponse.json({
      message: "Payment order created successfully",
      transaction_id: transaction._id,
      razorpay_order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key_id: razorpayKeyId,
      plan_name: plan.name,
    });
  } catch (error) {
    console.error("Insurance payment order creation error:", error);

    return NextResponse.json(
      { error: "Failed to create insurance payment order" },
      { status: 500 },
    );
  }
}
