import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import InsurancePolicy from "@/models/InsurancePolicy";
import SystemLog from "@/models/SystemLog";
import { syncInsurancePolicyStatus } from "@/lib/insurance";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "patient") {
      return NextResponse.json(
        { error: "Only patients can request policy revival" },
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
    });

    if (!policy) {
      return NextResponse.json(
        { error: "Insurance policy not found" },
        { status: 404 },
      );
    }

    await syncInsurancePolicyStatus(policy);

    if (policy.status === "expired") {
      return NextResponse.json(
        {
          error: "This insurance policy term has ended and cannot be revived.",
        },
        { status: 400 },
      );
    }

    if (policy.status === "revival_pending") {
      return NextResponse.json(
        {
          error:
            "Your insurance policy revival request is already under review.",
        },
        { status: 409 },
      );
    }

    if (policy.status !== "lapsed") {
      return NextResponse.json(
        {
          error: "Only lapsed insurance policies can be submitted for revival.",
        },
        { status: 400 },
      );
    }

    if (policy.expiry_date && new Date() >= new Date(policy.expiry_date)) {
      policy.status = "expired";
      policy.next_payment_due_at = undefined;
      policy.grace_period_ends_at = undefined;
      await policy.save();

      return NextResponse.json(
        {
          error: "This insurance policy term has ended and cannot be revived.",
        },
        { status: 400 },
      );
    }

    policy.status = "revival_pending";
    policy.revival_requested_at = new Date();
    policy.revival_approved_at = undefined;

    await policy.save();

    await SystemLog.create({
      actor_id: session.user.id,
      actor_role: session.user.role,
      action_type: "INSURANCE_POLICY_REVIVAL_REQUESTED",
      target_id: policy._id,
      details: {
        policy_id: policy._id,
        policy_number: policy.policy_number,
      },
    });

    return NextResponse.json({
      message: "Insurance policy revival request submitted successfully",
      policy: {
        _id: policy._id,
        policy_number: policy.policy_number,
        status: policy.status,
        revival_requested_at: policy.revival_requested_at,
      },
    });
  } catch (error) {
    console.error("Insurance revival request error:", error);

    return NextResponse.json(
      { error: "Failed to request insurance policy revival" },
      { status: 500 },
    );
  }
}
