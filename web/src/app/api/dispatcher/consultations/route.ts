import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Consultation from "@/models/Consultation";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "dispatcher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status") || "all";
    const emergency = searchParams.get("emergency") || "all";
    const ambulance = searchParams.get("ambulance") || "all";
    const date = searchParams.get("date") || "all";
    const sort = searchParams.get("sort") || "priority";

    const page = Math.max(Number(searchParams.get("page")) || 1, 1);

    const limit = Math.min(
      Math.max(Number(searchParams.get("limit")) || 10, 1),
      50,
    );

    const query: any = {};

    if (status !== "all") {
      query.status = status;
    }

    if (emergency === "emergency") {
      query["ai_draft.is_emergency"] = true;
    }

    if (emergency === "normal") {
      query["ai_draft.is_emergency"] = { $ne: true };
    }

    if (ambulance === "required") {
      query["ambulance_dispatch.required"] = true;
    }

    if (ambulance === "not_required") {
      query["ambulance_dispatch.required"] = { $ne: true };
    }

    if (search) {
      query.$or = [
        {
          "patient_input.symptoms_raw_text": {
            $regex: search,
            $options: "i",
          },
        },
        {
          "ai_draft.translated_symptoms": {
            $regex: search,
            $options: "i",
          },
        },
        {
          "ai_draft.chief_complaints": {
            $elemMatch: {
              $regex: search,
              $options: "i",
            },
          },
        },
      ];
    }

    if (date !== "all") {
      const now = new Date();
      const start = new Date(now);

      if (date === "today") {
        start.setHours(0, 0, 0, 0);
      }

      if (date === "7days") {
        start.setDate(start.getDate() - 7);
      }

      if (date === "30days") {
        start.setDate(start.getDate() - 30);
      }

      query.created_at = {
        $gte: start,
        $lte: now,
      };
    }

    let sortQuery: Record<string, 1 | -1> = {
      created_at: -1,
    };

    if (sort === "oldest") {
      sortQuery = { created_at: 1 };
    }

    if (sort === "newest") {
      sortQuery = { created_at: -1 };
    }

    if (sort === "priority") {
      sortQuery = {
        "ai_draft.is_emergency": -1,
        created_at: -1,
      };
    }

    const skip = (page - 1) * limit;

    const [consultations, total] = await Promise.all([
      Consultation.find(query)
        .populate("patient_id", "username email contact_no patient_info")
        .populate("assigned_department_id", "name")
        .populate(
          "claimed_by_doctor_id",
          "username email contact_no doctor_info",
        )
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .lean(),

      Consultation.countDocuments(query),
    ]);

    return NextResponse.json(
      {
        consultations,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Dispatcher consultations error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
