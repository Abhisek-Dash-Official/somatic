import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Hospital from "@/models/Hospital";
import SystemLog from "@/models/SystemLog";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1", 10);

    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const skip = (page - 1) * limit;

    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const sortBy = searchParams.get("sortBy") || "created_at";

    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    await dbConnect();

    const query: any = {};

    if (search) {
      query.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          qr_identifier: {
            $regex: search,
            $options: "i",
          },
        },
        {
          paperwork_endpoint: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    if (status === "active") {
      query.is_active = true;
    }

    if (status === "inactive") {
      query.is_active = false;
    }

    const [hospitals, totalCount] = await Promise.all([
      Hospital.find(query)
        .select("-auth_config.api_key -auth_config.token -auth_config.password")
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),

      Hospital.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: hospitals,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error: any) {
    console.error("Admin Hospitals GET Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    const body = await req.json();

    const { name, qr_identifier, paperwork_endpoint, auth_config, is_active } =
      body;

    if (
      !name ||
      typeof name !== "string" ||
      !qr_identifier ||
      typeof qr_identifier !== "string" ||
      !paperwork_endpoint ||
      typeof paperwork_endpoint !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, QR identifier and paperwork endpoint are required",
        },
        { status: 400 },
      );
    }

    await dbConnect();

    const existingHospital = await Hospital.findOne({
      qr_identifier: qr_identifier.trim(),
    });

    if (existingHospital) {
      return NextResponse.json(
        {
          success: false,
          message: "A hospital with this QR identifier already exists",
        },
        { status: 409 },
      );
    }

    const newHospital = await Hospital.create({
      name: name.trim(),
      qr_identifier: qr_identifier.trim(),
      paperwork_endpoint: paperwork_endpoint.trim(),
      auth_config: auth_config || {
        type: "none",
      },
      is_active: typeof is_active === "boolean" ? is_active : true,
    });

    await SystemLog.create({
      actor_id: session.user.id,
      actor_role: session.user.role,
      action_type: "CREATE_HOSPITAL",
      target_id: newHospital._id,
      details: {
        name: newHospital.name,
        qr_identifier: newHospital.qr_identifier,
        paperwork_endpoint: newHospital.paperwork_endpoint,
        auth_type: newHospital.auth_config?.type || "none",
        is_active: newHospital.is_active,
      },
    });

    const responseData = newHospital.toObject();

    if (responseData.auth_config) {
      delete responseData.auth_config.api_key;
      delete responseData.auth_config.token;
      delete responseData.auth_config.password;
    }

    return NextResponse.json(
      {
        success: true,
        message: "Hospital created successfully",
        data: responseData,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Admin Hospital POST Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
