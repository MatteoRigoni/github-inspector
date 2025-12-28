import { NextRequest, NextResponse } from "next/server";
import { verifyApiKey } from "../../api-keys/store";

/**
 * GET /api/github/readme
 * 
 * Ottiene il README di un repository GitHub
 * 
 * Headers:
 * - X-API-Key: API key per autenticazione
 * 
 * Query params:
 * - url: URL del repository GitHub (es: https://github.com/owner/repo)
 */
export async function GET(request: NextRequest) {
  try {
    // Estrai API key dall'header
    const apiKey = request.headers.get("X-API-Key") || request.headers.get("x-api-key");
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key non fornita. Fornire X-API-Key nell'header." },
        { status: 401 }
      );
    }

    // Verifica l'API key
    const verification = await verifyApiKey(apiKey);
    
    if (!verification.valid) {
      return NextResponse.json(
        { error: "Accesso non consentito. API key non valida o esaurita." },
        { status: 403 }
      );
    }

    // Estrai URL del repository dai query params
    const { searchParams } = new URL(request.url);
    const repoUrl = searchParams.get("url");

    if (!repoUrl) {
      return NextResponse.json(
        { error: "URL del repository non fornito. Fornire il parametro 'url' nella query string." },
        { status: 400 }
      );
    }

    // Parsing dell'URL del repository GitHub
    const githubUrlPattern = /github\.com\/([^\/]+)\/([^\/]+)(?:\/.*)?$/;
    const match = repoUrl.match(githubUrlPattern);

    if (!match) {
      return NextResponse.json(
        { error: "URL del repository non valido. Deve essere un URL GitHub valido (es: https://github.com/owner/repo)" },
        { status: 400 }
      );
    }

    const owner = match[1];
    const repo = match[2].replace(/\.git$/, ""); // Rimuovi .git se presente

    // Chiama l'API di GitHub per ottenere il README
    try {
      const githubResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/readme`,
        {
          headers: {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "GitHub-Inspector/1.0",
          },
        }
      );

      if (!githubResponse.ok) {
        if (githubResponse.status === 404) {
          return NextResponse.json(
            { error: "Repository non trovato o README non disponibile" },
            { status: 404 }
          );
        }
        throw new Error(`GitHub API error: ${githubResponse.status}`);
      }

      const readmeData = await githubResponse.json();

      // Il contenuto è in base64, decodificalo
      const content = Buffer.from(readmeData.content, "base64").toString("utf-8");

      // Restituisci il contenuto del README
      return NextResponse.json({
        content: content,
        encoding: readmeData.encoding,
        name: readmeData.name,
        path: readmeData.path,
        sha: readmeData.sha,
        size: readmeData.size,
        url: readmeData.html_url,
      });
    } catch (githubError) {
      console.error("Error fetching README from GitHub:", githubError);
      return NextResponse.json(
        { error: "Errore durante il recupero del README dal repository GitHub" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in GET /api/github/readme:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Errore interno del server" },
      { status: 500 }
    );
  }
}

