import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import InsuranceClaim from "@/models/InsuranceClaim";
import "@/models/User";
import "@/models/InsurancePolicy";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "dispatcher") {
      return NextResponse.json(
        { error: "Only dispatchers can view insurance claims" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search")?.trim();

    await dbConnect();

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

      const userIds = users.map((user: any) => user._id);

      query.$or = [
        { claim_number: { $regex: search, $options: "i" } },
        ...(userIds.length > 0 ? [{ user_id: { $in: userIds } }] : []),
      ];
    }

    const claims = await InsuranceClaim.find(query)
      .populate("user_id", "username email contact_no")
      .populate("policy_id", "policy_number status")
      .sort({ created_at: -1 })
      .lean();

    return NextResponse.json({ claims });
  } catch (error) {
    console.error("Dispatcher insurance claims fetch error:", error);

    return NextResponse.json(
      { error: "Failed to fetch insurance claims" },
      { status: 500 },
    );
  }
}
