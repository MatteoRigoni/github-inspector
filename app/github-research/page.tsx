"use client";

import { useState } from "react";
import AppLayout from "../components/AppLayout";
import { useToast } from "../components/ToastProvider";

interface SummarizeResponse {
  summary: string;
  "cool-facts": string[];
}

export default function GitHubResearchPage() {
  const [apiKey, setApiKey] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [summary, setSummary] = useState<SummarizeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { showError } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      showError("Inserisci un API key");
      return;
    }

    if (!repoUrl.trim()) {
      showError("Inserisci l'URL del repository GitHub");
      return;
    }

    try {
      setLoading(true);
      setLoadingSummary(true);
      setError(null);
      setResponse(null);
      setSummary(null);

      // First, fetch the README
      const apiUrl = `/api/github/readme?url=${encodeURIComponent(repoUrl)}`;
      const apiResponse = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "X-API-Key": apiKey,
        },
      });

      const data = await apiResponse.json();

      if (!apiResponse.ok) {
        setError(data.error || "Errore durante la richiesta");
        setResponse(data);
        setLoadingSummary(false);
      } else {
        setResponse(data);
        
        // If we successfully got the README, now summarize it
        if (data.content) {
          try {
            const summarizeUrl = `/api/github/summarize`;
            const summarizeResponse = await fetch(summarizeUrl, {
              method: "POST",
              headers: {
                "X-API-Key": apiKey,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                readmeContent: data.content,
              }),
            });

            const summarizeData = await summarizeResponse.json();

            if (!summarizeResponse.ok) {
              console.error("Error summarizing:", summarizeData.error);
              // Don't fail the whole request if summarization fails
            } else {
              setSummary(summarizeData);
            }
          } catch (summarizeErr) {
            console.error("Error calling summarize API:", summarizeErr);
            // Don't fail the whole request if summarization fails
          }
        }
        setLoadingSummary(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Errore durante la richiesta";
      setError(errorMessage);
      showError(errorMessage, 5000);
      setLoadingSummary(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-zinc-50 dark:bg-black">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">
              GitHub Inspector
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            AI-powered repository analysis: automatically generates intelligent summaries and extracts key insights from GitHub README files.
            </p>
          </div>

          {/* Business Level Explanation */}

          <div className="space-y-6">
            {/* Form */}
            <div className="bg-white dark:bg-black rounded-lg border border-black/[.08] dark:border-white/[.145] p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="apiKey"
                    className="block text-sm font-medium text-black dark:text-zinc-50 mb-2"
                  >
                    API Key
                  </label>
                  <input
                    id="apiKey"
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Insert the string API key"
                    className="w-full px-4 py-3 border border-black/[.08] dark:border-white/[.145] rounded-lg bg-white dark:bg-black text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label
                    htmlFor="repoUrl"
                    className="block text-sm font-medium text-black dark:text-zinc-50 mb-2"
                  >
                    Repository GitHub URL
                  </label>
                  <input
                    id="repoUrl"
                    type="text"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/owner/repo"
                    className="w-full px-4 py-3 border border-black/[.08] dark:border-white/[.145] rounded-lg bg-white dark:bg-black text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loading}
                  />
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                    Esempio: https://github.com/vercel/next.js
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || !apiKey.trim() || !repoUrl.trim()}
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                >
                  {loading ? "Analyzing..." : "Inspect Repository"}
                </button>
              </form>
            </div>

            {/* Summary Section */}
            {(summary || loadingSummary) && (
              <div className="bg-white dark:bg-black rounded-lg border border-black/[.08] dark:border-white/[.145] p-8">
                {loadingSummary ? (
                  <div className="flex items-center justify-center gap-3 py-8 text-zinc-600 dark:text-zinc-400">
                    <svg
                      className="animate-spin h-5 w-5 text-blue-600 dark:text-blue-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Generating inspection...</span>
                  </div>
                ) : summary ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-black dark:text-zinc-50 mb-3">
                        Summary
                      </h3>
                      <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed bg-zinc-50 dark:bg-zinc-950 rounded-lg p-4 border border-black/[.08] dark:border-white/[.145]">
                        {summary.summary}
                      </p>
                    </div>
                    {summary["cool-facts"] && summary["cool-facts"].length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium text-black dark:text-zinc-50 mb-3">
                          Cool Facts
                        </h3>
                        <ul className="space-y-2">
                          {summary["cool-facts"].map((fact, index) => (
                            <li
                              key={index}
                              className="flex items-start gap-3 text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-950 rounded-lg p-4 border border-black/[.08] dark:border-white/[.145]"
                            >
                              <span className="text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                                •
                              </span>
                              <span className="leading-relaxed">{fact}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            )}

          </div>
        </div>
      </div>
    </AppLayout>
  );
}

