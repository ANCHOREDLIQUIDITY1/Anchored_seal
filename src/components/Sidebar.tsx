"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Shield, Home, FileText, Plus, LayoutGrid, 
  Activity, User, Moon, LogOut, X 
} from "lucide-react";

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; plan: string } | null>(null);
  const [pendingCount, setPendingCount] = useState<number | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    // Fetch pending agreements count
    const fetchPendingCount = async () => {
      try {
        if (!localStorage.getItem("token")) return;
        const { api } = await import("@/lib/api");
        const response = await api.agreements.getAll();
        const count = response.data.filter((a: any) => a.status === 'pending' || a.status === 'partially_signed').length;
        setPendingCount(count);
      } catch (err) {
        console.error("Failed to fetch pending count", err);
      }
    };
    fetchPendingCount();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.push("/");
  };

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Agreements", href: "/dashboard/agreements", icon: FileText, badge: pendingCount !== null && pendingCount > 0 ? pendingCount.toString() : undefined },
    { name: "New Agreement", href: "/dashboard/new", icon: Plus },
    { name: "Templates", href: "/dashboard/templates", icon: LayoutGrid },
    { name: "Activity", href: "/dashboard/activity", icon: Activity },
    { name: "Profile", href: "/dashboard/profile", icon: User },
  ];

  // Get initials
  const initials = user?.name 
    ? user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
    : "U";

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg-page)] w-full border-r border-[#E2DFD6]">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <div className="bg-[var(--color-primary)] text-white p-1.5 rounded-lg shadow-sm">
            <Shield className="w-5 h-5" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-xl text-gray-900">TrustSeal</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-gray-900">
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link 
              key={item.name} 
              href={item.href}
              onClick={onClose}
              className={`flex items-center justify-between px-4 py-3 rounded-[var(--radius-md)] transition-colors ${
                isActive 
                  ? "bg-[var(--color-bg-card)] text-gray-900 font-bold" 
                  : "text-gray-500 hover:bg-[var(--color-bg-card)] hover:text-gray-900 font-medium"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isActive ? "text-gray-900" : "text-gray-400"}`} />
                <span className="text-sm">{item.name}</span>
              </div>
              {item.badge && (
                <span className="bg-[var(--color-primary)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile */}
      <div className="p-4 border-t border-[#E2DFD6]">
        {user ? (
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-sm">
              {initials}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-900 truncate max-w-[140px]">{user.name}</span>
              <span className="text-xs text-gray-500 capitalize">{user.plan} Plan</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 mb-4 px-2 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-gray-200"></div>
            <div className="flex flex-col gap-1">
              <div className="w-24 h-4 bg-gray-200 rounded"></div>
              <div className="w-16 h-3 bg-gray-200 rounded"></div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button className="flex-1 flex justify-center py-2 bg-[var(--color-bg-card)] rounded-lg text-gray-500 hover:text-gray-900 transition-colors">
            <Moon className="w-4 h-4" />
          </button>
          <button 
            onClick={handleLogout}
            className="flex-1 flex justify-center items-center gap-2 py-2 bg-[var(--color-bg-card)] rounded-lg text-gray-500 hover:text-gray-900 transition-colors text-xs font-bold"
          >
            <LogOut className="w-4 h-4" />
            Out
          </button>
        </div>
      </div>
    </div>
  );
}
