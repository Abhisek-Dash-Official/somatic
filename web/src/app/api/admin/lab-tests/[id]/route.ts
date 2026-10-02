import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import LabTest from "@/models/LabTest";
import SystemLog from "@/models/SystemLog";
import mongoose from "mongoose";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(req: Request, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid lab test ID",
        },
        { status: 400 },
      );
    }

    await dbConnect();

    const labTest = await LabTest.findById(id).lean();

    if (!labTest) {
      return NextResponse.json(
        {
          success: false,
          message: "Lab test not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: labTest,
    });
  } catch (error: any) {
    console.error("Admin Lab Test GET Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid lab test ID",
        },
        { status: 400 },
      );
    }

    const body = await req.json();

    await dbConnect();

    const existingLabTest = await LabTest.findById(id);

    if (!existingLabTest) {
      return NextResponse.json(
        {
          success: false,
          message: "Lab test not found",
        },
        { status: 404 },
      );
    }

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

    if (name !== undefined && (typeof name !== "string" || !name.trim())) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid lab test name",
        },
        { status: 400 },
      );
    }

    if (
      category !== undefined &&
      (typeof category !== "string" || !category.trim())
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid category",
        },
        { status: 400 },
      );
    }

    if (type !== undefined && type !== "test" && type !== "package") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid lab test type",
        },
        { status: 400 },
      );
    }

    if (
      price !== undefined &&
      (typeof price !== "number" || !Number.isFinite(price) || price < 0)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid price",
        },
        { status: 400 },
      );
    }

    if (code !== undefined && code !== null && typeof code !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid lab test code",
        },
        { status: 400 },
      );
    }

    if (parameters !== undefined && !Array.isArray(parameters)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid parameters",
        },
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

    let normalizedCode: string | undefined;

    if (typeof code === "string" && code.trim()) {
      normalizedCode = code.trim().toUpperCase();
    }

    if (normalizedCode && normalizedCode !== existingLabTest.code) {
      const duplicateLabTest = await LabTest.findOne({
        code: normalizedCode,
        _id: { $ne: id },
      });

      if (duplicateLabTest) {
        return NextResponse.json(
          {
            success: false,
            message: "Another lab test already uses this code",
          },
          { status: 409 },
        );
      }
    }

    const oldData = {
      name: existingLabTest.name,
      code: existingLabTest.code,
      category: existingLabTest.category,
      type: existingLabTest.type,
      price: existingLabTest.price,
      home_collection: existingLabTest.home_collection,
      is_active: existingLabTest.is_active,
    };

    if (name !== undefined) {
      existingLabTest.name = name.trim();
    }

    if (code !== undefined) {
      existingLabTest.code = normalizedCode;
    }

    if (description !== undefined) {
      existingLabTest.description =
        typeof description === "string" ? description.trim() : undefined;
    }

    if (category !== undefined) {
      existingLabTest.category = category.trim();
    }

    if (type !== undefined) {
      existingLabTest.type = type;
    }

    if (price !== undefined) {
      existingLabTest.price = price;
    }

    if (typeof home_collection === "boolean") {
      existingLabTest.home_collection = home_collection;
    }

    if (sample_type !== undefined) {
      existingLabTest.sample_type =
        typeof sample_type === "string" ? sample_type.trim() : undefined;
    }

    if (preparation !== undefined) {
      existingLabTest.preparation =
        typeof preparation === "string" ? preparation.trim() : undefined;
    }

    if (report_time !== undefined) {
      existingLabTest.report_time =
        typeof report_time === "string" ? report_time.trim() : undefined;
    }

    if (Array.isArray(parameters)) {
      existingLabTest.parameters = parameters.map((parameter) => ({
        name: parameter.name.trim(),
        unit:
          typeof parameter.unit === "string"
            ? parameter.unit.trim()
            : undefined,
        reference_range:
          typeof parameter.reference_range === "string"
            ? parameter.reference_range.trim()
            : undefined,
      }));
    }

    if (typeof is_active === "boolean") {
      existingLabTest.is_active = is_active;
    }

    await existingLabTest.save();

    await SystemLog.create({
      actor_id: session.user.id,
      actor_role: session.user.role,
      action_type: "UPDATE_LAB_TEST",
      target_id: existingLabTest._id,
      details: {
        before: oldData,
        after: {
          name: existingLabTest.name,
          code: existingLabTest.code,
          category: existingLabTest.category,
          type: existingLabTest.type,
          price: existingLabTest.price,
          home_collection: existingLabTest.home_collection,
          is_active: existingLabTest.is_active,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Lab test updated successfully",
      data: existingLabTest,
    });
  } catch (error: any) {
    console.error("Admin Lab Test PUT Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
