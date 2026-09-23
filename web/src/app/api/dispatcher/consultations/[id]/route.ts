import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Consultation from "@/models/Consultation";

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(req: Request, { params }: Props) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "dispatcher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    await dbConnect();

    const consultation = await Consultation.findById(id)
      .populate("patient_id", "username email contact_no address patient_info")
      .populate("assigned_department_id", "name")
      .populate(
        "claimed_by_doctor_id",
        "username email contact_no address doctor_info",
      )
      .lean();

    if (!consultation) {
      return NextResponse.json(
        { error: "Consultation not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ consultation }, { status: 200 });
  } catch (error) {
    console.error("Dispatcher consultation detail error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
