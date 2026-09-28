import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import InsurancePolicy from "@/models/InsurancePolicy";
import User from "@/models/User";
import InsurancePlan from "@/models/InsurancePlan";

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

    if (status && status !== "all") {
      query.status = status;
    }

    if (search) {
      const users = await User.find({
        $or: [
          { username: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }).select("_id");

      const plans = await InsurancePlan.find({
        name: { $regex: search, $options: "i" },
      }).select("_id");

      query.$or = [
        { policy_number: { $regex: search, $options: "i" } },
        { user_id: { $in: users.map((user) => user._id) } },
        { plan_id: { $in: plans.map((plan) => plan._id) } },
      ];
    }

    const skip = (page - 1) * limit;

    const [policies, total] = await Promise.all([
      InsurancePolicy.find(query)
        .populate("user_id", "username email contact_no")
        .populate(
          "plan_id",
          "name coverage_amount premium_amount premium_frequency policy_term_years",
        )
        .populate("approved_by", "username email")
        .populate("rejected_by", "username email")
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      InsurancePolicy.countDocuments(query),
    ]);

    return NextResponse.json({
      policies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin insurance policies GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch insurance policies" },
      { status: 500 },
    );
  }
}
