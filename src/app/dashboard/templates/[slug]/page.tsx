"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Handshake, Briefcase, Landmark, ShieldCheck, Users, PenTool,
  ChevronLeft, FileText, ArrowRight, Crown, Clock, Shield,
  List, Tag
} from "lucide-react";
import { getTemplateBySlug } from "@/lib/templates";

const iconMap: Record<string, React.ElementType> = {
  Handshake,
  Briefcase,
  Landmark,
  ShieldCheck,
  Users,
  PenTool,
};

const categoryColorMap: Record<string, { bg: string; text: string; iconBg: string }> = {
  "Business Partnership": { bg: "#E8F3EC", text: "#3B7B56", iconBg: "#D1ECDB" },
  "Freelance Contract": { bg: "#DBEAFE", text: "#1D4ED8", iconBg: "#C7D9F7" },
  "Loan Agreement": { bg: "#FEF3C7", text: "#D97706", iconBg: "#FDEAA4" },
  "NDA": { bg: "#EDE9FE", text: "#7C3AED", iconBg: "#DDD6FE" },
  "Personal Agreement": { bg: "#FCE7F3", text: "#DB2777", iconBg: "#F9C8E0" },
  "Custom Agreement": { bg: "#FFF7ED", text: "#EA580C", iconBg: "#FED7AA" },
};

export default function TemplateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const template = getTemplateBySlug(slug);

  if (!template) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <FileText className="w-12 h-12 text-gray-300" />
        <h2 className="font-bold text-xl text-gray-900">Template not found</h2>
        <p className="text-sm text-gray-500">The template you&apos;re looking for doesn&apos;t exist.</p>
        <button
          onClick={() => router.push("/dashboard/templates")}
          className="bg-[#153A22] hover:bg-[#112d1b] text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors"
        >
          Back to Templates
        </button>
      </div>
    );
  }

  const IconComponent = iconMap[template.icon] || FileText;
  const colors = categoryColorMap[template.category] || {
    bg: "#F3F4F6",
    text: "#4B5563",
    iconBg: "#E5E7EB",
  };

  return (
    <div className="flex flex-col gap-6 pb-10 max-w-4xl">
      {/* Back nav */}
      <button
        onClick={() => router.push("/dashboard/templates")}
        className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors self-start"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Templates
      </button>

      {/* Header Card */}
      <div className="bg-(--color-bg-card) rounded-xl p-6 md:p-8 relative overflow-hidden">
        {/* Premium badge */}
        {template.isPremium && (
          <div className="absolute top-6 right-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
            <Crown className="w-3.5 h-3.5" />
            Premium Template
          </div>
        )}

        <div className="flex items-start gap-5">
          <div
            className="p-4 rounded-xl shrink-0"
            style={{ backgroundColor: colors.iconBg }}
          >
            <IconComponent className="w-8 h-8" style={{ color: colors.text }} />
          </div>
          <div className="flex flex-col gap-2 min-w-0">
            <h1 className="font-bold text-xl md:text-2xl text-gray-900 pr-24">
              {template.name}
            </h1>
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-md self-start"
              style={{ backgroundColor: colors.bg, color: colors.text }}
            >
              {template.category}
            </span>
            <p className="text-sm text-gray-500 leading-relaxed mt-2">
              {template.longDescription}
            </p>
          </div>
        </div>

        {/* Meta badges */}
        <div className="flex flex-wrap gap-3 mt-6 pt-5 border-t border-[#d1cec4]/40">
          <div className="flex items-center gap-2 bg-white/60 px-3 py-2 rounded-lg">
            <List className="w-4 h-4 text-[var(--color-primary)]" />
            <span className="text-sm font-bold text-gray-900">{template.clauses.length} Clauses</span>
          </div>
          <div className="flex items-center gap-2 bg-white/60 px-3 py-2 rounded-lg">
            <Users className="w-4 h-4 text-[#1D4ED8]" />
            <span className="text-sm font-bold text-gray-900">{template.estimatedParties} Parties</span>
          </div>
          <div className="flex items-center gap-2 bg-white/60 px-3 py-2 rounded-lg">
            <Tag className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-bold text-gray-900">
              {template.variables.filter((v) => v.required).length} Required Fields
            </span>
          </div>
          {!template.isPremium && (
            <div className="flex items-center gap-2 bg-[#E8F3EC] px-3 py-2 rounded-lg">
              <span className="text-sm font-bold text-[#3B7B56]">✓ Free</span>
            </div>
          )}
        </div>
      </div>

      {/* Clauses Preview */}
      <div className="flex flex-col gap-4">
        <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
          <Shield className="w-5 h-5 text-[var(--color-primary)]" />
          Pre-written Clauses
        </h2>
        <div className="flex flex-col gap-3">
          {template.clauses.map((clause) => (
            <div
              key={clause.order}
              className="bg-(--color-bg-card) rounded-xl p-5 flex gap-4 items-start"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-sm"
                style={{ backgroundColor: colors.bg, color: colors.text }}
              >
                {clause.order}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {clause.content}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Variables / Fields to Fill */}
      {template.variables.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#D97706]" />
            Fields You&apos;ll Fill In
          </h2>
          <div className="bg-(--color-bg-card) rounded-xl p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {template.variables.map((variable) => (
                <div
                  key={variable.key}
                  className="flex items-center gap-3 bg-white/50 rounded-lg px-4 py-3"
                >
                  <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-gray-900">
                      {variable.label}
                    </span>
                    <span className="text-xs text-gray-400 capitalize">
                      {variable.type} {variable.required ? "• Required" : "• Optional"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CTA Footer */}
      <div className="bg-(--color-bg-card) rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-[var(--color-primary)] shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600">
            Using this template will pre-fill your agreement with the clauses above. You can edit, add, or remove any clause before sending.
          </p>
        </div>
        <Link
          href={`/dashboard/new?template=${template.slug}`}
          className="bg-[#153A22] hover:bg-[#112d1b] text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors text-sm shrink-0 w-full md:w-auto"
        >
          Use This Template
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
