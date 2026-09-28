import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import InsuranceClaim from "@/models/InsuranceClaim";
import "@/models/User";
import "@/models/InsurancePolicy";
import "@/models/InsurancePlan";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid claim ID" }, { status: 400 });
    }

    await dbConnect();

    const claim = await InsuranceClaim.findById(id)
      .populate("user_id", "username email contact_no date_of_birth address")
      .populate({
        path: "policy_id",
        select:
          "policy_number status insured_members start_date expiry_date plan_id documents",
        populate: {
          path: "plan_id",
          select:
            "name description coverage_amount premium_amount premium_frequency policy_term_years features",
        },
      })
      .lean();

    if (!claim) {
      return NextResponse.json(
        { error: "Insurance claim not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ claim });
  } catch (error) {
    console.error("Admin insurance claim GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch insurance claim" },
      { status: 500 },
    );
  }
}
