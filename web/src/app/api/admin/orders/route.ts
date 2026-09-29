import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (session.user.role !== "admin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("payment_status");
    const limit = Math.min(
      Math.max(Number(searchParams.get("limit")) || 20, 1),
      50,
    );

    const filter: Record<string, any> = {};

    if (cursor) filter._id = { $lt: cursor };
    if (status && status !== "all") filter.order_status = status;
    if (paymentStatus && paymentStatus !== "all")
      filter.payment_status = paymentStatus;

    const orders = await Order.find(filter)
      .sort({ _id: -1 })
      .limit(limit + 1)
      .select(
        "user_id items total_amount payment_method payment_status order_status shipping_address placed_at updated_at",
      )
      .populate("user_id", "username email contact_no")
      .lean();

    const hasMore = orders.length > limit;
    const result = hasMore ? orders.slice(0, limit) : orders;
    const nextCursor = hasMore
      ? result[result.length - 1]._id.toString()
      : null;

    return NextResponse.json({
      orders: result,
      next_cursor: nextCursor,
      has_more: hasMore,
    });
  } catch (error) {
    console.error("Admin Orders GET Error:", error);
    return NextResponse.json(
      { error: "Unable to fetch orders" },
      { status: 500 },
    );
  }
}
