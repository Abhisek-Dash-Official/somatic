import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Consultation from "@/models/Consultation";
import User from "@/models/User";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session?.user?.id ||
      (session.user.role !== "doctor" &&
        session.user.role !== "assistant_doctor")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await dbConnect();

    const doctor = await User.findById(session.user.id)
      .select("doctor_info")
      .lean();

    if (!doctor || !doctor.doctor_info?.department_id) {
      return NextResponse.json(
        {
          error: "Doctor department not configured. Please contact admin.",
        },
        { status: 403 },
      );
    }

    const doctorDeptId = doctor.doctor_info.department_id;

    const { searchParams } = new URL(req.url);

    const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);

    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "10"), 1),
      100,
    );

    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status") || "all";
    const emergency = searchParams.get("emergency") || "all";
    const ageMin = searchParams.get("ageMin");
    const ageMax = searchParams.get("ageMax");
    const dateRange = searchParams.get("dateRange") || "all";
    const sort = searchParams.get("sort") || "priority";

    const query: any = {
      $or: [
        {
          assigned_department_id: doctorDeptId,
        },
        {
          claimed_by_doctor_id: session.user.id,
        },
      ],
    };

    if (
      status === "pending_review" ||
      status === "in_review" ||
      status === "completed"
    ) {
      query.status = status;
    }

    if (emergency === "emergency") {
      query["ai_draft.is_emergency"] = true;
    }

    if (emergency === "normal") {
      query["ai_draft.is_emergency"] = {
        $ne: true,
      };
    }

    if (ageMin || ageMax) {
      query["patient_input.age"] = {};

      if (ageMin) {
        const min = Number(ageMin);

        if (!Number.isNaN(min)) {
          query["patient_input.age"].$gte = min;
        }
      }

      if (ageMax) {
        const max = Number(ageMax);

        if (!Number.isNaN(max)) {
          query["patient_input.age"].$lte = max;
        }
      }
    }

    if (search) {
      query.$and = [
        {
          $or: [
            {
              "ai_draft.chief_complaints": {
                $regex: search,
                $options: "i",
              },
            },
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
          ],
        },
      ];
    }

    if (dateRange !== "all") {
      const now = new Date();
      const start = new Date(now);

      start.setHours(0, 0, 0, 0);

      if (dateRange === "today") {
        query.created_at = {
          $gte: start,
          $lte: now,
        };
      }

      if (dateRange === "7days") {
        start.setDate(start.getDate() - 6);

        query.created_at = {
          $gte: start,
          $lte: now,
        };
      }

      if (dateRange === "30days") {
        start.setDate(start.getDate() - 29);

        query.created_at = {
          $gte: start,
          $lte: now,
        };
      }
    }

    let sortQuery: any = {
      "ai_draft.is_emergency": -1,
      created_at: -1,
    };

    if (sort === "newest") {
      sortQuery = {
        created_at: -1,
      };
    }

    if (sort === "oldest") {
      sortQuery = {
        created_at: 1,
      };
    }

    const skip = (page - 1) * limit;

    const total = await Consultation.countDocuments(query);

    const consultations = await Consultation.find(query)
      .select(
        "_id status created_at patient_input.age patient_input.symptoms_raw_text ai_draft.chief_complaints ai_draft.translated_symptoms ai_draft.is_emergency",
      )
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json(
      {
        consultations,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.max(Math.ceil(total / limit), 1),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Doctor consultations API error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
