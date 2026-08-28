import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Department from "@/models/Department";
import User from "@/models/User";
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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    await dbConnect();
    User;

    const [departments, total] = await Promise.all([
      Department.find()
        .populate("head_doctor_id", "username email")
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Department.countDocuments(),
    ]);

    return NextResponse.json({
      success: true,
      departments,
      pagination: { total, page, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    console.error("Departments GET Error:", error);
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
    const { name, desc, head_doctor_id, is_active } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Department name is required" },
        { status: 400 },
      );
    }

    await dbConnect();

    const existing = await Department.findOne({ name: name.trim() });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Department already exists" },
        { status: 400 },
      );
    }

    const department = await Department.create({
      name: name.trim(),
      desc: desc?.trim(),
      head_doctor_id: head_doctor_id || undefined,
      is_active: is_active ?? true,
    });

    await SystemLog.create({
      actor_id: session.user.id,
      actor_role: session.user.role,
      action_type: "CREATE_DEPARTMENT",
      target_id: department._id,
      details: { name: department.name },
    });

    return NextResponse.json({
      success: true,
      message: "Department created successfully",
      department,
    });
  } catch (error: any) {
    console.error("Departments POST Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { id, name, desc, head_doctor_id, is_active } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Department ID is required" },
        { status: 400 },
      );
    }

    await dbConnect();

    const department = await Department.findById(id);
    if (!department) {
      return NextResponse.json(
        { success: false, message: "Department not found" },
        { status: 404 },
      );
    }

    const updatedFields: string[] = [];
    if (name && department.name !== name.trim()) {
      department.name = name.trim();
      updatedFields.push("name");
    }
    if (desc !== undefined && department.desc !== desc) {
      department.desc = desc;
      updatedFields.push("desc");
    }
    if (
      head_doctor_id !== undefined &&
      String(department.head_doctor_id) !== String(head_doctor_id)
    ) {
      department.head_doctor_id = head_doctor_id || null;
      updatedFields.push("head_doctor_id");
    }
    if (is_active !== undefined && department.is_active !== is_active) {
      department.is_active = is_active;
      updatedFields.push("is_active");
    }

    await department.save();

    if (updatedFields.length > 0) {
      await SystemLog.create({
        actor_id: session.user.id,
        actor_role: session.user.role,
        action_type: "UPDATE_DEPARTMENT",
        target_id: department._id,
        details: { updated_fields: updatedFields },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Department updated successfully",
      department,
    });
  } catch (error: any) {
    console.error("Departments PUT Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
