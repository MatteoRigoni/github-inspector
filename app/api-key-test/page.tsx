"use client";

import { useState } from "react";
import AppLayout from "../components/AppLayout";
import { useToast } from "../components/ToastProvider";

export default function ApiKeyTestPage() {
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      showError("Inserisci un API key");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/api-keys/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: apiKey }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        // API key valida - mostra messaggio verde con consumo
        showSuccess(data.message, 5000);
      } else {
        // API key non valida o esaurita - mostra messaggio rosso
        showError(data.message || "API key non valida", 5000);
      }
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Errore durante la verifica",
        5000
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-zinc-50 dark:bg-black">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">
              API Key Test
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Verifica la validità di un API key e controlla il consumo rimanente
            </p>
          </div>

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
                  placeholder="Inserisci l'API key da verificare"
                  className="w-full px-4 py-3 border border-black/[.08] dark:border-white/[.145] rounded-lg bg-white dark:bg-black text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !apiKey.trim()}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                {loading ? "Verifica in corso..." : "Verifica API Key"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

