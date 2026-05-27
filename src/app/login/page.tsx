"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Key, Eye, EyeOff, Loader2 } from "lucide-react";

function LoginContent() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  const isRegistered = searchParams.get("registered") === "true" || searchParams.get("registered") === "";
  const initialSuccess = isRegistered ? "Account secured! You can now access the vault." : null;
  const [success, setSuccess] = useState<string | null>(null);

  const displaySuccess = success || initialSuccess;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null); // clears both success messages if we transition away from it via form submission.

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid access credentials. Check your email or key.");
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-nebula-bg p-4 relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-nebula-tertiary/5 rounded-full filter blur-[100px]" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-nebula-primary/5 rounded-full filter blur-[100px]" />

      <div className="w-full max-w-md space-y-8 glass p-10 rounded-nebula relative z-10 border border-black/10 shadow-2xl">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-nebula-secondary/20 rounded-nebula-inner flex items-center justify-center text-nebula-secondary shadow-lg shadow-nebula-secondary/10">
            <Key size={32} />
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black tracking-tighter uppercase italic">Access Vault</h1>
            <p className="text-sm text-nebula-on-surface/40 tracking-wide font-medium">Verify your style identity to continue.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-nebula-inner text-red-500 text-xs text-center font-bold uppercase tracking-widest animate-shake">
              {error}
            </div>
          )}

          {displaySuccess && (
            <div className="p-4 bg-nebula-primary/10 border border-nebula-primary/20 rounded-nebula-inner text-nebula-primary text-xs text-center font-bold uppercase tracking-widest">
              {displaySuccess}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-nebula-on-surface/40 ml-1">Identity Endpoint</label>
              <input 
                name="email"
                required
                type="email" 
                placeholder="you@nebula.com"
                className="w-full bg-black/5 border border-black/10 rounded-nebula-inner px-4 py-3 outline-none focus:border-nebula-secondary/50 focus:bg-black/10 transition-all text-sm"
              />
            </div>

            <div className="space-y-2 relative">
              <label className="text-xs font-bold uppercase tracking-widest text-nebula-on-surface/40 ml-1">Encryption Key</label>
              <div className="relative">
                <input 
                  name="password"
                  required
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••"
                  className="w-full bg-black/5 border border-black/10 rounded-nebula-inner px-4 py-3 outline-none focus:border-nebula-secondary/50 focus:bg-black/10 transition-all text-sm pr-12"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-nebula-on-surface/30 hover:text-nebula-on-surface transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="flex justify-end pt-1">
                <Link href="/forgot-password" className="text-xs font-bold text-nebula-primary hover:underline underline-offset-4">
                  Forgot Password?
                </Link>
              </div>
            </div>
          </div>

          <button 
            disabled={loading}
            type="submit" 
            className="w-full py-4 bg-nebula-secondary text-nebula-bg font-black rounded-full flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-nebula-secondary/20 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Unlock Closet"}
          </button>
        </form>

        <div className="text-center pt-4">
          <p className="text-sm text-nebula-on-surface/40 font-medium">
            New to the network?{" "}
            <Link href="/register" className="text-nebula-primary font-bold hover:underline underline-offset-4">
              Get an Identity
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-nebula-bg text-nebula-primary"><Loader2 className="animate-spin" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
