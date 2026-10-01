import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Learn from "@/models/Learn";
import SystemLog from "@/models/SystemLog";

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

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(req.url);

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

    const order = orderParam === "asc" ? 1 : -1;

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
    }

    if (medicallyReviewed === "true") {
      filter.is_medically_reviewed = true;
    }

    if (medicallyReviewed === "false") {
      filter.is_medically_reviewed = false;
    }

    await dbConnect();

    const [data, total] = await Promise.all([
      Learn.find(filter)
        .select(
          "title slug desc content cover_image category tags expert_summary read_time status author is_medically_reviewed reviewed_by views created_at updated_at",
        )
        .sort({
          [sortBy]: order,
          _id: order,
        })
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
  } catch (error: any) {
    console.error("Admin Learn GET Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    const body = await req.json();

    const {
      title,
      slug,
      desc,
      content,
      cover_image,
      category,
      tags,
      expert_summary,
      read_time,
      status,
      author,
      is_medically_reviewed,
      reviewed_by,
    } = body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof slug !== "string" ||
      !slug.trim() ||
      typeof desc !== "string" ||
      !desc.trim() ||
      typeof content !== "string" ||
      !content.trim() ||
      typeof cover_image !== "string" ||
      !cover_image.trim() ||
      typeof category !== "string" ||
      !category.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Title, slug, description, content, cover image and category are required",
        },
        { status: 400 },
      );
    }

    if (
      !Array.isArray(tags) ||
      tags.some((tag: unknown) => typeof tag !== "string")
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Tags must be an array of strings",
        },
        { status: 400 },
      );
    }

    if (
      typeof read_time !== "number" ||
      !Number.isFinite(read_time) ||
      read_time <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Read time must be a valid positive number",
        },
        { status: 400 },
      );
    }

    if (
      status !== undefined &&
      !["draft", "published", "archived"].includes(status)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid article status",
        },
        { status: 400 },
      );
    }

    if (
      !author ||
      typeof author !== "object" ||
      typeof author.name !== "string" ||
      !author.name.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Author name is required",
        },
        { status: 400 },
      );
    }

    await dbConnect();

    const normalizedSlug = slug.trim().toLowerCase().replace(/\s+/g, "-");

    const existingArticle = await Learn.findOne({
      slug: normalizedSlug,
    }).lean();

    if (existingArticle) {
      return NextResponse.json(
        {
          success: false,
          message: "An article with this slug already exists",
        },
        { status: 409 },
      );
    }

    const article = await Learn.create({
      title: title.trim(),
      slug: normalizedSlug,
      desc: desc.trim(),
      content: content.trim(),
      cover_image: cover_image.trim(),
      category: category.trim(),
      tags: tags.map((tag: string) => tag.trim()).filter(Boolean),
      expert_summary:
        typeof expert_summary === "string" ? expert_summary.trim() : undefined,
      read_time,
      status: status || "draft",
      author: {
        name: author.name.trim(),
        credentials:
          typeof author.credentials === "string"
            ? author.credentials.trim()
            : undefined,
        avatar:
          typeof author.avatar === "string" ? author.avatar.trim() : undefined,
      },
      is_medically_reviewed:
        typeof is_medically_reviewed === "boolean"
          ? is_medically_reviewed
          : false,
      reviewed_by:
        typeof reviewed_by === "string" ? reviewed_by.trim() : undefined,
    });

    await SystemLog.create({
      actor_id: session.user.id,
      actor_role: session.user.role,
      action_type: "CREATE_LEARN",
      target_id: article._id,
      details: {
        title: article.title,
        slug: article.slug,
        category: article.category,
        status: article.status,
        tags: article.tags,
        read_time: article.read_time,
        author: article.author,
        is_medically_reviewed: article.is_medically_reviewed,
        reviewed_by: article.reviewed_by || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Learn article created successfully",
        data: article,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Admin Learn POST Error:", error);

    if (error?.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "An article with this slug already exists",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
