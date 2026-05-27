"use client";

import { useSession, signOut } from "next-auth/react";
import { UserCircle, LogOut, Settings, Bell, Shirt, Shield } from "lucide-react";

interface ProfileClientProps {
  initialClothingCount: number;
  initialOutfitCount: number;
}

export default function ProfileClient({
  initialClothingCount,
  initialOutfitCount
}: ProfileClientProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-nebula-primary/30 border-t-nebula-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Profile Card */}
      <section className="glass rounded-nebula p-8 border border-black/5 relative overflow-hidden">
        {/* Decorative blurry blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-nebula-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-nebula-tertiary/10 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-nebula-primary to-nebula-secondary p-1 flex-shrink-0 animate-pulse">
             <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-nebula-on-surface">
               <UserCircle size={64} className="opacity-20" />
             </div>
          </div>
          
          <div className="text-center md:text-left flex-1 space-y-4">
            <div>
              <h1 className="text-4xl font-black tracking-tighter text-nebula-on-surface">
                {session?.user?.name || "Style Icon"}
              </h1>
              <p className="font-bold text-nebula-on-surface/50 tracking-widest uppercase text-sm mt-1">
                {session?.user?.email || "No email linked"}
              </p>
            </div>

            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <span className="px-4 py-1.5 bg-nebula-secondary/20 text-nebula-secondary text-[10px] font-bold uppercase tracking-widest rounded-full">
                {initialClothingCount} pieces vault
              </span>
              <span className="px-4 py-1.5 bg-nebula-primary/20 text-nebula-primary text-[10px] font-bold uppercase tracking-widest rounded-full">
                {initialOutfitCount} outfits styled
              </span>
            </div>
            
            <button 
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="mt-4 px-6 py-2 bg-red-400/10 text-red-500 hover:bg-red-400/20 text-sm font-bold uppercase tracking-widest rounded-full transition-all flex items-center gap-2 mx-auto md:mx-0"
            >
              <LogOut size={16} /> Disable Access
            </button>
          </div>
        </div>
      </section>

      {/* Account Settings Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass rounded-nebula p-6 border border-black/5 space-y-6 group hover:border-nebula-primary/20 transition-all cursor-pointer">
          <div className="flex items-center gap-4 border-b border-black/5 pb-4">
            <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center text-nebula-on-surface/60 group-hover:text-nebula-primary transition-colors">
              <Settings size={24} />
            </div>
            <div>
              <h3 className="font-bold text-nebula-on-surface text-lg">Account Settings</h3>
              <p className="text-sm text-nebula-on-surface/50">Manage your profile and presence</p>
            </div>
          </div>
          <div className="space-y-4 text-sm font-bold text-nebula-on-surface/70">
            <p className="hover:text-nebula-primary transition-colors">Edit Profile Information</p>
            <p className="hover:text-nebula-primary transition-colors">Connected Accounts</p>
            <p className="hover:text-nebula-primary transition-colors">Export Wardrobe Data</p>
          </div>
        </div>

        <div className="glass rounded-nebula p-6 border border-black/5 space-y-6 group hover:border-nebula-secondary/20 transition-all cursor-pointer">
          <div className="flex items-center gap-4 border-b border-black/5 pb-4">
            <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center text-nebula-on-surface/60 group-hover:text-nebula-secondary transition-colors">
              <Bell size={24} />
            </div>
            <div>
              <h3 className="font-bold text-nebula-on-surface text-lg">Notifications</h3>
              <p className="text-sm text-nebula-on-surface/50">Outfit schedules and alerts</p>
            </div>
          </div>
          <div className="space-y-4 text-sm font-bold text-nebula-on-surface/70">
            <div className="flex justify-between items-center">
              <span>Daily Outfit Recommendations</span>
              <div className="w-10 h-6 bg-nebula-secondary rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span>Weather-based Alterations</span>
              <div className="w-10 h-6 bg-nebula-secondary rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
          </div>
        </div>

        <div className="glass rounded-nebula p-6 border border-black/5 space-y-6 group hover:border-nebula-tertiary/20 transition-all cursor-pointer flex flex-col justify-between">
          <div className="flex items-center gap-4 border-b border-black/5 pb-4">
            <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center text-nebula-on-surface/60 group-hover:text-nebula-tertiary transition-colors">
              <Shirt size={24} />
            </div>
            <div>
              <h3 className="font-bold text-nebula-on-surface text-lg">Style Preferences</h3>
              <p className="text-sm text-nebula-on-surface/50">Tune the AI to your taste</p>
            </div>
          </div>
          <button className="w-full py-3 border-2 border-dashed border-black/10 text-nebula-on-surface/50 text-sm font-bold uppercase tracking-widest rounded-nebula-inner hover:border-nebula-tertiary/50 hover:text-nebula-tertiary hover:bg-nebula-tertiary/5 transition-all">
            Retake Style Quiz
          </button>
        </div>

        <div className="glass rounded-nebula p-6 border border-black/5 space-y-6 group hover:border-red-400/20 transition-all cursor-pointer">
          <div className="flex items-center gap-4 border-b border-black/5 pb-4">
            <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center text-nebula-on-surface/60 group-hover:text-red-400 transition-colors">
              <Shield size={24} />
            </div>
            <div>
              <h3 className="font-bold text-nebula-on-surface text-lg">Privacy & Security</h3>
              <p className="text-sm text-nebula-on-surface/50">Protect your digital identity</p>
            </div>
          </div>
          <div className="space-y-4 text-sm font-bold text-nebula-on-surface/70">
            <p className="hover:text-red-400 transition-colors">Change Encryption Key</p>
            <p className="hover:text-red-400 transition-colors text-red-500/70">Danger Zone: Delete Vault</p>
          </div>
        </div>
      </section>
    </div>
  );
}
