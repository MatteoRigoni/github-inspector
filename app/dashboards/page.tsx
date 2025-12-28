"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  type: string;
  usage: number;
  monthlyLimit: number;
  createdAt: string;
}

export default function DashboardsPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingKey, setViewingKey] = useState<ApiKey | null>(null);
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("dev");
  const [formMonthlyLimit, setFormMonthlyLimit] = useState(1000);
  const [error, setError] = useState<string | null>(null);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  useEffect(() => {
    if (showCopyToast) {
      const timer = setTimeout(() => {
        setIsFadingOut(true);
        setTimeout(() => {
          setShowCopyToast(false);
          setIsFadingOut(false);
        }, 200);
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [showCopyToast]);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/api-keys");
      if (!response.ok) throw new Error("Failed to fetch API keys");
      const data = await response.json();
      setApiKeys(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setError("Name is required");
      return;
    }

    try {
      const response = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName, type: formType, monthlyLimit: formMonthlyLimit }),
      });

      if (!response.ok) throw new Error("Failed to create API key");
      
      setFormName("");
      setFormType("dev");
      setFormMonthlyLimit(1000);
      setShowCreateModal(false);
      setError(null);
      fetchApiKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create API key");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !editingKey) {
      setError("Name is required");
      return;
    }

    try {
      const response = await fetch(`/api/api-keys/${editingKey.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName, monthlyLimit: formMonthlyLimit }),
      });

      if (!response.ok) throw new Error("Failed to update API key");
      
      setFormName("");
      setFormType("dev");
      setFormMonthlyLimit(1000);
      setShowEditModal(false);
      setEditingKey(null);
      setError(null);
      fetchApiKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update API key");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this API key?")) {
      return;
    }

    try {
      const response = await fetch(`/api/api-keys/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete API key");
      
      fetchApiKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete API key");
    }
  };

  const openEditModal = (key: ApiKey) => {
    setEditingKey(key);
    setFormName(key.name);
    setFormType(key.type);
    setFormMonthlyLimit(key.monthlyLimit);
    setShowEditModal(true);
  };

  const openViewModal = (key: ApiKey) => {
    setViewingKey(key);
    setShowViewModal(true);
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowViewModal(false);
    setEditingKey(null);
    setViewingKey(null);
    setFormName("");
    setFormType("dev");
    setFormMonthlyLimit(1000);
    setError(null);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopyToast(true);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return key;
    const prefix = key.substring(0, 4);
    return `${prefix}${"*".repeat(Math.max(20, key.length - 8))}`;
  };

  // Calculate total usage and limits
  const totalUsage = apiKeys.reduce((sum, key) => sum + key.usage, 0);
  const totalLimit = apiKeys.reduce((sum, key) => sum + key.monthlyLimit, 0);
  const usagePercentage = totalLimit > 0 ? Math.min((totalUsage / totalLimit) * 100, 100) : 0;

  // Calculate statistics by type
  const devKeys = apiKeys.filter(key => key.type === 'dev');
  const prodKeys = apiKeys.filter(key => key.type === 'prod');
  const devUsage = devKeys.reduce((sum, key) => sum + key.usage, 0);
  const devLimit = devKeys.reduce((sum, key) => sum + key.monthlyLimit, 0);
  const prodUsage = prodKeys.reduce((sum, key) => sum + key.usage, 0);
  const prodLimit = prodKeys.reduce((sum, key) => sum + key.monthlyLimit, 0);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      {/* Copy Toast */}
      {showCopyToast && (
        <div className={`fixed top-4 left-1/2 z-50 ${isFadingOut ? 'animate-fade-out' : 'animate-fade-in'}`}>
          <div className="bg-black/90 dark:bg-white/90 backdrop-blur-sm text-white dark:text-black px-4 py-2 rounded-lg shadow-lg border border-white/20 dark:border-black/20 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-medium">API Key copiata!</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
          <Link href="/" className="hover:text-black dark:hover:text-zinc-50">
            Pages
          </Link>
          <span className="mx-2">/</span>
          <span className="text-black dark:text-zinc-50">Overview</span>
        </nav>

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">
            Overview
          </h1>
        </div>

        {/* Statistics Widget */}
        <div className="mb-8 relative rounded-xl overflow-hidden bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 p-5">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            {/* Statistics Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <div className="text-white/80 text-xs uppercase tracking-wider mb-1">Total Keys</div>
                <div className="text-xl font-bold text-white">{apiKeys.length}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <div className="text-white/80 text-xs uppercase tracking-wider mb-1">Credits Used</div>
                <div className="text-xl font-bold text-white">{totalUsage.toLocaleString()}</div>
                <div className="text-white/60 text-xs mt-0.5">of {totalLimit.toLocaleString()}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <div className="text-white/80 text-xs uppercase tracking-wider mb-1">Usage %</div>
                <div className="text-xl font-bold text-white">{usagePercentage.toFixed(1)}%</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <div className="text-white/80 text-xs uppercase tracking-wider mb-1">Available</div>
                <div className="text-xl font-bold text-white">{(totalLimit - totalUsage).toLocaleString()}</div>
              </div>
            </div>

            {/* Usage by Type */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <div className="text-white/80 text-xs uppercase tracking-wider mb-1.5">Development</div>
                <div className="space-y-0.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/90">Keys</span>
                    <span className="text-white font-medium">{devKeys.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/90">Usage</span>
                    <span className="text-white font-medium">{devUsage.toLocaleString()} / {devLimit.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <div className="text-white/80 text-xs uppercase tracking-wider mb-1.5">Production</div>
                <div className="space-y-0.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/90">Keys</span>
                    <span className="text-white font-medium">{prodKeys.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/90">Usage</span>
                    <span className="text-white font-medium">{prodUsage.toLocaleString()} / {prodLimit.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* API Keys Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-black dark:text-zinc-50">
              API Keys
            </h2>
            <button
              onClick={() => {
                setShowCreateModal(true);
                setError(null);
              }}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors text-xl font-light"
              title="Create new API key"
            >
              +
            </button>
          </div>

          <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
            The key is used to authenticate your requests to the API. To learn more, see the{" "}
            <Link href="#" className="text-foreground hover:underline">
              documentation page
            </Link>
            .
          </p>

          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12 text-zinc-600 dark:text-zinc-400">
              Loading...
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-black rounded-lg border border-black/[.08] dark:border-white/[.145]">
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                No API keys found. Create your first one!
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-black rounded-lg border border-black/[.08] dark:border-white/[.145] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-black/[.08] dark:border-white/[.145]">
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                        NAME
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                        TYPE
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                        USAGE
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                        KEY
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                        OPTIONS
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[.08] dark:divide-white/[.145]">
                    {apiKeys.map((key) => (
                      <tr key={key.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black dark:text-zinc-50">
                          {key.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                          <span className="px-2 py-1 text-xs font-medium rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300">
                            {key.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                          {key.usage} / {key.monthlyLimit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-zinc-600 dark:text-zinc-400">
                          {maskKey(key.key)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => openViewModal(key)}
                              className="p-1.5 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-50 transition-colors"
                              title="View"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => copyToClipboard(key.key)}
                              className="p-1.5 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-50 transition-colors"
                              title="Copy"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => openEditModal(key)}
                              className="p-1.5 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-50 transition-colors"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(key.id)}
                              className="p-1.5 text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-black rounded-lg p-6 max-w-md w-full border border-black/[.08] dark:border-white/[.145]">
              <h2 className="text-xl font-semibold text-black dark:text-zinc-50 mb-4">
                Create New API Key
              </h2>
              <form onSubmit={handleCreate}>
                <div className="mb-4">
                  <label
                    htmlFor="create-name"
                    className="block text-sm font-medium text-black dark:text-zinc-50 mb-2"
                  >
                    Name
                  </label>
                  <input
                    id="create-name"
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-black/[.08] dark:border-white/[.145] bg-white dark:bg-black text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-foreground"
                    placeholder="Enter API key name"
                    autoFocus
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="create-type"
                    className="block text-sm font-medium text-black dark:text-zinc-50 mb-2"
                  >
                    Type
                  </label>
                  <select
                    id="create-type"
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-black/[.08] dark:border-white/[.145] bg-white dark:bg-black text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-foreground"
                  >
                    <option value="dev">dev</option>
                    <option value="prod">prod</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="create-limit"
                    className="block text-sm font-medium text-black dark:text-zinc-50 mb-2"
                  >
                    Monthly Limit
                  </label>
                  <input
                    id="create-limit"
                    type="number"
                    min="1"
                    value={formMonthlyLimit}
                    onChange={(e) => setFormMonthlyLimit(Number(e.target.value))}
                    className="w-full px-4 py-2 rounded-lg border border-black/[.08] dark:border-white/[.145] bg-white dark:bg-black text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-foreground"
                    placeholder="1000"
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={closeModals}
                    className="px-4 py-2 rounded-full border border-solid border-black/[.08] dark:border-white/[.145] text-black dark:text-zinc-50 hover:bg-black/[.04] dark:hover:bg-[#1a1a1a] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-full bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Modal */}
        {showViewModal && viewingKey && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-black rounded-lg p-6 max-w-md w-full border border-black/[.08] dark:border-white/[.145]">
              <h2 className="text-xl font-semibold text-black dark:text-zinc-50 mb-4">
                API Key Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black dark:text-zinc-50 mb-2">
                    Name
                  </label>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{viewingKey.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black dark:text-zinc-50 mb-2">
                    Type
                  </label>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    <span className="px-2 py-1 text-xs font-medium rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300">
                      {viewingKey.type}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black dark:text-zinc-50 mb-2">
                    API Key
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm bg-zinc-100 dark:bg-zinc-900 px-3 py-2 rounded font-mono text-zinc-800 dark:text-zinc-200 break-all">
                      {viewingKey.key}
                    </code>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(viewingKey.key)}
                      className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-50 transition-colors"
                      title="Copy to clipboard"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black dark:text-zinc-50 mb-2">
                    Usage
                  </label>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {viewingKey.usage} / {viewingKey.monthlyLimit}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black dark:text-zinc-50 mb-2">
                    Monthly Limit
                  </label>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{viewingKey.monthlyLimit}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black dark:text-zinc-50 mb-2">
                    Created
                  </label>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {new Date(viewingKey.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button
                  type="button"
                  onClick={closeModals}
                  className="px-4 py-2 rounded-full bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editingKey && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-black rounded-lg p-6 max-w-md w-full border border-black/[.08] dark:border-white/[.145]">
              <h2 className="text-xl font-semibold text-black dark:text-zinc-50 mb-4">
                Edit API Key
              </h2>
              <form onSubmit={handleUpdate}>
                <div className="mb-4">
                  <label
                    htmlFor="edit-name"
                    className="block text-sm font-medium text-black dark:text-zinc-50 mb-2"
                  >
                    Name
                  </label>
                  <input
                    id="edit-name"
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-black/[.08] dark:border-white/[.145] bg-white dark:bg-black text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-foreground"
                    placeholder="Enter API key name"
                    autoFocus
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="edit-limit"
                    className="block text-sm font-medium text-black dark:text-zinc-50 mb-2"
                  >
                    Monthly Limit
                  </label>
                  <input
                    id="edit-limit"
                    type="number"
                    min="1"
                    value={formMonthlyLimit}
                    onChange={(e) => setFormMonthlyLimit(Number(e.target.value))}
                    className="w-full px-4 py-2 rounded-lg border border-black/[.08] dark:border-white/[.145] bg-white dark:bg-black text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-foreground"
                    placeholder="1000"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-black dark:text-zinc-50 mb-2">
                    API Key (read-only)
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm bg-zinc-100 dark:bg-zinc-900 px-3 py-2 rounded font-mono text-zinc-800 dark:text-zinc-200">
                      {maskKey(editingKey.key)}
                    </code>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(editingKey.key)}
                      className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-50 transition-colors"
                      title="Copy to clipboard"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={closeModals}
                    className="px-4 py-2 rounded-full border border-solid border-black/[.08] dark:border-white/[.145] text-black dark:text-zinc-50 hover:bg-black/[.04] dark:hover:bg-[#1a1a1a] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-full bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
