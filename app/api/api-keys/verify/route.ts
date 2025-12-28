import { NextRequest, NextResponse } from "next/server";
import { verifyApiKey } from "../store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key } = body;

    if (!key || typeof key !== "string") {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 }
      );
    }

    const result = await verifyApiKey(key);
    
    return NextResponse.json(result, { status: result.valid ? 200 : 400 });
  } catch (error) {
    console.error('Error in POST /api/api-keys/verify:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to verify API key" },
      { status: 500 }
    );
  }
}

