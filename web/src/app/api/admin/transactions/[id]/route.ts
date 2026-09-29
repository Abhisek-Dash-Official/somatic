import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import Subscription from "@/models/Subscription";
import AiUsage from "@/models/AiUsage";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid transaction ID" },
        { status: 400 },
      );
    }

    await dbConnect();

    const transaction = await Transaction.findById(id)
      .populate("user_id", "username email contact_no role")
      .lean();

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 },
      );
    }

    let reference: unknown = null;
    let aiUsage: unknown[] = [];

    if (transaction.transaction_type === "subscription") {
      const subscription = await Subscription.findById(transaction.reference_id)
        .populate(
          "plan_id",
          "name description price currency duration_days features token_limit",
        )
        .lean();

      reference = subscription;

      if (subscription) {
        aiUsage = await AiUsage.find({
          subscription_id: subscription._id,
        })
          .sort({ created_at: -1 })
          .limit(50)
          .select(
            "feature ai_model tokens_prompt tokens_completion tokens_total response_time_sec reference_id created_at",
          )
          .lean();
      }
    }

    return NextResponse.json({
      transaction,
      reference,
      ai_usage: aiUsage,
    });
  } catch (error) {
    console.error("Admin transaction detail GET error:", error);

    return NextResponse.json(
      { error: "Failed to fetch transaction" },
      { status: 500 },
    );
  }
}
