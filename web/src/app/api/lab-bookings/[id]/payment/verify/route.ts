import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import crypto from "crypto";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import LabBooking from "@/models/LabBooking";
import Transaction from "@/models/Transaction";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
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

    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: "Incomplete payment verification data." },
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

    if (transaction.gateway_order_id !== razorpay_order_id) {
      return NextResponse.json(
        { success: false, error: "Invalid payment order." },
        { status: 400 },
      );
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      return NextResponse.json(
        { success: false, error: "Payment gateway is not configured." },
        { status: 500 },
      );
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (
      !crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(razorpay_signature),
      )
    ) {
      transaction.status = "failed";
      transaction.failed_at = new Date();
      transaction.failure_reason = "Invalid payment signature.";
      await transaction.save();

      return NextResponse.json(
        { success: false, error: "Payment verification failed." },
        { status: 400 },
      );
    }

    transaction.gateway_payment_id = razorpay_payment_id;
    transaction.gateway_signature = razorpay_signature;
    transaction.status = "paid";
    transaction.paid_at = new Date();
    transaction.failure_reason = undefined;
    await transaction.save();

    booking.payment_status = "paid";
    await booking.save();

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully.",
      data: {
        booking_id: booking._id,
        booking_number: booking.booking_number,
        payment_status: booking.payment_status,
        transaction_id: transaction._id,
      },
    });
  } catch (error) {
    console.error("POST /api/lab-bookings/[id]/payment/verify error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to verify payment." },
      { status: 500 },
    );
  }
}
