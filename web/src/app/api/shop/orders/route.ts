import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();

    const orders = await Order.find({ user_id: session.user.id })
      .sort({ placed_at: -1 })
      .select(
        "items total_amount payment_method payment_status order_status shipping_address placed_at updated_at",
      )
      .lean();

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    console.error("Orders GET Error:", error);
    return NextResponse.json(
      { error: "Unable to fetch orders" },
      { status: 500 },
    );
  }
}
