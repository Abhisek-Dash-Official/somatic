import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import LabTest from "@/models/LabTest";
import SystemLog from "@/models/SystemLog";

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
    const type = searchParams.get("type")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";

    await dbConnect();

    const query: Record<string, any> = {};

    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      query.$or = [
        { name: { $regex: escapedSearch, $options: "i" } },
        { code: { $regex: escapedSearch, $options: "i" } },
        { category: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    if (category) {
      query.category = category;
    }

    if (type === "test" || type === "package") {
      query.type = type;
    }

    if (status === "active") {
      query.is_active = true;
    }

    if (status === "inactive") {
      query.is_active = false;
    }

    const labTests = await LabTest.find(query).sort({ created_at: -1 }).lean();

    const categories = await LabTest.distinct("category");

    return NextResponse.json({
      success: true,
      data: labTests,
      categories: categories.filter(Boolean).sort(),
    });
  } catch (error: any) {
    console.error("Admin Lab Tests GET Error:", error);

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
      name,
      code,
      description,
      category,
      type,
      price,
      home_collection,
      sample_type,
      preparation,
      report_time,
      parameters,
      is_active,
    } = body;

    if (typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Lab test name is required" },
        { status: 400 },
      );
    }

    if (typeof category !== "string" || !category.trim()) {
      return NextResponse.json(
        { success: false, message: "Category is required" },
        { status: 400 },
      );
    }

    if (type !== undefined && type !== "test" && type !== "package") {
      return NextResponse.json(
        { success: false, message: "Invalid lab test type" },
        { status: 400 },
      );
    }

    if (typeof price !== "number" || !Number.isFinite(price) || price < 0) {
      return NextResponse.json(
        { success: false, message: "Invalid price" },
        { status: 400 },
      );
    }

    if (code !== undefined && code !== null && typeof code !== "string") {
      return NextResponse.json(
        { success: false, message: "Invalid lab test code" },
        { status: 400 },
      );
    }

    if (parameters !== undefined && !Array.isArray(parameters)) {
      return NextResponse.json(
        { success: false, message: "Invalid parameters" },
        { status: 400 },
      );
    }

    if (Array.isArray(parameters)) {
      for (const parameter of parameters) {
        if (
          !parameter ||
          typeof parameter.name !== "string" ||
          !parameter.name.trim()
        ) {
          return NextResponse.json(
            {
              success: false,
              message: "Every parameter must have a name",
            },
            { status: 400 },
          );
        }
      }
    }

    await dbConnect();

    const normalizedCode =
      typeof code === "string" && code.trim()
        ? code.trim().toUpperCase()
        : undefined;

    if (normalizedCode) {
      const existingLabTest = await LabTest.findOne({
        code: normalizedCode,
      });

      if (existingLabTest) {
        return NextResponse.json(
          {
            success: false,
            message: "A lab test already uses this code",
          },
          { status: 409 },
        );
      }
    }

    const labTest = await LabTest.create({
      name: name.trim(),
      code: normalizedCode,
      description:
        typeof description === "string" ? description.trim() : undefined,
      category: category.trim(),
      type: type || "test",
      price,
      home_collection:
        typeof home_collection === "boolean" ? home_collection : true,
      sample_type:
        typeof sample_type === "string" ? sample_type.trim() : undefined,
      preparation:
        typeof preparation === "string" ? preparation.trim() : undefined,
      report_time:
        typeof report_time === "string" ? report_time.trim() : undefined,
      parameters: Array.isArray(parameters)
        ? parameters.map((parameter) => ({
            name: parameter.name.trim(),
            unit:
              typeof parameter.unit === "string"
                ? parameter.unit.trim()
                : undefined,
            reference_range:
              typeof parameter.reference_range === "string"
                ? parameter.reference_range.trim()
                : undefined,
          }))
        : [],
      is_active: typeof is_active === "boolean" ? is_active : true,
    });

    await SystemLog.create({
      actor_id: session.user.id,
      actor_role: session.user.role,
      action_type: "CREATE_LAB_TEST",
      target_id: labTest._id,
      details: {
        name: labTest.name,
        code: labTest.code,
        category: labTest.category,
        type: labTest.type,
        price: labTest.price,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Lab test created successfully",
        data: labTest,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Admin Lab Tests POST Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
