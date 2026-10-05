import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import InsuranceClaim from "@/models/InsuranceClaim";
import InsurancePolicy from "@/models/InsurancePolicy";
import SystemLog from "@/models/SystemLog";
import "@/models/User";
import "@/models/Hospital";
import { notifyUser } from "@/lib/notification";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "dispatcher") {
      return NextResponse.json(
        { error: "Only dispatchers can view insurance claims" },
        { status: 403 },
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid insurance claim ID" },
        { status: 400 },
      );
    }

    await dbConnect();

    const claim = await InsuranceClaim.findById(id)
      .populate("user_id", "username email contact_no address")
      .populate("policy_id");

    if (!claim) {
      return NextResponse.json(
        { error: "Insurance claim not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ claim });
  } catch (error) {
    console.error("Dispatcher insurance claim detail error:", error);

    return NextResponse.json(
      { error: "Failed to fetch insurance claim" },
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

    if (session.user.role !== "dispatcher") {
      return NextResponse.json(
        { error: "Only dispatchers can update insurance claims" },
        { status: 403 },
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid insurance claim ID" },
        { status: 400 },
      );
    }

    const body = await req.json();
    const { action, rejection_reason, approved_amount, required_documents } =
      body;

    if (!action) {
      return NextResponse.json(
        { error: "Action is required" },
        { status: 400 },
      );
    }

    await dbConnect();

    const claim = await InsuranceClaim.findById(id);

    if (!claim) {
      return NextResponse.json(
        { error: "Insurance claim not found" },
        { status: 404 },
      );
    }

    const policy = await InsurancePolicy.findById(claim.policy_id);

    if (!policy) {
      return NextResponse.json(
        { error: "Insurance policy not found" },
        { status: 404 },
      );
    }

    if (action === "under_review") {
      if (claim.status !== "submitted") {
        return NextResponse.json(
          {
            error:
              "Claim cannot be moved to under review from its current status",
          },
          { status: 400 },
        );
      }

      claim.status = "under_review";

      await SystemLog.create({
        actor_id: session.user.id,
        actor_role: session.user.role,
        action_type: "INSURANCE_CLAIM_UNDER_REVIEW",
        target_id: claim._id,
        details: {
          claim_number: claim.claim_number,
          policy_status: policy.status,
        },
      });
    } else if (action === "documents_required") {
      if (claim.status !== "submitted" && claim.status !== "under_review") {
        return NextResponse.json(
          { error: "Documents cannot be requested for this claim status" },
          { status: 400 },
        );
      }

      if (
        !Array.isArray(required_documents) ||
        required_documents.length === 0
      ) {
        return NextResponse.json(
          { error: "Required documents must be provided" },
          { status: 400 },
        );
      }

      const documents = required_documents
        .map((document: unknown) => String(document).trim())
        .filter(Boolean);

      if (documents.length === 0) {
        return NextResponse.json(
          { error: "Required documents must be provided" },
          { status: 400 },
        );
      }

      claim.status = "documents_required";
      claim.required_documents = documents;
      claim.rejection_reason = undefined;
      claim.approved_amount = undefined;

      await SystemLog.create({
        actor_id: session.user.id,
        actor_role: session.user.role,
        action_type: "INSURANCE_CLAIM_DOCUMENTS_REQUIRED",
        target_id: claim._id,
        details: {
          claim_number: claim.claim_number,
          required_documents: documents,
        },
      });

      await notifyUser({
        sender_id: session.user.id,
        recipient_id: claim.user_id.toString(),
        type: "insurance_documents_required",
        title: "Documents Required for Your Claim",
        message: `Additional documents are required for your insurance claim ${claim.claim_number}: ${documents.join(", ")}.`,
        priority: "high",
        action_url: `/patient/insurance/claims/${claim._id}/documents`,
        reference_id: claim._id.toString(),
        reference_type: "insurance_claim",
      });
    } else if (action === "approve") {
      if (claim.status !== "under_review") {
        return NextResponse.json(
          { error: "Only claims under review can be approved" },
          { status: 400 },
        );
      }

      const amount = Number(approved_amount ?? claim.claimed_amount);

      if (!Number.isFinite(amount) || amount <= 0) {
        return NextResponse.json(
          { error: "A valid approved amount is required" },
          { status: 400 },
        );
      }

      if (
        claim.claimed_amount !== undefined &&
        amount > Number(claim.claimed_amount)
      ) {
        return NextResponse.json(
          { error: "Approved amount cannot exceed claimed amount" },
          { status: 400 },
        );
      }

      claim.approved_amount = amount;
      claim.status = "approved";
      claim.rejection_reason = undefined;

      await SystemLog.create({
        actor_id: session.user.id,
        actor_role: session.user.role,
        action_type: "INSURANCE_CLAIM_APPROVED",
        target_id: claim._id,
        details: {
          claim_number: claim.claim_number,
          approved_amount: amount,
        },
      });

      await notifyUser({
        sender_id: session.user.id,
        recipient_id: claim.user_id.toString(),
        type: "insurance_claim_approved",
        title: "Insurance Claim Approved",
        message: `Your insurance claim ${claim.claim_number} has been approved for ₹${amount}.`,
        priority: "high",
        action_url: `/patient/insurance/claims/${claim._id}`,
        reference_id: claim._id.toString(),
        reference_type: "insurance_claim",
      });
    } else if (action === "partially_approve") {
      if (claim.status !== "under_review") {
        return NextResponse.json(
          { error: "Only claims under review can be partially approved" },
          { status: 400 },
        );
      }

      const amount = Number(approved_amount);

      if (!Number.isFinite(amount) || amount <= 0) {
        return NextResponse.json(
          { error: "A valid approved amount is required" },
          { status: 400 },
        );
      }

      if (
        claim.claimed_amount !== undefined &&
        amount >= Number(claim.claimed_amount)
      ) {
        return NextResponse.json(
          { error: "Partial approval amount must be less than claimed amount" },
          { status: 400 },
        );
      }

      claim.approved_amount = amount;
      claim.status = "partially_approved";
      claim.rejection_reason = undefined;

      await SystemLog.create({
        actor_id: session.user.id,
        actor_role: session.user.role,
        action_type: "INSURANCE_CLAIM_PARTIALLY_APPROVED",
        target_id: claim._id,
        details: {
          claim_number: claim.claim_number,
          approved_amount: amount,
        },
      });

      await notifyUser({
        sender_id: session.user.id,
        recipient_id: claim.user_id.toString(),
        type: "insurance_claim_partially_approved",
        title: "Insurance Claim Partially Approved",
        message: `Your insurance claim ${claim.claim_number} has been partially approved for ₹${amount}.`,
        priority: "high",
        action_url: `/patient/insurance/claims/${claim._id}`,
        reference_id: claim._id.toString(),
        reference_type: "insurance_claim",
      });
    } else if (action === "reject") {
      if (
        claim.status !== "submitted" &&
        claim.status !== "under_review" &&
        claim.status !== "documents_required"
      ) {
        return NextResponse.json(
          { error: "Claim cannot be rejected from its current status" },
          { status: 400 },
        );
      }

      if (!rejection_reason?.trim()) {
        return NextResponse.json(
          { error: "Rejection reason is required" },
          { status: 400 },
        );
      }

      claim.status = "rejected";
      claim.rejection_reason = rejection_reason.trim();
      claim.approved_amount = undefined;

      await SystemLog.create({
        actor_id: session.user.id,
        actor_role: session.user.role,
        action_type: "INSURANCE_CLAIM_REJECTED",
        target_id: claim._id,
        details: {
          claim_number: claim.claim_number,
          rejection_reason: claim.rejection_reason,
        },
      });

      await notifyUser({
        sender_id: session.user.id,
        recipient_id: claim.user_id.toString(),
        type: "insurance_claim_rejected",
        title: "Insurance Claim Rejected",
        message: `Your insurance claim ${claim.claim_number} has been rejected. Reason: ${claim.rejection_reason}`,
        priority: "high",
        action_url: `/patient/insurance/claims/${claim._id}`,
        reference_id: claim._id.toString(),
        reference_type: "insurance_claim",
      });
    } else if (action === "settle") {
      if (
        claim.status !== "approved" &&
        claim.status !== "partially_approved"
      ) {
        return NextResponse.json(
          { error: "Only approved claims can be settled" },
          { status: 400 },
        );
      }

      if (!claim.approved_amount || claim.approved_amount <= 0) {
        return NextResponse.json(
          { error: "Approved amount is required before settlement" },
          { status: 400 },
        );
      }

      claim.status = "settled";

      await SystemLog.create({
        actor_id: session.user.id,
        actor_role: session.user.role,
        action_type: "INSURANCE_CLAIM_SETTLED",
        target_id: claim._id,
        details: {
          claim_number: claim.claim_number,
          approved_amount: claim.approved_amount,
        },
      });

      await notifyUser({
        sender_id: session.user.id,
        recipient_id: claim.user_id.toString(),
        type: "insurance_claim_settled",
        title: "Insurance Claim Settled",
        message: `Your insurance claim ${claim.claim_number} has been settled for ₹${claim.approved_amount}.`,
        priority: "normal",
        action_url: `/patient/insurance/claims/${claim._id}`,
        reference_id: claim._id.toString(),
        reference_type: "insurance_claim",
      });
    } else {
      return NextResponse.json(
        { error: "Invalid claim action" },
        { status: 400 },
      );
    }

    await claim.save();

    return NextResponse.json({
      message: "Insurance claim updated successfully",
      claim,
    });
  } catch (error) {
    console.error("Dispatcher insurance claim update error:", error);

    return NextResponse.json(
      { error: "Failed to update insurance claim" },
      { status: 500 },
    );
  }
}
