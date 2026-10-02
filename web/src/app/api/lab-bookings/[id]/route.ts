import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import LabBooking from "@/models/LabBooking";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
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
    }).lean();

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Lab booking not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("GET /api/lab-bookings/[id] error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to fetch lab booking." },
      { status: 500 },
    );
  }
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

    const body = await request.json();

    if (body.status !== "cancelled") {
      return NextResponse.json(
        {
          success: false,
          error: "Users can only cancel lab bookings.",
        },
        { status: 400 },
      );
    }

    const cancellableStatuses = ["booked", "collection_scheduled"];

    if (!cancellableStatuses.includes(booking.status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Booking cannot be cancelled when its status is "${booking.status}".`,
        },
        { status: 400 },
      );
    }

    const cancellationReason =
      typeof body.cancellation_reason === "string"
        ? body.cancellation_reason.trim()
        : "";

    booking.status = "cancelled";
    booking.cancelled_at = new Date();
    booking.cancellation_reason = cancellationReason || undefined;

    await booking.save();

    return NextResponse.json({
      success: true,
      message: "Lab booking cancelled successfully.",
      data: booking,
    });
  } catch (error) {
    console.error("PATCH /api/lab-bookings/[id] error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to update lab booking." },
      { status: 500 },
    );
  }
}
