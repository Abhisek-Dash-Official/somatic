import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import InsurancePlan from "@/models/InsurancePlan";
import SystemLog from "@/models/SystemLog";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const { id } = await params;

    await dbConnect();

    const plan = await InsurancePlan.findById(id).lean();

    if (!plan) {
      return NextResponse.json(
        { error: "Insurance plan not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ plan });
  } catch (error) {
    console.error("Admin insurance plan detail error:", error);

    return NextResponse.json(
      { error: "Failed to fetch insurance plan" },
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

    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can update insurance plans" },
        { status: 403 },
      );
    }

    const { id } = await params;
    const body = await req.json();

    await dbConnect();

    const plan = await InsurancePlan.findById(id);

    if (!plan) {
      return NextResponse.json(
        { error: "Insurance plan not found" },
        { status: 404 },
      );
    }

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

    if (name !== undefined) {
      if (!name?.trim()) {
        return NextResponse.json(
          { error: "Plan name cannot be empty" },
          { status: 400 },
        );
      }

      plan.name = name.trim();
    }

    if (description !== undefined) {
      plan.description = description?.trim();
    }

    if (coverage_amount !== undefined) {
      const value = Number(coverage_amount);

      if (!Number.isFinite(value) || value <= 0) {
        return NextResponse.json(
          { error: "Coverage amount must be greater than zero" },
          { status: 400 },
        );
      }

      plan.coverage_amount = value;
    }

    if (premium_amount !== undefined) {
      const value = Number(premium_amount);

      if (!Number.isFinite(value) || value <= 0) {
        return NextResponse.json(
          { error: "Premium amount must be greater than zero" },
          { status: 400 },
        );
      }

      plan.premium_amount = value;
    }

    if (premium_frequency !== undefined) {
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

      plan.premium_frequency = premium_frequency;
    }

    if (policy_term_years !== undefined) {
      const value = Number(policy_term_years);

      if (!Number.isFinite(value) || value <= 0) {
        return NextResponse.json(
          { error: "Policy term must be greater than zero" },
          { status: 400 },
        );
      }

      plan.policy_term_years = value;
    }

    if (features !== undefined) {
      if (!Array.isArray(features)) {
        return NextResponse.json(
          { error: "Features must be an array" },
          { status: 400 },
        );
      }

      plan.features = features;
    }

    if (is_active !== undefined) {
      plan.is_active = Boolean(is_active);
    }

    await plan.save();

    await SystemLog.create({
      actor_id: session.user.id,
      actor_role: session.user.role,
      action_type: "INSURANCE_PLAN_UPDATED",
      target_id: plan._id,
      details: {
        name: plan.name,
        coverage_amount: plan.coverage_amount,
        premium_amount: plan.premium_amount,
        premium_frequency: plan.premium_frequency,
        policy_term_years: plan.policy_term_years,
        is_active: plan.is_active,
      },
    });

    return NextResponse.json({
      message: "Insurance plan updated successfully",
      plan,
    });
  } catch (error) {
    console.error("Insurance plan update error:", error);

    return NextResponse.json(
      { error: "Failed to update insurance plan" },
      { status: 500 },
    );
  }
}
