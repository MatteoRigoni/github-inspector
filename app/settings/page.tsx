import AppLayout from "../components/AppLayout";

export default function SettingsPage() {
  return (
    <AppLayout>
      <div className="min-h-screen bg-zinc-50 dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">
              Settings
            </h1>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

