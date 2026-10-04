import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import InsurancePolicy from "@/models/InsurancePolicy";
import SystemLog from "@/models/SystemLog";
import "@/models/InsurancePlan";
import "@/models/User";
import { syncInsurancePolicyStatus } from "@/lib/insurance";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteContext) {
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid insurance policy ID" },
        { status: 400 },
      );
    }

    await dbConnect();

    const policy = await InsurancePolicy.findOne({
      _id: id,
      user_id: session.user.id,
    })
      .populate("plan_id")
      .populate("user_id", "username email contact_no address");

    if (!policy) {
      return NextResponse.json(
        { error: "Insurance policy not found" },
        { status: 404 },
      );
    }

    await syncInsurancePolicyStatus(policy);

    return NextResponse.json({
      policy: policy.toObject(),
    });
  } catch (error) {
    console.error("Insurance policy fetch error:", error);

    return NextResponse.json(
      { error: "Failed to fetch insurance policy" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request, { params }: RouteContext) {
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
      return NextResponse.json(
        { error: "Invalid insurance policy ID" },
        { status: 400 },
      );
    }

    const body = await req.json();
    const { action } = body;

    if (action !== "cancel") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await dbConnect();

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

    await syncInsurancePolicyStatus(policy);

    if (policy.status !== "active") {
      return NextResponse.json(
        {
          error: "Only active insurance policies can be cancelled",
        },
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
      policy: policy.toObject(),
    });
  } catch (error) {
    console.error("Cancel insurance policy error:", error);

    return NextResponse.json(
      { error: "Failed to cancel insurance policy" },
      { status: 500 },
    );
  }
}
