import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const {
      username,
      email,
      password,
      role,
      contact_no,
      address,
      doctor_info,
      patient_info,
    } = body;

    if (!username || !email || !password || !role) {
      return NextResponse.json(
        { error: "Missing required fields (username, email, password, role)" },
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
      role,
      contact_no,
      address,
      doctor_info: role === "doctor" ? doctor_info : undefined,
      patient_info: role === "patient" ? patient_info : undefined,
    });

    return NextResponse.json(
      { message: "User registered successfully!", userId: newUser._id },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 },
    );
  }
}
