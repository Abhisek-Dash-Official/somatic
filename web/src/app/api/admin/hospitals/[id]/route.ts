import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Hospital from "@/models/Hospital";
import SystemLog from "@/models/SystemLog";
import mongoose from "mongoose";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(req: Request, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid hospital ID",
        },
        { status: 400 },
      );
    }

    await dbConnect();

    const hospital = await Hospital.findById(id)
      .select("-auth_config.api_key -auth_config.token -auth_config.password")
      .lean();

    if (!hospital) {
      return NextResponse.json(
        {
          success: false,
          message: "Hospital not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: hospital,
    });
  } catch (error: any) {
    console.error("Admin Hospital GET Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid hospital ID",
        },
        { status: 400 },
      );
    }

    const body = await req.json();

    await dbConnect();

    const existingHospital = await Hospital.findById(id);

    if (!existingHospital) {
      return NextResponse.json(
        {
          success: false,
          message: "Hospital not found",
        },
        { status: 404 },
      );
    }

    const { name, qr_identifier, paperwork_endpoint, auth_config, is_active } =
      body;

    if (name !== undefined && (typeof name !== "string" || !name.trim())) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid hospital name",
        },
        { status: 400 },
      );
    }

    if (
      qr_identifier !== undefined &&
      (typeof qr_identifier !== "string" || !qr_identifier.trim())
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid QR identifier",
        },
        { status: 400 },
      );
    }

    if (
      paperwork_endpoint !== undefined &&
      (typeof paperwork_endpoint !== "string" || !paperwork_endpoint.trim())
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid paperwork endpoint",
        },
        { status: 400 },
      );
    }

    if (qr_identifier !== undefined) {
      const duplicateHospital = await Hospital.findOne({
        qr_identifier: qr_identifier.trim(),
        _id: { $ne: id },
      });

      if (duplicateHospital) {
        return NextResponse.json(
          {
            success: false,
            message: "Another hospital already uses this QR identifier",
          },
          { status: 409 },
        );
      }
    }

    const oldData = {
      name: existingHospital.name,
      qr_identifier: existingHospital.qr_identifier,
      paperwork_endpoint: existingHospital.paperwork_endpoint,
      auth_type: existingHospital.auth_config?.type || "none",
      is_active: existingHospital.is_active,
    };

    if (name !== undefined) {
      existingHospital.name = name.trim();
    }

    if (qr_identifier !== undefined) {
      existingHospital.qr_identifier = qr_identifier.trim();
    }

    if (paperwork_endpoint !== undefined) {
      existingHospital.paperwork_endpoint = paperwork_endpoint.trim();
    }

    if (auth_config !== undefined) {
      existingHospital.auth_config = auth_config;
    }

    if (typeof is_active === "boolean") {
      existingHospital.is_active = is_active;
    }

    await existingHospital.save();

    await SystemLog.create({
      actor_id: session.user.id,
      actor_role: session.user.role,
      action_type: "UPDATE_HOSPITAL",
      target_id: existingHospital._id,
      details: {
        before: oldData,
        after: {
          name: existingHospital.name,
          qr_identifier: existingHospital.qr_identifier,
          paperwork_endpoint: existingHospital.paperwork_endpoint,
          auth_type: existingHospital.auth_config?.type || "none",
          is_active: existingHospital.is_active,
        },
      },
    });

    const responseData = existingHospital.toObject();

    if (responseData.auth_config) {
      delete responseData.auth_config.api_key;
      delete responseData.auth_config.token;
      delete responseData.auth_config.password;
    }

    return NextResponse.json({
      success: true,
      message: "Hospital updated successfully",
      data: responseData,
    });
  } catch (error: any) {
    console.error("Admin Hospital PUT Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
