import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Transaction from "@/models/Transaction";

const statusTransitions: Record<string, string[]> = {
  placed: ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: ["out_for_delivery", "cancelled"],
  out_for_delivery: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["dispatcher", "admin"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();

    const { id } = await params;

    const order = await Order.findById(id)
      .populate("user_id", "username email contact_no")
      .lean();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const transaction = await Transaction.findOne({
      reference_id: order._id,
      transaction_type: "shop_order",
    })
      .select(
        "amount currency status payment_gateway gateway_order_id gateway_payment_id paid_at failed_at failure_reason created_at",
      )
      .lean();

    return NextResponse.json({ order, transaction }, { status: 200 });
  } catch (error) {
    console.error("Dispatcher Order GET Error:", error);
    return NextResponse.json(
      { error: "Unable to fetch order" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["dispatcher", "admin"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();

    const { id } = await params;
    const body = await req.json();
    const { order_status } = body;

    if (!order_status || typeof order_status !== "string") {
      return NextResponse.json(
        { error: "Order status is required" },
        { status: 400 },
      );
    }

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const allowedStatuses = statusTransitions[order.order_status] || [];

    if (!allowedStatuses.includes(order_status)) {
      return NextResponse.json(
        {
          error: `Cannot change order status from ${order.order_status} to ${order_status}`,
        },
        { status: 400 },
      );
    }

    order.order_status = order_status;
    await order.save();

    return NextResponse.json(
      {
        message: "Order status updated successfully",
        order,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Dispatcher Order PATCH Error:", error);
    return NextResponse.json(
      { error: "Unable to update order status" },
      { status: 500 },
    );
  }
}
