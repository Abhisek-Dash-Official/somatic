import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import BloodBank from "@/models/BloodBank";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city");
    const search = searchParams.get("search");

    const query: any = { is_active: true };

    if (city) {
      query["address.city"] = { $regex: new RegExp(city, "i") };
    }

    if (search) {
      query.name = { $regex: new RegExp(search, "i") };
    }

    const bloodBanks = await BloodBank.find(query)
      .select("name address contact_no images inventory is_delivery_available")
      .lean();

    return NextResponse.json({
      success: true,
      count: bloodBanks.length,
      data: bloodBanks,
    });
  } catch (error: any) {
    console.error("Error fetching blood banks:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch blood banks" },
      { status: 500 },
    );
  }
}
