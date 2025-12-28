import { NextRequest, NextResponse } from "next/server";
import { updateKey, deleteKey } from "../store";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, monthlyLimit } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const updatedKey = await updateKey(id, name, monthlyLimit);
    
    if (!updatedKey) {
      return NextResponse.json(
        { error: "API key not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedKey);
  } catch (error) {
    console.error('Error in PUT /api/api-keys/[id]:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update API key" },
      { status: error instanceof Error && error.message.includes("Invalid") ? 400 : 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteKey(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/api-keys/[id]:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete API key" },
      { status: 500 }
    );
  }
}

