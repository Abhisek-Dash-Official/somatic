import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import InsurancePlan from "@/models/InsurancePlan";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "patient") {
      return NextResponse.json(
        { error: "Only patients can view available insurance plans" },
        { status: 403 },
      );
    }

    await dbConnect();

    const plans = await InsurancePlan.find({
      is_active: true,
    })
      .sort({ premium_amount: 1 })
      .lean();

    return NextResponse.json({ plans });
  } catch (error) {
    console.error("Insurance plans fetch error:", error);

    return NextResponse.json(
      { error: "Failed to fetch available insurance plans" },
      { status: 500 },
    );
  }
}
