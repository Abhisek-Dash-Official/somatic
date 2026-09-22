import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Hospital from "@/models/Hospital";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const { qr_data } = body;

    if (!qr_data || typeof qr_data !== "string") {
      return NextResponse.json(
        { message: "Valid QR data is required" },
        { status: 400 },
      );
    }

    await dbConnect();

    const hospital = await Hospital.findOne({
      qr_identifier: qr_data.trim(),
      is_active: true,
    }).lean();

    if (!hospital) {
      return NextResponse.json(
        {
          message: "This QR code does not belong to a supported hospital.",
        },
        { status: 404 },
      );
    }

    const userId = (session.user as any).id || (session.user as any)._id;

    if (!userId) {
      return NextResponse.json(
        { message: "User information not found in session" },
        { status: 401 },
      );
    }

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
      patient: {
        name: patient.username,
        email: patient.email,
        contact_no: patient.contact_no || null,
        address: patient.address || null,
        blood_group: patient.patient_info?.blood_grp || null,
        known_allergies: patient.patient_info?.known_allergies || [],
        chronic_diseases: patient.patient_info?.chronic_diseases || [],
      },
    };

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const authConfig = hospital.auth_config;

    if (authConfig?.type === "api_key") {
      if (!authConfig.api_key) {
        return NextResponse.json(
          {
            message: "Hospital API key is not configured.",
          },
          { status: 500 },
        );
      }

      const headerName = authConfig.api_key_header || "X-API-Key";

      headers[headerName] = authConfig.api_key;
    }

    if (authConfig?.type === "bearer") {
      if (!authConfig.token) {
        return NextResponse.json(
          {
            message: "Hospital bearer token is not configured.",
          },
          { status: 500 },
        );
      }

      headers.Authorization = `Bearer ${authConfig.token}`;
    }

    if (authConfig?.type === "basic") {
      if (!authConfig.username || !authConfig.password) {
        return NextResponse.json(
          {
            message: "Hospital basic authentication is not configured.",
          },
          { status: 500 },
        );
      }

      const credentials = Buffer.from(
        `${authConfig.username}:${authConfig.password}`,
      ).toString("base64");

      headers.Authorization = `Basic ${credentials}`;
    }

    let hospitalResponse: Response;

    try {
      hospitalResponse = await fetch(hospital.paperwork_endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(paperworkData),
        cache: "no-store",
      });
    } catch (error) {
      console.error("Hospital API request failed:", error);

      return NextResponse.json(
        {
          message: "Unable to connect to the hospital API.",
        },
        { status: 502 },
      );
    }

    const responseText = await hospitalResponse.text();

    let hospitalData: unknown = null;

    try {
      hospitalData = responseText ? JSON.parse(responseText) : null;
    } catch {
      hospitalData = responseText || null;
    }

    if (!hospitalResponse.ok) {
      console.error(
        "Hospital API returned an error:",
        hospitalResponse.status,
        hospitalData,
      );

      return NextResponse.json(
        {
          message: "Hospital API rejected the paperwork request.",
          hospital: {
            name: hospital.name,
          },
          hospital_status: hospitalResponse.status,
          hospital_response: hospitalData,
        },
        { status: 502 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Hospital paperwork submitted successfully.",
        hospital: {
          name: hospital.name,
        },
        hospital_response: hospitalData,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Hospital paperwork submission error:", error);

    return NextResponse.json(
      {
        message: "Failed to submit hospital paperwork.",
      },
      { status: 500 },
    );
  }
}
