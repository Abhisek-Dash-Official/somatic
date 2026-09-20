import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import BloodBank from "@/models/BloodBank";
import mongoose from "mongoose";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);

    const city = searchParams.get("city");
    const search = searchParams.get("search");
    const bloodGroup = searchParams.get("bloodGroup");
    const limit = parseInt(searchParams.get("limit") || "8", 10);
    const lastId = searchParams.get("lastId");

    const query: any = { is_active: true };

    if (city) {
      query["address.city"] = { $regex: new RegExp(city, "i") };
    }

    if (search) {
      query.name = { $regex: new RegExp(search, "i") };
    }

    if (bloodGroup) {
      query.inventory = {
        $elemMatch: {
          blood_group: bloodGroup.toUpperCase(),
          stock_units: { $gt: 0 },
        },
      };
    }

    if (lastId && mongoose.Types.ObjectId.isValid(lastId)) {
      query._id = { ...query._id, $lt: new mongoose.Types.ObjectId(lastId) };
    }

    const bloodBanks = await BloodBank.find(query)
      .select("name address contact_no images inventory is_delivery_available")
      .sort({ _id: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      count: bloodBanks.length,
      data: bloodBanks,
      hasMore: bloodBanks.length === limit,
    });
  } catch (error: any) {
    console.error("Error fetching blood banks:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch blood banks" },
      { status: 500 },
    );
  }
}
