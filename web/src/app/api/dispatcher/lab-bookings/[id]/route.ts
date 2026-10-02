import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import LabBooking from "@/models/LabBooking";
import Transaction from "@/models/Transaction";
import SystemLog from "@/models/SystemLog";
import "@/models/User";
import "@/models/LabTest";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(req: Request, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "dispatcher") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid lab booking ID" },
        { status: 400 },
      );
    }

    await dbConnect();

    const booking = await LabBooking.findById(id)
      .populate("patient_id", "username email contact_no address patient_info")
      .populate(
        "tests.test_id",
        "name code category type price sample_type preparation report_time parameters",
      )
      .populate("results_entered_by", "username email");

    if (!booking) {
      return NextResponse.json(
        { error: "Lab booking not found" },
        { status: 404 },
      );
    }

    let transaction = null;

    if (booking.transaction_id) {
      transaction = await Transaction.findById(booking.transaction_id);
    }

    return NextResponse.json({
      success: true,
      booking,
      transaction,
    });
  } catch (error) {
    console.error("Dispatcher lab booking detail error:", error);

    return NextResponse.json(
      { error: "Failed to fetch lab booking" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "dispatcher") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid lab booking ID" },
        { status: 400 },
      );
    }

    const body = await req.json();
    const { action, results, notes, cancellation_reason } = body;

    const allowedActions = [
      "schedule_collection",
      "sample_collected",
      "start_processing",
      "report_ready",
      "complete",
      "enter_results",
      "confirm_cash_payment",
      "cancel",
      "update_notes",
    ];

    if (!allowedActions.includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await dbConnect();

    const booking = await LabBooking.findById(id);

    if (!booking) {
      return NextResponse.json(
        { error: "Lab booking not found" },
        { status: 404 },
      );
    }

    let actionType = "";
    let logDetails: Record<string, any> = {};

    if (action === "schedule_collection") {
      if (!["booked", "collection_scheduled"].includes(booking.status)) {
        return NextResponse.json(
          { error: "Booking cannot be scheduled in its current status" },
          { status: 400 },
        );
      }

      booking.status = "collection_scheduled";

      actionType = "LAB_COLLECTION_SCHEDULED";
      logDetails = {
        booking_id: booking._id,
        booking_number: booking.booking_number,
        patient_id: booking.patient_id,
        scheduled_date: booking.scheduled_date,
        scheduled_slot: booking.scheduled_slot,
      };
    }

    if (action === "sample_collected") {
      if (!["booked", "collection_scheduled"].includes(booking.status)) {
        return NextResponse.json(
          { error: "Sample cannot be marked collected in its current status" },
          { status: 400 },
        );
      }

      booking.status = "sample_collected";
      booking.sample_collected_at = new Date();

      actionType = "LAB_SAMPLE_COLLECTED";
      logDetails = {
        booking_id: booking._id,
        booking_number: booking.booking_number,
        patient_id: booking.patient_id,
        sample_collected_at: booking.sample_collected_at,
      };
    }

    if (action === "start_processing") {
      if (booking.status !== "sample_collected") {
        return NextResponse.json(
          { error: "Processing can only start after sample collection" },
          { status: 400 },
        );
      }

      booking.status = "processing";
      booking.processing_started_at = new Date();

      actionType = "LAB_PROCESSING_STARTED";
      logDetails = {
        booking_id: booking._id,
        booking_number: booking.booking_number,
        patient_id: booking.patient_id,
        processing_started_at: booking.processing_started_at,
      };
    }

    if (action === "enter_results") {
      if (!["processing", "sample_collected"].includes(booking.status)) {
        return NextResponse.json(
          { error: "Results cannot be entered in the current status" },
          { status: 400 },
        );
      }

      if (!Array.isArray(results) || !results.length) {
        return NextResponse.json(
          { error: "Results are required" },
          { status: 400 },
        );
      }

      booking.results = results;
      booking.results_entered_by = session.user.id;
      booking.results_entered_at = new Date();

      actionType = "LAB_RESULTS_ENTERED";
      logDetails = {
        booking_id: booking._id,
        booking_number: booking.booking_number,
        patient_id: booking.patient_id,
        results_entered_by: session.user.id,
        results_entered_at: booking.results_entered_at,
      };
    }

    if (action === "report_ready") {
      if (booking.status !== "processing") {
        return NextResponse.json(
          { error: "Report can only be marked ready while processing" },
          { status: 400 },
        );
      }

      if (!booking.results?.length) {
        return NextResponse.json(
          { error: "Enter lab results before marking the report ready" },
          { status: 400 },
        );
      }

      booking.status = "report_ready";
      booking.report_ready_at = new Date();

      actionType = "LAB_REPORT_READY";
      logDetails = {
        booking_id: booking._id,
        booking_number: booking.booking_number,
        patient_id: booking.patient_id,
        report_ready_at: booking.report_ready_at,
      };
    }

    if (action === "complete") {
      if (booking.status !== "report_ready") {
        return NextResponse.json(
          { error: "Booking can only be completed after the report is ready" },
          { status: 400 },
        );
      }

      booking.status = "completed";
      booking.completed_at = new Date();

      actionType = "LAB_BOOKING_COMPLETED";
      logDetails = {
        booking_id: booking._id,
        booking_number: booking.booking_number,
        patient_id: booking.patient_id,
        completed_at: booking.completed_at,
      };
    }

    if (action === "confirm_cash_payment") {
      if (booking.payment_method !== "cash_on_collection") {
        return NextResponse.json(
          { error: "This booking does not use cash on collection" },
          { status: 400 },
        );
      }

      if (!booking.transaction_id) {
        return NextResponse.json(
          { error: "Payment transaction not found" },
          { status: 404 },
        );
      }

      const transaction = await Transaction.findById(booking.transaction_id);

      if (!transaction) {
        return NextResponse.json(
          { error: "Payment transaction not found" },
          { status: 404 },
        );
      }

      if (transaction.status === "paid") {
        return NextResponse.json(
          { error: "Payment is already confirmed" },
          { status: 400 },
        );
      }

      transaction.status = "paid";
      transaction.paid_at = new Date();

      await transaction.save();

      booking.payment_status = "paid";

      actionType = "LAB_CASH_PAYMENT_CONFIRMED";
      logDetails = {
        booking_id: booking._id,
        booking_number: booking.booking_number,
        patient_id: booking.patient_id,
        transaction_id: transaction._id,
        amount: transaction.amount,
        payment_method: booking.payment_method,
      };
    }

    if (action === "cancel") {
      if (["completed", "cancelled"].includes(booking.status)) {
        return NextResponse.json(
          { error: "Booking cannot be cancelled in its current status" },
          { status: 400 },
        );
      }

      if (booking.payment_status === "paid") {
        return NextResponse.json(
          {
            error:
              "Paid bookings require refund processing before cancellation",
          },
          { status: 400 },
        );
      }

      booking.status = "cancelled";
      booking.cancelled_at = new Date();
      booking.cancellation_reason =
        cancellation_reason?.trim() || "Cancelled by dispatcher";

      actionType = "LAB_BOOKING_CANCELLED";
      logDetails = {
        booking_id: booking._id,
        booking_number: booking.booking_number,
        patient_id: booking.patient_id,
        cancellation_reason: booking.cancellation_reason,
      };
    }

    if (action === "update_notes") {
      booking.notes = typeof notes === "string" ? notes.trim() : "";

      actionType = "LAB_NOTES_UPDATED";
      logDetails = {
        booking_id: booking._id,
        booking_number: booking.booking_number,
        patient_id: booking.patient_id,
        updated_by: session.user.id,
      };
    }

    if (notes !== undefined) {
      booking.notes = typeof notes === "string" ? notes.trim() : booking.notes;
    }

    await booking.save();

    await SystemLog.create({
      actor_id: session.user.id,
      actor_role: session.user.role,
      action_type: actionType,
      target_id: booking._id,
      details: logDetails,
    });

    return NextResponse.json({
      message: "Lab booking updated successfully",
      booking: {
        _id: booking._id,
        booking_number: booking.booking_number,
        status: booking.status,
        payment_status: booking.payment_status,
        payment_method: booking.payment_method,
        sample_collected_at: booking.sample_collected_at,
        processing_started_at: booking.processing_started_at,
        report_ready_at: booking.report_ready_at,
        completed_at: booking.completed_at,
        cancelled_at: booking.cancelled_at,
        results_entered_by: booking.results_entered_by,
        results_entered_at: booking.results_entered_at,
        results: booking.results,
        notes: booking.notes,
      },
    });
  } catch (error) {
    console.error("Dispatcher lab booking action error:", error);

    return NextResponse.json(
      { error: "Failed to update lab booking" },
      { status: 500 },
    );
  }
}
