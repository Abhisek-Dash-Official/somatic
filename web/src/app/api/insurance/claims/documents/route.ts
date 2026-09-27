import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import InsuranceClaim from "@/models/InsuranceClaim";
import SystemLog from "@/models/SystemLog";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "patient") {
      return NextResponse.json(
        { error: "Only patients can add claim documents" },
        { status: 403 },
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { documents } = body;

    if (!Array.isArray(documents) || documents.length === 0) {
      return NextResponse.json(
        { error: "At least one document is required" },
        { status: 400 },
      );
    }

    for (const document of documents) {
      if (!document?.type || !document?.file_url) {
        return NextResponse.json(
          { error: "Each document must have a type and file URL" },
          { status: 400 },
        );
      }
    }

    await dbConnect();

    const claim = await InsuranceClaim.findOne({
      _id: id,
      user_id: session.user.id,
    });

    if (!claim) {
      return NextResponse.json(
        { error: "Insurance claim not found" },
        { status: 404 },
      );
    }

    if (claim.status !== "documents_required") {
      return NextResponse.json(
        { error: "Additional documents are not required for this claim" },
        { status: 400 },
      );
    }

    claim.documents.push(...documents);
    claim.status = "under_review";

    await claim.save();

    await SystemLog.create({
      actor_id: session.user.id,
      actor_role: session.user.role,
      action_type: "INSURANCE_CLAIM_DOCUMENTS_SUBMITTED",
      target_id: claim._id,
      details: {
        claim_number: claim.claim_number,
        documents_added: documents.length,
      },
    });

    return NextResponse.json({
      message: "Additional claim documents submitted successfully",
      claim: {
        _id: claim._id,
        claim_number: claim.claim_number,
        status: claim.status,
        documents: claim.documents,
      },
    });
  } catch (error) {
    console.error("Insurance claim document submission error:", error);

    return NextResponse.json(
      { error: "Failed to submit claim documents" },
      { status: 500 },
    );
  }
}
