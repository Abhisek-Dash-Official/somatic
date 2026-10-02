import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Consultation from "@/models/Consultation";
import LabBooking from "@/models/LabBooking";
import Order from "@/models/Order";
import InsuranceClaim from "@/models/InsuranceClaim";
import "@/models/Department";
import "@/models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "dispatcher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await dbConnect();

    const [
      pending,
      contactingPatient,
      hospitalSelected,
      dispatched,
      arrived,
      cancelled,
      pendingConsultations,
      reviewConsultations,
      pendingLabs,
      collectionLabs,
      processingLabs,
      readyLabs,
      pendingOrders,
      processingOrders,
      shippedOrders,
      pendingClaims,
      reviewClaims,
      recentRequests,
    ] = await Promise.all([
      Consultation.countDocuments({
        "ambulance_dispatch.required": true,
        "ambulance_dispatch.status": "pending",
      }),
      Consultation.countDocuments({
        "ambulance_dispatch.required": true,
        "ambulance_dispatch.status": "contacting_patient",
      }),
      Consultation.countDocuments({
        "ambulance_dispatch.required": true,
        "ambulance_dispatch.status": "hospital_selected",
      }),
      Consultation.countDocuments({
        "ambulance_dispatch.required": true,
        "ambulance_dispatch.status": "dispatched",
      }),
      Consultation.countDocuments({
        "ambulance_dispatch.required": true,
        "ambulance_dispatch.status": "arrived",
      }),
      Consultation.countDocuments({
        "ambulance_dispatch.required": true,
        "ambulance_dispatch.status": "cancelled",
      }),
      Consultation.countDocuments({ status: "pending_review" }),
      Consultation.countDocuments({ status: "in_review" }),
      LabBooking.countDocuments({ status: "booked" }),
      LabBooking.countDocuments({ status: "collection_scheduled" }),
      LabBooking.countDocuments({
        status: { $in: ["sample_collected", "processing"] },
      }),
      LabBooking.countDocuments({ status: "report_ready" }),
      Order.countDocuments({ order_status: "PLACED" }),
      Order.countDocuments({ order_status: "PROCESSING" }),
      Order.countDocuments({ order_status: "SHIPPED" }),
      InsuranceClaim.countDocuments({ status: "submitted" }),
      InsuranceClaim.countDocuments({ status: "under_review" }),
      Consultation.find({ "ambulance_dispatch.required": true })
        .populate("patient_id", "username contact_no")
        .populate("assigned_department_id", "name")
        .populate("claimed_by_doctor_id", "username contact_no")
        .sort({ "ambulance_dispatch.requested_at": -1 })
        .limit(8)
        .lean(),
    ]);

    return NextResponse.json({
      stats: {
        ambulance: {
          pending,
          contacting_patient: contactingPatient,
          hospital_selected: hospitalSelected,
          dispatched,
          arrived,
          cancelled,
          active: pending + contactingPatient + hospitalSelected + dispatched,
        },
        consultations: {
          pending: pendingConsultations,
          in_review: reviewConsultations,
          active: pendingConsultations + reviewConsultations,
        },
        labs: {
          booked: pendingLabs,
          collection_scheduled: collectionLabs,
          processing: processingLabs,
          report_ready: readyLabs,
          active: pendingLabs + collectionLabs + processingLabs,
        },
        orders: {
          placed: pendingOrders,
          processing: processingOrders,
          shipped: shippedOrders,
          active: pendingOrders + processingOrders + shippedOrders,
        },
        insurance: {
          submitted: pendingClaims,
          under_review: reviewClaims,
          active: pendingClaims + reviewClaims,
        },
      },
      recentRequests,
    });
  } catch (error) {
    console.error("Dispatcher dashboard error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
