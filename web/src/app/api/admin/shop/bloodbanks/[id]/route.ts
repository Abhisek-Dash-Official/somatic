import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import BloodBank from "@/models/BloodBank";
import SystemLog from "@/models/SystemLog";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    const { id } = await params;
    await dbConnect();

    const bloodBank = await BloodBank.findById(id).lean();
    if (!bloodBank) {
      return NextResponse.json(
        { success: false, message: "Blood Bank not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: bloodBank });
  } catch (error: any) {
    console.error("Admin BloodBank GET by ID Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    const { id } = await params;
    const body = await req.json();
    await dbConnect();

    const updatedBloodBank = await BloodBank.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true },
    );

    if (!updatedBloodBank) {
      return NextResponse.json(
        { success: false, message: "Blood Bank not found" },
        { status: 404 },
      );
    }

    await SystemLog.create({
      actor_id: session.user.id,
      actor_role: session.user.role,
      action_type: "UPDATE_BLOOD_BANK",
      target_id: updatedBloodBank._id,
      details: {
        name: updatedBloodBank.name,
        license_no: updatedBloodBank.license_no,
        updated_fields: Object.keys(body),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Blood Bank updated successfully",
      data: updatedBloodBank,
    });
  } catch (error: any) {
    console.error("Admin BloodBank PUT Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    const { id } = await params;
    await dbConnect();

    const bloodBank = await BloodBank.findByIdAndUpdate(
      id,
      { is_active: false },
      { new: true },
    );

    if (!bloodBank) {
      return NextResponse.json(
        { success: false, message: "Blood Bank not found" },
        { status: 404 },
      );
    }

    await SystemLog.create({
      actor_id: session.user.id,
      actor_role: session.user.role,
      action_type: "DELETE_BLOOD_BANK",
      target_id: bloodBank._id,
      details: {
        name: bloodBank.name,
        license_no: bloodBank.license_no,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Blood Bank deactivated successfully",
    });
  } catch (error: any) {
    console.error("Admin BloodBank DELETE Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
