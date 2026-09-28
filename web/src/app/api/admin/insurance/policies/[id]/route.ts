import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import InsurancePolicy from "@/models/InsurancePolicy";
import "@/models/User";
import "@/models/InsurancePlan";
import SystemLog from "@/models/SystemLog";

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
      return NextResponse.json({ error: "Invalid policy ID" }, { status: 400 });
    }

    await dbConnect();

    const policy = await InsurancePolicy.findById(id)
      .populate("user_id", "username email contact_no date_of_birth address")
      .populate(
        "plan_id",
        "name description coverage_amount premium_amount premium_frequency policy_term_years features",
      )
      .populate("approved_by", "username email")
      .populate("rejected_by", "username email")
      .lean();

    if (!policy) {
      return NextResponse.json(
        { error: "Insurance policy not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ policy });
  } catch (error) {
    console.error("Admin insurance policy GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch insurance policy" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid policy ID" }, { status: 400 });
    }

    const body = await req.json();
    const action = body.action;
    const reason = typeof body.reason === "string" ? body.reason.trim() : "";

    if (action !== "cancel") {
      return NextResponse.json(
        { error: "Invalid policy action" },
        { status: 400 },
      );
    }

    if (!reason) {
      return NextResponse.json(
        { error: "Cancellation reason is required" },
        { status: 400 },
      );
    }

    await dbConnect();

    const policy = await InsurancePolicy.findById(id);

    if (!policy) {
      return NextResponse.json(
        { error: "Insurance policy not found" },
        { status: 404 },
      );
    }

    if (policy.status === "cancelled") {
      return NextResponse.json(
        { error: "Policy is already cancelled" },
        { status: 400 },
      );
    }

    if (policy.status === "expired") {
      return NextResponse.json(
        { error: "Expired policy cannot be cancelled" },
        { status: 400 },
      );
    }

    const previousStatus = policy.status;

    policy.status = "cancelled";
    policy.rejection_reason = reason;

    await policy.save();

    await SystemLog.create({
      actor_id: session.user.id,
      actor_role: session.user.role,
      action_type: "INSURANCE_POLICY_CANCELLED_BY_ADMIN",
      target_id: policy._id,
      details: {
        policy_number: policy.policy_number,
        previous_status: previousStatus,
        reason,
      },
    });

    return NextResponse.json({
      message: "Insurance policy cancelled successfully",
      policy: {
        _id: policy._id,
        policy_number: policy.policy_number,
        status: policy.status,
        rejection_reason: policy.rejection_reason,
      },
    });
  } catch (error) {
    console.error("Admin insurance policy PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update insurance policy" },
      { status: 500 },
    );
  }
}
