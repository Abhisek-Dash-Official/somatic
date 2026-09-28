import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import InsuranceClaim from "@/models/InsuranceClaim";
import InsurancePolicy from "@/models/InsurancePolicy";
import Hospital from "@/models/Hospital";
import SystemLog from "@/models/SystemLog";

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

    if (!policy_id || !claim_type) {
      return NextResponse.json(
        { error: "Policy and claim type are required" },
        { status: 400 },
      );
    }

    if (!["cashless", "reimbursement"].includes(claim_type)) {
      return NextResponse.json(
        { error: "Invalid claim type" },
        { status: 400 },
      );
    }

    if (documents && !Array.isArray(documents)) {
      return NextResponse.json(
        { error: "Documents must be an array" },
        { status: 400 },
      );
    }

    await dbConnect();

    const policy = await InsurancePolicy.findOne({
      _id: policy_id,
      user_id: session.user.id,
      status: "active",
    });

    if (!policy) {
      return NextResponse.json(
        { error: "Active insurance policy not found" },
        { status: 404 },
      );
    }

    const amount = claimed_amount ?? estimated_amount;

    if (
      amount !== undefined &&
      (!Number.isFinite(Number(amount)) || Number(amount) <= 0)
    ) {
      return NextResponse.json(
        { error: "Claim amount must be greater than zero" },
        { status: 400 },
      );
    }

    if (documents && documents.length > 0) {
      for (const document of documents) {
        if (!document?.type || !document?.file_url) {
          return NextResponse.json(
            { error: "Each document must have a type and file URL" },
            { status: 400 },
          );
        }
      }
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
      estimated_amount,
      claimed_amount: claimed_amount ?? estimated_amount,
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
      .populate("policy_id", "policy_number status")
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
