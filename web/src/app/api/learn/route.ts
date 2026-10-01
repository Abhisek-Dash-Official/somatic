import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Learn from "@/models/Learn";

const SORT_FIELDS = {
  created_at: "created_at",
  updated_at: "updated_at",
  title: "title",
  views: "views",
  read_time: "read_time",
} as const;

type SortField = keyof typeof SORT_FIELDS;

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";
    const tag = searchParams.get("tag")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";
    const medicallyReviewed = searchParams.get("medically_reviewed") || "";

    const pageParam = Number(searchParams.get("page") || 1);
    const limitParam = Number(searchParams.get("limit") || 12);

    const page =
      Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;
    const limit =
      Number.isFinite(limitParam) && limitParam > 0
        ? Math.min(Math.floor(limitParam), 50)
        : 12;
    const skip = (page - 1) * limit;

    const sortByParam = searchParams.get("sortBy") || "created_at";
    const orderParam = searchParams.get("order") || "desc";

    const sortBy: SortField = Object.prototype.hasOwnProperty.call(
      SORT_FIELDS,
      sortByParam,
    )
      ? (sortByParam as SortField)
      : "created_at";

    const order: "asc" | "desc" = orderParam === "asc" ? "asc" : "desc";

    const filter: Record<string, any> = {};

    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");

      filter.$or = [
        { title: regex },
        { desc: regex },
        { category: regex },
        { tags: regex },
        { "author.name": regex },
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (tag) {
      filter.tags = tag;
    }

    if (status) {
      filter.status = status;
    } else {
      filter.status = "published";
    }

    if (medicallyReviewed === "true") {
      filter.is_medically_reviewed = true;
    }

    if (medicallyReviewed === "false") {
      filter.is_medically_reviewed = false;
    }

    const sortOrder = order === "asc" ? 1 : -1;

    const [data, total] = await Promise.all([
      Learn.find(filter)
        .select(
          "title slug desc content cover_image category tags expert_summary read_time status author is_medically_reviewed reviewed_by views created_at updated_at",
        )
        .sort({ [sortBy]: sortOrder, _id: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),

      Learn.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Learn GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch learn articles",
      },
      { status: 500 },
    );
  }
}
