import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import LabBooking from "@/models/LabBooking";
import "@/models/User";
import "@/models/LabTest";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "dispatcher") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("payment_status");

    await dbConnect();

    const filter: Record<string, any> = {};

    if (status) {
      filter.status = status;
    }

    if (paymentStatus) {
      filter.payment_status = paymentStatus;
    }

    const bookings = await LabBooking.find(filter)
      .populate("patient_id", "username email contact_no address patient_info")
      .populate("tests.test_id", "name code category type price")
      .populate("results_entered_by", "username email")
      .sort({ created_at: -1 });

    return NextResponse.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error("Dispatcher lab bookings error:", error);

    return NextResponse.json(
      { error: "Failed to fetch lab bookings" },
      { status: 500 },
    );
  }
}
