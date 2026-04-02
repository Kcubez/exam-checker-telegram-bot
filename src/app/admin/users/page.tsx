'use client';

import { useState } from 'react';
import { UserPlus, Trash2, Edit2, Search, ArrowLeft, ShieldCheck, Mail, Calendar } from 'lucide-react';
import Link from 'next/link';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  createdAt: string;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'Admin User', email: 'admin@exam.com', role: 'ADMIN', createdAt: '2026-03-31' },
    { id: '2', name: 'Regular Student', email: 'user@exam.com', role: 'USER', createdAt: '2026-04-01' },
    { id: '3', name: 'Test Student', email: 'test@exam.com', role: 'USER', createdAt: '2026-04-01' },
  ]);

  const removeUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col font-sans">
      {/* Top Header */}
      <header className="h-24 bg-slate-900/50 border-b border-white/5 flex items-center justify-between px-10 backdrop-blur-3xl sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="p-2 border border-white/5 rounded-xl hover:bg-white/5 transition-all text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
              User Management
              <span className="text-[10px] bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full font-bold self-start mt-1 uppercase tracking-widest leading-none border border-blue-500/10 shadow-lg shadow-blue-500/20">Admin Only</span>
            </h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest ml-1">Manage platform users and roles</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none group-focus-within:text-blue-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search users..." 
              className="bg-slate-950/50 border border-white/5 rounded-2xl pl-11 pr-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all w-80 font-medium"
            />
          </div>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3.5 rounded-2xl font-bold transition-all shadow-xl shadow-blue-500/20 active:scale-95 group">
            <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Add User
          </button>
        </div>
      </header>

      {/* Main Table */}
      <main className="p-10 flex-1">
        <div className="bg-slate-900/30 border border-white/5 rounded-[40px] overflow-hidden shadow-3xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-900/50 border-b border-white/5">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">User Identity</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">System Role</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Onboarding Date</th>
                  <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center font-black text-slate-200 border border-white/5 shadow-xl group-hover:scale-110 transition-transform">
                          {user.name.charAt(0)}
                        </div>
                        <div className="space-y-0.5">
                          <p className="font-bold text-white leading-tight">{user.name}</p>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium tracking-tight">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-current \${user.role === 'ADMIN' ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 bg-slate-500/10'}`}>
                        <ShieldCheck className={user.role === 'ADMIN' ? 'w-3 h-3' : 'hidden'} />
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-bold uppercase tracking-widest">
                        <Calendar className="w-4 h-4 opacity-30" />
                        {user.createdAt}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                        <button className="p-3 text-slate-400 hover:text-blue-400 bg-white/5 rounded-xl border border-white/5 hover:border-blue-500/20 transition-all">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => removeUser(user.id)}
                          className="p-3 text-slate-400 hover:text-rose-500 bg-white/5 rounded-xl border border-white/5 hover:border-rose-500/20 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-8 border-t border-white/5 bg-slate-900/40 flex items-center justify-between">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Showing {users.length} registered users</p>
            <div className="flex gap-2">
              <button disabled className="px-4 py-2 border border-white/5 rounded-xl text-xs font-bold text-slate-600 disabled:opacity-50">Previous</button>
              <button disabled className="px-4 py-2 border border-blue-500/20 bg-blue-500/5 rounded-xl text-xs font-bold text-blue-400">Next Page</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
