import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import InsuranceClaim from "@/models/InsuranceClaim";
import InsurancePolicy from "@/models/InsurancePolicy";
import User from "@/models/User";

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
      const [users, policies] = await Promise.all([
        User.find({
          $or: [
            { username: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }).select("_id"),
        InsurancePolicy.find({
          policy_number: { $regex: search, $options: "i" },
        }).select("_id"),
      ]);

      query.$or = [
        { claim_number: { $regex: search, $options: "i" } },
        { user_id: { $in: users.map((user) => user._id) } },
        { policy_id: { $in: policies.map((policy) => policy._id) } },
      ];
    }

    const skip = (page - 1) * limit;

    const [claims, total] = await Promise.all([
      InsuranceClaim.find(query)
        .populate("user_id", "username email contact_no")
        .populate({
          path: "policy_id",
          select: "policy_number status start_date expiry_date plan_id",
          populate: {
            path: "plan_id",
            select:
              "name coverage_amount premium_amount premium_frequency policy_term_years",
          },
        })
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      InsuranceClaim.countDocuments(query),
    ]);

    return NextResponse.json({
      claims,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin insurance claims GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch insurance claims" },
      { status: 500 },
    );
  }
}
