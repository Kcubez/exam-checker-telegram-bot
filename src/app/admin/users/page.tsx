'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserPlus, Trash2, Edit2, Search, ShieldCheck, Mail, Calendar, Loader2, X, Lock, Eye, EyeOff, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { getAdminUsers, deleteAdminUser, createAdminUser, updateAdminUser } from '@/app/actions/admin';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';

interface DBUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: Date;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<DBUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modals state
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingUser, setEditingUser] = useState<DBUser | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState('USER');
  const [formPassword, setFormPassword] = useState('');

  const { toast } = useToast();
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

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    const result = await getAdminUsers();
    if (result.success) setUsers(result.users as unknown as DBUser[]);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setFormName('');
    setFormEmail('');
    setFormRole('USER');
    setFormPassword('');
    setEditingUser(null);
    setIsCreating(false);
    setShowPassword(false);
  };

  const handleCreate = () => {
    resetForm();
    setIsCreating(true);
  };

  const handleEdit = (user: DBUser) => {
    setEditingUser(user);
    setFormName(user.name || '');
    setFormEmail(user.email);
    setFormRole(user.role);
    setFormPassword('');
  };

  const saveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    if (editingUser) {
      const result = await updateAdminUser(editingUser.id, {
        name: formName,
        email: formEmail,
        role: formRole,
        password: formPassword || undefined
      });
      if (result.success) {
        toast('User updated successfully.', 'success');
        fetchUsers();
        resetForm();
      } else {
        toast(`Update failed: ${result.error}`, 'error');
      }
    } else {
      const result = await createAdminUser({
        name: formName,
        email: formEmail,
        role: formRole,
        password: formPassword
      });
      if (result.success) {
        toast('User created successfully.', 'success');
        fetchUsers();
        resetForm();
      } else {
        toast(`Creation failed: ${result.error}`, 'error');
      }
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!confirmId) return;
    setIsDeleting(true);
    const result = await deleteAdminUser(confirmId);
    setIsDeleting(false);
    setConfirmId(null);
    if (result.success) {
      toast('User deleted successfully.', 'success');
      setUsers(prev => prev.filter(u => u.id !== confirmId));
    } else {
      toast(`Delete failed: ${result.error}`, 'error');
    }
  };

  const filtered = users.filter(u =>
    (u.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col font-sans">
      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!confirmId} onClose={() => setConfirmId(null)} title="Delete User">
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
            <Trash2 className="w-8 h-8 text-rose-400 shrink-0" />
            <p className="text-sm font-bold text-rose-100">
              This will permanently delete the user and all their data. This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setConfirmId(null)}
              className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white font-black uppercase tracking-widest rounded-2xl transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 py-4 bg-rose-500 hover:bg-rose-400 text-white font-black uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 font-bold"
            >
              {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {isDeleting ? 'Deleting...' : 'Yes, Delete'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Create/Edit Modal */}
      <Modal 
        isOpen={isCreating || !!editingUser} 
        onClose={resetForm} 
        title={editingUser ? 'Edit User' : 'Add New User'}
      >
        <form onSubmit={saveUser} className="space-y-6">
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Full Name</label>
                <input 
                    type="text" 
                    value={formName} 
                    onChange={e => setFormName(e.target.value)}
                    required
                    placeholder="e.g. Kaung Myat"
                    className="w-full bg-slate-900 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
            </div>
            
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
                <input 
                    type="email" 
                    value={formEmail} 
                    onChange={e => setFormEmail(e.target.value)}
                    required
                    placeholder="e.g. user@example.com"
                    className="w-full bg-slate-900 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                    {editingUser ? 'New Password (Optional)' : 'Account Password'}
                </label>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <input 
                        type={showPassword ? 'text' : 'password'} 
                        value={formPassword} 
                        onChange={e => setFormPassword(e.target.value)}
                        required={!editingUser}
                        placeholder={editingUser ? "Leave blank to keep same" : "Set account password"}
                        className="w-full bg-slate-900 border border-white/5 rounded-2xl pl-12 pr-14 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">System Role</label>
                <select 
                    value={formRole} 
                    onChange={e => setFormRole(e.target.value)}
                    className="w-full bg-slate-900 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none font-bold"
                >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                </select>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest rounded-3xl transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {isSaving ? 'Processing...' : (editingUser ? 'Update User Identity' : 'Securely Create User')}
            </button>
        </form>
      </Modal>

      {/* Top Header */}
      <header className="h-24 bg-slate-900/50 border-b border-white/5 flex items-center justify-between px-10 backdrop-blur-3xl sticky top-0 z-50">
        <div className="flex items-center gap-6">
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
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search users..."
              className="bg-slate-950/50 border border-white/5 rounded-2xl pl-11 pr-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all w-80 font-medium text-white placeholder-slate-600"
            />
          </div>
          <button 
            onClick={handleCreate}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3.5 rounded-2xl font-bold transition-all shadow-xl shadow-blue-500/20 active:scale-95 group"
          >
            <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Add User
          </button>
          
          <div className="w-px h-10 bg-white/5 mx-2" />

          <button 
            onClick={handleSignOut}
            title="Log Out"
            className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 hover:bg-rose-500 hover:text-white transition-all cursor-pointer group/logout shadow-lg hover:shadow-rose-500/20"
          >
            <LogOut className="w-5 h-5 group-hover/logout:scale-110 transition-transform" />
          </button>
        </div>
      </header>

      {/* Main Table */}
      <main className="p-10 flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-10 h-10 animate-spin text-blue-400" />
          </div>
        ) : (
          <div className="bg-slate-900/30 border border-white/5 rounded-[40px] overflow-hidden">
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
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-8 py-16 text-center text-slate-500 font-medium">
                        No users found.
                      </td>
                    </tr>
                  ) : filtered.map((user) => (
                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center font-black text-slate-200 border border-white/5 shadow-xl group-hover:scale-110 transition-transform">
                            {(user.name ?? user.email).charAt(0).toUpperCase()}
                          </div>
                          <div className="space-y-0.5">
                            <p className="font-bold text-white leading-tight">{user.name ?? '(No name)'}</p>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium tracking-tight">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${user.role === 'ADMIN' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' : 'text-slate-400 bg-slate-500/10 border-slate-500/20'}`}>
                          {user.role === 'ADMIN' && <ShieldCheck className="w-3 h-3" />}
                          {user.role}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-bold uppercase tracking-widest">
                          <Calendar className="w-4 h-4 opacity-30" />
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2 transition-all">
                          <button
                            onClick={() => handleEdit(user)}
                            disabled={user.role === 'ADMIN'}
                            className="p-3 text-slate-400 hover:text-blue-400 bg-white/5 rounded-xl border border-white/5 hover:border-blue-500/20 transition-all cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed group/btn"
                            title={user.role === 'ADMIN' ? 'Protected Admin Account' : 'Edit User'}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setConfirmId(user.id)}
                            disabled={user.role === 'ADMIN'}
                            className="p-3 text-slate-400 hover:text-rose-500 bg-white/5 rounded-xl border border-white/5 hover:border-rose-500/20 transition-all cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed"
                            title={user.role === 'ADMIN' ? 'Protected Admin Account' : 'Delete User'}
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
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Showing {filtered.length} of {users.length} registered users</p>
              <div className="flex gap-2">
                <button disabled className="px-4 py-2 border border-white/5 rounded-xl text-xs font-bold text-slate-600 disabled:opacity-50">Previous</button>
                <button disabled className="px-4 py-2 border border-blue-500/20 bg-blue-500/5 rounded-xl text-xs font-bold text-blue-400">Next Page</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
