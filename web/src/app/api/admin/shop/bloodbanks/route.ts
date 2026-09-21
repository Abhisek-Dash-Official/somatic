import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import BloodBank from "@/models/BloodBank";
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
    const city = searchParams.get("city") || "";
    const pincode = searchParams.get("pincode") || "";
    const bloodGroup = searchParams.get("bloodGroup") || "";
    const status = searchParams.get("status");
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    await dbConnect();

    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { license_no: { $regex: search, $options: "i" } },
        { hospital_affiliation: { $regex: search, $options: "i" } },
      ];
    }

    if (city) {
      query["address.city"] = { $regex: city, $options: "i" };
    }

    if (pincode) {
      query["address.pincode"] = pincode;
    }

    if (bloodGroup) {
      query.inventory = {
        $elemMatch: {
          blood_group: bloodGroup.toUpperCase(),
        },
      };
    }

    if (status === "active") query.is_active = true;
    if (status === "inactive") query.is_active = false;

    const [bloodBanks, totalCount] = await Promise.all([
      BloodBank.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      BloodBank.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: bloodBanks,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error: any) {
    console.error("Admin BloodBanks GET Error:", error);
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

    const newBloodBank = await BloodBank.create(body);

    await SystemLog.create({
      actor_id: session.user.id,
      actor_role: session.user.role,
      action_type: "CREATE_BLOOD_BANK",
      target_id: newBloodBank._id,
      details: {
        name: newBloodBank.name,
        license_no: newBloodBank.license_no,
        city: newBloodBank.address?.city,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Blood Bank created successfully",
        data: newBloodBank,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Admin BloodBank POST Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
