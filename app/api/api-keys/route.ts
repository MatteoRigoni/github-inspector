import { NextRequest, NextResponse } from "next/server";
import { getAllKeys, createKey } from "./store";

export async function GET() {
  try {
    const keys = await getAllKeys();
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
    const body = await request.json();
    const { name, type, monthlyLimit } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const newKey = await createKey(name, type, monthlyLimit);
    return NextResponse.json(newKey, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/api-keys:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create API key" },
      { status: error instanceof Error && error.message.includes("Invalid") ? 400 : 500 }
    );
  }
}

