'use client';

import { Bot, FileText, Settings, LogOut, LayoutDashboard, Users } from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900/50 border-r border-white/5 flex flex-col pt-8 backdrop-blur-3xl">
        <div className="px-8 pb-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold leading-none">Exam Bot</h1>
            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Control Panel</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all group"
          >
            <LayoutDashboard className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
            <span className="font-medium">Overview</span>
          </Link>
          <Link
            href="/dashboard/mcqs"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all group"
          >
            <FileText className="w-5 h-5 group-hover:text-emerald-400 transition-colors" />
            <span className="font-medium">Create MCQs</span>
          </Link>
          <Link
            href="/dashboard/students"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all group"
          >
            <Users className="w-5 h-5 group-hover:text-amber-400 transition-colors" />
            <span className="font-medium">Student Results</span>
          </Link>
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all group"
          >
            <Settings className="w-5 h-5 group-hover:text-rose-400 transition-colors" />
            <span className="font-medium">Bot Settings</span>
          </Link>
        </nav>

        <div className="p-4 mt-auto">
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-rose-400 hover:bg-rose-500/10 transition-all font-medium border border-transparent hover:border-rose-500/20 cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto scrollbar-hide">
        {children}
      </main>
    </div>
  );
}
