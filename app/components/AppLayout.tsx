"use client";

import Sidebar from "./Sidebar";
import { SidebarProvider, useSidebar } from "./SidebarContext";
import AuthButton from "./AuthButton";

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar();

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-black">
      <Sidebar />
      <main
        className={`flex-1 transition-all duration-300 ${
          isOpen ? "lg:ml-64" : "lg:ml-0"
        }`}
      >
        {/* Header with Auth Button */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-black/[.08] dark:border-white/[.145]">
          <div className="flex items-center justify-end px-4 sm:px-6 lg:px-8 h-16">
            <AuthButton />
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </SidebarProvider>
  );
}

