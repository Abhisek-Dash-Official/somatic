import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import ChatConversation from "@/models/ChatConversation";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await connectDB();

    const conversations = await ChatConversation.find({
      user_id: session.user.id,
      is_archived: false,
    })
      .select("_id title summary last_message_at created_at")
      .sort({ last_message_at: -1 })
      .lean();

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("SOMA conversations GET error:", error);

    return NextResponse.json(
      { error: "Failed to load conversations." },
      { status: 500 },
    );
  }
}
