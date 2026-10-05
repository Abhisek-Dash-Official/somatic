import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import InsurancePolicy from "@/models/InsurancePolicy";
import SystemLog from "@/models/SystemLog";
import { notifyUser } from "@/lib/notification";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "dispatcher") {
      return NextResponse.json(
        { error: "Only dispatchers can review policy revival requests" },
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

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Action must be approve or reject" },
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

    if (policy.status !== "revival_pending") {
      return NextResponse.json(
        { error: "This policy does not have a pending revival request" },
        { status: 400 },
      );
    }

    if (policy.expiry_date && new Date() >= new Date(policy.expiry_date)) {
      policy.status = "expired";
      await policy.save();

      return NextResponse.json(
        {
          error: "This insurance policy term has ended and cannot be revived.",
        },
        { status: 400 },
      );
    }

    if (action === "reject") {
      policy.status = "lapsed";
      policy.revival_approved_at = undefined;

      await policy.save();

      await SystemLog.create({
        actor_id: session.user.id,
        actor_role: session.user.role,
        action_type: "INSURANCE_POLICY_REVIVAL_REJECTED",
        target_id: policy._id,
        details: {
          policy_id: policy._id,
          policy_number: policy.policy_number,
        },
      });

      await notifyUser({
        sender_id: session.user.id,
        recipient_id: policy.user_id.toString(),
        type: "insurance_revival_rejected",
        title: "Insurance Revival Rejected",
        message: `Your revival request for insurance policy ${policy.policy_number} has been rejected. Your policy remains lapsed.`,
        priority: "high",
        action_url: `/patient/insurance/policies/${policy._id}`,
        reference_id: policy._id.toString(),
        reference_type: "insurance_policy",
      });

      return NextResponse.json({
        message: "Insurance policy revival rejected",
        status: policy.status,
      });
    }

    policy.status = "payment_pending";
    policy.revival_approved_at = new Date();

    await policy.save();

    await SystemLog.create({
      actor_id: session.user.id,
      actor_role: session.user.role,
      action_type: "INSURANCE_POLICY_REVIVAL_APPROVED",
      target_id: policy._id,
      details: {
        policy_id: policy._id,
        policy_number: policy.policy_number,
      },
    });

    await notifyUser({
      sender_id: session.user.id,
      recipient_id: policy.user_id.toString(),
      type: "insurance_revival_approved",
      title: "Insurance Revival Approved",
      message: `Your revival request for insurance policy ${policy.policy_number} has been approved. Please complete the required premium payment to reactivate your policy.`,
      priority: "high",
      action_url: `/patient/insurance/policies/${policy._id}/revival-payment`,
      reference_id: policy._id.toString(),
      reference_type: "insurance_policy",
    });

    return NextResponse.json({
      message: "Insurance policy revival approved. Payment is now required.",
      status: policy.status,
      revival_approved_at: policy.revival_approved_at,
    });
  } catch (error) {
    console.error("Dispatcher insurance revival error:", error);

    return NextResponse.json(
      { error: "Failed to process insurance policy revival" },
      { status: 500 },
    );
  }
}
