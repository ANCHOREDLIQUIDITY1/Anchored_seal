"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { 
  FileText, Search, List, LayoutGrid, Eye, Download, Plus, Check, AlertCircle, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { IAgreement } from "@/types";

type TabType = "all" | "signed" | "pending" | "expired";

export default function AgreementsPage() {
  const [agreements, setAgreements] = useState<IAgreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const fetchAgreements = async () => {
      try {
        const response = await api.agreements.getAll();
        setAgreements(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to load agreements");
      } finally {
        setLoading(false);
      }
    };
    
    if (localStorage.getItem("token")) {
      fetchAgreements();
    } else {
      // Defer state update to avoid synchronous setState warning
      setTimeout(() => setLoading(false), 0);
    }
  }, []);

  // Compute stats for tabs
  const counts = useMemo(() => {
    return {
      all: agreements.length,
      signed: agreements.filter(a => a.status === 'signed').length,
      pending: agreements.filter(a => a.status === 'pending' || a.status === 'partially_signed').length,
      expired: agreements.filter(a => a.status === 'expired').length,
    };
  }, [agreements]);

  // Filter agreements based on tab and search query
  const filteredAgreements = useMemo(() => {
    let filtered = agreements;

    // Filter by tab
    if (activeTab === "signed") {
      filtered = filtered.filter(a => a.status === "signed");
    } else if (activeTab === "pending") {
      filtered = filtered.filter(a => a.status === "pending" || a.status === "partially_signed");
    } else if (activeTab === "expired") {
      filtered = filtered.filter(a => a.status === "expired");
    }

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(a => {
        const titleMatch = a.title.toLowerCase().includes(q);
        const partyMatch = a.parties.some(p => p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q));
        return titleMatch || partyMatch;
      });
    }

    // Sort chronologically descending
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [agreements, activeTab, searchQuery]);

  const handleDownloadPDF = async (e: React.MouseEvent, agreement: IAgreement) => {
    e.preventDefault(); // Prevent navigating to View page if wrapped in link
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
    
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.text(agreement.title, 20, 20);
      
      doc.setFontSize(12);
      doc.text(`Category: ${agreement.category}`, 20, 30);
      doc.text(`Status: ${agreement.status}`, 20, 38);
      if (agreement.value) doc.text(`Value: ${agreement.value}`, 20, 46);
      
      doc.text(`Created: ${new Date(agreement.createdAt).toLocaleDateString()}`, 20, 54);
      
      // Description
      let yPos = 66;
      if (agreement.description) {
        doc.setFontSize(14);
        doc.text("Description", 20, yPos);
        yPos += 8;
        doc.setFontSize(10);
        const splitDesc = doc.splitTextToSize(agreement.description, 170);
        doc.text(splitDesc, 20, yPos);
        yPos += (splitDesc.length * 5) + 10;
      }
      
      // Parties
      doc.setFontSize(14);
      doc.text("Parties Involved", 20, yPos);
      yPos += 8;
      
      agreement.parties.forEach((party, idx) => {
        if (yPos > 270) { doc.addPage(); yPos = 20; }
        doc.setFontSize(11);
        doc.text(`${party.name} (${party.email}) - ${party.role}`, 20, yPos);
        yPos += 6;
        doc.setFontSize(9);
        doc.text(`Status: ${party.status}`, 25, yPos);
        yPos += 8;
      });
      
      // Clauses
      yPos += 5;
      if (yPos > 250) { doc.addPage(); yPos = 20; }
      doc.setFontSize(14);
      doc.text("Terms & Clauses", 20, yPos);
      yPos += 8;
      
      agreement.clauses.forEach((clause) => {
        if (yPos > 270) { doc.addPage(); yPos = 20; }
        doc.setFontSize(11);
        doc.text(`${clause.order}.`, 20, yPos);
        
        const splitClause = doc.splitTextToSize(clause.content, 160);
        doc.text(splitClause, 30, yPos);
        yPos += (splitClause.length * 5) + 5;
      });
      
      // TrustSeal Footer
      if (agreement.status === 'signed') {
        if (yPos > 260) { doc.addPage(); yPos = 20; }
        yPos += 15;
        doc.setFontSize(12);
        doc.setTextColor(21, 58, 34); // Green color
        doc.text("SEALED - TRUSTSEAL", 20, yPos);
      }
      
      doc.save(`${agreement.title.replace(/\s+/g, '_')}_Agreement.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF", error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'signed':
        return <span className="bg-[#E8F3EC] text-[#3B7B56] text-xs font-bold px-2 py-0.5 rounded-md">Signed</span>;
      case 'pending':
      case 'partially_signed':
        return <span className="bg-[#FEF3C7] text-[#D97706] text-xs font-bold px-2 py-0.5 rounded-md">Pending</span>;
      case 'expired':
        return <span className="bg-[#FEE2E2] text-[#DC2626] text-xs font-bold px-2 py-0.5 rounded-md">Expired</span>;
      case 'draft':
        return <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-md">Draft</span>;
      default:
        return <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-md capitalize">{status.replace('_', ' ')}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-8 pb-10 animate-pulse">
        <div className="h-20 bg-gray-200 rounded-lg w-full"></div>
        <div className="h-12 bg-gray-200 rounded-lg w-full max-w-md"></div>
        <div className="h-96 bg-gray-200 rounded-lg w-full"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-10 relative">
      {/* Floating Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 right-6 md:absolute md:top-0 md:right-0 z-50 bg-[#1e1e24] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-4"
          >
            <div className="bg-[#3B7B56] p-1 rounded-md">
              <Check className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium text-sm pr-4">PDF download started</span>
            <button onClick={() => setShowToast(false)} className="text-gray-400 hover:text-white ml-2">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="font-bold text-2xl text-gray-900">Agreements</h1>
          <p className="text-gray-500 text-sm mt-1">{counts.all} total agreements</p>
        </div>
        <Link 
          href="/dashboard/new"
          className="bg-[#153A22] hover:bg-[#112d1b] text-white px-5 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          New Agreement
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium text-sm">{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex w-full md:w-auto overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none">
        <div className="bg-(--color-bg-card) p-1 rounded-xl flex gap-1 whitespace-nowrap min-w-max">
          <button 
            onClick={() => setActiveTab("all")}
            className={`px-4 py-1.5 rounded-lg text-sm transition-all flex items-center gap-1.5 ${
              activeTab === "all" ? "bg-[#153A22] text-white font-bold" : "text-gray-500 font-medium hover:text-gray-900"
            }`}
          >
            All <span className="opacity-70 text-[11px]">({counts.all})</span>
          </button>
          <button 
            onClick={() => setActiveTab("signed")}
            className={`px-4 py-1.5 rounded-lg text-sm transition-all flex items-center gap-1.5 ${
              activeTab === "signed" ? "bg-[#153A22] text-white font-bold" : "text-gray-500 font-medium hover:text-gray-900"
            }`}
          >
            Signed <span className="opacity-70 text-[11px]">({counts.signed})</span>
          </button>
          <button 
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-1.5 rounded-lg text-sm transition-all flex items-center gap-1.5 ${
              activeTab === "pending" ? "bg-[#153A22] text-white font-bold" : "text-gray-500 font-medium hover:text-gray-900"
            }`}
          >
            Pending <span className="opacity-70 text-[11px]">({counts.pending})</span>
          </button>
          <button 
            onClick={() => setActiveTab("expired")}
            className={`px-4 py-1.5 rounded-lg text-sm transition-all flex items-center gap-1.5 ${
              activeTab === "expired" ? "bg-[#153A22] text-white font-bold" : "text-gray-500 font-medium hover:text-gray-900"
            }`}
          >
            Expired <span className="opacity-70 text-[11px]">({counts.expired})</span>
          </button>
        </div>
      </div>

      {/* Search and Layout Toggle */}
      <div className="flex flex-col md:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search agreements, parties..."
            className="w-full bg-(--color-bg-card) pl-10 pr-4 py-2.5 rounded-lg border-none focus:ring-2 focus:ring-[#153A22]/20 outline-none text-sm font-medium placeholder:text-gray-400 text-gray-900"
          />
        </div>
        <div className="flex bg-(--color-bg-card) p-1 rounded-lg w-full md:w-auto justify-end">
          <button className="p-1.5 bg-[#E2DFD6] rounded-md shadow-sm text-gray-900 transition-all">
            <List className="w-4 h-4" strokeWidth={2.5} />
          </button>
          <button className="p-1.5 text-gray-400 hover:text-gray-900 transition-all">
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Agreement List */}
      <div className="flex flex-col gap-3 mt-2">
        {filteredAgreements.length === 0 ? (
          <div className="bg-(--color-bg-card) rounded-xl p-10 flex flex-col items-center justify-center text-center">
            <FileText className="w-10 h-10 text-gray-300 mb-3" />
            <h3 className="font-bold text-gray-900">No agreements found</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-xs">
              {searchQuery ? "Try adjusting your search query." : "No agreements match this category."}
            </p>
          </div>
        ) : (
          filteredAgreements.map((agreement) => {
            const dateStr = new Date(agreement.createdAt).toISOString().split('T')[0];
            const partiesStr = agreement.parties.map(p => p.name).join(' • ');

            return (
              <div key={agreement._id} className="bg-(--color-bg-card) rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex gap-4 items-center overflow-hidden">
                  <div className="bg-[#E8F3EC] p-3 rounded-lg text-[#3B7B56] shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold text-gray-900 text-sm md:text-base truncate">
                        {agreement.title}
                      </span>
                      {getStatusBadge(agreement.status)}
                    </div>
                    <span className="text-xs text-gray-500 truncate">
                      {partiesStr} • Created {dateStr}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 md:ml-4">
                  <Link 
                    href={`/dashboard/agreements/${agreement._id}`}
                    className="flex items-center gap-2 px-4 py-2 border border-[#d1cec4] bg-transparent hover:bg-[#E2DFD6] rounded-lg text-sm font-bold text-gray-900 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </Link>
                  <button 
                    onClick={(e) => handleDownloadPDF(e, agreement)}
                    className="flex items-center gap-2 px-4 py-2 border border-[#d1cec4] bg-transparent hover:bg-[#E2DFD6] rounded-lg text-sm font-bold text-gray-900 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    PDF
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
