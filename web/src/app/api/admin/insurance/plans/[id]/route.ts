import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import InsurancePlan from "@/models/InsurancePlan";
import SystemLog from "@/models/SystemLog";

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
      return NextResponse.json({ error: "Invalid plan ID" }, { status: 400 });
    }

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
    console.error("Admin insurance plan GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch insurance plan" },
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
      return NextResponse.json({ error: "Invalid plan ID" }, { status: 400 });
    }

    const body = await req.json();

    await dbConnect();

    const plan = await InsurancePlan.findById(id);

    if (!plan) {
      return NextResponse.json(
        { error: "Insurance plan not found" },
        { status: 404 },
      );
    }

    const updates: Record<string, any> = {};

    if (body.name !== undefined) {
      if (typeof body.name !== "string" || !body.name.trim()) {
        return NextResponse.json(
          { error: "Plan name is required" },
          { status: 400 },
        );
      }
      updates.name = body.name.trim();
    }

    if (body.description !== undefined) {
      if (body.description !== null && typeof body.description !== "string") {
        return NextResponse.json(
          { error: "Invalid description" },
          { status: 400 },
        );
      }
      updates.description =
        typeof body.description === "string"
          ? body.description.trim()
          : undefined;
    }

    if (body.coverage_amount !== undefined) {
      const value = Number(body.coverage_amount);
      if (!Number.isFinite(value) || value < 0) {
        return NextResponse.json(
          { error: "Valid coverage amount is required" },
          { status: 400 },
        );
      }
      updates.coverage_amount = value;
    }

    if (body.premium_amount !== undefined) {
      const value = Number(body.premium_amount);
      if (!Number.isFinite(value) || value < 0) {
        return NextResponse.json(
          { error: "Valid premium amount is required" },
          { status: 400 },
        );
      }
      updates.premium_amount = value;
    }

    if (body.premium_frequency !== undefined) {
      if (
        !["monthly", "quarterly", "half_yearly", "yearly"].includes(
          body.premium_frequency,
        )
      ) {
        return NextResponse.json(
          { error: "Invalid premium frequency" },
          { status: 400 },
        );
      }
      updates.premium_frequency = body.premium_frequency;
    }

    if (body.policy_term_years !== undefined) {
      const value = Number(body.policy_term_years);
      if (!Number.isInteger(value) || value < 1) {
        return NextResponse.json(
          { error: "Policy term must be at least 1 year" },
          { status: 400 },
        );
      }
      updates.policy_term_years = value;
    }

    if (body.features !== undefined) {
      if (!Array.isArray(body.features)) {
        return NextResponse.json(
          { error: "Features must be an array" },
          { status: 400 },
        );
      }

      updates.features = body.features
        .filter(
          (feature: unknown) => typeof feature === "string" && feature.trim(),
        )
        .map((feature: string) => feature.trim());
    }

    if (body.is_active !== undefined) {
      if (typeof body.is_active !== "boolean") {
        return NextResponse.json(
          { error: "is_active must be a boolean" },
          { status: 400 },
        );
      }
      updates.is_active = body.is_active;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields provided for update" },
        { status: 400 },
      );
    }

    const previousValues = {
      name: plan.name,
      coverage_amount: plan.coverage_amount,
      premium_amount: plan.premium_amount,
      premium_frequency: plan.premium_frequency,
      policy_term_years: plan.policy_term_years,
      is_active: plan.is_active,
    };

    Object.assign(plan, updates);
    await plan.save();

    await SystemLog.create({
      actor_id: session.user.id,
      actor_role: session.user.role,
      action_type: "INSURANCE_PLAN_UPDATED",
      target_id: plan._id,
      details: {
        previous_values: previousValues,
        updated_fields: Object.keys(updates),
      },
    });

    return NextResponse.json({
      message: "Insurance plan updated successfully",
      plan,
    });
  } catch (error) {
    console.error("Admin insurance plan PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update insurance plan" },
      { status: 500 },
    );
  }
}
