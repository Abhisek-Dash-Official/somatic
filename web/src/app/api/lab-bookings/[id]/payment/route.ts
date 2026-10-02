import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import LabBooking from "@/models/LabBooking";
import Transaction from "@/models/Transaction";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 401 },
      );
    }

    const role = (session.user as { role?: string }).role;

    if (!["admin", "dispatcher"].includes(role || "")) {
      return NextResponse.json(
        { success: false, error: "Forbidden." },
        { status: 403 },
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

    const booking = await LabBooking.findById(id);

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Lab booking not found." },
        { status: 404 },
      );
    }

    if (booking.payment_method !== "cash_on_collection") {
      return NextResponse.json(
        { success: false, error: "This booking is not a cash booking." },
        { status: 400 },
      );
    }

    if (booking.payment_status === "paid") {
      return NextResponse.json(
        { success: false, error: "Payment is already marked as paid." },
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
      reference_id: booking._id,
      transaction_type: "lab_booking",
      payment_gateway: "cash",
    });

    if (!transaction) {
      return NextResponse.json(
        { success: false, error: "Cash transaction not found." },
        { status: 404 },
      );
    }

    transaction.status = "paid";
    transaction.paid_at = new Date();
    transaction.metadata = {
      ...((transaction.metadata as Record<string, unknown>) || {}),
      cash_collected_by: session.user.id,
    };

    await transaction.save();

    booking.payment_status = "paid";
    await booking.save();

    return NextResponse.json({
      success: true,
      message: "Cash payment marked as paid.",
      data: {
        booking_id: booking._id,
        payment_status: booking.payment_status,
        transaction_id: transaction._id,
      },
    });
  } catch (error) {
    console.error("PATCH /api/admin/lab-bookings/[id]/payment error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to update cash payment." },
      { status: 500 },
    );
  }
}
