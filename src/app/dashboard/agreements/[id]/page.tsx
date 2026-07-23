"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Shield, X, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { IAgreement, IParty } from "@/types";

export default function AgreementViewPage() {
  const params = useParams();
  const router = useRouter();
  const [agreement, setAgreement] = useState<IAgreement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Get current user to show "You" label
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {}
    }

    const fetchAgreement = async () => {
      try {
        const id = params.id as string;
        const res = await api.agreements.getById(id);
        setAgreement(res.data);
      } catch (err: any) {
        setError(err.message || "Failed to load agreement");
      } finally {
        setLoading(false);
      }
    };

    fetchAgreement();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#153A22] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !agreement) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg flex items-center gap-2 max-w-2xl mx-auto mt-10">
        <AlertCircle className="w-5 h-5" />
        <span className="font-medium text-sm">{error || "Agreement not found"}</span>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const isCurrentUser = (email: string) => {
    return currentUser?.email === email;
  };

  const dateStr = new Date(agreement.createdAt).toISOString().split('T')[0];
  const completedDateStr = agreement.completedAt ? new Date(agreement.completedAt).toISOString().split('T')[0] : "Pending";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'signed':
        return <span className="bg-[#E8F3EC] text-[#3B7B56] text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider">Signed</span>;
      case 'pending':
      case 'partially_signed':
        return <span className="bg-[#FEF3C7] text-[#D97706] text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider">Pending</span>;
      case 'expired':
        return <span className="bg-[#FEE2E2] text-[#DC2626] text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider">Expired</span>;
      case 'draft':
        return <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider">Draft</span>;
      default:
        return <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider">{status.replace('_', ' ')}</span>;
    }
  };

  // Avatar colors
  const avatarColors = ["bg-[#153A22]", "bg-[#1E3A8A]", "bg-[#9333EA]", "bg-[#B45309]"];

  return (
    <div className="flex flex-col items-center pb-10">
      <div className="w-full max-w-3xl bg-[#FCFBF8] rounded-2xl shadow-sm border border-[#E8E6DF] overflow-hidden relative">
        
        {/* Header Section */}
        <div className="p-6 md:p-8 border-b border-[#E8E6DF]/50">
          <button 
            onClick={() => router.back()}
            className="absolute top-6 right-6 p-2 bg-[#F2F0E8] hover:bg-[#EAE7DF] rounded-xl transition-colors text-gray-500 hover:text-gray-900"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-3">
            {getStatusBadge(agreement.status)}
            <span className="text-xs font-medium text-gray-500">{agreement.category}</span>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 pr-12">{agreement.title}</h1>
        </div>

        {/* Content Section */}
        <div className="p-6 md:p-8 flex flex-col gap-8">
          
          {/* Parties Involved */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Parties Involved</h3>
            <div className="flex flex-wrap gap-3">
              {agreement.parties.map((party, idx) => {
                const isMe = isCurrentUser(party.email);
                const colorClass = avatarColors[idx % avatarColors.length];
                
                return (
                  <div key={idx} className="bg-[#F2F0E8] rounded-full pl-1.5 pr-4 py-1.5 flex items-center gap-3 shadow-sm border border-[#E8E6DF]/50">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${colorClass}`}>
                      {getInitials(party.name)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">{party.name}</span>
                      {isMe && <span className="text-[10px] font-bold text-[#3B7B56] bg-[#E8F3EC] px-1.5 py-0.5 rounded uppercase tracking-wider">You</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grid Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-[#F2F0E8] p-4 rounded-xl border border-[#E8E6DF]/50">
              <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Created</h4>
              <p className="text-sm font-bold text-gray-900">{dateStr}</p>
            </div>
            <div className="bg-[#F2F0E8] p-4 rounded-xl border border-[#E8E6DF]/50">
              <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Signed</h4>
              <p className="text-sm font-bold text-gray-900">{completedDateStr}</p>
            </div>
            <div className="bg-[#F2F0E8] p-4 rounded-xl border border-[#E8E6DF]/50">
              <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Value</h4>
              <p className="text-sm font-bold text-gray-900">{agreement.value || "N/A"}</p>
            </div>
            <div className="bg-[#F2F0E8] p-4 rounded-xl border border-[#E8E6DF]/50">
              <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Category</h4>
              <p className="text-sm font-bold text-gray-900">{agreement.category}</p>
            </div>
          </div>

          {/* Description */}
          {agreement.description && (
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Description</h3>
              <p className="text-sm text-gray-700 leading-relaxed bg-[#F2F0E8] p-4 rounded-xl border border-[#E8E6DF]/50">
                {agreement.description}
              </p>
            </div>
          )}

          {/* Key Terms & Clauses */}
          {agreement.clauses && agreement.clauses.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Key Terms & Clauses</h3>
              <div className="flex flex-col gap-2">
                {agreement.clauses.map((clause, idx) => (
                  <div key={idx} className="bg-[#F2F0E8] rounded-xl p-4 flex gap-4 items-start border border-[#E8E6DF]/50">
                    <span className="text-sm font-bold text-[#3B7B56] mt-0.5 min-w-[20px]">{clause.order}</span>
                    <span className="text-sm text-gray-800 leading-relaxed">{clause.content}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Seal */}
          <div className="flex justify-center mt-6 mb-2">
            <div className="w-28 h-28 rounded-full border-[3px] border-[#153A22] flex flex-col items-center justify-center p-2 relative">
              {/* Inner ring */}
              <div className="absolute inset-1 rounded-full border border-[#153A22]/20"></div>
              <Shield className="w-8 h-8 text-[#153A22] mb-1" strokeWidth={1.5} />
              <div className="text-center">
                <p className="text-[10px] font-black tracking-widest text-[#153A22] uppercase leading-tight">Sealed</p>
                <p className="text-[8px] font-bold tracking-widest text-[#153A22]/70 uppercase leading-tight mt-0.5">TrustSeal</p>
              </div>
            </div>
          </div>

          {/* Audit Trail */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Audit Trail</h3>
            <div className="bg-[#F2F0E8] rounded-xl p-4 flex flex-col md:flex-row justify-between md:items-center gap-2 border border-[#E8E6DF]/50">
              <span className="text-sm text-gray-800 font-medium">Agreement created</span>
              <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                {new Date(agreement.createdAt).toLocaleString(undefined, {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })}
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
