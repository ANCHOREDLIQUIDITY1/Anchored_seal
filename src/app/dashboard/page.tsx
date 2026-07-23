"use client";

import { useSyncExternalStore, useMemo, useEffect, useState } from "react";
import { 
  FileText, Check, Clock, X,
  LayoutGrid, PlusSquare, History,
  PenTool, Send, Eye, AlertCircle
} from "lucide-react";
import { api } from "@/lib/api";
import { IAgreement, IAuditTrail } from "@/types";

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

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
}

interface ActivityItem extends IAuditTrail {
  agreementTitle: string;
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

  const [agreements, setAgreements] = useState<IAgreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.agreements.getAll();
        setAgreements(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    
    if (localStorage.getItem("token")) {
      fetchDashboardData();
    } else {
      // Defer state update to avoid synchronous setState warning
      setTimeout(() => setLoading(false), 0);
    }
  }, []);

  // Compute Stats
  const totalAgreements = agreements.length;
  const signedAgreements = agreements.filter(a => a.status === 'signed').length;
  const pendingAgreements = agreements.filter(a => a.status === 'pending' || a.status === 'partially_signed').length;
  const expiredAgreements = agreements.filter(a => a.status === 'expired').length;

  // Recent Agreements (top 3)
  const recentAgreements = [...agreements]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  // Activity Feed
  const activityFeed: ActivityItem[] = useMemo(() => {
    const allEvents = agreements.flatMap(a => 
      a.auditTrail.map(event => ({ ...event, agreementTitle: a.title }))
    );
    return allEvents
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 15); // top 15 activities
  }, [agreements]);

  const getActivityIcon = (action: string) => {
    switch (action.toUpperCase()) {
      case 'SIGNED':
        return <div className="mt-0.5 text-[#3B7B56]"><PenTool className="w-5 h-5" /></div>;
      case 'SENT':
        return <div className="mt-0.5 text-[#1e40af]"><Send className="w-5 h-5" /></div>;
      case 'VIEWED':
        return <div className="mt-0.5 text-[#6b7280]"><Eye className="w-5 h-5" /></div>;
      case 'CREATED':
        return <div className="mt-0.5 text-[#d97706]"><PlusSquare className="w-5 h-5" /></div>;
      default:
        return <div className="mt-0.5 text-gray-400"><History className="w-5 h-5" /></div>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'signed':
        return <span className="bg-[#E8F3EC] text-[#3B7B56] text-xs font-bold px-3 py-1 rounded-full">Signed</span>;
      case 'pending':
      case 'partially_signed':
        return <span className="bg-[#FEF3C7] text-[#D97706] text-xs font-bold px-3 py-1 rounded-full">Pending</span>;
      case 'expired':
        return <span className="bg-[#FEE2E2] text-[#DC2626] text-xs font-bold px-3 py-1 rounded-full">Expired</span>;
      case 'draft':
        return <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">Draft</span>;
      default:
        return <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full capitalize">{status.replace('_', ' ')}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-8 pb-10 animate-pulse">
        <div className="h-20 bg-gray-200 rounded-lg w-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-32 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

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

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium text-sm">{error}</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total */}
        <div className="bg-(--color-bg-card) rounded-lg p-6 relative overflow-hidden">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Agreements</p>
          <p className="text-3xl font-extrabold text-(--color-primary) mt-3">{totalAgreements}</p>
          <div className="absolute top-6 right-6 text-(--color-primary) opacity-80">
            <FileText className="w-6 h-6" />
          </div>
        </div>
        {/* Signed */}
        <div className="bg-(--color-bg-card) rounded-lg p-6 relative overflow-hidden">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Signed</p>
          <p className="text-3xl font-extrabold text-[#3B7B56] mt-3">{signedAgreements}</p>
          <p className="text-xs text-gray-500 mt-2 font-medium">All parties signed</p>
          <div className="absolute top-6 right-6 bg-[#E8F3EC] p-1.5 rounded-sm text-[#3B7B56]">
            <Check className="w-5 h-5" strokeWidth={3} />
          </div>
        </div>
        {/* Pending */}
        <div className="bg-(--color-bg-card) rounded-lg p-6 relative overflow-hidden">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pending</p>
          <p className="text-3xl font-extrabold text-[#D97706] mt-3">{pendingAgreements}</p>
          <p className="text-xs text-gray-500 mt-2 font-medium">Awaiting signatures</p>
          <div className="absolute top-6 right-6 text-[#D97706]">
            <Clock className="w-6 h-6" />
          </div>
        </div>
        {/* Expired */}
        <div className="bg-(--color-bg-card) rounded-lg p-6 relative overflow-hidden">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Expired</p>
          <p className="text-3xl font-extrabold text-[#DC2626] mt-3">{expiredAgreements}</p>
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
            {recentAgreements.length > 0 && (
              <a href="#" className="text-xs font-bold text-[#3B7B56] hover:underline">View all →</a>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {recentAgreements.length === 0 ? (
              <div className="bg-(--color-bg-card) rounded-lg p-10 flex flex-col items-center justify-center text-center border border-dashed border-gray-300">
                <FileText className="w-10 h-10 text-gray-300 mb-3" />
                <h3 className="font-bold text-gray-900">No agreements yet</h3>
                <p className="text-sm text-gray-500 mt-1 mb-4 max-w-xs">Create your first agreement to start securely signing documents.</p>
                <button className="bg-(--color-primary) hover:bg-[#153a22] text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors">
                  Create Agreement
                </button>
              </div>
            ) : (
              recentAgreements.map((agreement) => {
                const dateStr = new Date(agreement.createdAt).toISOString().split('T')[0];
                const partiesStr = agreement.parties.map(p => p.name).join(' • ');

                return (
                  <div key={agreement._id} className="bg-(--color-bg-card) rounded-lg p-4 flex items-center justify-between">
                    <div className="flex gap-4 items-center">
                      <div className="bg-[#E2DFD6] p-3 rounded-lg text-gray-500 hidden sm:block">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-gray-900">{agreement.title}</span>
                        <span className="text-xs text-gray-500 mt-1 line-clamp-1">{partiesStr} • {dateStr}</span>
                      </div>
                    </div>
                    {getStatusBadge(agreement.status)}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="flex flex-col gap-4">
          <h2 className="font-bold text-lg text-gray-900">Activity</h2>
          <div className="bg-(--color-bg-card) rounded-lg p-5 flex flex-col gap-6 h-72.5 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none">
            {activityFeed.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                <History className="w-8 h-8 text-gray-300 mb-2" />
                <p className="text-sm font-medium">No recent activity</p>
              </div>
            ) : (
              activityFeed.map((activity, idx) => {
                let activityText = `${activity.actor} ${activity.action.toLowerCase()} this agreement`;
                if (activity.action === 'CREATED') {
                  activityText = `${activity.actor} created '${activity.agreementTitle}'`;
                } else if (activity.action === 'SENT') {
                  activityText = `${activity.actor} sent '${activity.agreementTitle}'`;
                } else if (activity.action === 'SIGNED') {
                  activityText = `${activity.actor} signed '${activity.agreementTitle}'`;
                }

                return (
                  <div key={activity._id || idx} className="flex gap-3">
                    {getActivityIcon(activity.action)}
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-900 line-clamp-1" title={activityText}>
                        {activityText}
                      </span>
                      <span className="text-xs text-gray-500 mt-0.5">{timeAgo(activity.timestamp)}</span>
                    </div>
                  </div>
                );
              })
            )}
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
