import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAllKeys, createKey } from "./store";

export async function GET() {
  try {
    // Ottieni la sessione dell'utente
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // Filtra le API keys per utente se autenticato
    const keys = await getAllKeys(userId);
    return NextResponse.json(keys);
  } catch (error) {
    console.error('Error in GET /api/api-keys:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch API keys" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Ottieni la sessione dell'utente
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, type, monthlyLimit } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // Crea la chiave associata all'utente
    const newKey = await createKey(name, type, monthlyLimit, session.user.id);
    return NextResponse.json(newKey, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/api-keys:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create API key" },
      { status: error instanceof Error && error.message.includes("Invalid") ? 400 : 500 }
    );
  }
}

