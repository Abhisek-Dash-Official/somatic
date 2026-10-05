import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import AiUsage from "@/models/AiUsage";
import User from "@/models/User";
import SystemSetting from "@/models/SystemSetting";

export async function GET(req: Request) {
  try {
    User;

    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 },
      );
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const rangeParam = Number(searchParams.get("range") || 30);
    const range = [7, 30, 90].includes(rangeParam) ? rangeParam : 30;

    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - range);

    const baseMatch = { created_at: { $gte: startDate, $lte: now } };

    const [
      overviewData,
      featureData,
      modelData,
      dailyData,
      sourceData,
      topUsersData,
      setting,
    ] = await Promise.all([
      AiUsage.aggregate([
        { $match: baseMatch },
        {
          $group: {
            _id: null,
            totalRequests: { $sum: 1 },
            totalPromptTokens: { $sum: { $ifNull: ["$tokens_prompt", 0] } },
            totalCompletionTokens: {
              $sum: { $ifNull: ["$tokens_completion", 0] },
            },
            totalTokens: { $sum: { $ifNull: ["$tokens_total", 0] } },
            avgPromptTokens: { $avg: { $ifNull: ["$tokens_prompt", 0] } },
            avgCompletionTokens: {
              $avg: { $ifNull: ["$tokens_completion", 0] },
            },
            avgResponseTime: { $avg: { $ifNull: ["$response_time_sec", 0] } },
          },
        },
      ]),

      AiUsage.aggregate([
        { $match: baseMatch },
        {
          $group: {
            _id: "$feature",
            requests: { $sum: 1 },
            totalTokens: { $sum: { $ifNull: ["$tokens_total", 0] } },
            promptTokens: { $sum: { $ifNull: ["$tokens_prompt", 0] } },
            completionTokens: { $sum: { $ifNull: ["$tokens_completion", 0] } },
            avgResponseTime: { $avg: { $ifNull: ["$response_time_sec", 0] } },
          },
        },
        { $sort: { totalTokens: -1 } },
      ]),

      AiUsage.aggregate([
        { $match: baseMatch },
        {
          $group: {
            _id: { $ifNull: ["$ai_model", "Unknown"] },
            requests: { $sum: 1 },
            totalTokens: { $sum: { $ifNull: ["$tokens_total", 0] } },
            avgResponseTime: { $avg: { $ifNull: ["$response_time_sec", 0] } },
          },
        },
        { $sort: { totalTokens: -1 } },
      ]),

      AiUsage.aggregate([
        { $match: baseMatch },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$created_at",
              },
            },
            requests: { $sum: 1 },
            tokens: { $sum: { $ifNull: ["$tokens_total", 0] } },
            promptTokens: { $sum: { $ifNull: ["$tokens_prompt", 0] } },
            completionTokens: { $sum: { $ifNull: ["$tokens_completion", 0] } },
            avgResponseTime: { $avg: { $ifNull: ["$response_time_sec", 0] } },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      AiUsage.aggregate([
        { $match: baseMatch },
        {
          $group: {
            _id: {
              $cond: [
                { $ifNull: ["$subscription_id", false] },
                "Subscription",
                "Free / Quota",
              ],
            },
            requests: { $sum: 1 },
            tokens: { $sum: { $ifNull: ["$tokens_total", 0] } },
          },
        },
        { $sort: { tokens: -1 } },
      ]),

      AiUsage.aggregate([
        { $match: baseMatch },
        {
          $group: {
            _id: "$user_id",
            requests: { $sum: 1 },
            tokens: { $sum: { $ifNull: ["$tokens_total", 0] } },
            avgResponseTime: { $avg: { $ifNull: ["$response_time_sec", 0] } },
          },
        },
        { $sort: { tokens: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: {
            path: "$user",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            username: { $ifNull: ["$user.username", "Unknown User"] },
            email: { $ifNull: ["$user.email", ""] },
            role: { $ifNull: ["$user.role", "unknown"] },
            requests: 1,
            tokens: 1,
            avgResponseTime: 1,
          },
        },
      ]),

      SystemSetting.findOne().select("ai_model_config").lean(),
    ]);

    const overview = overviewData[0] || {
      totalRequests: 0,
      totalPromptTokens: 0,
      totalCompletionTokens: 0,
      totalTokens: 0,
      avgPromptTokens: 0,
      avgCompletionTokens: 0,
      avgResponseTime: 0,
    };

    const threshold = Number(
      setting?.ai_model_config?.daily_token_threshold_alert || 0,
    );

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const todayData = await AiUsage.aggregate([
      {
        $match: {
          created_at: { $gte: todayStart, $lte: now },
        },
      },
      {
        $group: {
          _id: null,
          tokens: { $sum: { $ifNull: ["$tokens_total", 0] } },
          requests: { $sum: 1 },
        },
      },
    ]);

    const today = todayData[0] || { tokens: 0, requests: 0 };

    const dailyUsagePercentage =
      threshold > 0 ? Math.min((today.tokens / threshold) * 100, 100) : 0;

    return NextResponse.json({
      success: true,
      range,
      period: {
        start: startDate,
        end: now,
      },
      overview: {
        totalRequests: overview.totalRequests,
        totalPromptTokens: Math.round(overview.totalPromptTokens),
        totalCompletionTokens: Math.round(overview.totalCompletionTokens),
        totalTokens: Math.round(overview.totalTokens),
        avgPromptTokens: Math.round(overview.avgPromptTokens),
        avgCompletionTokens: Math.round(overview.avgCompletionTokens),
        avgResponseTime: Number(overview.avgResponseTime.toFixed(2)),
        avgTokensPerRequest: overview.totalRequests
          ? Math.round(overview.totalTokens / overview.totalRequests)
          : 0,
      },
      model: {
        current: setting?.ai_model_config?.current_model || "Not configured",
        dailyThreshold: threshold,
        todayTokens: today.tokens,
        todayRequests: today.requests,
        dailyUsagePercentage: Number(dailyUsagePercentage.toFixed(1)),
      },
      features: featureData.map((item) => ({
        feature: item._id || "Unknown",
        requests: item.requests,
        totalTokens: Math.round(item.totalTokens),
        promptTokens: Math.round(item.promptTokens),
        completionTokens: Math.round(item.completionTokens),
        avgResponseTime: Number(item.avgResponseTime.toFixed(2)),
      })),
      models: modelData.map((item) => ({
        model: item._id,
        requests: item.requests,
        totalTokens: Math.round(item.totalTokens),
        avgResponseTime: Number(item.avgResponseTime.toFixed(2)),
      })),
      daily: dailyData.map((item) => ({
        date: item._id,
        requests: item.requests,
        tokens: Math.round(item.tokens),
        promptTokens: Math.round(item.promptTokens),
        completionTokens: Math.round(item.completionTokens),
        avgResponseTime: Number(item.avgResponseTime.toFixed(2)),
      })),
      sources: sourceData.map((item) => ({
        source: item._id,
        requests: item.requests,
        tokens: Math.round(item.tokens),
      })),
      topUsers: topUsersData.map((item) => ({
        id: item._id,
        username: item.username,
        email: item.email,
        role: item.role,
        requests: item.requests,
        tokens: Math.round(item.tokens),
        avgResponseTime: Number(item.avgResponseTime.toFixed(2)),
      })),
    });
  } catch (error) {
    console.error("AI Analytics API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch AI analytics" },
      { status: 500 },
    );
  }
}
