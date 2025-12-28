import { NextRequest, NextResponse } from "next/server";
import { verifyApiKey, incrementApiKeyUsage } from "../../api-keys/store";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";

// Define the output schema using JSON Schema (native LangChain approach)
const outputSchema = {
  type: "object",
  properties: {
    summary: {
      type: "string",
      description: "A comprehensive summary of the GitHub repository based on the README content"
    },
    "cool-facts": {
      type: "array",
      items: {
        type: "string"
      },
      description: "A list of interesting or noteworthy facts about the repository"
    }
  },
  required: ["summary", "cool-facts"],
  additionalProperties: false
};

/**
 * GET /api/github/summarize
 * 
 * Summarizes a GitHub repository based on its README content
 * 
 * Headers:
 * - X-API-Key: API key for authentication
 * 
 * Query params:
 * - readmeContent: The content of the README file to summarize
 */
export async function GET(request: NextRequest) {
  try {
    // Extract API key from header
    const apiKey = request.headers.get("X-API-Key") || request.headers.get("x-api-key");
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key non fornita. Fornire X-API-Key nell'header." },
        { status: 401 }
      );
    }

    // Verify the API key
    const verification = await verifyApiKey(apiKey);
    
    if (!verification.valid) {
      return NextResponse.json(
        { error: "Accesso non consentito. API key non valida o esaurita." },
        { status: 403 }
      );
    }

    // Extract readmeContent from query params
    const { searchParams } = new URL(request.url);
    const readmeContent = searchParams.get("readmeContent");

    if (!readmeContent) {
      return NextResponse.json(
        { error: "readmeContent non fornito. Fornire il parametro 'readmeContent' nella query string." },
        { status: 400 }
      );
    }

    // Check for OpenAI API key
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY non configurata. Configurare la variabile d'ambiente OPENAI_API_KEY." },
        { status: 500 }
      );
    }

    // Initialize the OpenAI model with structured output
    const model = new ChatOpenAI({
      modelName: "gpt-4o-mini",
      temperature: 0,
      openAIApiKey: openaiApiKey,
    }).withStructuredOutput(outputSchema);

    // Create the prompt template
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "You are an expert at analyzing GitHub repositories. Your task is to summarize repositories based on their README content."],
      ["human", `Summarize this github repository from *.md main content.

{readmeContent}`]
    ]);

    // Create the chain
    const chain = prompt.pipe(model);

    // Invoke the chain with the readme content
    const result = await chain.invoke({
      readmeContent: readmeContent,
    });

    // Increment API key usage after successful summarization
    // Don't block the response if increment fails
    incrementApiKeyUsage(apiKey).catch((err) => {
      console.error("Failed to increment API key usage:", err);
    });

    // Return the structured result
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in GET /api/github/summarize:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Errore interno del server" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/github/summarize
 * 
 * Summarizes a GitHub repository based on its README content
 * 
 * Headers:
 * - X-API-Key: API key for authentication
 * 
 * Body:
 * - readmeContent: The content of the README file to summarize (string)
 */
export async function POST(request: NextRequest) {
  try {
    // Extract API key from header
    const apiKey = request.headers.get("X-API-Key") || request.headers.get("x-api-key");
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key non fornita. Fornire X-API-Key nell'header." },
        { status: 401 }
      );
    }

    // Verify the API key
    const verification = await verifyApiKey(apiKey);
    
    if (!verification.valid) {
      return NextResponse.json(
        { error: "Accesso non consentito. API key non valida o esaurita." },
        { status: 403 }
      );
    }

    // Extract readmeContent from request body
    const body = await request.json();
    const readmeContent = body.readmeContent;

    if (!readmeContent || typeof readmeContent !== "string") {
      return NextResponse.json(
        { error: "readmeContent non fornito o non valido. Fornire 'readmeContent' come stringa nel body della richiesta." },
        { status: 400 }
      );
    }

    // Check for OpenAI API key
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY non configurata. Configurare la variabile d'ambiente OPENAI_API_KEY." },
        { status: 500 }
      );
    }

    // Initialize the OpenAI model with structured output
    const model = new ChatOpenAI({
      modelName: "gpt-4o-mini",
      temperature: 0,
      openAIApiKey: openaiApiKey,
    }).withStructuredOutput(outputSchema);

    // Create the prompt template
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "You are an expert at analyzing GitHub repositories. Your task is to summarize repositories based on their README content."],
      ["human", `Summarize this github repository from *.md main content.

{readmeContent}`]
    ]);

    // Create the chain
    const chain = prompt.pipe(model);

    // Invoke the chain with the readme content
    const result = await chain.invoke({
      readmeContent: readmeContent,
    });

    // Increment API key usage after successful summarization
    // Don't block the response if increment fails
    incrementApiKeyUsage(apiKey).catch((err) => {
      console.error("Failed to increment API key usage:", err);
    });

    // Return the structured result
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in POST /api/github/summarize:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Errore interno del server" },
      { status: 500 }
    );
  }
}

