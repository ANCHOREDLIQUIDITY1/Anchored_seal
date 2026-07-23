import { Shield } from "lucide-react";
import AuthCard from "@/components/AuthCard";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-[var(--color-bg-page)]">
      <div className="w-full max-w-md flex flex-col items-center mt-[-5vh]">
        {/* Header Section */}
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-[var(--color-primary)] text-white p-2 rounded-xl shadow-sm">
              <Shield className="w-7 h-7" strokeWidth={2.5} />
            </div>
            <h1 className="font-heading font-extrabold text-3xl tracking-tight text-gray-900">
              TrustSeal
            </h1>
          </div>
          <p className="text-gray-600 text-sm font-medium">
            Digital agreements for the modern world
          </p>
        </div>

        {/* Auth Component */}
        <AuthCard />

        {/* Footer */}
        <p className="mt-8 text-xs font-medium text-gray-500 text-center px-4">
          By continuing, you agree to our <a href="#" className="text-[#3B7B56] hover:text-primary transition-colors">Terms</a> & <a href="#" className="text-[#3B7B56] hover:text-primary transition-colors">Privacy Policy</a>
        </p>
      </div>
    </main>
  );
}
