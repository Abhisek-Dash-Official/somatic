import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Medicine from "@/models/Medicine";
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
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const requiresPrescription = searchParams.get("requires_prescription");
    const status = searchParams.get("status");
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    await dbConnect();

    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      query.category = category.toLowerCase();
    }

    if (requiresPrescription !== null && requiresPrescription !== undefined) {
      if (requiresPrescription === "true") query.requires_prescription = true;
      if (requiresPrescription === "false") query.requires_prescription = false;
    }

    if (status === "active") query.is_active = true;
    if (status === "inactive") query.is_active = false;

    const [medicines, totalCount] = await Promise.all([
      Medicine.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      Medicine.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: medicines,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error: any) {
    console.error("Admin Medicines GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
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
    await dbConnect();

    const newMedicine = await Medicine.create(body);

    await SystemLog.create({
      actor_id: session.user.id,
      actor_role: session.user.role,
      action_type: "CREATE_MEDICINE",
      target_id: newMedicine._id,
      details: {
        name: newMedicine.name,
        brand: newMedicine.brand,
        sku: newMedicine.sku,
        category: newMedicine.category,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Medicine created successfully",
        data: newMedicine,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Admin Medicine POST Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
