import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import InsurancePolicy from "@/models/InsurancePolicy";
import SystemLog from "@/models/SystemLog";
import "@/models/User";
import "@/models/InsurancePlan";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(req: Request, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "dispatcher") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid insurance policy ID" },
        { status: 400 },
      );
    }

    await dbConnect();

    const policy = await InsurancePolicy.findById(id)
      .populate("user_id", "username email contact_no address patient_info")
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

    return NextResponse.json({ policy });
  } catch (error) {
    console.error("Dispatcher insurance detail error:", error);

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

    if (session.user.role !== "dispatcher") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid insurance policy ID" },
        { status: 400 },
      );
    }

    const body = await req.json();
    const { action, rejection_reason } = body;

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await dbConnect();

    const policy = await InsurancePolicy.findById(id);

    if (!policy) {
      return NextResponse.json(
        { error: "Insurance policy not found" },
        { status: 404 },
      );
    }

    if (policy.status !== "pending") {
      return NextResponse.json(
        { error: `Policy cannot be ${action}d in its current status` },
        { status: 400 },
      );
    }

    let actionType = "";
    let logDetails: Record<string, any> = {};

    if (action === "approve") {
      policy.status = "approved";
      policy.approved_by = session.user.id;
      policy.approved_at = new Date();
      policy.rejected_by = undefined;
      policy.rejected_at = undefined;
      policy.rejection_reason = undefined;

      actionType = "INSURANCE_PROPOSAL_APPROVED";
      logDetails = {
        policy_id: policy._id,
        plan_id: policy.plan_id,
        user_id: policy.user_id,
      };
    }

    if (action === "reject") {
      if (!rejection_reason?.trim()) {
        return NextResponse.json(
          { error: "Rejection reason is required" },
          { status: 400 },
        );
      }

      policy.status = "rejected";
      policy.rejected_by = session.user.id;
      policy.rejected_at = new Date();
      policy.rejection_reason = rejection_reason.trim();
      policy.approved_by = undefined;
      policy.approved_at = undefined;

      actionType = "INSURANCE_PROPOSAL_REJECTED";
      logDetails = {
        policy_id: policy._id,
        plan_id: policy.plan_id,
        user_id: policy.user_id,
        rejection_reason: rejection_reason.trim(),
      };
    }

    await policy.save();

    await SystemLog.create({
      actor_id: session.user.id,
      actor_role: session.user.role,
      action_type: actionType,
      target_id: policy._id,
      details: logDetails,
    });

    return NextResponse.json({
      message:
        action === "approve"
          ? "Insurance proposal approved successfully"
          : "Insurance proposal rejected successfully",
      policy: {
        _id: policy._id,
        status: policy.status,
        approved_by: policy.approved_by,
        approved_at: policy.approved_at,
        rejected_by: policy.rejected_by,
        rejected_at: policy.rejected_at,
        rejection_reason: policy.rejection_reason,
      },
    });
  } catch (error) {
    console.error("Dispatcher insurance action error:", error);

    return NextResponse.json(
      { error: "Failed to update insurance policy" },
      { status: 500 },
    );
  }
}
