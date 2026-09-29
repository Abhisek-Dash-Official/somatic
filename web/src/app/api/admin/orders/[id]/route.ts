import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Transaction from "@/models/Transaction";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "admin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await dbConnect();

    const { id } = await params;

    const order = await Order.findById(id)
      .populate("user_id", "username email contact_no")
      .lean();

    if (!order)
      return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const transaction = await Transaction.findOne({
      reference_id: order._id,
      transaction_type: "shop_order",
    })
      .select(
        "amount currency status payment_gateway gateway_order_id gateway_payment_id paid_at failed_at failure_reason created_at updated_at",
      )
      .lean();

    return NextResponse.json({ order, transaction }, { status: 200 });
  } catch (error) {
    console.error("Admin Order GET Error:", error);
    return NextResponse.json(
      { error: "Unable to fetch order" },
      { status: 500 },
    );
  }
}
