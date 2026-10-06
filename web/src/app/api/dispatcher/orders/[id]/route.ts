import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Transaction from "@/models/Transaction";
import SystemLog from "@/models/SystemLog";
import { notifyUser } from "@/lib/notification";

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

    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!["dispatcher", "admin"].includes(session.user.role || ""))
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

    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!["dispatcher", "admin"].includes(session.user.role || ""))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await dbConnect();

    const { id } = await params;
    const body = await req.json();
    const { order_status, payment_status } = body;

    if (!order_status && !payment_status) {
      return NextResponse.json(
        { error: "Order status or payment status is required" },
        { status: 400 },
      );
    }

    const order = await Order.findById(id);

    if (!order)
      return NextResponse.json({ error: "Order not found" }, { status: 404 });

    let actionType = "";
    let logDetails: Record<string, unknown> = {};

    if (payment_status) {
      if (payment_status !== "paid") {
        return NextResponse.json(
          { error: "Only paid status can be set by dispatcher" },
          { status: 400 },
        );
      }

      if (order.payment_method !== "COD") {
        return NextResponse.json(
          { error: "Only COD orders can be marked as paid manually" },
          { status: 400 },
        );
      }

      if (order.payment_status === "paid") {
        return NextResponse.json(
          {
            message: "COD payment is already marked as paid",
            order,
          },
          { status: 200 },
        );
      }

      const transaction = await Transaction.findOne({
        reference_id: order._id,
        transaction_type: "shop_order",
      });

      if (!transaction) {
        return NextResponse.json(
          { error: "Transaction not found" },
          { status: 404 },
        );
      }

      if (transaction.payment_gateway !== "cash") {
        return NextResponse.json(
          { error: "This order is not a cash payment transaction" },
          { status: 400 },
        );
      }

      if (transaction.status === "paid") {
        order.payment_status = "paid";
        await order.save();

        actionType = "SHOP_COD_PAYMENT_MARKED_PAID";
        logDetails = {
          order_id: order._id,
          transaction_id: transaction._id,
          payment_method: "COD",
          payment_status: "paid",
          amount: transaction.amount,
          currency: transaction.currency,
          synchronized: true,
        };

        await SystemLog.create({
          actor_id: session.user.id,
          actor_role: session.user.role,
          action_type: actionType,
          target_id: order._id,
          details: logDetails,
        });

        try {
          await notifyUser({
            sender_id: session.user.id,
            recipient_id: order.user_id.toString(),
            type: "shop_payment_received",
            title: "Payment Received",
            message: `Your COD payment for order #${order._id.toString().slice(-8).toUpperCase()} has been received successfully.`,
            priority: "normal",
            action_url: `/shop/orders/${order._id}`,
            reference_id: order._id.toString(),
            reference_type: "shop_order",
          });
        } catch (notificationError) {
          console.error("COD payment notification error:", notificationError);
        }

        return NextResponse.json(
          {
            message: "COD payment synchronized successfully",
            order,
            transaction,
          },
          { status: 200 },
        );
      }

      transaction.status = "paid";
      transaction.paid_at = new Date();
      transaction.failure_reason = undefined;
      await transaction.save();

      order.payment_status = "paid";
      await order.save();

      actionType = "SHOP_COD_PAYMENT_MARKED_PAID";
      logDetails = {
        order_id: order._id,
        transaction_id: transaction._id,
        payment_method: "COD",
        payment_status: "paid",
        amount: transaction.amount,
        currency: transaction.currency,
      };

      await SystemLog.create({
        actor_id: session.user.id,
        actor_role: session.user.role,
        action_type: actionType,
        target_id: order._id,
        details: logDetails,
      });

      try {
        await notifyUser({
          sender_id: session.user.id,
          recipient_id: order.user_id.toString(),
          type: "shop_payment_received",
          title: "Payment Received",
          message: `Your COD payment for order #${order._id.toString().slice(-8).toUpperCase()} has been received successfully.`,
          priority: "normal",
          action_url: `/shop/orders/${order._id}`,
          reference_id: order._id.toString(),
          reference_type: "shop_order",
        });
      } catch (notificationError) {
        console.error("COD payment notification error:", notificationError);
      }

      return NextResponse.json(
        {
          message: "COD payment marked as paid successfully",
          order,
          transaction,
        },
        { status: 200 },
      );
    }

    if (order_status) {
      if (typeof order_status !== "string") {
        return NextResponse.json(
          { error: "Invalid order status" },
          { status: 400 },
        );
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

      const previousStatus = order.order_status;

      order.order_status = order_status;
      await order.save();

      actionType =
        order_status === "cancelled"
          ? "SHOP_ORDER_CANCELLED"
          : "SHOP_ORDER_STATUS_UPDATED";

      logDetails = {
        order_id: order._id,
        previous_status: previousStatus,
        new_status: order_status,
      };

      await SystemLog.create({
        actor_id: session.user.id,
        actor_role: session.user.role,
        action_type: actionType,
        target_id: order._id,
        details: logDetails,
      });

      const orderNumber = order._id.toString().slice(-8).toUpperCase();

      const statusNotifications: Record<
        string,
        {
          type: string;
          title: string;
          message: string;
          priority: "low" | "normal" | "high" | "urgent";
        }
      > = {
        confirmed: {
          type: "shop_order_confirmed",
          title: "Order Confirmed",
          message: `Your order #${orderNumber} has been confirmed and is being prepared.`,
          priority: "normal",
        },
        shipped: {
          type: "shop_order_shipped",
          title: "Order Shipped",
          message: `Your order #${orderNumber} has been shipped.`,
          priority: "normal",
        },
        out_for_delivery: {
          type: "shop_order_out_for_delivery",
          title: "Out for Delivery",
          message: `Your order #${orderNumber} is out for delivery.`,
          priority: "high",
        },
        delivered: {
          type: "shop_order_delivered",
          title: "Order Delivered",
          message: `Your order #${orderNumber} has been delivered successfully.`,
          priority: "normal",
        },
        cancelled: {
          type: "shop_order_cancelled",
          title: "Order Cancelled",
          message: `Your order #${orderNumber} has been cancelled.`,
          priority: "high",
        },
      };

      const notification = statusNotifications[order_status];

      if (notification) {
        try {
          await notifyUser({
            sender_id: session.user.id,
            recipient_id: order.user_id.toString(),
            type: notification.type,
            title: notification.title,
            message: notification.message,
            priority: notification.priority,
            action_url: `/shop/orders/${order._id}`,
            reference_id: order._id.toString(),
            reference_type: "shop_order",
          });
        } catch (notificationError) {
          console.error("Order status notification error:", notificationError);
        }
      }

      return NextResponse.json(
        {
          message: "Order status updated successfully",
          order,
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      { error: "No valid update requested" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Dispatcher Order PATCH Error:", error);

    return NextResponse.json(
      { error: "Unable to update order" },
      { status: 500 },
    );
  }
}
