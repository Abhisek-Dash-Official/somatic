import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import LabTest from "@/models/LabTest";
import LabBooking from "@/models/LabBooking";
import Transaction from "@/models/Transaction";

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

    await connectDB();

    const body = await request.json();
    const {
      tests,
      collection_address,
      scheduled_date,
      scheduled_slot,
      payment_method,
    } = body;

    if (!Array.isArray(tests) || tests.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one lab test is required." },
        { status: 400 },
      );
    }

    if (!["online", "cash_on_collection"].includes(payment_method)) {
      return NextResponse.json(
        { success: false, error: "Invalid payment method." },
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

    const booking = await LabBooking.create({
      booking_number: generateBookingNumber(),
      patient_id: new mongoose.Types.ObjectId(session.user.id),
      tests: bookingTests,
      subtotal,
      collection_fee: collectionFee,
      discount,
      total_amount: totalAmount,
      payment_status: "pending",
      payment_method,
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

    const transaction = await Transaction.create({
      user_id: new mongoose.Types.ObjectId(session.user.id),
      transaction_type: "lab_booking",
      reference_id: booking._id,
      amount: totalAmount,
      currency: "INR",
      status: payment_method === "cash_on_collection" ? "pending" : "created",
      payment_gateway:
        payment_method === "cash_on_collection" ? "cash" : "razorpay",
      metadata: {
        booking_number: booking.booking_number,
        payment_method,
      },
    });

    booking.transaction_id = transaction._id;
    await booking.save();

    return NextResponse.json(
      {
        success: true,
        message:
          payment_method === "cash_on_collection"
            ? "Lab booking created successfully."
            : "Lab booking created. Continue to payment.",
        data: {
          booking,
          transaction,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/lab-bookings error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to create lab booking." },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 401 },
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status")?.trim() || "";
    const page = Math.max(Number(searchParams.get("page")) || 1, 1);
    const limit = Math.min(
      Math.max(Number(searchParams.get("limit")) || 10, 1),
      50,
    );
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {
      patient_id: new mongoose.Types.ObjectId(session.user.id),
    };

    const allowedStatuses = [
      "booked",
      "collection_scheduled",
      "sample_collected",
      "processing",
      "report_ready",
      "completed",
      "cancelled",
    ];

    if (status && allowedStatuses.includes(status)) filter.status = status;

    const [bookings, total] = await Promise.all([
      LabBooking.find(filter)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      LabBooking.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: bookings,
      pagination: {
        page,
        limit,
        total,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_previous: page > 1,
      },
    });
  } catch (error) {
    console.error("GET /api/lab-bookings error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to fetch lab bookings." },
      { status: 500 },
    );
  }
}
