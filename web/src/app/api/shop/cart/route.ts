import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Cart from "@/models/Cart";
import Medicine from "@/models/Medicine";
import BloodBank from "@/models/BloodBank";

async function calculateTotalAmount(items: any[]): Promise<number> {
  let total = 0;
  for (const item of items) {
    if (item.item_type === "Medicine") {
      const medicine = await Medicine.findById(item.item_id).select(
        "pricing.price pricing.mrp",
      );
      if (medicine) {
        const price = medicine.pricing?.price ?? medicine.pricing?.mrp ?? 0;
        total += price * item.quantity;
      }
    } else if (item.item_type === "BloodBank") {
      const bloodBank = await BloodBank.findById(item.item_id).select(
        "inventory",
      );
      const bloodItem = bloodBank?.inventory?.find(
        (inv: any) => inv.blood_group === item.blood_group,
      );
      if (bloodItem?.price_per_unit) {
        total += bloodItem.price_per_unit * item.quantity;
      }
    }
  }
  return total;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const cart = await Cart.findOne({ user_id: session.user.id })
      .populate({
        path: "items.item_id",
        select:
          "name manufacturer pricing hospital_affiliation address inventory images",
      })
      .lean();

    if (!cart) {
      return NextResponse.json({ items: [], total_amount: 0 }, { status: 200 });
    }

    return NextResponse.json(cart, { status: 200 });
  } catch (error: any) {
    console.error("Cart GET Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await req.json();
    const { item_type, item_id, blood_group, quantity } = body;

    if (!item_type || !item_id || !quantity) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    let cart = await Cart.findOne({ user_id: session.user.id });

    if (!cart) {
      cart = new Cart({
        user_id: session.user.id,
        items: [{ item_type, item_id, blood_group, quantity }],
        total_amount: 0,
      });
    } else {
      const existingItemIndex = cart.items.findIndex(
        (item: any) =>
          item.item_id.toString() === item_id &&
          item.blood_group === blood_group,
      );

      if (existingItemIndex > -1) {
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        cart.items.push({ item_type, item_id, blood_group, quantity });
      }
    }

    cart.total_amount = await calculateTotalAmount(cart.items);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: "items.item_id",
        select:
          "name manufacturer pricing hospital_affiliation address inventory images",
      })
      .lean();

    return NextResponse.json(populatedCart, { status: 200 });
  } catch (error: any) {
    console.error("Cart POST Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await req.json();
    const { item_id, blood_group, action, quantity } = body;

    if (!item_id) {
      return NextResponse.json(
        { error: "Missing item_id field" },
        { status: 400 },
      );
    }

    const cart = await Cart.findOne({ user_id: session.user.id });
    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    const itemIndex = cart.items.findIndex(
      (item: any) =>
        item.item_id.toString() === item_id && item.blood_group === blood_group,
    );

    if (itemIndex > -1) {
      if (
        action === "remove" ||
        (typeof quantity === "number" && quantity <= 0)
      ) {
        cart.items.splice(itemIndex, 1);
      } else if (typeof quantity === "number") {
        cart.items[itemIndex].quantity = quantity;
      } else if (action === "increase") {
        cart.items[itemIndex].quantity += 1;
      } else if (action === "decrease") {
        cart.items[itemIndex].quantity -= 1;
        if (cart.items[itemIndex].quantity <= 0) {
          cart.items.splice(itemIndex, 1);
        }
      }

      cart.total_amount = await calculateTotalAmount(cart.items);
      await cart.save();

      const updatedCart = await Cart.findById(cart._id)
        .populate({
          path: "items.item_id",
          select:
            "name manufacturer pricing hospital_affiliation address inventory images",
        })
        .lean();

      return NextResponse.json(updatedCart, { status: 200 });
    }

    return NextResponse.json(
      { error: "Item not found in cart" },
      { status: 404 },
    );
  } catch (error: any) {
    console.error("Cart PATCH Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 },
    );
  }
}
