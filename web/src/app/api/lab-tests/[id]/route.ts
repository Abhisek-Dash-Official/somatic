import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import LabTest from "@/models/LabTest";
import connectDB from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid lab test ID." },
        { status: 400 },
      );
    }

    await connectDB();

    const test = await LabTest.findOne({
      _id: id,
      is_active: true,
    }).lean();

    if (!test) {
      return NextResponse.json(
        { success: false, error: "Lab test not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: test,
    });
  } catch (error) {
    console.error("GET /api/lab-tests/[id] error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to fetch lab test." },
      { status: 500 },
    );
  }
}
