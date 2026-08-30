import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { createSystemLog } from "@/lib/logger";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    await dbConnect();
    const user = await User.findById(session.user.id);

    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (user.is_ban || user.is_delete) {
      throw new Error("Account is disabled");
    }

    if (body.username) user.username = body.username.trim();
    if (body.contact_no) user.contact_no = body.contact_no.trim();
    if (body.address) user.address = body.address.trim();
    if (body.avatar_id) user.avatar_id = body.avatar_id;

    if (user.role === "doctor" && body.doctor_info) {
      user.doctor_info = {
        ...user.doctor_info,
        ...body.doctor_info,
      };
    }

    if (user.role === "patient" && body.patient_info) {
      user.patient_info = {
        ...user.patient_info,
        ...body.patient_info,
      };
    }

    if (body.newPassword) {
      if (!body.currentPassword) {
        return NextResponse.json(
          { error: "Current password required." },
          { status: 400 },
        );
      }
      const isMatch = await bcrypt.compare(
        body.currentPassword,
        user.password_hash,
      );
      if (!isMatch) {
        return NextResponse.json(
          { error: "Incorrect current password." },
          { status: 400 },
        );
      }
      user.password_hash = await bcrypt.hash(body.newPassword, 10);
    }

    await user.save();

    const updatedUser = await User.findById(session.user.id)
      .select("-password_hash")
      .lean();

    await createSystemLog({
      actor_id: session.user.id,
      actor_role: session.user.role,
      action_type: "UPDATE_PROFILE",
      target_id: session.user.id,
      details: {
        updated_fields: Object.keys(body),
        password_changed: !!body.newPassword,
      },
    });

    return NextResponse.json(
      { message: "Profile updated successfully", user: updatedUser },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Profile API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 },
    );
  }
}
