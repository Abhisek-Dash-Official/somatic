import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import Razorpay from "razorpay";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import LabTest from "@/models/LabTest";

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
    const { tests, collection_address, scheduled_date, scheduled_slot } = body;

    if (!Array.isArray(tests) || tests.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one lab test is required." },
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
      collectionDate <= new Date()
    ) {
      return NextResponse.json(
        { success: false, error: "Collection date must be in the future." },
        { status: 400 },
      );
    }

    await connectDB();

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
        test_id: String(test._id),
        name: test.name,
        type: test.type,
        price: test.price,
      };
    });

    const subtotal = bookingTests.reduce((sum, test) => sum + test.price, 0);
    const collectionFee = 0;
    const discount = 0;
    const totalAmount = subtotal + collectionFee - discount;

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
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: `LAB-${Date.now()}`,
      notes: {
        user_id: String(session.user.id),
        payment_method: "online",
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        key_id: keyId,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        total_amount: totalAmount,
        tests: bookingTests,
        collection_address: {
          address_line: collection_address.address_line.trim(),
          city: collection_address.city.trim(),
          state: collection_address.state.trim(),
          pincode: collection_address.pincode.trim(),
          landmark: collection_address.landmark?.trim() || "",
        },
        scheduled_date: collectionDate.toISOString(),
        scheduled_slot: scheduled_slot.trim(),
      },
    });
  } catch (error) {
    console.error("POST /api/lab-bookings/payment/order error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to create payment order." },
      { status: 500 },
    );
  }
}
