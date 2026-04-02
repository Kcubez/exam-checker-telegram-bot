'use client';

import { useState } from 'react';
import { Shield, Loader2, ArrowRight } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Mimic admin authentication
    setTimeout(() => {
      window.location.href = '/admin/users';
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md space-y-10 relative z-10 animate-in fade-in zoom-in duration-700">
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-600 shadow-2xl shadow-blue-500/40 transform rotate-3">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <div className="pt-4">
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Admin Portal</h1>
            <p className="text-slate-500 font-bold text-sm tracking-widest uppercase mt-1">Management Access Only</p>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-white/5 rounded-[40px] p-10 backdrop-blur-3xl shadow-3xl">
          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Admin Identity</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all font-medium"
                  placeholder="admin@exam.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Security Key</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-5 px-4 rounded-2xl shadow-2xl text-sm font-black uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-500 focus:outline-none transition-all disabled:opacity-50 transform hover:scale-[1.02] active:scale-95 group"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Authenticate
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] text-slate-600 font-bold uppercase tracking-widest leading-loose">
          Secure Environment. All activities are logged. <br/>
          System unauthorized access prohibited.
        </p>
      </div>
    </main>
  );
}
