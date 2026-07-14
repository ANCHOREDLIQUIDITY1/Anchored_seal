import Link from "next/link";
import { ArrowRight, ShieldCheck, FileSignature, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-6 lg:px-12 h-20 flex items-center justify-between border-b border-foreground/5 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-primary w-8 h-8" />
          <span className="font-heading font-bold text-2xl text-primary">TrustSeal</span>
        </div>
        <nav className="hidden md:flex gap-8 text-sm font-medium">
          <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
          <Link href="#pricing" className="hover:text-primary transition-colors">Pricing</Link>
          <Link href="#faq" className="hover:text-primary transition-colors">FAQ</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/auth/login" className="text-sm font-medium hover:text-primary transition-colors">
            Sign In
          </Link>
          <Link
            href="/auth/register"
            className="text-sm font-medium bg-primary text-white px-5 py-2.5 rounded-md hover:bg-primary/90 transition-all shadow-sm"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 lg:py-32 bg-gradient-to-b from-background to-primary/5">
        <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium border border-accent/20">
            <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse" />
            v1.0 is now live
          </div>
          
          <h1 className="font-heading font-extrabold text-5xl lg:text-7xl leading-tight tracking-tight">
            The Digital Agreement Platform for the <span className="text-primary">Informal Economy</span>.
          </h1>
          
          <p className="text-lg lg:text-xl text-foreground/70 max-w-2xl mx-auto">
            Create, send, and sign legally binding agreements in under 3 minutes. No lawyers, no printing, no in-person meetings required.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/agreements/new"
              className="group flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-lg font-medium text-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Create Free Agreement
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/templates"
              className="px-8 py-4 rounded-lg font-medium text-lg border border-foreground/10 hover:bg-foreground/5 transition-all"
            >
              Browse Templates
            </Link>
          </div>
        </div>

        {/* Value Props Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl w-full mt-24">
          <div className="flex flex-col items-center text-center p-6 space-y-4 rounded-xl bg-background shadow-sm border border-foreground/5 hover:border-primary/20 transition-colors">
            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-xl">Lightning Fast</h3>
            <p className="text-foreground/70 text-sm">Draft an agreement on your phone and get it signed in WhatsApp in minutes.</p>
          </div>
          
          <div className="flex flex-col items-center text-center p-6 space-y-4 rounded-xl bg-background shadow-sm border border-foreground/5 hover:border-accent/20 transition-colors">
            <div className="h-12 w-12 bg-accent/10 rounded-full flex items-center justify-center text-accent">
              <FileSignature className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-xl">Legally Binding</h3>
            <p className="text-foreground/70 text-sm">Every signature is recorded with IP and timestamp on a tamper-proof PDF.</p>
          </div>
          
          <div className="flex flex-col items-center text-center p-6 space-y-4 rounded-xl bg-background shadow-sm border border-foreground/5 hover:border-primary/20 transition-colors">
            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-xl">Total Security</h3>
            <p className="text-foreground/70 text-sm">Your documents are encrypted and accessible only to authorized parties.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
