import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import InsurancePlan from "@/models/InsurancePlan";
import SystemLog from "@/models/SystemLog";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = Math.max(Number(searchParams.get("page")) || 1, 1);
    const limit = Math.min(
      Math.max(Number(searchParams.get("limit")) || 10, 1),
      100,
    );
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";

    const query: Record<string, any> = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (status === "active") {
      query.is_active = true;
    } else if (status === "inactive") {
      query.is_active = false;
    }

    const skip = (page - 1) * limit;

    const [plans, total] = await Promise.all([
      InsurancePlan.find(query)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      InsurancePlan.countDocuments(query),
    ]);

    return NextResponse.json({
      plans,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin insurance plans GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch insurance plans" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const description =
      typeof body.description === "string" ? body.description.trim() : "";
    const coverageAmount = Number(body.coverage_amount);
    const premiumAmount = Number(body.premium_amount);
    const premiumFrequency = body.premium_frequency;
    const policyTermYears = Number(body.policy_term_years);
    const features = Array.isArray(body.features)
      ? body.features
          .filter(
            (feature: unknown) => typeof feature === "string" && feature.trim(),
          )
          .map((feature: string) => feature.trim())
      : [];

    if (!name) {
      return NextResponse.json(
        { error: "Plan name is required" },
        { status: 400 },
      );
    }

    if (!Number.isFinite(coverageAmount) || coverageAmount < 0) {
      return NextResponse.json(
        { error: "Valid coverage amount is required" },
        { status: 400 },
      );
    }

    if (!Number.isFinite(premiumAmount) || premiumAmount < 0) {
      return NextResponse.json(
        { error: "Valid premium amount is required" },
        { status: 400 },
      );
    }

    if (
      !["monthly", "quarterly", "half_yearly", "yearly"].includes(
        premiumFrequency,
      )
    ) {
      return NextResponse.json(
        { error: "Invalid premium frequency" },
        { status: 400 },
      );
    }

    if (!Number.isInteger(policyTermYears) || policyTermYears < 1) {
      return NextResponse.json(
        { error: "Policy term must be at least 1 year" },
        { status: 400 },
      );
    }

    await dbConnect();

    const plan = await InsurancePlan.create({
      name,
      description: description || undefined,
      coverage_amount: coverageAmount,
      premium_amount: premiumAmount,
      premium_frequency: premiumFrequency,
      policy_term_years: policyTermYears,
      features,
      is_active: body.is_active !== false,
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
    console.error("Admin insurance plans POST error:", error);
    return NextResponse.json(
      { error: "Failed to create insurance plan" },
      { status: 500 },
    );
  }
}
