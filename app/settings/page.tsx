import AppLayout from "../components/AppLayout";

export default function SettingsPage() {
  return (
    <AppLayout>
      <div className="min-h-screen bg-zinc-50 dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">
              Settings
            </h1>
          </div>
          <div className="bg-white dark:bg-black rounded-lg border border-black/[.08] dark:border-white/[.145] p-8 text-center">
            <p className="text-zinc-600 dark:text-zinc-400">
              Settings functionality coming soon...
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

