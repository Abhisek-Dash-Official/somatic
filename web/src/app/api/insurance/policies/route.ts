import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import InsurancePlan from "@/models/InsurancePlan";
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
        { error: "Only patients can purchase insurance" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { plan_id, insured_members, documents } = body;

    if (!plan_id || !mongoose.Types.ObjectId.isValid(plan_id)) {
      return NextResponse.json(
        { error: "Valid insurance plan is required" },
        { status: 400 },
      );
    }

    if (!Array.isArray(insured_members) || insured_members.length === 0) {
      return NextResponse.json(
        { error: "At least one insured member is required" },
        { status: 400 },
      );
    }

    for (const member of insured_members) {
      if (!member?.name?.trim() || !member?.relationship?.trim()) {
        return NextResponse.json(
          { error: "Each insured member must have a name and relationship" },
          { status: 400 },
        );
      }

      if (
        member.date_of_birth &&
        Number.isNaN(new Date(member.date_of_birth).getTime())
      ) {
        return NextResponse.json(
          { error: "Invalid date of birth for insured member" },
          { status: 400 },
        );
      }
    }

    if (documents !== undefined && !Array.isArray(documents)) {
      return NextResponse.json(
        { error: "Documents must be an array" },
        { status: 400 },
      );
    }

    if (documents) {
      for (const document of documents) {
        if (!document?.type || !document?.file_url?.trim()) {
          return NextResponse.json(
            { error: "Each document must have a type and file URL" },
            { status: 400 },
          );
        }
      }
    }

    await dbConnect();

    const existingPolicies = await InsurancePolicy.find({
      user_id: session.user.id,
      status: {
        $in: [
          "pending",
          "approved",
          "payment_pending",
          "active",
          "revival_pending",
          "lapsed",
        ],
      },
    });

    for (const existingPolicy of existingPolicies) {
      await syncInsurancePolicyStatus(existingPolicy);
    }

    const existingPolicy = existingPolicies.find((policy) =>
      [
        "pending",
        "approved",
        "payment_pending",
        "active",
        "revival_pending",
        "lapsed",
      ].includes(policy.status),
    );

    if (existingPolicy) {
      if (existingPolicy.status === "lapsed") {
        return NextResponse.json(
          {
            error:
              "You already have a lapsed insurance policy. Please request revival instead of purchasing another policy.",
          },
          { status: 409 },
        );
      }

      if (existingPolicy.status === "revival_pending") {
        return NextResponse.json(
          {
            error:
              "Your insurance policy revival request is already under review.",
          },
          { status: 409 },
        );
      }

      return NextResponse.json(
        {
          error: "You already have an existing insurance policy or application",
        },
        { status: 409 },
      );
    }

    const plan = await InsurancePlan.findOne({
      _id: plan_id,
      is_active: true,
    });

    if (!plan) {
      return NextResponse.json(
        { error: "Insurance plan not found or inactive" },
        { status: 404 },
      );
    }

    const policy = await InsurancePolicy.create({
      user_id: session.user.id,
      plan_id: plan._id,
      insured_members: insured_members.map((member: any) => ({
        name: member.name.trim(),
        relationship: member.relationship.trim(),
        ...(member.date_of_birth
          ? { date_of_birth: new Date(member.date_of_birth) }
          : {}),
      })),
      documents: Array.isArray(documents)
        ? documents.map((document: any) => ({
            type: document.type,
            file_url: document.file_url.trim(),
          }))
        : [],
      status: "pending",
    });

    await SystemLog.create({
      actor_id: session.user.id,
      actor_role: session.user.role,
      action_type: "INSURANCE_PROPOSAL_CREATED",
      target_id: policy._id,
      details: {
        plan_id: plan._id,
        plan_name: plan.name,
        premium_amount: plan.premium_amount,
        coverage_amount: plan.coverage_amount,
        premium_frequency: plan.premium_frequency,
        policy_term_years: plan.policy_term_years,
        insured_members_count: insured_members.length,
      },
    });

    return NextResponse.json(
      {
        message: "Insurance proposal submitted successfully",
        policy: {
          _id: policy._id,
          plan_id: policy.plan_id,
          status: policy.status,
          insured_members: policy.insured_members,
          documents: policy.documents,
          created_at: policy.created_at,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Insurance proposal creation error:", error);

    return NextResponse.json(
      { error: "Failed to submit insurance proposal" },
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
        { error: "Only patients can access insurance policies" },
        { status: 403 },
      );
    }

    await dbConnect();

    const policies = await InsurancePolicy.find({
      user_id: session.user.id,
    })
      .populate("plan_id")
      .sort({ created_at: -1 });

    for (const policy of policies) {
      await syncInsurancePolicyStatus(policy);
    }

    return NextResponse.json({
      policies: policies.map((policy) => policy.toObject()),
    });
  } catch (error) {
    console.error("Insurance policies fetch error:", error);

    return NextResponse.json(
      { error: "Failed to fetch insurance policies" },
      { status: 500 },
    );
  }
}
