import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserById } from "@/lib/users";

export async function GET(request: NextRequest) {
  try {
    // Ottieni la sessione dell'utente
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Recupera i dati dell'utente da Supabase
    const user = await getUserById(session.user.id);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error in GET /api/users/me:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch user data",
      },
      { status: 500 }
    );
  }
}

