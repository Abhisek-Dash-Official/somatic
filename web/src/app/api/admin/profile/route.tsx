import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import SystemLog from "@/models/SystemLog";
import bcrypt from "bcryptjs";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
        }

        await dbConnect();

        const [user, totalActions] = await Promise.all([
            User.findById(session.user.id).select("-password_hash").lean(),
            SystemLog.countDocuments({ actor_id: session.user.id })
        ]);

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (user.is_ban || user.is_delete) {
            throw new Error("Account is disabled");
        }

        return NextResponse.json({ profile: user, stats: { totalActions } });
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to fetch profile data" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
        }

        const body = await req.json();
        const { username, password, contact_no, address, avatar_id } = body;

        await dbConnect();

        if (contact_no && !/^[0-9]{10}$/.test(contact_no)) {
            return NextResponse.json({ error: "Invalid contact number format. Must be 10 digits." }, { status: 400 });
        }

        const updateFields: any = {};
        const updatedFieldsList: string[] = [];

        if (username) {
            const existingUser = await User.findOne({ username, _id: { $ne: session.user.id } });
            if (existingUser) {
                return NextResponse.json({ error: "Username is already taken." }, { status: 400 });
            }
            updateFields.username = username;
            updatedFieldsList.push("username");
        }

        if (password && password.trim() !== "") {
            if (password.length < 6) {
                return NextResponse.json({ error: "Password must be at least 6 characters long." }, { status: 400 });
            }
            const salt = await bcrypt.genSalt(10);
            updateFields.password_hash = await bcrypt.hash(password, salt);
            updatedFieldsList.push("password");
        }

        if (contact_no !== undefined) {
            updateFields.contact_no = contact_no;
            updatedFieldsList.push("contact_no");
        }
        if (address !== undefined) {
            updateFields.address = address;
            updatedFieldsList.push("address");
        }
        if (avatar_id !== undefined) {
            updateFields.avatar_id = avatar_id;
            updatedFieldsList.push("avatar_id");
        }

        if (Object.keys(updateFields).length === 0) {
            return NextResponse.json({ error: "No fields provided to update." }, { status: 400 });
        }

        const updatedUser = await User.findByIdAndUpdate(
            session.user.id,
            { $set: updateFields },
            { new: true, runValidators: true }
        ).select("-password_hash").lean();

        if (!updatedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        await SystemLog.create({
            actor_id: session.user.id,
            actor_role: session.user.role,
            action_type: "UPDATE_PROFILE",
            target_id: session.user.id,
            details: { updated_fields: updatedFieldsList },
        });

        return NextResponse.json({ message: "Profile updated successfully", profile: updatedUser });
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }
}