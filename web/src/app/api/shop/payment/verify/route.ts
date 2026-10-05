import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Transaction from "@/models/Transaction";
import Order from "@/models/Order";
import Cart from "@/models/Cart";
import SystemLog from "@/models/SystemLog";
import {
  verifyRazorpaySignature,
  fetchRazorpayOrder,
  fetchRazorpayPayment,
} from "@/lib/payment";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await req.json();

    const {
      order_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    if (
      !order_id ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return NextResponse.json(
        { error: "Missing payment verification fields" },
        { status: 400 },
      );
    }

    const order = await Order.findOne({
      _id: order_id,
      user_id: session.user.id,
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const transaction = await Transaction.findOne({
      reference_id: order._id,
      user_id: session.user.id,
      transaction_type: "shop_order",
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 },
      );
    }

    if (transaction.status === "paid" && order.payment_status === "paid") {
      return NextResponse.json({
        success: true,
        already_paid: true,
        order: order.toObject(),
        order_id: order._id.toString(),
        payment_id: transaction.gateway_payment_id,
        transaction_id: transaction._id.toString(),
      });
    }

    if (transaction.status !== "pending") {
      return NextResponse.json(
        { error: "Transaction is not payable" },
        { status: 400 },
      );
    }

    if (transaction.gateway_order_id !== razorpay_order_id) {
      return NextResponse.json(
        { error: "Razorpay order mismatch" },
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
      transaction.failure_reason = "Invalid Razorpay payment signature";
      await transaction.save();

      order.payment_status = "failed";
      await order.save();

      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 },
      );
    }

    const [razorpayOrder, razorpayPayment] = await Promise.all([
      fetchRazorpayOrder(razorpay_order_id),
      fetchRazorpayPayment(razorpay_payment_id),
    ]);

    const expectedAmount = Math.round(transaction.amount * 100);

    if (
      razorpayOrder.id !== razorpay_order_id ||
      razorpayOrder.currency !== transaction.currency ||
      Number(razorpayOrder.amount) !== expectedAmount
    ) {
      return NextResponse.json(
        { error: "Razorpay order amount or currency mismatch" },
        { status: 400 },
      );
    }

    if (
      razorpayPayment.id !== razorpay_payment_id ||
      razorpayPayment.order_id !== razorpay_order_id
    ) {
      return NextResponse.json(
        { error: "Razorpay payment mismatch" },
        { status: 400 },
      );
    }

    if (
      razorpayPayment.currency !== transaction.currency ||
      Number(razorpayPayment.amount) !== expectedAmount
    ) {
      return NextResponse.json(
        { error: "Payment amount or currency mismatch" },
        { status: 400 },
      );
    }

    if (razorpayPayment.status !== "captured") {
      return NextResponse.json(
        {
          error: "Payment has not been captured yet",
          payment_status: razorpayPayment.status,
        },
        { status: 400 },
      );
    }

    transaction.gateway_payment_id = razorpay_payment_id;
    transaction.gateway_signature = razorpay_signature;
    transaction.status = "paid";
    transaction.paid_at = new Date();
    transaction.failure_reason = undefined;

    order.payment_status = "paid";
    order.order_status = "confirmed";

    await Promise.all([transaction.save(), order.save()]);

    await SystemLog.create({
      actor_id: session.user.id,
      actor_role: session.user.role,
      action_type: "SHOP_PAYMENT_VERIFIED",
      target_id: order._id,
      details: {
        order_id: order._id,
        transaction_id: transaction._id,
        payment_method: "ONLINE",
        payment_status: "paid",
        order_status: "confirmed",
        razorpay_order_id,
        razorpay_payment_id,
        amount: transaction.amount,
        currency: transaction.currency,
      },
    });

    await Cart.findOneAndUpdate(
      { user_id: session.user.id },
      {
        $set: {
          items: [],
          total_amount: 0,
        },
      },
    );

    return NextResponse.json({
      success: true,
      already_paid: false,
      order: order.toObject(),
      order_id: order._id.toString(),
      transaction_id: transaction._id.toString(),
      payment_id: razorpay_payment_id,
      message: "Payment verified successfully",
    });
  } catch (error) {
    console.error("Verify Payment Error:", error);

    return NextResponse.json(
      { error: "Unable to verify payment" },
      { status: 500 },
    );
  }
}
