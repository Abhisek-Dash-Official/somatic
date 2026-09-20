import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Medicine from "@/models/Medicine";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "8", 10);

    // Cursors from frontend
    const lastId = searchParams.get("lastId");
    const lastDate = searchParams.get("lastDate");

    const query: any = { is_active: true };

    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = [
        { name: { $regex: escapedSearch, $options: "i" } },
        { brand: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    if (category) {
      query.category = category.toLowerCase();
    }

    // Cursor condition: fetch items older than the last fetched item
    if (lastId && lastDate) {
      query.$or = [
        { created_at: { $lt: new Date(lastDate) } },
        {
          created_at: new Date(lastDate),
          _id: { $lt: lastId },
        },
      ];
    }

    const medicines = await Medicine.find(query)
      .sort({ created_at: -1, _id: -1 })
      .limit(limit) // No .skip() needed! Super fast even for 1M+ rows
      .lean();

    return NextResponse.json(
      {
        success: true,
        count: medicines.length,
        data: medicines,
        hasMore: medicines.length === limit,
      },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
