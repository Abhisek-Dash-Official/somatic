import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Department from "@/models/Department";
import SystemLog from "@/models/SystemLog";
import bcrypt from "bcryptjs";

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
    const role = searchParams.get("role") || "patient"; // patient, doctor, admin
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all"; // all, active, banned, deleted
    const sortBy = searchParams.get("sortBy") || "created_at"; // created_at, username, experience
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;
    const bloodGroup = searchParams.get("bloodGroup") || "";
    const departmentId = searchParams.get("departmentId") || "";
    const acceptingCases = searchParams.get("acceptingCases");

    await dbConnect();
    Department;

    const query: any = { role };

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (status === "active") {
      query.is_ban = false;
      query.is_delete = false;
    } else if (status === "banned") {
      query.is_ban = true;
    } else if (status === "deleted") {
      query.is_delete = true;
    }

    if (role === "patient" && bloodGroup) {
      query["patient_info.blood_grp"] = bloodGroup;
    }

    if (role === "doctor") {
      if (departmentId) {
        query["doctor_info.department_id"] = departmentId;
      }
      if (
        acceptingCases !== null &&
        acceptingCases !== undefined &&
        acceptingCases !== ""
      ) {
        query["doctor_info.is_accepting_cases"] = acceptingCases === "true";
      }
    }

    const sortOptions: any = {};
    if (sortBy === "experience" && role === "doctor") {
      sortOptions["doctor_info.experience"] = sortOrder;
    } else {
      sortOptions[sortBy] = sortOrder;
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(query)
        .select("-password_hash")
        .populate("doctor_info.department_id", "name")
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      users,
      pagination: { total, page, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    console.error("Admin Users GET Error:", error);
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
    const {
      username,
      email,
      password,
      role,
      contact_no,
      address,
      avatar_id,
      doctor_info,
      patient_info,
    } = body;

    if (!username || !email || !password || !role) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    await dbConnect();

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Email or username already exists" },
        { status: 400 },
      );
    }

    const password_hash = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password_hash,
      role,
      contact_no,
      address,
      avatar_id: avatar_id || "1",
      doctor_info: role === "doctor" ? doctor_info : undefined,
      patient_info: role === "patient" ? patient_info : undefined,
    });

    await SystemLog.create({
      actor_id: session.user.id,
      actor_role: session.user.role,
      action_type: "CREATE_USER_BY_ADMIN",
      target_id: newUser._id,
      details: { username: newUser.username, role: newUser.role },
    });

    return NextResponse.json({
      success: true,
      message: "User created successfully",
    });
  } catch (error: any) {
    console.error("Admin Users POST Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { userId, action, value } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    if (userId === session.user.id) {
      return NextResponse.json(
        { success: false, message: "Action forbidden on your own account" },
        { status: 400 },
      );
    }

    await dbConnect();
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    let logAction = "";
    const details: any = {};

    if (action === "ROLE") {
      if (!["admin", "doctor", "patient"].includes(value)) {
        return NextResponse.json(
          { success: false, message: "Invalid role" },
          { status: 400 },
        );
      }
      details.old_role = user.role;
      user.role = value;
      details.new_role = value;
      logAction = "UPDATE_USER_ROLE";
    } else if (action === "BAN") {
      user.is_ban = !!value;
      details.is_ban = user.is_ban;
      logAction = user.is_ban ? "BAN_USER" : "UNBAN_USER";
    } else if (action === "DELETE") {
      user.is_delete = !!value;
      details.is_delete = user.is_delete;
      logAction = user.is_delete ? "DELETE_USER" : "RESTORE_USER";
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid action type" },
        { status: 400 },
      );
    }

    await user.save();

    await SystemLog.create({
      actor_id: session.user.id,
      actor_role: session.user.role,
      action_type: logAction,
      target_id: user._id,
      details,
    });

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
    });
  } catch (error: any) {
    console.error("Admin Users PATCH Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
