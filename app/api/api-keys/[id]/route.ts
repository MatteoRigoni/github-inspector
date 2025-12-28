import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateKey, deleteKey } from "../store";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Ottieni la sessione dell'utente
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { name, monthlyLimit } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const updatedKey = await updateKey(id, name, monthlyLimit, session.user.id);
    
    if (!updatedKey) {
      return NextResponse.json(
        { error: "API key not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedKey);
  } catch (error) {
    console.error('Error in PUT /api/api-keys/[id]:', error);
    const errorMessage = error instanceof Error ? error.message : "Failed to update API key";
    const statusCode = errorMessage.includes("Unauthorized") ? 403 : 
                     (errorMessage.includes("Invalid") || errorMessage.includes("not found") ? 400 : 500);
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Ottieni la sessione dell'utente
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    await deleteKey(id, session.user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/api-keys/[id]:', error);
    const errorMessage = error instanceof Error ? error.message : "Failed to delete API key";
    const statusCode = errorMessage.includes("Unauthorized") ? 403 : 
                     (errorMessage.includes("not found") ? 404 : 500);
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}

