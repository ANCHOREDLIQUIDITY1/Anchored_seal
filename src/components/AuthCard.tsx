"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

type AuthMode = "signin" | "register";

export default function AuthCard() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("signin");
  
  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Status State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === "signin") {
        const response = await api.auth.login({ email, password });
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("token", response.token);
        setSuccess("Successfully signed in!");
        router.push("/dashboard");
      } else {
        const response = await api.auth.register({ name, email, password });
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("token", response.token);
        setSuccess("Account created successfully!");
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-(--color-bg-card) rounded-xl p-6 shadow-sm border border-[#E2DFD6]">
      {/* Segmented Control */}
      <div className="flex w-full bg-[#E2DFD6] rounded-full p-1 mb-8">
        <button
          onClick={() => { setMode("signin"); setError(null); setSuccess(null); }}
          className={`flex-1 py-2 text-sm font-semibold rounded-full transition-all duration-200 ${
            mode === "signin" 
              ? "bg-(--color-bg-page) text-gray-900 shadow-sm" 
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => { setMode("register"); setError(null); setSuccess(null); }}
          className={`flex-1 py-2 text-sm font-semibold rounded-full transition-all duration-200 ${
            mode === "register" 
              ? "bg-(--color-bg-page) text-gray-900 shadow-sm" 
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Auth Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {mode === "register" && (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold tracking-wider text-gray-600 uppercase">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Chukwuemeka Obi"
              className="px-4 py-3 bg-(--color-bg-input) border border-(--color-border-input) rounded-(--radius-md) focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm text-gray-900 font-medium placeholder:text-gray-400"
            />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold tracking-wider text-gray-600 uppercase">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="emeka@trustseal.app"
            className="px-4 py-3 bg-(--color-bg-input) border border-(--color-border-input) rounded-(--radius-md) focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm text-gray-900 font-medium placeholder:text-gray-400"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold tracking-wider text-gray-600 uppercase">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="px-4 py-3 bg-(--color-bg-input) border border-(--color-border-input) rounded-(--radius-md) focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm text-gray-900 font-medium tracking-widest placeholder:text-gray-400 placeholder:tracking-normal"
          />
        </div>

        {mode === "signin" && (
          <div className="flex justify-end -mt-2">
            <a href="#" className="text-xs font-bold text-[#3B7B56] hover:text-primary transition-colors">
              Forgot password?
            </a>
          </div>
        )}

        {/* Feedback Messages */}
        {error && <div className="text-sm font-medium text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}
        {success && <div className="text-sm font-medium text-green-600 bg-green-50 p-3 rounded-md">{success}</div>}

        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full bg-(--color-primary) hover:bg-[#153a22] text-white py-3.5 rounded-sm font-bold transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="animate-pulse">Processing...</span>
          ) : (
             mode === "signin" ? "Sign in to TrustSeal" : "Create TrustSeal Account"
          )}
        </button>
      </form>
    </div>
  );
}
