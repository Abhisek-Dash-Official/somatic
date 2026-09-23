import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Consultation from "@/models/Consultation";

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

      Consultation.find({
        "ambulance_dispatch.required": true,
      })
        .populate("patient_id", "username contact_no")
        .populate("assigned_department_id", "name")
        .populate("claimed_by_doctor_id", "username contact_no")
        .sort({ "ambulance_dispatch.requested_at": -1 })
        .limit(8)
        .lean(),
    ]);

    const activeRequests =
      pending + contactingPatient + hospitalSelected + dispatched;

    return NextResponse.json({
      stats: {
        pending,
        contacting_patient: contactingPatient,
        hospital_selected: hospitalSelected,
        dispatched,
        arrived,
        cancelled,
        active: activeRequests,
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
