import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import SubscriptionPlan from "@/models/SubscriptionPlan";
import Subscription from "@/models/Subscription";
import { createSystemLog } from "@/lib/logger";

type AdminSession = {
  user: {
    id: string;
    role: "admin";
  };
};

const isAdmin = (session: unknown): session is AdminSession => {
  if (!session || typeof session !== "object") return false;
  const user = (session as { user?: { id?: unknown; role?: unknown } }).user;
  return typeof user?.id === "string" && user.role === "admin";
};

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!isAdmin(session)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const view = searchParams.get("view") || "plans";
    const search = searchParams.get("search")?.trim().toLowerCase() || "";
    const page = Math.max(Number(searchParams.get("page")) || 1, 1);
    const limit = Math.min(
      Math.max(Number(searchParams.get("limit")) || 10, 1),
      50,
    );

    if (view === "plans") {
      const [plans, subscriberCounts] = await Promise.all([
        SubscriptionPlan.find().sort({ created_at: -1 }).lean(),
        Subscription.aggregate([
          { $group: { _id: "$plan_id", count: { $sum: 1 } } },
        ]),
      ]);

      const countMap = new Map(
        subscriberCounts.map((item) => [String(item._id), item.count]),
      );

      return NextResponse.json({
        plans: plans.map((plan: any) => ({
          ...plan,
          subscriber_count: countMap.get(String(plan._id)) || 0,
        })),
      });
    }

    if (view === "subscribers") {
      const subscriptions = await Subscription.find()
        .populate("user_id", "username email contact_no avatar_id")
        .populate(
          "plan_id",
          "name description price currency duration_days features token_limit",
        )
        .sort({ created_at: -1 })
        .lean();

      const filtered = search
        ? subscriptions.filter((subscription: any) => {
            const user = subscription.user_id;
            const plan = subscription.plan_id;

            return (
              user?.username?.toLowerCase().includes(search) ||
              user?.email?.toLowerCase().includes(search) ||
              subscription.plan_name?.toLowerCase().includes(search) ||
              plan?.name?.toLowerCase().includes(search) ||
              subscription.status?.toLowerCase().includes(search)
            );
          })
        : subscriptions;

      const total = filtered.length;
      const start = (page - 1) * limit;

      return NextResponse.json({
        subscribers: filtered.slice(start, start + limit),
        pagination: {
          page,
          limit,
          total,
          total_pages: Math.ceil(total / limit),
          has_more: start + limit < total,
        },
      });
    }

    return NextResponse.json({ message: "Invalid view" }, { status: 400 });
  } catch (error) {
    console.error("Admin subscriptions GET error:", error);
    return NextResponse.json(
      { message: "Failed to fetch subscriptions" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!isAdmin(session)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await req.json();
    const {
      name,
      description,
      price,
      currency,
      duration_days,
      features,
      token_limit,
      is_active,
    } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { message: "Plan name is required" },
        { status: 400 },
      );
    }

    if (
      price === undefined ||
      !Number.isFinite(Number(price)) ||
      Number(price) < 0
    ) {
      return NextResponse.json(
        { message: "Valid price is required" },
        { status: 400 },
      );
    }

    if (
      duration_days === undefined ||
      !Number.isInteger(Number(duration_days)) ||
      Number(duration_days) < 1
    ) {
      return NextResponse.json(
        { message: "Duration must be at least 1 day" },
        { status: 400 },
      );
    }

    if (
      token_limit === undefined ||
      !Number.isFinite(Number(token_limit)) ||
      Number(token_limit) < 0
    ) {
      return NextResponse.json(
        { message: "Valid token limit is required" },
        { status: 400 },
      );
    }

    const plan = await SubscriptionPlan.create({
      name: name.trim(),
      description: description?.trim() || "",
      price: Number(price),
      currency: currency?.trim()?.toUpperCase() || "INR",
      duration_days: Number(duration_days),
      features: Array.isArray(features)
        ? features
            .filter((feature): feature is string => typeof feature === "string")
            .map((feature) => feature.trim())
            .filter(Boolean)
        : [],
      token_limit: Number(token_limit),
      is_active: is_active !== false,
    });

    await createSystemLog({
      actor_id: session.user.id,
      actor_role: "admin",
      action_type: "subscription_plan_created",
      target_id: plan._id,
      details: {
        name: plan.name,
        price: plan.price,
        currency: plan.currency,
        duration_days: plan.duration_days,
        token_limit: plan.token_limit,
      },
    });

    return NextResponse.json(
      { message: "Plan created successfully", plan },
      { status: 201 },
    );
  } catch (error) {
    console.error("Admin subscriptions POST error:", error);
    return NextResponse.json(
      { message: "Failed to create plan" },
      { status: 500 },
    );
  }
}
