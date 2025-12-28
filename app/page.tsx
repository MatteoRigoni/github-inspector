"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AppLayout from "./components/AppLayout";
import { useToast } from "./components/ToastProvider";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  type: string;
  usage: number;
  monthlyLimit: number;
  createdAt: string;
}

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
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
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterUsage, setFilterUsage] = useState<string>("all");
  const { showSuccess } = useToast();

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    fetchApiKeys();
  }, []);

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
      showSuccess("API Key copiata!");
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

  // Filter API keys
  const filteredApiKeys = apiKeys.filter((key) => {
    // Search filter
    const matchesSearch = searchQuery === "" || 
      key.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      key.key.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Type filter
    const matchesType = filterType === "all" || key.type === filterType;
    
    // Usage filter
    const usagePercentage = key.monthlyLimit > 0 ? (key.usage / key.monthlyLimit) * 100 : 0;
    const matchesUsage = filterUsage === "all" ||
      (filterUsage === "low" && usagePercentage < 70) ||
      (filterUsage === "medium" && usagePercentage >= 70 && usagePercentage < 90) ||
      (filterUsage === "high" && usagePercentage >= 90);
    
    return matchesSearch && matchesType && matchesUsage;
  });

  const hasActiveFilters = searchQuery !== "" || filterType !== "all" || filterUsage !== "all";

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-zinc-300 dark:border-zinc-600 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Don't render content if not authenticated (will redirect)
  if (status === "unauthenticated" || !session) {
    return null;
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-zinc-50 dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
          <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">
            Dashboard
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Manage and monitor your API keys: create, edit, track usage, and view statistics for seamless access control.
          </p>
        </div>
          {/* Statistics Widget */}
          <div className="mb-10 relative rounded-xl overflow-hidden bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 p-5 shadow-2xl">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10">
              {/* Statistics Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-4 h-4 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    <div className="text-white/95 text-xs uppercase tracking-wide">Total Keys</div>
                  </div>
                  <div className="text-xl font-bold text-white">{apiKeys.length}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-4 h-4 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <div className="text-white/95 text-xs uppercase tracking-wide">Credits Used</div>
                  </div>
                  <div className="text-xl font-bold text-white">{totalUsage.toLocaleString()}</div>
                  <div className="text-white/60 text-xs mt-0.5">of {totalLimit.toLocaleString()}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-4 h-4 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <div className="text-white/95 text-xs uppercase tracking-wide">Usage %</div>
                  </div>
                  <div className="text-xl font-bold text-white mb-2">{usagePercentage.toFixed(1)}%</div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        usagePercentage >= 90 ? 'bg-red-300' : 
                        usagePercentage >= 70 ? 'bg-yellow-300' : 
                        'bg-green-300'
                      }`}
                      style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-4 h-4 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-white/95 text-xs uppercase tracking-wide">Available</div>
                  </div>
                  <div className="text-xl font-bold text-white">{(totalLimit - totalUsage).toLocaleString()}</div>
                </div>
              </div>

              {/* Usage by Type */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 min-h-[100px]">
                  <div className="text-white/95 text-xs uppercase tracking-wide mb-1.5">Development</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/90">Keys</span>
                      <span className="text-white font-medium">{devKeys.length}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/90">Usage</span>
                        <span className="text-white font-medium">{devUsage.toLocaleString()} / {devLimit.toLocaleString()}</span>
                      </div>
                      {devLimit > 0 && (
                        <div className="w-full bg-white/20 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full transition-all ${
                              (devUsage / devLimit) >= 0.9 ? 'bg-red-300' : 
                              (devUsage / devLimit) >= 0.7 ? 'bg-yellow-300' : 
                              'bg-green-300'
                            }`}
                            style={{ width: `${Math.min((devUsage / devLimit) * 100, 100)}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 min-h-[100px]">
                  <div className="text-white/95 text-xs uppercase tracking-wide mb-1.5">Production</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/90">Keys</span>
                      <span className="text-white font-medium">{prodKeys.length}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/90">Usage</span>
                        <span className="text-white font-medium">{prodUsage.toLocaleString()} / {prodLimit.toLocaleString()}</span>
                      </div>
                      {prodLimit > 0 && (
                        <div className="w-full bg-white/20 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full transition-all ${
                              (prodUsage / prodLimit) >= 0.9 ? 'bg-red-300' : 
                              (prodUsage / prodLimit) >= 0.7 ? 'bg-yellow-300' : 
                              'bg-green-300'
                            }`}
                            style={{ width: `${Math.min((prodUsage / prodLimit) * 100, 100)}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* API Keys Section */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-black dark:text-zinc-50">
                API Keys
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(true);
                  setError(null);
                }}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] hover:shadow-md transition-all text-xl font-light focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                title="Create new API key"
              >
                +
              </button>
            </div>

            <p className="mb-4 text-base text-zinc-600 dark:text-zinc-400">
              The key is used to authenticate your requests to the API. To learn more, see the{" "}
              <a href="#" className="text-foreground hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded">
                documentation page
              </a>
              .
            </p>

            {/* Search and Filters */}
            <div className="mb-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search Input */}
                <div className="flex-1">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search by name or key..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-black/[.12] dark:border-white/[.145] bg-white dark:bg-black text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    />
                  </div>
                </div>

                {/* Type Filter */}
                <div className="sm:w-48">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-black/[.12] dark:border-white/[.145] bg-white dark:bg-black text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <option value="all">All Types</option>
                    <option value="dev">Development</option>
                    <option value="prod">Production</option>
                  </select>
                </div>

                {/* Usage Filter */}
                <div className="sm:w-48">
                  <select
                    value={filterUsage}
                    onChange={(e) => setFilterUsage(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-black/[.12] dark:border-white/[.145] bg-white dark:bg-black text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <option value="all">All Usage</option>
                    <option value="low">Low (&lt;70%)</option>
                    <option value="medium">Medium (70-90%)</option>
                    <option value="high">High (≥90%)</option>
                  </select>
                </div>

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setFilterType("all");
                      setFilterUsage("all");
                    }}
                    className="px-4 py-2 rounded-lg border border-black/[.12] dark:border-white/[.145] text-black dark:text-zinc-50 hover:bg-black/[.04] dark:hover:bg-[#1a1a1a] transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 whitespace-nowrap"
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              {/* Filter Results Count */}
              {hasActiveFilters && (
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  Showing <span className="font-medium text-black dark:text-zinc-50">{filteredApiKeys.length}</span> of <span className="font-medium text-black dark:text-zinc-50">{apiKeys.length}</span> keys
                </div>
              )}
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200 text-sm">
                {error}
              </div>
            )}

            {loading ? (
              <div className="bg-white dark:bg-black rounded-lg border border-black/[.12] dark:border-white/[.145] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-white dark:bg-black z-10">
                      <tr className="border-b border-black/[.12] dark:border-white/[.145]">
                        <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                          NAME
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                          TYPE
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                          USAGE
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                          KEY
                        </th>
                        <th className="px-6 py-3 text-right text-sm font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                          OPTIONS
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3].map((i) => (
                        <tr key={i} className="border-b border-black/[.12] dark:border-white/[.145]">
                          <td className="px-6 py-5">
                            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-24 animate-pulse"></div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-16 animate-pulse"></div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-20 animate-pulse"></div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-32 animate-pulse"></div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex items-center justify-end gap-4">
                              <div className="h-8 w-8 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"></div>
                              <div className="h-8 w-8 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"></div>
                              <div className="h-8 w-8 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"></div>
                              <div className="h-8 w-8 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"></div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : apiKeys.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-black rounded-lg border border-black/[.12] dark:border-white/[.145]">
                <svg className="mx-auto h-12 w-12 text-zinc-400 dark:text-zinc-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                <p className="text-base text-zinc-600 dark:text-zinc-400 mb-4">
                  No API keys found. Create your first one!
                </p>
              </div>
            ) : filteredApiKeys.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-black rounded-lg border border-black/[.12] dark:border-white/[.145]">
                <svg className="mx-auto h-12 w-12 text-zinc-400 dark:text-zinc-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-base text-zinc-600 dark:text-zinc-400 mb-4">
                  No API keys match your filters.
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setFilterType("all");
                      setFilterUsage("all");
                    }}
                    className="px-4 py-2 rounded-lg border border-black/[.12] dark:border-white/[.145] text-black dark:text-zinc-50 hover:bg-black/[.04] dark:hover:bg-[#1a1a1a] transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-black rounded-lg border border-black/[.12] dark:border-white/[.145] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-white dark:bg-black z-10">
                      <tr className="border-b border-black/[.12] dark:border-white/[.145]">
                        <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                          NAME
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                          TYPE
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                          USAGE
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                          KEY
                        </th>
                        <th className="px-6 py-3 text-right text-sm font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                          OPTIONS
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/[.12] dark:divide-white/[.145]">
                      {filteredApiKeys.map((key, index) => (
                        <tr key={key.id} className={`hover:bg-zinc-100 dark:hover:bg-zinc-950 transition-colors ${index % 2 === 1 ? 'bg-zinc-50/50 dark:bg-zinc-950/50' : ''}`}>
                          <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-black dark:text-zinc-50">
                            {key.name}
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                            <span className="px-2 py-1 text-xs font-medium rounded-md bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300">
                              {key.type}
                            </span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                            <div className="space-y-1.5">
                              <span>{key.usage} / {key.monthlyLimit}</span>
                              {key.monthlyLimit > 0 && (
                                <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5">
                                  <div 
                                    className={`h-1.5 rounded-full transition-all ${
                                      (key.usage / key.monthlyLimit) >= 0.9 ? 'bg-red-500' : 
                                      (key.usage / key.monthlyLimit) >= 0.7 ? 'bg-yellow-500' : 
                                      'bg-green-500'
                                    }`}
                                    style={{ width: `${Math.min((key.usage / key.monthlyLimit) * 100, 100)}%` }}
                                  ></div>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap text-sm font-mono text-zinc-600 dark:text-zinc-400">
                            {maskKey(key.key)}
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap text-right text-sm">
                            <div className="flex items-center justify-end gap-4">
                              <button
                                onClick={() => openViewModal(key)}
                                className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
                                title="View"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => copyToClipboard(key.key)}
                                className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
                                title="Copy"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => openEditModal(key)}
                                className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
                                title="Edit"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(key.id)}
                                className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-lg"
                                title="Delete"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <div className="bg-white dark:bg-black rounded-lg p-6 max-w-md w-full border border-black/[.12] dark:border-white/[.145]">
                <h2 className="text-2xl font-bold text-black dark:text-zinc-50 mb-4">
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
                      className="w-full px-4 py-2 rounded-lg border border-black/[.08] dark:border-white/[.145] bg-white dark:bg-black text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
                      className="w-full px-4 py-2 rounded-lg border border-black/[.08] dark:border-white/[.145] bg-white dark:bg-black text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
                      className="w-full px-4 py-2 rounded-lg border border-black/[.08] dark:border-white/[.145] bg-white dark:bg-black text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      placeholder="1000"
                    />
                  </div>
                  <div className="flex gap-3 justify-end">
                    <button
                      type="button"
                      onClick={closeModals}
                      className="px-4 py-2 rounded-full border border-solid border-black/[.08] dark:border-white/[.145] text-black dark:text-zinc-50 hover:bg-black/[.04] dark:hover:bg-[#1a1a1a] transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-full bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
              <div className="bg-white dark:bg-black rounded-lg p-6 max-w-md w-full border border-black/[.12] dark:border-white/[.145]">
                <h2 className="text-2xl font-bold text-black dark:text-zinc-50 mb-4">
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
                      <span className="px-2 py-1 text-xs font-medium rounded-md bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300">
                        {viewingKey.type}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-zinc-50 mb-2">
                      API Key
                    </label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-sm bg-zinc-100 dark:bg-zinc-900 px-3 py-2 rounded-lg font-mono text-zinc-800 dark:text-zinc-200 break-all">
                        {viewingKey.key}
                      </code>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(viewingKey.key)}
                        className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
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
                    className="px-4 py-2 rounded-full bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
              <div className="bg-white dark:bg-black rounded-lg p-6 max-w-md w-full border border-black/[.12] dark:border-white/[.145]">
                <h2 className="text-2xl font-bold text-black dark:text-zinc-50 mb-4">
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
                      className="w-full px-4 py-2 rounded-lg border border-black/[.08] dark:border-white/[.145] bg-white dark:bg-black text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
                      className="w-full px-4 py-2 rounded-lg border border-black/[.08] dark:border-white/[.145] bg-white dark:bg-black text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      placeholder="1000"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-black dark:text-zinc-50 mb-2">
                      API Key (read-only)
                    </label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-sm bg-zinc-100 dark:bg-zinc-900 px-3 py-2 rounded-lg font-mono text-zinc-800 dark:text-zinc-200">
                        {maskKey(editingKey.key)}
                      </code>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(editingKey.key)}
                        className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
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
                      className="px-4 py-2 rounded-full border border-solid border-black/[.08] dark:border-white/[.145] text-black dark:text-zinc-50 hover:bg-black/[.04] dark:hover:bg-[#1a1a1a] transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-full bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
    </AppLayout>
  );
}
