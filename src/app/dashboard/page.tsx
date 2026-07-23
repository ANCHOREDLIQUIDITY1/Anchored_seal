"use client";

import { useSyncExternalStore, useMemo } from "react";
import { 
  FileText, Check, Clock, X,
  LayoutGrid, PlusSquare, History,
  PenTool, Send, Eye, UserPlus
} from "lucide-react";

// Subscribe to storage events so the component updates if localStorage changes across tabs
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot() {
  return localStorage.getItem("user");
}

function getServerSnapshot() {
  return null;
}

export default function Dashboard() {
  const storedUser = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  
  const user = useMemo(() => {
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  }, [storedUser]);

  const firstName = user?.name ? user.name.split(" ")[0] : "User";

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-bold text-2xl text-gray-900">
            Welcome back, {firstName} 👋
          </h1>
          <p className="text-gray-500 text-sm font-medium mt-1">
            Here&apos;s what&apos;s happening with your agreements.
          </p>
        </div>
        <button className="bg-(--color-primary) hover:bg-[#153a22] text-white px-5 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors w-full md:w-auto">
          <PlusSquare className="w-5 h-5" />
          New Agreement
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total */}
        <div className="bg-(--color-bg-card) rounded-lg p-6 relative overflow-hidden">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Agreements</p>
          <p className="text-3xl font-extrabold text-(--color-primary) mt-3">14</p>
          <div className="absolute top-6 right-6 text-(--color-primary) opacity-80">
            <FileText className="w-6 h-6" />
          </div>
        </div>
        {/* Signed */}
        <div className="bg-(--color-bg-card) rounded-lg p-6 relative overflow-hidden">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Signed</p>
          <p className="text-3xl font-extrabold text-[#3B7B56] mt-3">9</p>
          <p className="text-xs text-gray-500 mt-2 font-medium">All parties signed</p>
          <div className="absolute top-6 right-6 bg-[#E8F3EC] p-1.5 rounded-sm text-[#3B7B56]">
            <Check className="w-5 h-5" strokeWidth={3} />
          </div>
        </div>
        {/* Pending */}
        <div className="bg-(--color-bg-card) rounded-lg p-6 relative overflow-hidden">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pending</p>
          <p className="text-3xl font-extrabold text-[#D97706] mt-3">3</p>
          <p className="text-xs text-gray-500 mt-2 font-medium">Awaiting signatures</p>
          <div className="absolute top-6 right-6 text-[#D97706]">
            <Clock className="w-6 h-6" />
          </div>
        </div>
        {/* Expired */}
        <div className="bg-(--color-bg-card) rounded-lg p-6 relative overflow-hidden">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Expired</p>
          <p className="text-3xl font-extrabold text-[#DC2626] mt-3">2</p>
          <p className="text-xs text-gray-500 mt-2 font-medium">Past deadline</p>
          <div className="absolute top-6 right-6 text-[#DC2626]">
            <X className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Agreements */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-gray-900">Recent Agreements</h2>
            <a href="#" className="text-xs font-bold text-[#3B7B56] hover:underline">View all →</a>
          </div>

          <div className="flex flex-col gap-3">
            {/* Item 1 */}
            <div className="bg-(--color-bg-card) rounded-lg p-4 flex items-center justify-between">
              <div className="flex gap-4 items-center">
                <div className="bg-[#E2DFD6] p-3 rounded-lg text-gray-500 hidden sm:block">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm text-gray-900">Freelance Web Development Agreement</span>
                  <span className="text-xs text-gray-500 mt-1">Chukwuemeka Obi • Kemi Adeyemi • 2025-05-10</span>
                </div>
              </div>
              <span className="bg-[#E8F3EC] text-[#3B7B56] text-xs font-bold px-3 py-1 rounded-full">Signed</span>
            </div>

            {/* Item 2 */}
            <div className="bg-(--color-bg-card) rounded-lg p-4 flex items-center justify-between">
              <div className="flex gap-4 items-center">
                <div className="bg-[#E2DFD6] p-3 rounded-lg text-gray-500 hidden sm:block">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm text-gray-900">Business Partnership Agreement</span>
                  <span className="text-xs text-gray-500 mt-1">Chukwuemeka Obi • Tunde Balogun • Ngozi Eze • 2025-05-18</span>
                </div>
              </div>
              <span className="bg-[#FEF3C7] text-[#D97706] text-xs font-bold px-3 py-1 rounded-full">Pending</span>
            </div>

            {/* Item 3 */}
            <div className="bg-(--color-bg-card) rounded-lg p-4 flex items-center justify-between">
              <div className="flex gap-4 items-center">
                <div className="bg-[#E2DFD6] p-3 rounded-lg text-gray-500 hidden sm:block">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm text-gray-900">Personal Loan Agreement</span>
                  <span className="text-xs text-gray-500 mt-1">Chukwuemeka Obi • Femi Olawale • 2025-04-01</span>
                </div>
              </div>
              <span className="bg-[#E8F3EC] text-[#3B7B56] text-xs font-bold px-3 py-1 rounded-full">Signed</span>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="flex flex-col gap-4">
          <h2 className="font-bold text-lg text-gray-900">Activity</h2>
          <div className="bg-(--color-bg-card) rounded-lg p-5 flex flex-col gap-6 h-72.5 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none">
            {/* Activity 1 */}
            <div className="flex gap-3">
              <div className="mt-0.5 text-[#3B7B56]"><PenTool className="w-5 h-5" /></div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-900">Kemi Adeyemi signed</span>
                <span className="text-xs text-gray-500 mt-0.5">2 days ago</span>
              </div>
            </div>
            {/* Activity 2 */}
            <div className="flex gap-3">
              <div className="mt-0.5 text-[#1e40af]"><Send className="w-5 h-5" /></div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-900">You sent &apos;Business Partn...&apos;</span>
                <span className="text-xs text-gray-500 mt-0.5">7 days ago</span>
              </div>
            </div>
            {/* Activity 3 */}
            <div className="flex gap-3">
              <div className="mt-0.5 text-[#3B7B56]"><PenTool className="w-5 h-5" /></div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-900">Femi Olawale signed</span>
                <span className="text-xs text-gray-500 mt-0.5">1 month ago</span>
              </div>
            </div>
            {/* Activity 4 */}
            <div className="flex gap-3">
              <div className="mt-0.5 text-[#6b7280]"><Eye className="w-5 h-5" /></div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-900">TechVault Ltd viewed</span>
                <span className="text-xs text-gray-500 mt-0.5">2 months ago</span>
              </div>
            </div>
            {/* Activity 5 */}
            <div className="flex gap-3">
              <div className="mt-0.5 text-[#d97706]"><UserPlus className="w-5 h-5" /></div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-900">You created an account</span>
                <span className="text-xs text-gray-500 mt-0.5">5 days ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-col gap-4 mt-6">
        <h2 className="font-bold text-lg text-gray-900">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button className="bg-(--color-bg-card) hover:bg-[#e4e1d6] text-gray-900 px-4 py-3 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors">
            <LayoutGrid className="w-4 h-4 text-(--color-primary)" />
            Create from Template
          </button>
          <button className="bg-(--color-bg-card) hover:bg-[#e4e1d6] text-gray-900 px-4 py-3 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors">
            <PlusSquare className="w-4 h-4 text-[#3B7B56]" />
            New Custom Agreement
          </button>
          <button className="bg-(--color-bg-card) hover:bg-[#e4e1d6] text-gray-900 px-4 py-3 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors">
            <Clock className="w-4 h-4 text-[#D97706]" />
            View Pending
          </button>
          <button className="bg-(--color-bg-card) hover:bg-[#e4e1d6] text-gray-900 px-4 py-3 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors">
            <History className="w-4 h-4 text-gray-500" />
            Activity Log
          </button>
        </div>
      </div>

    </div>
  );
}
