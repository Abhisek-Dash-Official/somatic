import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import InsurancePolicy from "@/models/InsurancePolicy";
import "@/models/InsurancePlan";
import "@/models/User";
import SystemLog from "@/models/SystemLog";
import mongoose from "mongoose";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "patient") {
      return NextResponse.json(
        { error: "Only patients can view their insurance policies" },
        { status: 403 },
      );
    }

    const { id } = await params;

    await dbConnect();

    const policy = await InsurancePolicy.findOne({
      _id: id,
      user_id: session.user.id,
    })
      .populate("plan_id")
      .populate("user_id", "username email contact_no address")
      .lean();

    if (!policy) {
      return NextResponse.json(
        { error: "Insurance policy not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ policy });
  } catch (error) {
    console.error("Insurance policy fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch insurance policy" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "patient") {
      return NextResponse.json(
        { error: "Only patients can cancel their policies" },
        { status: 403 },
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid policy ID" }, { status: 400 });
    }

    const { action } = await req.json();

    if (action !== "cancel") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const policy = await InsurancePolicy.findOne({
      _id: id,
      user_id: session.user.id,
    });

    if (!policy) {
      return NextResponse.json(
        { error: "Insurance policy not found" },
        { status: 404 },
      );
    }

    if (policy.status !== "active") {
      return NextResponse.json(
        { error: "Only active insurance policies can be cancelled" },
        { status: 400 },
      );
    }

    policy.status = "cancelled";
    await policy.save();

    await SystemLog.create({
      actor_id: session.user.id,
      actor_role: session.user.role,
      action_type: "INSURANCE_POLICY_CANCELLED",
      target_id: policy._id,
      details: {
        policy_number: policy.policy_number,
      },
    });

    return NextResponse.json({
      message: "Insurance policy cancelled successfully",
      policy,
    });
  } catch (error) {
    console.error("Cancel insurance policy error:", error);

    return NextResponse.json(
      { error: "Failed to cancel insurance policy" },
      { status: 500 },
    );
  }
}
