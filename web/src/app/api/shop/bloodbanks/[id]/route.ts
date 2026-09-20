import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import BloodBank from "@/models/BloodBank";
import mongoose from "mongoose";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await dbConnect();
    const bloodBankId = (await params).id;

    if (!mongoose.Types.ObjectId.isValid(bloodBankId)) {
      return NextResponse.json(
        { success: false, error: "Invalid Blood Bank ID format" },
        { status: 400 },
      );
    }

    const bloodBank = await BloodBank.findOne({
      _id: bloodBankId,
      is_active: true,
    }).lean();

    if (!bloodBank) {
      return NextResponse.json(
        { success: false, error: "Blood Bank not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: bloodBank,
    });
  } catch (error: any) {
    console.error("Error fetching single blood bank:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
