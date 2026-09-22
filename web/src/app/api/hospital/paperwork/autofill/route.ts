import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const { qr_data } = body;

    if (!qr_data) {
      return NextResponse.json(
        { message: "QR data is required" },
        { status: 400 },
      );
    }

    await dbConnect();

    const userId = (session.user as any).id || (session.user as any)._id;

    const patient = await User.findById(userId)
      .select("username email contact_no address patient_info")
      .lean();

    if (!patient) {
      return NextResponse.json(
        { message: "Patient information not found" },
        { status: 404 },
      );
    }

    const paperworkData = {
      qr_data,

      patient: {
        name: patient.username,
        email: patient.email,
        contact_no: patient.contact_no || null,
        address: patient.address || null,
        blood_group: patient.patient_info?.blood_grp || null,
        known_allergies: patient.patient_info?.known_allergies || [],
        chronic_diseases: patient.patient_info?.chronic_diseases || [],
      },

      patient_fields_required: [
        "age",
        "weight",
        "current_symptoms",
        "current_vitals",
      ],
    };

    // TODO: After Hospital model/integration is added,
    // find the hospital using qr_data/QR identifier,
    // get its paperwork_endpoint and required auth/config,
    // then POST paperworkData to the hospital API.
    // Do not trust arbitrary URLs from the QR code.
    // Handle hospital not found, inactive hospital,
    // authentication, hospital API errors, timeout,
    // and successful submission here.

    return NextResponse.json(
      {
        success: true,
        message: "Hospital paperwork information prepared successfully.",
        data: paperworkData,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Hospital paperwork autofill error:", error);

    return NextResponse.json(
      {
        message: "Failed to prepare hospital paperwork.",
      },
      { status: 500 },
    );
  }
}
