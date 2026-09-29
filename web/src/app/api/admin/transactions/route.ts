import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Transaction from "@/models/Transaction";
import User from "@/models/User";

const allowedTypes = [
  "insurance_premium",
  "shop_order",
  "lab_booking",
  "subscription",
];
const allowedStatuses = [
  "created",
  "pending",
  "paid",
  "failed",
  "refunded",
  "partially_refunded",
  "cancelled",
];
const allowedGateways = ["razorpay"];

const encodeCursor = (value: { created_at: string; id: string }) =>
  Buffer.from(JSON.stringify(value)).toString("base64url");

const decodeCursor = (cursor: string) => {
  try {
    return JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")) as {
      created_at: string;
      id: string;
    };
  } catch {
    return null;
  }
};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);

    const q = searchParams.get("q")?.trim() || "";
    const transactionType = searchParams.get("transaction_type") || "";
    const status = searchParams.get("status") || "";
    const gateway = searchParams.get("payment_gateway") || "";
    const from = searchParams.get("from") || "";
    const to = searchParams.get("to") || "";
    const sort = searchParams.get("sort") || "newest";
    const cursor = searchParams.get("cursor") || "";
    const limit = Math.min(
      Math.max(Number(searchParams.get("limit")) || 20, 1),
      50,
    );

    if (transactionType && !allowedTypes.includes(transactionType)) {
      return NextResponse.json(
        { error: "Invalid transaction type" },
        { status: 400 },
      );
    }

    if (status && !allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid transaction status" },
        { status: 400 },
      );
    }

    if (gateway && !allowedGateways.includes(gateway)) {
      return NextResponse.json(
        { error: "Invalid payment gateway" },
        { status: 400 },
      );
    }

    const filter: Record<string, any> = {};

    if (transactionType) filter.transaction_type = transactionType;
    if (status) filter.status = status;
    if (gateway) filter.payment_gateway = gateway;

    if (from || to) {
      filter.created_at = {};

      if (from) {
        const fromDate = new Date(`${from}T00:00:00.000Z`);
        if (Number.isNaN(fromDate.getTime())) {
          return NextResponse.json(
            { error: "Invalid from date" },
            { status: 400 },
          );
        }
        filter.created_at.$gte = fromDate;
      }

      if (to) {
        const toDate = new Date(`${to}T23:59:59.999Z`);
        if (Number.isNaN(toDate.getTime())) {
          return NextResponse.json(
            { error: "Invalid to date" },
            { status: 400 },
          );
        }
        filter.created_at.$lte = toDate;
      }
    }

    if (q) {
      const users = await User.find({
        $or: [
          { username: { $regex: q, $options: "i" } },
          { email: { $regex: q, $options: "i" } },
        ],
      })
        .select("_id")
        .limit(100)
        .lean();

      const userIds = users.map((user) => user._id);

      filter.$or = [
        ...(userIds.length ? [{ user_id: { $in: userIds } }] : []),
        { gateway_order_id: { $regex: q, $options: "i" } },
        { gateway_payment_id: { $regex: q, $options: "i" } },
        { failure_reason: { $regex: q, $options: "i" } },
      ];

      if (/^[a-f\d]{24}$/i.test(q)) {
        filter.$or.push({ _id: q });
      }

      if (!filter.$or.length) {
        return NextResponse.json({
          transactions: [],
          next_cursor: null,
          has_more: false,
        });
      }
    }

    const decodedCursor = cursor ? decodeCursor(cursor) : null;

    if (cursor && !decodedCursor) {
      return NextResponse.json({ error: "Invalid cursor" }, { status: 400 });
    }

    const sortDirection = sort === "oldest" ? 1 : -1;

    if (decodedCursor) {
      const cursorDate = new Date(decodedCursor.created_at);

      if (Number.isNaN(cursorDate.getTime())) {
        return NextResponse.json({ error: "Invalid cursor" }, { status: 400 });
      }

      filter.$or = [
        ...(filter.$or || []),
        ...(sortDirection === -1
          ? [
              {
                created_at: { $lt: cursorDate },
              },
              {
                created_at: cursorDate,
                _id: { $lt: decodedCursor.id },
              },
            ]
          : [
              {
                created_at: { $gt: cursorDate },
              },
              {
                created_at: cursorDate,
                _id: { $gt: decodedCursor.id },
              },
            ]),
      ];
    }

    const transactions = await Transaction.find(filter)
      .sort({ created_at: sortDirection, _id: sortDirection })
      .limit(limit + 1)
      .select(
        "user_id transaction_type reference_id amount currency status payment_gateway gateway_order_id gateway_payment_id paid_at failed_at failure_reason created_at updated_at",
      )
      .populate("user_id", "username email contact_no")
      .lean();

    const hasMore = transactions.length > limit;
    const results = hasMore ? transactions.slice(0, limit) : transactions;

    const last = results[results.length - 1];

    const nextCursor =
      hasMore && last
        ? encodeCursor({
            created_at: new Date(last.created_at).toISOString(),
            id: String(last._id),
          })
        : null;

    return NextResponse.json({
      transactions: results,
      next_cursor: nextCursor,
      has_more: hasMore,
    });
  } catch (error) {
    console.error("Admin transactions GET error:", error);

    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 },
    );
  }
}
