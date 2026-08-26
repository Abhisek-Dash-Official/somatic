import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import SystemSetting from "@/models/SystemSetting";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const settings = await SystemSetting.findOne().lean();

    if (settings && settings.allow_new_signups === false) {
      return NextResponse.json(
        { error: "New signups are currently disabled." },

        { status: 403 },
      );
    }

    const body = await req.json();

    const { username, email, password, contact_no, address, patient_info } =
      body;

    if (!username || !email || !password || !contact_no) {
      return NextResponse.json(
        { error: "Missing required core fields" },
        { status: 400 },
      );
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email or username already exists" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password_hash: hashedPassword,
      role: "patient",
      contact_no,
      address,
      patient_info,
    });

    return NextResponse.json(
      { message: "Patient registered successfully!", userId: newUser._id },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 },
    );
  }
}
