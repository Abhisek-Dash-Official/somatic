import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import InsuranceClaim from "@/models/InsuranceClaim";
import InsurancePolicy from "@/models/InsurancePolicy";
import SystemLog from "@/models/SystemLog";
import { syncInsurancePolicyStatus } from "@/lib/insurance";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "patient") {
      return NextResponse.json(
        { error: "Only patients can submit insurance claims" },
        { status: 403 },
      );
    }

    const body = await req.json();

    const {
      policy_id,
      claim_type,
      incident_type,
      incident_date,
      treatment_date,
      admission_date,
      discharge_date,
      estimated_amount,
      claimed_amount,
      documents,
    } = body;

    if (!policy_id || !mongoose.Types.ObjectId.isValid(policy_id)) {
      return NextResponse.json(
        { error: "Valid insurance policy is required" },
        { status: 400 },
      );
    }

    if (!claim_type) {
      return NextResponse.json(
        { error: "Claim type is required" },
        { status: 400 },
      );
    }

    if (!["cashless", "reimbursement"].includes(claim_type)) {
      return NextResponse.json(
        { error: "Invalid claim type" },
        { status: 400 },
      );
    }

    if (
      incident_type &&
      !["accident", "illness", "emergency", "other"].includes(incident_type)
    ) {
      return NextResponse.json(
        { error: "Invalid incident type" },
        { status: 400 },
      );
    }

    if (documents !== undefined && !Array.isArray(documents)) {
      return NextResponse.json(
        { error: "Documents must be an array" },
        { status: 400 },
      );
    }

    if (documents) {
      for (const document of documents) {
        if (!document?.type?.trim() || !document?.file_url?.trim()) {
          return NextResponse.json(
            { error: "Each document must have a type and file URL" },
            { status: 400 },
          );
        }
      }
    }

    await dbConnect();

    const policy = await InsurancePolicy.findOne({
      _id: policy_id,
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
      if (policy.status === "lapsed") {
        return NextResponse.json(
          {
            error:
              "This insurance policy has lapsed and cannot be used for new claims. Please request policy revival.",
          },
          { status: 400 },
        );
      }

      if (policy.status === "revival_pending") {
        return NextResponse.json(
          {
            error:
              "Your insurance policy revival request is currently under review.",
          },
          { status: 400 },
        );
      }

      if (policy.status === "payment_pending") {
        return NextResponse.json(
          {
            error:
              "Your insurance policy requires a premium payment before it can be used for claims.",
          },
          { status: 400 },
        );
      }

      if (policy.status === "expired") {
        return NextResponse.json(
          {
            error:
              "This insurance policy has expired and cannot be used for claims.",
          },
          { status: 400 },
        );
      }

      return NextResponse.json(
        { error: "This insurance policy is not active" },
        { status: 400 },
      );
    }

    const now = new Date();

    if (policy.expiry_date && now >= new Date(policy.expiry_date)) {
      policy.status = "expired";
      await policy.save();

      return NextResponse.json(
        {
          error:
            "This insurance policy has expired and cannot be used for claims.",
        },
        { status: 400 },
      );
    }

    const estimated = Number(estimated_amount);
    const claimed = Number(claimed_amount);

    if (!Number.isFinite(estimated) || estimated <= 0) {
      return NextResponse.json(
        { error: "Estimated amount must be greater than zero" },
        { status: 400 },
      );
    }

    if (!Number.isFinite(claimed) || claimed <= 0) {
      return NextResponse.json(
        { error: "Claim amount must be greater than zero" },
        { status: 400 },
      );
    }

    if (claimed > estimated) {
      return NextResponse.json(
        { error: "Claim amount cannot be greater than the estimated amount" },
        { status: 400 },
      );
    }

    const dates = [
      ["incident_date", incident_date],
      ["treatment_date", treatment_date],
      ["admission_date", admission_date],
      ["discharge_date", discharge_date],
    ];

    for (const [name, value] of dates) {
      if (value && Number.isNaN(new Date(value).getTime())) {
        return NextResponse.json({ error: `Invalid ${name}` }, { status: 400 });
      }
    }

    if (
      admission_date &&
      discharge_date &&
      new Date(discharge_date) < new Date(admission_date)
    ) {
      return NextResponse.json(
        { error: "Discharge date cannot be before admission date" },
        { status: 400 },
      );
    }

    const claim = await InsuranceClaim.create({
      user_id: session.user.id,
      policy_id: policy._id,
      claim_type,
      incident_type,
      incident_date,
      treatment_date,
      admission_date,
      discharge_date,
      estimated_amount: estimated,
      claimed_amount: claimed,
      documents: documents || [],
      status: "submitted",
    });

    claim.claim_number = `CLM-${Date.now()}-${claim._id
      .toString()
      .slice(-6)
      .toUpperCase()}`;

    await claim.save();

    await SystemLog.create({
      actor_id: session.user.id,
      actor_role: session.user.role,
      action_type: "INSURANCE_CLAIM_SUBMITTED",
      target_id: claim._id,
      details: {
        policy_id: policy._id,
        claim_number: claim.claim_number,
        claim_type,
        estimated_amount: claim.estimated_amount,
        claimed_amount: claim.claimed_amount,
      },
    });

    return NextResponse.json(
      {
        message: "Insurance claim submitted successfully",
        claim: {
          _id: claim._id,
          claim_number: claim.claim_number,
          policy_id: claim.policy_id,
          claim_type: claim.claim_type,
          status: claim.status,
          estimated_amount: claim.estimated_amount,
          claimed_amount: claim.claimed_amount,
          created_at: claim.created_at,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Insurance claim creation error:", error);

    return NextResponse.json(
      { error: "Failed to submit insurance claim" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "patient") {
      return NextResponse.json(
        { error: "Only patients can view their insurance claims" },
        { status: 403 },
      );
    }

    await dbConnect();

    const claims = await InsuranceClaim.find({
      user_id: session.user.id,
    })
      .populate("policy_id", "policy_number status start_date expiry_date")
      .sort({ created_at: -1 })
      .lean();

    return NextResponse.json({ claims });
  } catch (error) {
    console.error("Insurance claims fetch error:", error);

    return NextResponse.json(
      { error: "Failed to fetch insurance claims" },
      { status: 500 },
    );
  }
}
