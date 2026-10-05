import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Cart from "@/models/Cart";
import Medicine from "@/models/Medicine";
import BloodBank from "@/models/BloodBank";
import Order from "@/models/Order";
import Transaction from "@/models/Transaction";
import SystemLog from "@/models/SystemLog";
import { createRazorpayOrder, getRazorpayKeyId } from "@/lib/payment";

type ShippingAddress = {
  street: string;
  city: string;
  state: string;
  pincode: string;
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await req.json();
    const shipping_address: ShippingAddress = body.shipping_address;

    if (
      !shipping_address?.street?.trim() ||
      !shipping_address?.city?.trim() ||
      !shipping_address?.state?.trim() ||
      !shipping_address?.pincode?.trim()
    ) {
      return NextResponse.json(
        { error: "Complete shipping address is required" },
        { status: 400 },
      );
    }

    if (!/^\d{6}$/.test(shipping_address.pincode.trim())) {
      return NextResponse.json({ error: "Invalid pincode" }, { status: 400 });
    }

    const cart = await Cart.findOne({ user_id: session.user.id }).lean();

    if (!cart || !cart.items?.length) {
      return NextResponse.json(
        { error: "Your cart is empty" },
        { status: 400 },
      );
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const cartItem of cart.items) {
      if (cartItem.item_type === "Medicine") {
        const medicine = await Medicine.findById(cartItem.item_id)
          .select("name manufacturer pricing stock is_active")
          .lean();

        if (!medicine || !medicine.is_active) {
          return NextResponse.json(
            { error: `Medicine ${cartItem.item_id} is no longer available` },
            { status: 400 },
          );
        }

        if (medicine.stock < cartItem.quantity) {
          return NextResponse.json(
            { error: `${medicine.name} does not have enough stock` },
            { status: 400 },
          );
        }

        const price =
          medicine.pricing?.sale_price ?? medicine.pricing?.mrp ?? 0;

        if (price <= 0) {
          return NextResponse.json(
            { error: `${medicine.name} does not have a valid price` },
            { status: 400 },
          );
        }

        totalAmount += price * cartItem.quantity;

        orderItems.push({
          item_type: "Medicine",
          item_id: medicine._id,
          name: medicine.name,
          manufacturer: medicine.manufacturer || "",
          quantity: cartItem.quantity,
          unit_price: price,
        });
      }

      if (cartItem.item_type === "BloodBank") {
        const bloodBank = await BloodBank.findById(cartItem.item_id)
          .select("name inventory is_active is_delivery_available")
          .lean();

        if (!bloodBank || !bloodBank.is_active) {
          return NextResponse.json(
            { error: "Blood bank is no longer available" },
            { status: 400 },
          );
        }

        if (!bloodBank.is_delivery_available) {
          return NextResponse.json(
            { error: `${bloodBank.name} does not support delivery` },
            { status: 400 },
          );
        }

        const bloodItem = bloodBank.inventory?.find(
          (inventoryItem: any) =>
            inventoryItem.blood_group === cartItem.blood_group,
        );

        if (!bloodItem) {
          return NextResponse.json(
            {
              error: `${cartItem.blood_group} blood unit is no longer available`,
            },
            { status: 400 },
          );
        }

        if (bloodItem.stock_units < cartItem.quantity) {
          return NextResponse.json(
            {
              error: `${cartItem.blood_group} blood does not have enough stock`,
            },
            { status: 400 },
          );
        }

        const price = bloodItem.price_per_unit ?? 0;

        if (price <= 0) {
          return NextResponse.json(
            { error: `Invalid price for ${cartItem.blood_group} blood` },
            { status: 400 },
          );
        }

        totalAmount += price * cartItem.quantity;

        orderItems.push({
          item_type: "BloodBank",
          item_id: bloodBank._id,
          name: bloodBank.name,
          manufacturer: "",
          blood_group: cartItem.blood_group,
          quantity: cartItem.quantity,
          unit_price: price,
        });
      }
    }

    if (!orderItems.length || totalAmount <= 0) {
      return NextResponse.json(
        { error: "Unable to calculate order total" },
        { status: 400 },
      );
    }

    const order = await Order.create({
      user_id: session.user.id,
      items: orderItems,
      total_amount: totalAmount,
      payment_method: "ONLINE",
      payment_status: "pending",
      order_status: "placed",
      shipping_address: {
        street: shipping_address.street.trim(),
        city: shipping_address.city.trim(),
        state: shipping_address.state.trim(),
        pincode: shipping_address.pincode.trim(),
      },
    });

    try {
      const transaction = await Transaction.create({
        user_id: session.user.id,
        transaction_type: "shop_order",
        reference_id: order._id,
        amount: totalAmount,
        currency: "INR",
        status: "created",
        payment_gateway: "razorpay",
        metadata: {
          order_id: order._id.toString(),
          payment_method: "ONLINE",
          payment_purpose: "shop_order_payment",
        },
      });

      const razorpayOrder = await createRazorpayOrder({
        amount: totalAmount,
        currency: "INR",
        receipt: `SHOP-${transaction._id}`,
        notes: {
          somatic_order_id: order._id.toString(),
          somatic_transaction_id: transaction._id.toString(),
          user_id: session.user.id.toString(),
          payment_purpose: "shop_order_payment",
        },
      });

      transaction.gateway_order_id = razorpayOrder.id;
      transaction.status = "pending";
      await transaction.save();

      await SystemLog.create({
        actor_id: session.user.id,
        actor_role: session.user.role,
        action_type: "SHOP_ORDER_CREATED_ONLINE",
        target_id: order._id,
        details: {
          order_id: order._id,
          transaction_id: transaction._id,
          razorpay_order_id: razorpayOrder.id,
          payment_method: "ONLINE",
          payment_status: "pending",
          order_status: "placed",
          amount: totalAmount,
          currency: "INR",
        },
      });

      return NextResponse.json(
        {
          success: true,
          order_id: order._id.toString(),
          transaction_id: transaction._id.toString(),
          razorpay_order_id: razorpayOrder.id,
          amount: Math.round(totalAmount * 100),
          currency: "INR",
          key_id: getRazorpayKeyId(),
        },
        { status: 200 },
      );
    } catch (paymentError) {
      await Transaction.deleteMany({
        reference_id: order._id,
        transaction_type: "shop_order",
      });

      await Order.deleteOne({ _id: order._id });

      throw paymentError;
    }
  } catch (error) {
    console.error("Create Payment Order Error:", error);

    return NextResponse.json(
      { error: "Unable to create payment order" },
      { status: 500 },
    );
  }
}
