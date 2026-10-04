import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import InsurancePolicy from "@/models/InsurancePolicy";
import "@/models/User";
import "@/models/InsurancePlan";
import SystemLog from "@/models/SystemLog";
import { syncInsurancePolicyStatus } from "@/lib/insurance";

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
      .populate("rejected_by", "username email");

    if (!policy) {
      return NextResponse.json(
        { error: "Insurance policy not found" },
        { status: 404 },
      );
    }

    await syncInsurancePolicyStatus(policy);

    return NextResponse.json({ policy: policy.toObject() });
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
    const { action, reason } = body;

    if (action !== "cancel") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    if (!reason?.trim()) {
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

    await syncInsurancePolicyStatus(policy);

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
    policy.rejection_reason = reason.trim();

    await policy.save();

    await SystemLog.create({
      user_id: session.user.id,
      action: "INSURANCE_POLICY_CANCELLED_BY_ADMIN",
      entity_type: "InsurancePolicy",
      entity_id: policy._id,
      metadata: {
        policy_id: policy._id.toString(),
        policy_number: policy.policy_number,
        previous_status: previousStatus,
        reason: reason.trim(),
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
