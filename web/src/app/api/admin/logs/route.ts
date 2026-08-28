import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import SystemLog from "@/models/SystemLog";
import User from "@/models/User";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "15", 10);
    const skip = (page - 1) * limit;

    await dbConnect();

    const [logs, totalCount] = await Promise.all([
      SystemLog.find()
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .populate("actor_id", "username")
        .select("timestamp action_type actor_role actor_id details target_id")
        .lean(),
      SystemLog.countDocuments(),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      logs,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error: any) {
    console.error("System Logs API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch system logs" },
      { status: 500 },
    );
  }
}
