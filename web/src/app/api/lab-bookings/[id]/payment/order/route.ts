import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import Razorpay from "razorpay";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import LabBooking from "@/models/LabBooking";
import Transaction from "@/models/Transaction";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 401 },
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid booking ID." },
        { status: 400 },
      );
    }

    await connectDB();

    const booking = await LabBooking.findOne({
      _id: id,
      patient_id: new mongoose.Types.ObjectId(session.user.id),
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Lab booking not found." },
        { status: 404 },
      );
    }

    if (booking.payment_method !== "online") {
      return NextResponse.json(
        { success: false, error: "This booking uses cash on collection." },
        { status: 400 },
      );
    }

    if (booking.payment_status === "paid") {
      return NextResponse.json(
        { success: false, error: "This booking is already paid." },
        { status: 400 },
      );
    }

    if (booking.status === "cancelled") {
      return NextResponse.json(
        { success: false, error: "Cancelled bookings cannot be paid." },
        { status: 400 },
      );
    }

    if (!booking.transaction_id) {
      return NextResponse.json(
        { success: false, error: "Payment transaction not found." },
        { status: 500 },
      );
    }

    const transaction = await Transaction.findOne({
      _id: booking.transaction_id,
      user_id: new mongoose.Types.ObjectId(session.user.id),
      reference_id: booking._id,
      transaction_type: "lab_booking",
    });

    if (!transaction) {
      return NextResponse.json(
        { success: false, error: "Payment transaction not found." },
        { status: 404 },
      );
    }

    if (transaction.status === "paid") {
      return NextResponse.json(
        { success: false, error: "This transaction is already paid." },
        { status: 400 },
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { success: false, error: "Payment gateway is not configured." },
        { status: 500 },
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(booking.total_amount * 100),
      currency: "INR",
      receipt: booking.booking_number,
      notes: {
        booking_id: String(booking._id),
        booking_number: booking.booking_number,
        transaction_id: String(transaction._id),
      },
    });

    transaction.gateway_order_id = order.id;
    transaction.status = "pending";
    transaction.payment_gateway = "razorpay";
    await transaction.save();

    return NextResponse.json({
      success: true,
      data: {
        key_id: keyId,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        booking_id: booking._id,
        booking_number: booking.booking_number,
        transaction_id: transaction._id,
      },
    });
  } catch (error) {
    console.error("POST /api/lab-bookings/[id]/payment/order error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to create payment order." },
      { status: 500 },
    );
  }
}
