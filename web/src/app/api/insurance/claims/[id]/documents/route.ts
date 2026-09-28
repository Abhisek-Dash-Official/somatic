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

    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "patient")
      return NextResponse.json(
        { error: "Only patients can add claim documents" },
        { status: 403 },
      );

    const { id } = await params;
    const { documents } = await req.json();

    if (!Array.isArray(documents) || documents.length === 0) {
      return NextResponse.json(
        { error: "At least one document is required" },
        { status: 400 },
      );
    }

    for (const document of documents) {
      if (!document?.type?.trim() || !document?.file_url?.trim()) {
        return NextResponse.json(
          { error: "Each document must have a document type and file URL" },
          { status: 400 },
        );
      }
    }

    await dbConnect();

    const claim = await InsuranceClaim.findOne({
      _id: id,
      user_id: session.user.id,
    });

    if (!claim)
      return NextResponse.json(
        { error: "Insurance claim not found" },
        { status: 404 },
      );

    if (claim.status !== "documents_required") {
      return NextResponse.json(
        { error: "Additional documents are not required for this claim" },
        { status: 400 },
      );
    }

    const requiredDocuments = claim.required_documents || [];

    const submittedTypes = new Set([
      ...(claim.documents || []).map((document: any) => document.type),
      ...documents.map((document: any) => document.type),
    ]);

    const missingDocuments = requiredDocuments.filter(
      (type: string) => !submittedTypes.has(type),
    );

    if (missingDocuments.length > 0) {
      return NextResponse.json(
        {
          error: "Some required documents are still missing",
          missing_documents: missingDocuments,
        },
        { status: 400 },
      );
    }

    claim.documents.push(
      ...documents.map((document: any) => ({
        type: document.type,
        file_url: document.file_url.trim(),
        uploaded_at: new Date(),
      })),
    );

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
      message: "Claim documents submitted successfully",
      claim: {
        _id: claim._id,
        claim_number: claim.claim_number,
        status: claim.status,
        required_documents: claim.required_documents || [],
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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "patient")
      return NextResponse.json(
        { error: "Only patients can edit claim documents" },
        { status: 403 },
      );

    const { id } = await params;
    const { index, type, file_url } = await req.json();

    if (!Number.isInteger(index) || index < 0) {
      return NextResponse.json(
        { error: "Invalid document index" },
        { status: 400 },
      );
    }

    if (!type || !file_url?.trim()) {
      return NextResponse.json(
        { error: "Valid document type and file URL are required" },
        { status: 400 },
      );
    }

    await dbConnect();

    const claim = await InsuranceClaim.findOne({
      _id: id,
      user_id: session.user.id,
    });

    if (!claim)
      return NextResponse.json(
        { error: "Insurance claim not found" },
        { status: 404 },
      );

    if (
      claim.status !== "documents_required" &&
      claim.status !== "under_review"
    ) {
      return NextResponse.json(
        { error: "Documents cannot be edited in the current claim status" },
        { status: 400 },
      );
    }

    if (!claim.documents[index]) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 },
      );
    }

    claim.documents[index].type = type;
    claim.documents[index].file_url = file_url.trim();

    await claim.save();

    await SystemLog.create({
      actor_id: session.user.id,
      actor_role: session.user.role,
      action_type: "INSURANCE_CLAIM_DOCUMENT_UPDATED",
      target_id: claim._id,
      details: {
        claim_number: claim.claim_number,
        document_index: index,
        document_type: type,
      },
    });

    return NextResponse.json({
      message: "Document updated successfully",
      document: claim.documents[index],
    });
  } catch (error) {
    console.error("Insurance claim document update error:", error);
    return NextResponse.json(
      { error: "Failed to update document" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "patient")
      return NextResponse.json(
        { error: "Only patients can remove claim documents" },
        { status: 403 },
      );

    const { id } = await params;
    const { index } = await req.json();

    if (!Number.isInteger(index) || index < 0) {
      return NextResponse.json(
        { error: "Invalid document index" },
        { status: 400 },
      );
    }

    await dbConnect();

    const claim = await InsuranceClaim.findOne({
      _id: id,
      user_id: session.user.id,
    });

    if (!claim)
      return NextResponse.json(
        { error: "Insurance claim not found" },
        { status: 404 },
      );

    if (
      claim.status !== "documents_required" &&
      claim.status !== "under_review"
    ) {
      return NextResponse.json(
        { error: "Documents cannot be removed in the current claim status" },
        { status: 400 },
      );
    }

    const document = claim.documents[index];

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 },
      );
    }

    const removedType = document.type;

    claim.documents.splice(index, 1);

    if (
      claim.status === "under_review" &&
      claim.required_documents?.includes(removedType)
    ) {
      claim.status = "documents_required";
    }

    await claim.save();

    await SystemLog.create({
      actor_id: session.user.id,
      actor_role: session.user.role,
      action_type: "INSURANCE_CLAIM_DOCUMENT_REMOVED",
      target_id: claim._id,
      details: {
        claim_number: claim.claim_number,
        document_index: index,
        document_type: removedType,
      },
    });

    return NextResponse.json({
      message: "Document removed successfully",
      claim: {
        _id: claim._id,
        claim_number: claim.claim_number,
        status: claim.status,
        required_documents: claim.required_documents || [],
        documents: claim.documents,
      },
    });
  } catch (error) {
    console.error("Insurance claim document removal error:", error);
    return NextResponse.json(
      { error: "Failed to remove document" },
      { status: 500 },
    );
  }
}
