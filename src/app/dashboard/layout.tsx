"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Menu } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#FDFCFB] overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-72 h-full shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <div className="relative w-72 max-w-[80%] h-full bg-(--color-bg-page) shadow-2xl">
            <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        <main className="flex-1 w-full  mx-auto p-4 md:p-8">
          {/* Mobile Header Toggle */}
          <div className="lg:hidden flex items-center mb-6">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex items-center gap-2 px-3 py-2 bg-(--color-bg-card) rounded-lg text-gray-900 font-bold text-sm"
            >
              <Menu className="w-4 h-4" />
              Menu
            </button>
          </div>
          
          {children}
        </main>
      </div>
    </div>
  );
}
