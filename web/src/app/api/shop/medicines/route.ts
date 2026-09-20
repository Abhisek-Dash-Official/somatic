import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Medicine from "@/models/Medicine";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const skip = (page - 1) * limit;

    const query: any = { is_active: true };

    if (search) {
      query.$text = { $search: search };
    }

    if (category) {
      query.category = category.toLowerCase();
    }

    const medicines = await Medicine.find(query)
      .sort(search ? { score: { $meta: "textScore" } } : { created_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Medicine.countDocuments(query);

    return NextResponse.json(
      { success: true, count: medicines.length, total, data: medicines },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
