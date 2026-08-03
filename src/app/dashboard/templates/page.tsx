"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Handshake, Briefcase, Landmark, ShieldCheck, Users, PenTool,
  Search, LayoutGrid, Sparkles, FileText, ArrowRight, Eye,
  Crown
} from "lucide-react";
import { templates } from "@/lib/templates";

type CategoryFilter = "All" | string;

// Map icon string keys to actual Lucide components
const iconMap: Record<string, React.ElementType> = {
  Handshake,
  Briefcase,
  Landmark,
  ShieldCheck,
  Users,
  PenTool,
};

// Category color map for visual variety
const categoryColorMap: Record<string, { bg: string; text: string; iconBg: string }> = {
  "Business Partnership": { bg: "#E8F3EC", text: "#3B7B56", iconBg: "#D1ECDB" },
  "Freelance Contract": { bg: "#DBEAFE", text: "#1D4ED8", iconBg: "#C7D9F7" },
  "Loan Agreement": { bg: "#FEF3C7", text: "#D97706", iconBg: "#FDEAA4" },
  "NDA": { bg: "#EDE9FE", text: "#7C3AED", iconBg: "#DDD6FE" },
  "Personal Agreement": { bg: "#FCE7F3", text: "#DB2777", iconBg: "#F9C8E0" },
  "Custom Agreement": { bg: "#FFF7ED", text: "#EA580C", iconBg: "#FED7AA" },
};

const allCategories = [
  "All",
  "Business Partnership",
  "Freelance Contract",
  "Loan Agreement",
  "NDA",
  "Personal Agreement",
  "Custom Agreement",
];

export default function TemplatesPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTemplates = useMemo(() => {
    let filtered = templates;

    if (activeCategory !== "All") {
      filtered = filtered.filter((t) => t.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [activeCategory, searchQuery]);

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="font-bold text-2xl text-gray-900 flex items-center gap-2">
            <LayoutGrid className="w-6 h-6 text-[var(--color-primary)]" />
            Templates
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Start faster with pre-built agreement templates. Customise freely before sending.
          </p>
        </div>
        <Link
          href="/dashboard/new"
          className="bg-[#153A22] hover:bg-[#112d1b] text-white px-5 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors shrink-0 text-sm"
        >
          <Sparkles className="w-4 h-4" />
          Custom Agreement
        </Link>
      </div>

      {/* Category Tabs */}
      <div className="flex w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none">
        <div className="bg-(--color-bg-card) p-1 rounded-xl flex gap-1 whitespace-nowrap min-w-max">
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-lg text-sm transition-all ${
                activeCategory === cat
                  ? "bg-[#153A22] text-white font-bold"
                  : "text-gray-500 font-medium hover:text-gray-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search templates..."
          className="w-full bg-(--color-bg-card) pl-10 pr-4 py-2.5 rounded-lg border-none focus:ring-2 focus:ring-[#153A22]/20 outline-none text-sm font-medium placeholder:text-gray-400 text-gray-900"
        />
      </div>

      {/* Template Cards Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="bg-(--color-bg-card) rounded-xl p-14 flex flex-col items-center justify-center text-center">
          <FileText className="w-10 h-10 text-gray-300 mb-3" />
          <h3 className="font-bold text-gray-900">No templates found</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-xs">
            Try adjusting your search or category filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredTemplates.map((template) => {
            const IconComponent = iconMap[template.icon] || FileText;
            const colors = categoryColorMap[template.category] || {
              bg: "#F3F4F6",
              text: "#4B5563",
              iconBg: "#E5E7EB",
            };

            return (
              <div
                key={template.slug}
                className="bg-(--color-bg-card) rounded-xl p-6 flex flex-col gap-4 group hover:shadow-lg hover:shadow-black/5 transition-all duration-300 relative overflow-hidden"
              >
                {/* Premium badge */}
                {template.isPremium && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <Crown className="w-3 h-3" />
                    Premium
                  </div>
                )}

                {/* Icon + Category */}
                <div className="flex items-start gap-4">
                  <div
                    className="p-3 rounded-xl shrink-0 transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: colors.iconBg }}
                  >
                    <IconComponent
                      className="w-6 h-6"
                      style={{ color: colors.text }}
                    />
                  </div>
                  <div className="flex flex-col min-w-0 pt-0.5">
                    <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-1">
                      {template.name}
                    </h3>
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded-md mt-1.5 self-start"
                      style={{ backgroundColor: colors.bg, color: colors.text }}
                    >
                      {template.category}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 flex-1">
                  {template.description}
                </p>

                {/* Meta info */}
                <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    {template.clauses.length} clauses
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {template.estimatedParties} parties
                  </span>
                  {!template.isPremium && (
                    <span className="text-[#3B7B56] font-bold">Free</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-[#d1cec4]/40">
                  <Link
                    href={`/dashboard/templates/${template.slug}`}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-[#d1cec4] rounded-lg text-sm font-bold text-gray-900 hover:bg-[#E2DFD6] transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </Link>
                  <Link
                    href={`/dashboard/new?template=${template.slug}`}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#153A22] hover:bg-[#112d1b] text-white rounded-lg text-sm font-bold transition-colors"
                  >
                    Use Template
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
