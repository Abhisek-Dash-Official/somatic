import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import mongoose from "mongoose";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Consultation from "@/models/Consultation";
import "@/models/Hospital";
import Hospital from "@/models/Hospital";

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

    const { searchParams } = new URL(req.url);
    const latitude = Number(searchParams.get("latitude"));
    const longitude = Number(searchParams.get("longitude"));

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return NextResponse.json(
        { error: "Valid latitude and longitude are required" },
        { status: 400 },
      );
    }

    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return NextResponse.json(
        { error: "Invalid coordinates" },
        { status: 400 },
      );
    }

    await dbConnect();

    const consultation = await Consultation.findOne({
      _id: id,
      "ambulance_dispatch.required": true,
    }).select("_id");

    if (!consultation) {
      return NextResponse.json(
        { error: "Ambulance request not found" },
        { status: 404 },
      );
    }

    const hospitals = await Hospital.find({
      is_active: true,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          $maxDistance: 10000,
        },
      },
    })
      .select("_id name address contact has_ambulance")
      .limit(10)
      .lean();

    return NextResponse.json({
      hospitals: hospitals.map((hospital: any) => ({
        _id: String(hospital._id),
        name: hospital.name,
        address: hospital.address,
        contact: hospital.contact,
        has_ambulance: hospital.has_ambulance,
      })),
    });
  } catch (error) {
    console.error("Nearby hospitals error:", error);

    return NextResponse.json(
      { error: "Unable to find nearby hospitals" },
      { status: 500 },
    );
  }
}
