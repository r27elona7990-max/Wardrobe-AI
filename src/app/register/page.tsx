"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/app/actions/register";
import { Shirt, ArrowRight, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const result = await registerUser(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/login?registered=true");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-nebula-bg p-4 relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-nebula-primary/5 rounded-full filter blur-[100px] -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-nebula-secondary/5 rounded-full filter blur-[100px] translate-x-1/2 translate-y-1/2" />

      <div className="w-full max-w-md space-y-8 glass p-10 rounded-nebula relative z-10 border border-black/10 shadow-2xl">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-nebula-primary/20 rounded-nebula-inner flex items-center justify-center text-nebula-primary shadow-lg shadow-nebula-primary/10">
            <Shirt size={32} />
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black tracking-tighter">Create Your Account</h1>
            <p className="text-sm text-nebula-on-surface/40">Secure your digital closet identity.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-nebula-inner text-red-500 text-xs text-center font-bold uppercase tracking-widest">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-nebula-on-surface/40 ml-1">Stage Name / Name</label>
              <input 
                name="name"
                required
                type="text" 
                placeholder="Style Icon"
                className="w-full bg-black/5 border border-black/10 rounded-nebula-inner px-4 py-3 outline-none focus:border-nebula-primary/50 focus:bg-black/10 transition-all text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-nebula-on-surface/40 ml-1">Email Base</label>
              <input 
                name="email"
                required
                type="email" 
                placeholder="you@nebula.com"
                className="w-full bg-black/5 border border-black/10 rounded-nebula-inner px-4 py-3 outline-none focus:border-nebula-primary/50 focus:bg-black/10 transition-all text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-nebula-on-surface/40 ml-1">Encryption Key (Password)</label>
              <input 
                name="password"
                required
                type="password" 
                placeholder="••••••••"
                className="w-full bg-black/5 border border-black/10 rounded-nebula-inner px-4 py-3 outline-none focus:border-nebula-primary/50 focus:bg-black/10 transition-all text-sm"
              />
            </div>
          </div>

          <button 
            disabled={loading}
            type="submit" 
            className="w-full py-4 bg-nebula-primary text-nebula-bg font-black rounded-full flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-nebula-primary/20 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                <span>Secure Access</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-4">
          <p className="text-sm text-nebula-on-surface/40">
            Already in the network?{" "}
            <Link href="/login" className="text-nebula-secondary font-bold hover:underline underline-offset-4">
              Access Vault
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
