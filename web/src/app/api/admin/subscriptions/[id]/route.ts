import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import SubscriptionPlan from "@/models/SubscriptionPlan";
import Subscription from "@/models/Subscription";
import AiUsage from "@/models/AiUsage";
import Transaction from "@/models/Transaction";
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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!isAdmin(session)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { id } = await params;
    const { searchParams } = new URL(req.url);

    if (searchParams.get("type") !== "subscription") {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    const subscription: any = await Subscription.findById(id)
      .populate(
        "user_id",
        "username email contact_no avatar_id date_of_birth role",
      )
      .populate(
        "plan_id",
        "name description price currency duration_days features supported_features token_limit",
      )
      .lean();

    if (!subscription) {
      return NextResponse.json(
        { message: "Subscription not found" },
        { status: 404 },
      );
    }

    const [usage, transactions] = await Promise.all([
      AiUsage.find({ subscription_id: subscription._id })
        .sort({ created_at: -1 })
        .lean(),

      Transaction.find({
        reference_id: subscription._id,
        transaction_type: "subscription",
      })
        .sort({ created_at: -1 })
        .lean(),
    ]);

    return NextResponse.json({
      subscription,
      usage,
      transactions,
    });
  } catch (error) {
    console.error("Subscription detail GET error:", error);
    return NextResponse.json(
      { message: "Failed to fetch subscription" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!isAdmin(session)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { id } = await params;
    const body = await req.json();

    const allowedFields = [
      "name",
      "description",
      "price",
      "currency",
      "duration_days",
      "features",
      "supported_features",
      "token_limit",
      "is_active",
    ];

    const updates: Record<string, any> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (updates.name !== undefined) {
      updates.name = String(updates.name).trim();

      if (!updates.name) {
        return NextResponse.json(
          { message: "Plan name is required" },
          { status: 400 },
        );
      }
    }

    if (updates.description !== undefined) {
      updates.description = String(updates.description).trim();
    }

    if (updates.currency !== undefined) {
      updates.currency = String(updates.currency).trim().toUpperCase();
    }

    if (updates.price !== undefined) {
      updates.price = Number(updates.price);

      if (!Number.isFinite(updates.price) || updates.price < 0) {
        return NextResponse.json({ message: "Invalid price" }, { status: 400 });
      }
    }

    if (updates.duration_days !== undefined) {
      updates.duration_days = Number(updates.duration_days);

      if (
        !Number.isInteger(updates.duration_days) ||
        updates.duration_days < 1
      ) {
        return NextResponse.json(
          { message: "Invalid duration" },
          { status: 400 },
        );
      }
    }

    if (updates.token_limit !== undefined) {
      updates.token_limit = Number(updates.token_limit);

      if (!Number.isFinite(updates.token_limit) || updates.token_limit < 0) {
        return NextResponse.json(
          { message: "Invalid token limit" },
          { status: 400 },
        );
      }
    }

    if (updates.features !== undefined) {
      updates.features = Array.isArray(updates.features)
        ? updates.features
            .filter((feature): feature is string => typeof feature === "string")
            .map((feature) => feature.trim())
            .filter(Boolean)
        : [];
    }

    if (updates.supported_features !== undefined) {
      updates.supported_features = Array.isArray(updates.supported_features)
        ? updates.supported_features
            .filter((feature): feature is string => typeof feature === "string")
            .map((feature) => feature.trim())
            .filter(Boolean)
        : [];
    }

    const existingPlan: any = await SubscriptionPlan.findById(id).lean();

    if (!existingPlan) {
      return NextResponse.json({ message: "Plan not found" }, { status: 404 });
    }

    const plan = await SubscriptionPlan.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).lean();

    await createSystemLog({
      actor_id: session.user.id,
      actor_role: "admin",
      action_type: "subscription_plan_updated",
      target_id: id,
      details: {
        changed_fields: Object.keys(updates),
        previous: Object.fromEntries(
          Object.keys(updates).map((key) => [key, existingPlan[key]]),
        ),
        updated: updates,
      },
    });

    return NextResponse.json({
      message: "Plan updated successfully",
      plan,
    });
  } catch (error) {
    console.error("Admin subscription PATCH error:", error);
    return NextResponse.json(
      { message: "Failed to update plan" },
      { status: 500 },
    );
  }
}
