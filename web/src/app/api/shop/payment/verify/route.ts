import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import crypto from "crypto";

import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";

import Transaction from "@/models/Transaction";
import Order from "@/models/Order";
import Cart from "@/models/Cart";

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
        {
          error: "Missing payment verification fields",
        },
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
        order_id: order._id.toString(),
      });
    }

    if (transaction.gateway_order_id !== razorpay_order_id) {
      return NextResponse.json(
        {
          error: "Razorpay order mismatch",
        },
        { status: 400 },
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      console.error("RAZORPAY_KEY_SECRET is missing");

      return NextResponse.json(
        {
          error: "Payment configuration error",
        },
        { status: 500 },
      );
    }

    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${transaction.gateway_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const generatedBuffer = Buffer.from(generatedSignature, "utf8");

    const receivedBuffer = Buffer.from(razorpay_signature, "utf8");

    const signatureValid =
      generatedBuffer.length === receivedBuffer.length &&
      crypto.timingSafeEqual(generatedBuffer, receivedBuffer);

    if (!signatureValid) {
      transaction.status = "failed";
      transaction.failed_at = new Date();
      transaction.failure_reason = "Invalid Razorpay payment signature";

      await transaction.save();

      order.payment_status = "failed";

      await order.save();

      return NextResponse.json(
        {
          error: "Payment verification failed",
        },
        { status: 400 },
      );
    }

    transaction.gateway_payment_id = razorpay_payment_id;
    transaction.gateway_signature = razorpay_signature;
    transaction.status = "paid";
    transaction.paid_at = new Date();

    await transaction.save();

    order.payment_status = "paid";
    order.order_status = "confirmed";

    await order.save();

    await Cart.findOneAndUpdate(
      {
        user_id: session.user.id,
      },
      {
        $set: {
          items: [],
          total_amount: 0,
        },
      },
    );

    return NextResponse.json({
      success: true,
      order_id: order._id.toString(),
      payment_id: razorpay_payment_id,
      message: "Payment verified successfully",
    });
  } catch (error: any) {
    console.error("Verify Payment Error:", error);

    return NextResponse.json(
      {
        error: "Unable to verify payment",
      },
      { status: 500 },
    );
  }
}
