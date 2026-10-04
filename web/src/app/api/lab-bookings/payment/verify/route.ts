import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import LabTest from "@/models/LabTest";
import LabBooking from "@/models/LabBooking";
import Transaction from "@/models/Transaction";
import {
  fetchRazorpayOrder,
  fetchRazorpayPayment,
  verifyRazorpaySignature,
} from "@/lib/payment";

function generateBookingNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `LAB-${timestamp}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 401 },
      );
    }

    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      tests,
      collection_address,
      scheduled_date,
      scheduled_slot,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: "Incomplete payment verification data." },
        { status: 400 },
      );
    }

    if (!Array.isArray(tests) || tests.length === 0) {
      return NextResponse.json(
        { success: false, error: "Lab test selection is required." },
        { status: 400 },
      );
    }

    if (
      !collection_address?.address_line ||
      !collection_address?.city ||
      !collection_address?.state ||
      !collection_address?.pincode
    ) {
      return NextResponse.json(
        { success: false, error: "Complete collection address is required." },
        { status: 400 },
      );
    }

    if (!scheduled_date || !scheduled_slot) {
      return NextResponse.json(
        { success: false, error: "Collection date and slot are required." },
        { status: 400 },
      );
    }

    const testIds = tests.map((item) => item?.test_id).filter(Boolean);

    if (testIds.length !== tests.length) {
      return NextResponse.json(
        { success: false, error: "Invalid lab test selection." },
        { status: 400 },
      );
    }

    if (new Set(testIds.map(String)).size !== testIds.length) {
      return NextResponse.json(
        { success: false, error: "Duplicate lab tests are not allowed." },
        { status: 400 },
      );
    }

    if (testIds.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
      return NextResponse.json(
        { success: false, error: "Invalid lab test ID." },
        { status: 400 },
      );
    }

    const collectionDate = new Date(scheduled_date);

    if (
      Number.isNaN(collectionDate.getTime()) ||
      collectionDate.getTime() <= Date.now()
    ) {
      return NextResponse.json(
        { success: false, error: "Collection date must be in the future." },
        { status: 400 },
      );
    }

    if (
      !verifyRazorpaySignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      )
    ) {
      return NextResponse.json(
        { success: false, error: "Payment verification failed." },
        { status: 400 },
      );
    }

    const [razorpayOrder, razorpayPayment] = await Promise.all([
      fetchRazorpayOrder(razorpay_order_id),
      fetchRazorpayPayment(razorpay_payment_id),
    ]);

    const razorpayAmount = Number(razorpayOrder.amount);
    const paymentAmount = Number(razorpayPayment.amount);

    if (
      razorpayOrder.currency !== "INR" ||
      razorpayPayment.currency !== "INR" ||
      !Number.isFinite(razorpayAmount) ||
      !Number.isFinite(paymentAmount) ||
      razorpayAmount <= 0 ||
      paymentAmount !== razorpayAmount
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid payment order." },
        { status: 400 },
      );
    }

    if (String(razorpayPayment.order_id) !== String(razorpay_order_id)) {
      return NextResponse.json(
        { success: false, error: "Payment does not belong to this order." },
        { status: 400 },
      );
    }

    if (razorpayPayment.status !== "captured") {
      return NextResponse.json(
        { success: false, error: "Payment has not been captured." },
        { status: 400 },
      );
    }

    await connectDB();

    const existingTransaction = await Transaction.findOne({
      transaction_type: "lab_booking",
      gateway_payment_id: razorpay_payment_id,
    });

    if (existingTransaction) {
      const existingBooking = await LabBooking.findById(
        existingTransaction.reference_id,
      );

      if (existingBooking) {
        return NextResponse.json({
          success: true,
          message: "Payment was already verified.",
          data: {
            booking: existingBooking,
            transaction: existingTransaction,
          },
        });
      }

      return NextResponse.json(
        {
          success: false,
          error:
            "Payment transaction already exists but booking was not found.",
        },
        { status: 409 },
      );
    }

    const labTests = await LabTest.find({
      _id: { $in: testIds },
      is_active: true,
    }).lean();

    if (labTests.length !== testIds.length) {
      return NextResponse.json(
        {
          success: false,
          error: "One or more selected lab tests are unavailable.",
        },
        { status: 400 },
      );
    }

    const bookingTests = testIds.map((testId) => {
      const test = labTests.find(
        (item) => String(item._id) === String(testId),
      )!;

      return {
        test_id: test._id,
        name: test.name,
        type: test.type,
        price: test.price,
      };
    });

    const subtotal = bookingTests.reduce((sum, test) => sum + test.price, 0);
    const collectionFee = 0;
    const discount = 0;
    const totalAmount = subtotal + collectionFee - discount;
    const expectedAmount = Math.round(totalAmount * 100);

    if (razorpayAmount !== expectedAmount) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment amount does not match booking amount.",
        },
        { status: 400 },
      );
    }

    const booking = await LabBooking.create({
      booking_number: generateBookingNumber(),
      patient_id: new mongoose.Types.ObjectId(session.user.id),
      tests: bookingTests,
      subtotal,
      collection_fee: collectionFee,
      discount,
      total_amount: totalAmount,
      payment_status: "paid",
      payment_method: "online",
      collection_address: {
        address_line: collection_address.address_line.trim(),
        city: collection_address.city.trim(),
        state: collection_address.state.trim(),
        pincode: collection_address.pincode.trim(),
        landmark: collection_address.landmark?.trim() || undefined,
      },
      scheduled_date: collectionDate,
      scheduled_slot: scheduled_slot.trim(),
      status: "booked",
    });

    try {
      const transaction = await Transaction.create({
        user_id: new mongoose.Types.ObjectId(session.user.id),
        transaction_type: "lab_booking",
        reference_id: booking._id,
        amount: totalAmount,
        currency: "INR",
        status: "paid",
        payment_gateway: "razorpay",
        gateway_order_id: razorpay_order_id,
        gateway_payment_id: razorpay_payment_id,
        gateway_signature: razorpay_signature,
        paid_at: new Date(),
        metadata: {
          booking_number: booking.booking_number,
          payment_method: "online",
        },
      });

      booking.transaction_id = transaction._id;
      await booking.save();

      return NextResponse.json({
        success: true,
        message: "Payment verified and lab booking created successfully.",
        data: {
          booking,
          transaction,
        },
      });
    } catch (transactionError) {
      await LabBooking.deleteOne({ _id: booking._id });
      throw transactionError;
    }
  } catch (error) {
    console.error("POST /api/lab-bookings/payment/verify error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to verify payment and create booking." },
      { status: 500 },
    );
  }
}
