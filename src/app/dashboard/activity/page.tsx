"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { 
  History, Search, PenTool, Send, Eye, PlusSquare, 
  Download, Filter, ArrowUpRight, FileText, AlertCircle 
} from "lucide-react";
import { api } from "@/lib/api";
import { IAgreement, IAuditTrail } from "@/types";

interface ActivityItem extends IAuditTrail {
  agreementId: string;
  agreementTitle: string;
  partiesCount: number;
}

type ActionFilter = "all" | "signed" | "sent" | "created" | "other";

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

export default function ActivityPage() {
  const [agreements, setAgreements] = useState<IAgreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<ActionFilter>("all");
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("");

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed.email) setCurrentUserEmail(parsed.email.toLowerCase());
      }
    } catch (e) {}

    const fetchAgreements = async () => {
      try {
        const response = await api.agreements.getAll();
        setAgreements(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to load activity log");
      } finally {
        setLoading(false);
      }
    };

    if (localStorage.getItem("token")) {
      fetchAgreements();
    } else {
      setTimeout(() => setLoading(false), 0);
    }
  }, []);

  // Compute all activities sorted chronologically descending
  const activityFeed: ActivityItem[] = useMemo(() => {
    const allEvents: ActivityItem[] = [];

    agreements.forEach((a) => {
      if (a.auditTrail && Array.isArray(a.auditTrail)) {
        a.auditTrail.forEach((event) => {
          allEvents.push({
            ...event,
            agreementId: a._id,
            agreementTitle: a.title,
            partiesCount: a.parties?.length || 1,
          });
        });
      }
    });

    return allEvents.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [agreements]);

  // Filter and search activities
  const filteredActivities = useMemo(() => {
    return activityFeed.filter((item) => {
      const actionUpper = item.action.toUpperCase();
      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "signed" && actionUpper === "SIGNED") ||
        (activeFilter === "sent" && (actionUpper === "SENT" || actionUpper === "INVITED")) ||
        (activeFilter === "created" && actionUpper === "CREATED") ||
        (activeFilter === "other" &&
          !["SIGNED", "SENT", "INVITED", "CREATED"].includes(actionUpper));

      if (!matchesFilter) return false;

      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const actorMatch = item.actor?.toLowerCase().includes(query);
        const titleMatch = item.agreementTitle?.toLowerCase().includes(query);
        const actionMatch = item.action?.toLowerCase().includes(query);
        return actorMatch || titleMatch || actionMatch;
      }

      return true;
    });
  }, [activityFeed, activeFilter, searchQuery]);

  const getActorLabel = (actor: string) => {
    if (!actor || actor === "Creator" || actor.toLowerCase() === currentUserEmail) {
      return "You";
    }
    // Convert email to clean display name if it contains '@'
    if (actor.includes("@")) {
      const prefix = actor.split("@")[0];
      return prefix
        .split(/[._-]/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
    }
    return actor;
  };

  const getActivityIcon = (action: string) => {
    switch (action.toUpperCase()) {
      case "SIGNED":
        return (
          <div className="w-10 h-10 rounded-xl bg-[#E8F3EC] text-[#3B7B56] flex items-center justify-center shrink-0">
            <PenTool className="w-5 h-5" />
          </div>
        );
      case "SENT":
      case "INVITED":
        return (
          <div className="w-10 h-10 rounded-xl bg-[#DBEAFE] text-[#1D4ED8] flex items-center justify-center shrink-0">
            <Send className="w-5 h-5" />
          </div>
        );
      case "CREATED":
        return (
          <div className="w-10 h-10 rounded-xl bg-[#FEF3C7]/80 text-[#D97706] flex items-center justify-center shrink-0">
            <PlusSquare className="w-5 h-5" />
          </div>
        );
      case "DOWNLOADED":
      case "DOWNLOAD":
        return (
          <div className="w-10 h-10 rounded-xl bg-[#E2DFD6] text-gray-800 flex items-center justify-center shrink-0">
            <Download className="w-5 h-5" />
          </div>
        );
      case "VIEWED":
        return (
          <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center shrink-0">
            <Eye className="w-5 h-5" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-xl bg-[#E2DFD6] text-gray-500 flex items-center justify-center shrink-0">
            <History className="w-5 h-5" />
          </div>
        );
    }
  };

  const getStatusBadge = (action: string) => {
    const act = action.toLowerCase();
    switch (act) {
      case "signed":
        return (
          <span className="bg-[#D1FAE5] text-[#059669] font-extrabold text-xs px-3.5 py-1 rounded-full lowercase tracking-wide shrink-0">
            signed
          </span>
        );
      case "sent":
      case "invited":
        return (
          <span className="bg-[#DBEAFE] text-[#1D4ED8] font-extrabold text-xs px-3.5 py-1 rounded-full lowercase tracking-wide shrink-0">
            sent
          </span>
        );
      case "created":
        return (
          <span className="bg-white/80 text-gray-700 font-extrabold text-xs px-3.5 py-1 rounded-full lowercase tracking-wide border border-[#d1cec4]/50 shrink-0">
            created
          </span>
        );
      case "downloaded":
      case "download":
        return (
          <span className="bg-[#E2DFD6] text-gray-800 font-extrabold text-xs px-3.5 py-1 rounded-full lowercase tracking-wide shrink-0">
            download
          </span>
        );
      case "viewed":
        return (
          <span className="bg-[#EDE9FE] text-[#7C3AED] font-extrabold text-xs px-3.5 py-1 rounded-full lowercase tracking-wide shrink-0">
            viewed
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-700 font-extrabold text-xs px-3.5 py-1 rounded-full lowercase tracking-wide shrink-0">
            {act}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 pb-10 animate-pulse max-w-4xl mx-auto w-full">
        <div className="h-16 bg-gray-200 rounded-lg w-full max-w-sm"></div>
        <div className="h-12 bg-gray-200 rounded-lg w-full"></div>
        <div className="h-96 bg-gray-200 rounded-xl w-full"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-12 mx-auto w-full">
      {/* Title & Subtitle */}
      <div>
        <h1 className="font-bold text-2xl md:text-3xl text-gray-900 tracking-tight">
          Activity Log
        </h1>
        <p className="text-gray-500 text-sm font-medium mt-1">
          Complete history of all agreement actions
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="font-medium text-sm">{error}</span>
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none">
          <div className="bg-(--color-bg-card) p-1 rounded-xl flex gap-1 whitespace-nowrap">
            {(["all", "signed", "sent", "created", "other"] as ActionFilter[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  activeFilter === filter
                    ? "bg-[#153A22] text-white"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {filter === "all" ? `All (${activityFeed.length})` : filter}
              </button>
            ))}
          </div>
        </div>

        <div className="relative shrink-0 w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search activities..."
            className="w-full bg-(--color-bg-card) pl-9 pr-4 py-2 rounded-xl text-xs font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#153A22]/20 transition-all"
          />
        </div>
      </div>

      {/* Activity List Card */}
      <div className="bg-(--color-bg-card) rounded-2xl border border-[#DCD8CC]/50 overflow-hidden">
        {filteredActivities.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="bg-[#E2DFD6] p-4 rounded-full mb-4 text-gray-400">
              <History className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-gray-900 text-base">No activity records found</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm">
              {searchQuery || activeFilter !== "all"
                ? "No actions matched your active filter or search criteria."
                : "When agreements are created, sent, viewed, or signed, all events will appear here in chronological order."}
            </p>
            {activityFeed.length === 0 && (
              <Link
                href="/dashboard/new"
                className="mt-6 bg-[#153A22] hover:bg-[#112d1b] text-white px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2"
              >
                Create Agreement
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#DCD8CC]/60">
            {filteredActivities.map((activity, idx) => {
              const actorLabel = getActorLabel(activity.actor);
              const isYou = actorLabel === "You";

              // Construct intuitive sentence based on action
              let actionPhrase = "interacted with";
              const actionUpper = activity.action.toUpperCase();
              if (actionUpper === "SIGNED") actionPhrase = "signed";
              else if (actionUpper === "SENT") {
                actionPhrase = activity.partiesCount > 1 
                  ? `sent to ${activity.partiesCount} parties` 
                  : "sent";
              }
              else if (actionUpper === "CREATED") actionPhrase = "created";
              else if (actionUpper === "VIEWED") actionPhrase = "viewed";
              else if (actionUpper === "DOWNLOADED" || actionUpper === "DOWNLOAD") actionPhrase = "downloaded as PDF";
              else if (actionUpper === "INVITED") actionPhrase = "was invited to sign";
              else actionPhrase = activity.action.toLowerCase();

              // Special format for sent with parties or invited
              let displayText: React.ReactNode;
              if (actionUpper === "SENT" && activity.partiesCount > 1) {
                displayText = (
                  <>
                    <span className="font-bold text-gray-900">{actorLabel}</span> sent &apos;<span className="font-bold text-gray-900">{activity.agreementTitle}</span>&apos; to {activity.partiesCount} parties
                  </>
                );
              } else if (actionUpper === "DOWNLOADED" || actionUpper === "DOWNLOAD") {
                displayText = (
                  <>
                    <span className="font-bold text-gray-900">{actorLabel}</span> downloaded &apos;<span className="font-bold text-gray-900">{activity.agreementTitle}</span>&apos; as PDF
                  </>
                );
              } else {
                displayText = (
                  <>
                    <span className="font-bold text-gray-900">{actorLabel}</span> {actionPhrase} &apos;<span className="font-bold text-gray-900">{activity.agreementTitle}</span>&apos;
                  </>
                );
              }

              return (
                <Link
                  key={activity._id || `${activity.agreementId}-${idx}`}
                  href={`/dashboard/agreements/${activity.agreementId}`}
                  className="flex items-center justify-between p-4 sm:px-6 hover:bg-white/40 transition-colors duration-150 group"
                >
                  <div className="flex items-center gap-4 min-w-0 pr-4">
                    {getActivityIcon(activity.action)}

                    <div className="flex flex-col min-w-0">
                      <p className="text-sm text-gray-700 font-medium truncate leading-tight group-hover:text-gray-950 transition-colors">
                        {displayText}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 font-medium">
                          {timeAgo(activity.timestamp)}
                        </span>
                        {activity.details && (
                          <span className="text-[11px] text-gray-400 truncate hidden sm:inline">
                            • {activity.details}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {getStatusBadge(activity.action)}
                    <ArrowUpRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0.5 -translate-x-1 hidden sm:block" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
