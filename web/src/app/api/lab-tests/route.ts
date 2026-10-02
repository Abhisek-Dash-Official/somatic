import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import LabTest from "@/models/LabTest";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";
    const type = searchParams.get("type")?.trim() || "";
    const page = Math.max(Number(searchParams.get("page")) || 1, 1);
    const limit = Math.min(
      Math.max(Number(searchParams.get("limit")) || 12, 1),
      50,
    );
    const sortBy = searchParams.get("sortBy") || "created_at";
    const order = searchParams.get("order") === "asc" ? 1 : -1;

    const allowedSortFields = [
      "created_at",
      "updated_at",
      "name",
      "price",
      "category",
    ];

    const filter: Record<string, any> = { is_active: true };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
      ];
    }

    if (category) filter.category = category;

    if (type === "test" || type === "package") {
      filter.type = type;
    }

    const sortField = allowedSortFields.includes(sortBy)
      ? sortBy
      : "created_at";
    const skip = (page - 1) * limit;

    const [tests, total] = await Promise.all([
      LabTest.find(filter)
        .sort({ [sortField]: order })
        .skip(skip)
        .limit(limit)
        .lean(),
      LabTest.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: tests,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
        has_next: page < Math.ceil(total / limit),
        has_previous: page > 1,
      },
    });
  } catch (error) {
    console.error("GET /api/lab-tests error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to fetch lab tests." },
      { status: 500 },
    );
  }
}
