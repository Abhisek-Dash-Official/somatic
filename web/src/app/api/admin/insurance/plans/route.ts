import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import InsurancePlan from "@/models/InsurancePlan";
import SystemLog from "@/models/SystemLog";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can view insurance plans" },
        { status: 403 },
      );
    }

    await dbConnect();

    const plans = await InsurancePlan.find({}).sort({ created_at: -1 }).lean();

    return NextResponse.json({ plans });
  } catch (error) {
    console.error("Admin insurance plans fetch error:", error);

    return NextResponse.json(
      { error: "Failed to fetch insurance plans" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can create insurance plans" },
        { status: 403 },
      );
    }

    const body = await req.json();

    const {
      name,
      description,
      coverage_amount,
      premium_amount,
      premium_frequency,
      policy_term_years,
      features,
      is_active,
    } = body;

    if (
      !name?.trim() ||
      coverage_amount === undefined ||
      premium_amount === undefined ||
      !premium_frequency ||
      policy_term_years === undefined
    ) {
      return NextResponse.json(
        {
          error:
            "Name, coverage amount, premium amount, premium frequency and policy term are required",
        },
        { status: 400 },
      );
    }

    if (
      !["monthly", "quarterly", "half_yearly", "yearly"].includes(
        premium_frequency,
      )
    ) {
      return NextResponse.json(
        { error: "Invalid premium frequency" },
        { status: 400 },
      );
    }

    const coverageAmount = Number(coverage_amount);
    const premiumAmount = Number(premium_amount);
    const policyTermYears = Number(policy_term_years);

    if (!Number.isFinite(coverageAmount) || coverageAmount <= 0) {
      return NextResponse.json(
        { error: "Coverage amount must be greater than zero" },
        { status: 400 },
      );
    }

    if (!Number.isFinite(premiumAmount) || premiumAmount <= 0) {
      return NextResponse.json(
        { error: "Premium amount must be greater than zero" },
        { status: 400 },
      );
    }

    if (!Number.isFinite(policyTermYears) || policyTermYears <= 0) {
      return NextResponse.json(
        { error: "Policy term must be greater than zero" },
        { status: 400 },
      );
    }

    if (features !== undefined && !Array.isArray(features)) {
      return NextResponse.json(
        { error: "Features must be an array" },
        { status: 400 },
      );
    }

    await dbConnect();

    const plan = await InsurancePlan.create({
      name: name.trim(),
      description: description?.trim(),
      coverage_amount: coverageAmount,
      premium_amount: premiumAmount,
      premium_frequency,
      policy_term_years: policyTermYears,
      features: features || [],
      is_active: is_active !== undefined ? Boolean(is_active) : true,
    });

    await SystemLog.create({
      actor_id: session.user.id,
      actor_role: session.user.role,
      action_type: "INSURANCE_PLAN_CREATED",
      target_id: plan._id,
      details: {
        name: plan.name,
        coverage_amount: plan.coverage_amount,
        premium_amount: plan.premium_amount,
        premium_frequency: plan.premium_frequency,
        policy_term_years: plan.policy_term_years,
      },
    });

    return NextResponse.json(
      {
        message: "Insurance plan created successfully",
        plan,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Insurance plan creation error:", error);

    return NextResponse.json(
      { error: "Failed to create insurance plan" },
      { status: 500 },
    );
  }
}
