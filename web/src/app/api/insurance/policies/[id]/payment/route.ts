import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import InsurancePolicy from "@/models/InsurancePolicy";
import Transaction from "@/models/Transaction";
import SystemLog from "@/models/SystemLog";
import { createRazorpayOrder, getRazorpayKeyId } from "@/lib/payment";
import { syncInsurancePolicyStatus } from "@/lib/insurance";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: RouteContext) {
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid insurance policy ID" },
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

    await syncInsurancePolicyStatus(policy);

    if (policy.status === "expired") {
      return NextResponse.json(
        { error: "This insurance policy has expired." },
        { status: 400 },
      );
    }

    if (policy.status === "cancelled") {
      return NextResponse.json(
        { error: "This insurance policy has been cancelled." },
        { status: 400 },
      );
    }

    if (policy.status === "rejected") {
      return NextResponse.json(
        { error: "This insurance policy application was rejected." },
        { status: 400 },
      );
    }

    if (policy.status === "lapsed") {
      return NextResponse.json(
        {
          error:
            "This insurance policy has lapsed. Please request policy revival.",
        },
        { status: 400 },
      );
    }

    if (policy.status === "revival_pending") {
      return NextResponse.json(
        {
          error: "Your policy revival request is awaiting approval.",
        },
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

    const amount = Number(plan.premium_amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid insurance premium amount" },
        { status: 400 },
      );
    }

    let paymentPurpose: "initial_premium" | "renewal_premium" | "revival";

    if (policy.status === "payment_pending" && policy.revival_approved_at) {
      paymentPurpose = "revival";
    } else if (policy.status === "active") {
      if (!policy.next_payment_due_at) {
        return NextResponse.json(
          { error: "This policy does not have a pending premium payment." },
          { status: 400 },
        );
      }

      const now = new Date();

      if (now < new Date(policy.next_payment_due_at)) {
        return NextResponse.json(
          {
            error: "Your next premium payment is not due yet",
            next_payment_due_at: policy.next_payment_due_at,
          },
          { status: 400 },
        );
      }

      paymentPurpose = "renewal_premium";
    } else if (
      policy.status === "approved" ||
      policy.status === "payment_pending"
    ) {
      paymentPurpose = "initial_premium";
    } else {
      return NextResponse.json(
        { error: "This insurance policy is not available for payment" },
        { status: 400 },
      );
    }

    const existingTransaction = await Transaction.findOne({
      user_id: session.user.id,
      transaction_type: "insurance_premium",
      reference_id: policy._id,
      status: { $in: ["created", "pending"] },
      "metadata.payment_purpose": paymentPurpose,
    }).sort({ created_at: -1 });

    if (existingTransaction) {
      return NextResponse.json({
        message: "Payment order already exists",
        transaction_id: existingTransaction._id,
        razorpay_order_id: existingTransaction.gateway_order_id,
        amount: Math.round(existingTransaction.amount * 100),
        currency: existingTransaction.currency,
        key_id: getRazorpayKeyId(),
        plan_name: plan.name,
        premium_frequency: plan.premium_frequency,
        payment_purpose: paymentPurpose,
      });
    }

    const paymentNumber = Number(policy.premium_payments_completed || 0) + 1;

    const transaction = await Transaction.create({
      user_id: session.user.id,
      transaction_type: "insurance_premium",
      reference_id: policy._id,
      amount,
      currency: "INR",
      status: "created",
      payment_gateway: "razorpay",
      metadata: {
        policy_id: policy._id.toString(),
        plan_id: plan._id.toString(),
        plan_name: plan.name,
        premium_frequency: plan.premium_frequency,
        premium_payment_number: paymentNumber,
        payment_purpose: paymentPurpose,
      },
    });

    try {
      const razorpayOrder = await createRazorpayOrder({
        amount,
        currency: "INR",
        receipt: transaction._id.toString(),
        notes: {
          transaction_id: transaction._id.toString(),
          policy_id: policy._id.toString(),
          user_id: session.user.id,
          transaction_type: "insurance_premium",
          payment_purpose: paymentPurpose,
        },
      });

      transaction.gateway_order_id = razorpayOrder.id;
      transaction.status = "pending";
      await transaction.save();

      if (
        paymentPurpose === "initial_premium" &&
        policy.status === "approved"
      ) {
        policy.status = "payment_pending";
        await policy.save();
      }

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
          premium_frequency: plan.premium_frequency,
          premium_payment_number: paymentNumber,
          payment_purpose: paymentPurpose,
        },
      });

      return NextResponse.json({
        message: "Payment order created successfully",
        transaction_id: transaction._id,
        razorpay_order_id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key_id: getRazorpayKeyId(),
        plan_name: plan.name,
        premium_frequency: plan.premium_frequency,
        payment_purpose: paymentPurpose,
      });
    } catch (error) {
      await Transaction.deleteOne({ _id: transaction._id });
      throw error;
    }
  } catch (error) {
    console.error("Insurance payment order creation error:", error);

    return NextResponse.json(
      { error: "Failed to create insurance payment order" },
      { status: 500 },
    );
  }
}
