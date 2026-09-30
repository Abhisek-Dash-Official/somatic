import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import ChatConversation from "@/models/ChatConversation";
import ChatMessage from "@/models/ChatMessage";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;

    await connectDB();

    const conversation = await ChatConversation.findOne({
      _id: id,
      user_id: session.user.id,
      is_archived: false,
    }).lean();

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found." },
        { status: 404 },
      );
    }

    const messages = await ChatMessage.find({
      conversation_id: conversation._id,
      user_id: session.user.id,
    })
      .select("_id role content created_at")
      .sort({ created_at: 1 })
      .lean();

    return NextResponse.json({
      conversation,
      messages,
    });
  } catch (error) {
    console.error("SOMA conversation GET error:", error);

    return NextResponse.json(
      { error: "Failed to load conversation." },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    await connectDB();

    const update: Record<string, unknown> = {};

    if (typeof body.title === "string") {
      const title = body.title.trim();

      if (!title) {
        return NextResponse.json(
          { error: "Title is required." },
          { status: 400 },
        );
      }

      update.title = title.slice(0, 120);
    }

    if (typeof body.is_archived === "boolean") {
      update.is_archived = body.is_archived;
    }

    const conversation = await ChatConversation.findOneAndUpdate(
      {
        _id: id,
        user_id: session.user.id,
      },
      { $set: update },
      { new: true },
    ).lean();

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error("SOMA conversation PATCH error:", error);

    return NextResponse.json(
      { error: "Failed to update conversation." },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;

    await connectDB();

    const conversation = await ChatConversation.findOneAndDelete({
      _id: id,
      user_id: session.user.id,
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found." },
        { status: 404 },
      );
    }

    await ChatMessage.deleteMany({
      conversation_id: id,
      user_id: session.user.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("SOMA conversation DELETE error:", error);

    return NextResponse.json(
      { error: "Failed to delete conversation." },
      { status: 500 },
    );
  }
}
