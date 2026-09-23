import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Consultation from "@/models/Consultation";
import "@/models/User";
import "@/models/Department";
import "@/models/Hospital";
import mongoose from "mongoose";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "dispatcher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);

    const status = searchParams.get("status") || "active";
    const search = searchParams.get("search")?.trim() || "";
    const page = Math.max(Number(searchParams.get("page")) || 1, 1);
    const limit = Math.min(
      Math.max(Number(searchParams.get("limit")) || 10, 1),
      50,
    );
    const skip = (page - 1) * limit;

    const query: Record<string, any> = {
      "ambulance_dispatch.required": true,
      $or: [
        { "ambulance_dispatch.dispatcher_id": { $exists: false } },
        { "ambulance_dispatch.dispatcher_id": null },
        { "ambulance_dispatch.dispatcher_id": session.user.id },
      ],
    };

    if (status === "active") {
      query["ambulance_dispatch.status"] = {
        $in: [
          "pending",
          "contacting_patient",
          "hospital_selected",
          "dispatched",
        ],
      };
    } else if (status !== "all") {
      query["ambulance_dispatch.status"] = status;
    }

    if (search) {
      const patients = await mongoose
        .model("User")
        .find({
          role: "patient",
          $or: [
            { username: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { contact_no: { $regex: search, $options: "i" } },
          ],
        })
        .select("_id")
        .lean();

      query.$or = [
        {
          "ambulance_dispatch.patient_location.address": {
            $regex: search,
            $options: "i",
          },
        },
        {
          "ambulance_dispatch.receiving_hospital.name": {
            $regex: search,
            $options: "i",
          },
        },
        {
          patient_id: {
            $in: patients.map((patient: any) => patient._id),
          },
        },
      ];
    }

    const [requests, total] = await Promise.all([
      Consultation.find(query)
        .populate(
          "patient_id",
          "username email contact_no address patient_info",
        )
        .populate("assigned_department_id", "name")
        .populate(
          "claimed_by_doctor_id",
          "username email contact_no address doctor_info",
        )
        .populate(
          "ambulance_dispatch.dispatcher_id",
          "username email contact_no",
        )
        .sort({
          "ambulance_dispatch.requested_at": -1,
          created_at: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      Consultation.countDocuments(query),
    ]);

    const formattedRequests = requests.map((request: any) => {
      const {
        patient_id,
        assigned_department_id,
        claimed_by_doctor_id,
        ambulance_dispatch,
        ...consultation
      } = request;

      const { dispatcher_id, ...ambulanceDispatch } = ambulance_dispatch || {};

      return {
        ...consultation,
        patient_info: patient_id || null,
        department_info: assigned_department_id || null,
        doctor_info: claimed_by_doctor_id || null,
        ambulance_dispatch: {
          ...ambulanceDispatch,
          dispatcher_info: dispatcher_id || null,
        },
      };
    });

    return NextResponse.json({
      requests: formattedRequests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Dispatcher ambulances error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
