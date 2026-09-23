import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import mongoose from "mongoose";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Consultation from "@/models/Consultation";
import "@/models/User";
import "@/models/Department";
import "@/models/Hospital";
import Hospital from "@/models/Hospital";
import SystemLog from "@/models/SystemLog";

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(req: Request, { params }: Props) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "dispatcher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Invalid ambulance request ID" },
        { status: 400 },
      );
    }

    await dbConnect();

    const request = await Consultation.findOne({
      _id: id,
      "ambulance_dispatch.required": true,
    })
      .populate("patient_id", "username email contact_no address patient_info")
      .populate("assigned_department_id", "name")
      .populate("claimed_by_doctor_id", "username email contact_no doctor_info")
      .populate("ambulance_dispatch.dispatcher_id", "username email contact_no")
      .lean();

    if (!request) {
      return NextResponse.json(
        { error: "Ambulance request not found" },
        { status: 404 },
      );
    }

    const {
      patient_id,
      assigned_department_id,
      claimed_by_doctor_id,
      ambulance_dispatch,
      ...consultation
    } = request as any;

    const { dispatcher_id, ...ambulanceDispatch } = ambulance_dispatch || {};

    return NextResponse.json({
      request: {
        ...consultation,
        patient_info: patient_id || null,
        department_info: assigned_department_id || null,
        doctor_info: claimed_by_doctor_id || null,
        ambulance_dispatch: {
          ...ambulanceDispatch,
          dispatcher_info: dispatcher_id || null,
        },
      },
    });
  } catch (error) {
    console.error("Dispatcher ambulance detail error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request, { params }: Props) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "dispatcher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Invalid ambulance request ID" },
        { status: 400 },
      );
    }

    const body = await req.json();
    const { action } = body;

    await dbConnect();

    const consultation = await Consultation.findOne({
      _id: id,
      "ambulance_dispatch.required": true,
    });

    if (!consultation) {
      return NextResponse.json(
        { error: "Ambulance request not found" },
        { status: 404 },
      );
    }

    let actionType = "";
    let logDetails: Record<string, unknown> = {};

    if (action === "contact_patient") {
      consultation.ambulance_dispatch.status = "contacting_patient";
      consultation.ambulance_dispatch.dispatcher_id = session.user.id;

      actionType = "AMBULANCE_PATIENT_CONTACTED";
      logDetails = { status: "contacting_patient" };

      await consultation.save();
    } else if (action === "save_location") {
      const { address, latitude, longitude } = body;

      if (!address || latitude === undefined || longitude === undefined) {
        return NextResponse.json(
          { error: "Address, latitude and longitude are required" },
          { status: 400 },
        );
      }

      const lat = Number(latitude);
      const lng = Number(longitude);

      if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lng) ||
        lat < -90 ||
        lat > 90 ||
        lng < -180 ||
        lng > 180
      ) {
        return NextResponse.json(
          { error: "Invalid latitude or longitude" },
          { status: 400 },
        );
      }

      consultation.ambulance_dispatch.patient_location = {
        type: "Point",
        coordinates: [lng, lat],
        address: address.trim(),
      };

      consultation.ambulance_dispatch.status = "contacting_patient";
      consultation.ambulance_dispatch.dispatcher_id = session.user.id;

      if (!consultation.ambulance_dispatch.requested_at) {
        consultation.ambulance_dispatch.requested_at = new Date();
      }

      actionType = "AMBULANCE_PATIENT_LOCATION_UPDATED";
      logDetails = {
        address: address.trim(),
        latitude: lat,
        longitude: lng,
      };

      await consultation.save();
    } else if (action === "select_hospital") {
      const { hospital_id } = body;

      if (!mongoose.isValidObjectId(hospital_id)) {
        return NextResponse.json(
          { error: "Invalid hospital ID" },
          { status: 400 },
        );
      }

      const hospital = await Hospital.findOne({
        _id: hospital_id,
        is_active: true,
      })
        .select("_id name address")
        .lean();

      if (!hospital) {
        return NextResponse.json(
          { error: "Hospital not found" },
          { status: 404 },
        );
      }

      consultation.ambulance_dispatch.receiving_hospital = {
        hospital_id: hospital._id,
        name: hospital.name,
        address: hospital.address,
      };

      consultation.ambulance_dispatch.status = "hospital_selected";
      consultation.ambulance_dispatch.dispatcher_id = session.user.id;

      actionType = "AMBULANCE_HOSPITAL_SELECTED";
      logDetails = {
        hospital_id: hospital._id,
        hospital_name: hospital.name,
      };

      await consultation.save();
    } else if (action === "confirm_hospital") {
      if (!consultation.ambulance_dispatch.receiving_hospital?.hospital_id) {
        return NextResponse.json(
          { error: "Select a hospital first" },
          { status: 400 },
        );
      }

      consultation.ambulance_dispatch.hospital_confirmation = {
        confirmed: true,
        confirmed_at: new Date(),
      };

      consultation.ambulance_dispatch.status = "hospital_selected";
      consultation.ambulance_dispatch.dispatcher_id = session.user.id;

      actionType = "AMBULANCE_HOSPITAL_CONFIRMED";
      logDetails = {
        hospital_id:
          consultation.ambulance_dispatch.receiving_hospital.hospital_id,
        hospital_name: consultation.ambulance_dispatch.receiving_hospital.name,
      };

      await consultation.save();
    } else if (action === "ambulance_details") {
      const { name, contact_no, vehicle_no } = body;

      consultation.ambulance_dispatch.ambulance_service = {
        name: name?.trim() || undefined,
        contact_no: contact_no?.trim() || undefined,
        vehicle_no: vehicle_no?.trim() || undefined,
      };

      consultation.ambulance_dispatch.dispatcher_id = session.user.id;

      actionType = "AMBULANCE_DETAILS_UPDATED";
      logDetails = {
        ambulance_name: name?.trim() || null,
        contact_no: contact_no?.trim() || null,
        vehicle_no: vehicle_no?.trim() || null,
      };

      await consultation.save();
    } else if (action === "dispatch") {
      if (!consultation.ambulance_dispatch.patient_location) {
        return NextResponse.json(
          { error: "Patient location is required before dispatch" },
          { status: 400 },
        );
      }

      if (!consultation.ambulance_dispatch.receiving_hospital?.hospital_id) {
        return NextResponse.json(
          { error: "Receiving hospital is required before dispatch" },
          { status: 400 },
        );
      }

      if (!consultation.ambulance_dispatch.hospital_confirmation?.confirmed) {
        return NextResponse.json(
          { error: "Hospital confirmation is required before dispatch" },
          { status: 400 },
        );
      }

      consultation.ambulance_dispatch.status = "dispatched";
      consultation.ambulance_dispatch.dispatched_at = new Date();
      consultation.ambulance_dispatch.dispatcher_id = session.user.id;

      actionType = "AMBULANCE_DISPATCHED";
      logDetails = {
        status: "dispatched",
        hospital_id:
          consultation.ambulance_dispatch.receiving_hospital.hospital_id,
        hospital_name: consultation.ambulance_dispatch.receiving_hospital.name,
      };

      await consultation.save();
    } else if (action === "arrived") {
      consultation.ambulance_dispatch.status = "arrived";
      consultation.ambulance_dispatch.arrived_at = new Date();
      consultation.ambulance_dispatch.dispatcher_id = session.user.id;

      actionType = "AMBULANCE_ARRIVED";
      logDetails = { status: "arrived" };

      await consultation.save();
    } else if (action === "cancel") {
      const { reason } = body;

      if (!reason?.trim()) {
        return NextResponse.json(
          { error: "Cancellation reason is required" },
          { status: 400 },
        );
      }

      consultation.ambulance_dispatch.status = "cancelled";
      consultation.ambulance_dispatch.cancelled_at = new Date();
      consultation.ambulance_dispatch.cancellation_reason = reason.trim();
      consultation.ambulance_dispatch.dispatcher_id = session.user.id;

      actionType = "AMBULANCE_REQUEST_CANCELLED";
      logDetails = {
        status: "cancelled",
        reason: reason.trim(),
      };

      await consultation.save();
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await SystemLog.create({
      actor_id: session.user.id,
      actor_role: session.user.role,
      action_type: actionType,
      target_id: consultation._id,
      details: logDetails,
    });

    return NextResponse.json({
      message: "Ambulance request updated successfully",
    });
  } catch (error) {
    console.error("Dispatcher ambulance action error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
