import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import InsurancePolicy from "@/models/InsurancePolicy";
import "@/models/User";
import "@/models/InsurancePlan";
import { syncInsurancePolicyStatus } from "@/lib/insurance";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "dispatcher") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search")?.trim();

    const query: Record<string, any> = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      const users = await import("@/models/User").then(({ default: User }) =>
        User.find({
          $or: [
            { username: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }).select("_id"),
      );

      query.$or = [
        { user_id: { $in: users.map((user) => user._id) } },
        { policy_number: { $regex: search, $options: "i" } },
      ];
    }

    const policies = await InsurancePolicy.find(query)
      .populate("user_id", "username email contact_no address")
      .populate(
        "plan_id",
        "name description coverage_amount premium_amount premium_frequency policy_term_years",
      )
      .populate("approved_by", "username email")
      .populate("rejected_by", "username email")
      .sort({ created_at: -1 });

    for (const policy of policies) {
      await syncInsurancePolicyStatus(policy);
    }

    return NextResponse.json({ policies });
  } catch (error) {
    console.error("Dispatcher insurance list error:", error);

    return NextResponse.json(
      { error: "Failed to fetch insurance policies" },
      { status: 500 },
    );
  }
}
