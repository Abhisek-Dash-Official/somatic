import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
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
    const departmentId = searchParams.get("departmentId");

    await dbConnect();

    const [departmentDoctors, unassignedDoctors] = await Promise.all([
      User.find({ role: "doctor", "doctor_info.department_id": departmentId })
        .select("username email doctor_info contact_no avatar_id")
        .lean(),
      User.find({
        role: "doctor",
        $or: [
          { "doctor_info.department_id": { $exists: false } },
          { "doctor_info.department_id": null },
        ],
      })
        .select("username email doctor_info")
        .lean(),
    ]);

    return NextResponse.json({
      success: true,
      departmentDoctors,
      unassignedDoctors,
    });
  } catch (error: any) {
    console.error("Dept Doctors GET Error:", error);
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

    const { doctorId, departmentId, action } = await req.json(); // action: "ASSIGN" | "REMOVE"
    if (!doctorId || !action) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    await dbConnect();

    const doctor = await User.findOne({ _id: doctorId, role: "doctor" });
    if (!doctor) {
      return NextResponse.json(
        { success: false, message: "Doctor not found" },
        { status: 404 },
      );
    }

    if (action === "ASSIGN") {
      if (!departmentId)
        return NextResponse.json(
          { success: false, message: "Department ID required" },
          { status: 400 },
        );
      doctor.doctor_info.department_id = departmentId;
    } else if (action === "REMOVE") {
      doctor.doctor_info.department_id = undefined;
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid action" },
        { status: 400 },
      );
    }

    await doctor.save();

    await SystemLog.create({
      actor_id: session.user.id,
      actor_role: session.user.role,
      action_type:
        action === "ASSIGN"
          ? "ASSIGN_DOCTOR_DEPARTMENT"
          : "REMOVE_DOCTOR_DEPARTMENT",
      target_id: doctor._id,
      details: {
        department_id: departmentId || null,
        doctor_username: doctor.username,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Doctor successfully ${action === "ASSIGN" ? "assigned to" : "removed from"} department`,
    });
  } catch (error: any) {
    console.error("Dept Doctors PATCH Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
