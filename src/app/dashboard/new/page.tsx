"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Check, ChevronLeft, ChevronRight, Send, Shield, Plus, X, LayoutGrid 
} from "lucide-react";
import { api } from "@/lib/api";
import { getTemplateBySlug } from "@/lib/templates";

type Step = 1 | 2 | 3 | 4;

interface Party {
  name: string;
  email: string;
  role: string;
}

interface Clause {
  order: number;
  content: string;
}

interface FormData {
  title: string;
  category: string;
  description: string;
  value: string;
  expiresAt: string;
  parties: Party[];
  clauses: Clause[];
}

function NewAgreementForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    category: "Freelance Contract",
    description: "",
    value: "",
    expiresAt: "",
    parties: [
      { name: "", email: "", role: "creator" }, // Pre-filled below
      { name: "", email: "", role: "signer" }
    ],
    clauses: [
      { order: 1, content: "" }
    ]
  });

  useEffect(() => {
    // Pre-fill user data for Party 1
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        // Defer state update to avoid synchronous setState warning
        setTimeout(() => {
          setFormData(prev => {
            const newParties = [...prev.parties];
            newParties[0] = { name: user.name || "", email: user.email || "", role: "creator" };
            return { ...prev, parties: newParties };
          });
        }, 0);
      } catch (e: unknown) {
        console.error(e);
      }
    }

    // Pre-fill from template if query param exists
    const templateSlug = searchParams.get("template");
    if (templateSlug) {
      const template = getTemplateBySlug(templateSlug);
      if (template) {
        setTimeout(() => {
          setTemplateName(template.name);
          setFormData(prev => ({
            ...prev,
            title: template.name,
            category: template.category,
            description: template.longDescription,
            clauses: template.clauses.map(c => ({ order: c.order, content: c.content })),
          }));
        }, 0);
      }
    }
  }, [searchParams]);

  const handleNext = () => setCurrentStep(s => Math.min(s + 1, 4) as Step);
  const handlePrev = () => setCurrentStep(s => Math.max(s - 1, 1) as Step);

  const handleAddParty = () => {
    setFormData(prev => ({
      ...prev,
      parties: [...prev.parties, { name: "", email: "", role: "signer" }]
    }));
  };

  const handleRemoveParty = (index: number) => {
    setFormData(prev => ({
      ...prev,
      parties: prev.parties.filter((_, i) => i !== index)
    }));
  };

  const handlePartyChange = (index: number, field: keyof Party, val: string) => {
    setFormData(prev => {
      const p = [...prev.parties];
      p[index] = { ...p[index], [field]: val };
      return { ...prev, parties: p };
    });
  };

  const handleAddClause = () => {
    setFormData(prev => ({
      ...prev,
      clauses: [...prev.clauses, { order: prev.clauses.length + 1, content: "" }]
    }));
  };

  const handleRemoveClause = (index: number) => {
    setFormData(prev => {
      const newClauses = prev.clauses.filter((_, i) => i !== index);
      // Re-order
      newClauses.forEach((c, i) => { c.order = i + 1; });
      return { ...prev, clauses: newClauses };
    });
  };

  const handleClauseChange = (index: number, val: string) => {
    setFormData(prev => {
      const c = [...prev.clauses];
      c[index].content = val;
      return { ...prev, clauses: c };
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      // Filter out empty parties and clauses
      const payload: Partial<FormData> = {
        ...formData,
        parties: formData.parties.filter(p => p.name.trim() !== "" && p.email.trim() !== ""),
        clauses: formData.clauses.filter(c => c.content.trim() !== "")
      };

      if (!payload.expiresAt) {
        delete payload.expiresAt;
      }

      const res = await api.agreements.create(payload as Record<string, unknown>);
      
      // Redirect to the newly created agreement
      if (res.success && res.data && res.data._id) {
        router.push(`/dashboard/agreements/${res.data._id}`);
      } else {
        router.push(`/dashboard/agreements`);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create agreement");
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, label: "Details" },
    { num: 2, label: "Parties" },
    { num: 3, label: "Terms" },
    { num: 4, label: "Review" },
  ];

  return (
    <div className="flex flex-col gap-8 pb-10 mx-auto w-full">
      
      {/* Header */}
      <div>
        <h1 className="font-bold text-2xl text-gray-900">New Agreement</h1>
        <p className="text-gray-500 text-sm mt-1">Create a legally recordable digital agreement</p>
        {templateName && (
          <div className="mt-3 flex items-center gap-2 bg-[#E8F3EC] px-3 py-2 rounded-lg">
            <LayoutGrid className="w-4 h-4 text-[#3B7B56]" />
            <span className="text-xs font-bold text-[#3B7B56]">Using template: {templateName}</span>
          </div>
        )}
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between relative mt-4">
        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-200 -z-10 transform -translate-y-1/2 rounded-full"></div>
        {steps.map((step) => {
          const isActive = currentStep === step.num;
          const isCompleted = currentStep > step.num;

          return (
            <div key={step.num} className="flex flex-col items-center gap-2 bg-[var(--color-bg-page)] px-2">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  isActive || isCompleted ? "bg-[#153A22] text-white" : "bg-[#E2DFD6] text-gray-500"
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" strokeWidth={3} /> : step.num}
              </div>
              <span className={`text-xs font-bold ${isActive || isCompleted ? "text-[#153A22]" : "text-gray-400"}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Form Container */}
      <div className="bg-(--color-bg-card) rounded-xl p-6 md:p-8">
        
        {/* Step 1: Details */}
        {currentStep === 1 && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="font-bold text-lg text-gray-900">Agreement Details</h2>
            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Agreement Title</label>
              <input 
                type="text" 
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="e.g. Freelance Web Development Agreement" 
                className="w-full bg-transparent border border-[#d1cec4] rounded-lg px-4 py-3 focus:border-[#153A22] focus:ring-1 focus:ring-[#153A22] outline-none transition-colors text-sm font-medium text-gray-900"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Category</label>
              <select 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full bg-transparent border border-[#d1cec4] rounded-lg px-4 py-3 focus:border-[#153A22] focus:ring-1 focus:ring-[#153A22] outline-none transition-colors text-sm font-medium text-gray-900 appearance-none"
              >
                <option value="Business Partnership">Business Partnership</option>
                <option value="Freelance Contract">Freelance Contract</option>
                <option value="Loan Agreement">Loan Agreement</option>
                <option value="NDA">NDA</option>
                <option value="Personal Agreement">Personal Agreement</option>
                <option value="Custom Agreement">Custom Agreement</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description / Context</label>
              <textarea 
                rows={3}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Brief description of this agreement's purpose..." 
                className="w-full bg-transparent border border-[#d1cec4] rounded-lg px-4 py-3 focus:border-[#153A22] focus:ring-1 focus:ring-[#153A22] outline-none transition-colors text-sm font-medium text-gray-900 resize-none"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Agreement Value (Optional)</label>
                <input 
                  type="text" 
                  value={formData.value}
                  onChange={e => setFormData({...formData, value: e.target.value})}
                  placeholder="e.g. ₦450,000 or N/A" 
                  className="w-full bg-transparent border border-[#d1cec4] rounded-lg px-4 py-3 focus:border-[#153A22] focus:ring-1 focus:ring-[#153A22] outline-none transition-colors text-sm font-medium text-gray-900"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Deadline / Expiry Date</label>
                <input 
                  type="date" 
                  value={formData.expiresAt}
                  onChange={e => setFormData({...formData, expiresAt: e.target.value})}
                  className="w-full bg-transparent border border-[#d1cec4] rounded-lg px-4 py-3 focus:border-[#153A22] focus:ring-1 focus:ring-[#153A22] outline-none transition-colors text-sm font-medium text-gray-900"
                />
              </div>
            </div>

            <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#d1cec4]/50">
              <button 
                onClick={() => router.push('/dashboard/agreements')}
                className="px-5 py-2.5 border border-[#d1cec4] rounded-lg text-sm font-bold text-gray-900 hover:bg-[#E2DFD6] transition-colors flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" /> Cancel
              </button>
              <button 
                onClick={handleNext}
                disabled={!formData.title.trim()}
                className="bg-[#153A22] hover:bg-[#112d1b] text-white px-6 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors text-sm disabled:opacity-50"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Parties */}
        {currentStep === 2 && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h2 className="font-bold text-lg text-gray-900">Parties Involved</h2>
              <p className="text-sm text-gray-500 mt-1">Add all parties who will sign this agreement. Invitations will be sent via email.</p>
            </div>
            
            <div className="flex flex-col gap-5">
              {formData.parties.map((party, idx) => (
                <div key={idx} className="flex flex-col gap-2 relative">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex justify-between items-center">
                    <span>Party {idx + 1} {idx === 0 ? "(YOU)" : ""}</span>
                    {idx > 1 && (
                      <button onClick={() => handleRemoveParty(idx)} className="text-red-500 hover:text-red-700">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input 
                      type="text" 
                      value={party.name}
                      onChange={e => handlePartyChange(idx, 'name', e.target.value)}
                      placeholder="Full Name" 
                      readOnly={idx === 0}
                      className={`w-full bg-transparent border border-[#d1cec4] rounded-lg px-4 py-3 focus:border-[#153A22] focus:ring-1 focus:ring-[#153A22] outline-none transition-colors text-sm font-medium text-gray-900 ${idx === 0 ? 'opacity-70 cursor-not-allowed bg-gray-50/50' : ''}`}
                    />
                    <input 
                      type="email" 
                      value={party.email}
                      onChange={e => handlePartyChange(idx, 'email', e.target.value)}
                      placeholder="Email Address" 
                      readOnly={idx === 0}
                      className={`w-full bg-transparent border border-[#d1cec4] rounded-lg px-4 py-3 focus:border-[#153A22] focus:ring-1 focus:ring-[#153A22] outline-none transition-colors text-sm font-medium text-gray-900 ${idx === 0 ? 'opacity-70 cursor-not-allowed bg-gray-50/50' : ''}`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={handleAddParty}
              className="px-5 py-2.5 border border-[#d1cec4] rounded-lg text-sm font-bold text-gray-900 hover:bg-[#E2DFD6] transition-colors flex items-center justify-center gap-2 self-start mt-2"
            >
              <Plus className="w-4 h-4" /> Add Another Party
            </button>

            <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#d1cec4]/50">
              <button 
                onClick={handlePrev}
                className="px-5 py-2.5 border border-[#d1cec4] rounded-lg text-sm font-bold text-gray-900 hover:bg-[#E2DFD6] transition-colors flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button 
                onClick={handleNext}
                disabled={formData.parties.some(p => !p.name.trim() || !p.email.trim())}
                className="bg-[#153A22] hover:bg-[#112d1b] text-white px-6 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors text-sm disabled:opacity-50"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Terms */}
        {currentStep === 3 && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h2 className="font-bold text-lg text-gray-900">Terms & Clauses</h2>
              <p className="text-sm text-gray-500 mt-1">Add the specific terms and conditions all parties must agree to.</p>
            </div>
            
            <div className="flex flex-col gap-4">
              {formData.clauses.map((clause, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <div className="mt-3 font-bold text-sm text-[#153A22] w-6 text-center">{clause.order}</div>
                  <div className="flex-1 relative">
                    <textarea 
                      rows={2}
                      value={clause.content}
                      onChange={e => handleClauseChange(idx, e.target.value)}
                      placeholder="e.g. Profit split terms..." 
                      className="w-full bg-transparent border border-[#d1cec4] rounded-lg px-4 py-3 focus:border-[#153A22] focus:ring-1 focus:ring-[#153A22] outline-none transition-colors text-sm font-medium text-gray-900 resize-none"
                    ></textarea>
                    {idx > 0 && (
                      <button onClick={() => handleRemoveClause(idx)} className="absolute top-3 right-3 text-red-500 hover:text-red-700 bg-white rounded-full">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={handleAddClause}
              className="px-5 py-2.5 border border-[#d1cec4] rounded-lg text-sm font-bold text-gray-900 hover:bg-[#E2DFD6] transition-colors flex items-center justify-center gap-2 self-start mt-2"
            >
              <Plus className="w-4 h-4" /> Add Clause
            </button>

            <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#d1cec4]/50">
              <button 
                onClick={handlePrev}
                className="px-5 py-2.5 border border-[#d1cec4] rounded-lg text-sm font-bold text-gray-900 hover:bg-[#E2DFD6] transition-colors flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button 
                onClick={handleNext}
                disabled={formData.clauses[0].content.trim() === ""}
                className="bg-[#153A22] hover:bg-[#112d1b] text-white px-6 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors text-sm disabled:opacity-50"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="font-bold text-lg text-gray-900">Review & Create</h2>
            
            {/* Summary Card */}
            <div className="bg-[#E2DFD6]/50 rounded-xl p-6 border border-[#d1cec4]/50 relative overflow-hidden">
              <div className="absolute top-6 right-6 bg-[#DBEAFE] text-[#1D4ED8] text-xs font-bold px-3 py-1.5 rounded-full">
                Draft
              </div>
              
              <h3 className="font-bold text-xl text-gray-900 pr-20">{formData.title}</h3>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">{formData.category}</p>
              
              <p className="text-sm text-gray-700 mt-4 leading-relaxed">{formData.description}</p>
              
              <div className="flex flex-wrap gap-3 mt-5">
                {formData.parties.filter(p => p.name.trim() !== "").map((party, idx) => (
                  <div key={idx} className="bg-white rounded-full px-3 py-1.5 flex items-center gap-2 shadow-sm border border-[#d1cec4]/30">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${idx === 0 ? "bg-[#153A22]" : "bg-[#1D4ED8]"}`}>
                      {party.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-bold text-gray-900">{party.name.split(" ")[0]}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-col gap-2">
                {formData.clauses.filter(c => c.content.trim() !== "").map((clause, idx) => (
                  <div key={idx} className="flex gap-2 items-start text-sm text-gray-600">
                    <span className="font-bold text-gray-400">§{clause.order}</span>
                    <span className="line-clamp-1">{clause.content}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 text-sm text-gray-600 items-start">
              <Shield className="w-5 h-5 text-[#153A22] shrink-0" />
              <p>This agreement will be stored securely, timestamped, and emailed to all parties for review and digital signing.</p>
            </div>

            {error && (
              <div className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-lg border border-red-200">
                {error}
              </div>
            )}

            <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#d1cec4]/50">
              <button 
                onClick={handlePrev}
                disabled={loading}
                className="px-5 py-2.5 border border-[#d1cec4] rounded-lg text-sm font-bold text-gray-900 hover:bg-[#E2DFD6] transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button 
                onClick={handleSubmit}
                disabled={loading}
                className="bg-[#153A22] hover:bg-[#112d1b] text-white px-6 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors text-sm disabled:opacity-80"
              >
                {loading ? "Creating..." : (
                  <>
                    <Send className="w-4 h-4" /> Create & Send Agreement
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function NewAgreementPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col gap-8 pb-10 animate-pulse">
        <div className="h-20 bg-gray-200 rounded-lg w-full" />
        <div className="h-12 bg-gray-200 rounded-lg w-full max-w-md" />
        <div className="h-96 bg-gray-200 rounded-lg w-full" />
      </div>
    }>
      <NewAgreementForm />
    </Suspense>
  );
}
