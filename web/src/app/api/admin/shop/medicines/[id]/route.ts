import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Medicine from "@/models/Medicine";
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

    const medicine = await Medicine.findById(id).lean();
    if (!medicine) {
      return NextResponse.json(
        { success: false, message: "Medicine not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: medicine });
  } catch (error: any) {
    console.error("Admin Medicine GET by ID Error:", error);
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

    const updatedMedicine = await Medicine.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true },
    );

    if (!updatedMedicine) {
      return NextResponse.json(
        { success: false, message: "Medicine not found" },
        { status: 404 },
      );
    }

    await SystemLog.create({
      actor_id: session.user.id,
      actor_role: session.user.role,
      action_type: "UPDATE_MEDICINE",
      target_id: updatedMedicine._id,
      details: {
        name: updatedMedicine.name,
        sku: updatedMedicine.sku,
        updated_fields: Object.keys(body),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Medicine updated successfully",
      data: updatedMedicine,
    });
  } catch (error: any) {
    console.error("Admin Medicine PUT Error:", error);
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

    const medicine = await Medicine.findByIdAndUpdate(
      id,
      { is_active: false },
      { new: true },
    );

    if (!medicine) {
      return NextResponse.json(
        { success: false, message: "Medicine not found" },
        { status: 404 },
      );
    }

    await SystemLog.create({
      actor_id: session.user.id,
      actor_role: session.user.role,
      action_type: "DELETE_MEDICINE",
      target_id: medicine._id,
      details: {
        name: medicine.name,
        sku: medicine.sku,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Medicine deactivated successfully",
    });
  } catch (error: any) {
    console.error("Admin Medicine DELETE Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
