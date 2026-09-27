import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import InsuranceClaim from "@/models/InsuranceClaim";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "patient") {
      return NextResponse.json(
        { error: "Only patients can view insurance claims" },
        { status: 403 },
      );
    }

    const { id } = await params;

    await dbConnect();

    const claim = await InsuranceClaim.findOne({
      _id: id,
      user_id: session.user.id,
    })
      .populate("policy_id", "policy_number status start_date expiry_date")
      .populate("hospital_id", "name address contact")
      .lean();

    if (!claim) {
      return NextResponse.json(
        { error: "Insurance claim not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ claim });
  } catch (error) {
    console.error("Insurance claim fetch error:", error);

    return NextResponse.json(
      { error: "Failed to fetch insurance claim" },
      { status: 500 },
    );
  }
}
