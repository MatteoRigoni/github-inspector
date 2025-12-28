"use client";

import { useState } from "react";
import AppLayout from "../components/AppLayout";
import { useToast } from "../components/ToastProvider";

export default function ApiResearchPage() {
  const [apiKey, setApiKey] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
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
      setError(null);
      setResponse(null);

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
      } else {
        setResponse(data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Errore durante la richiesta";
      setError(errorMessage);
      showError(errorMessage, 5000);
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
              API Research
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Testa l'API per ottenere il README di un repository GitHub
            </p>
          </div>

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
                    placeholder="Inserisci la tua API key"
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
                  {loading ? "Caricamento..." : "Ottieni README"}
                </button>
              </form>
            </div>

            {/* Response */}
            {(response || error) && (
              <div className="bg-white dark:bg-black rounded-lg border border-black/[.08] dark:border-white/[.145] p-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-black dark:text-zinc-50">
                    Risposta API
                  </h2>
                  <button
                    onClick={() => {
                      setResponse(null);
                      setError(null);
                    }}
                    className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-50 transition-colors"
                  >
                    Pulisci
                  </button>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-950 rounded-lg p-4 border border-black/[.08] dark:border-white/[.145]">
                  <pre className="text-sm text-zinc-800 dark:text-zinc-200 overflow-auto max-h-[600px] whitespace-pre-wrap break-words font-mono">
                    {JSON.stringify(response || { error }, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

