import React, { useState, useEffect } from "react";
import { useAuth } from "../App";
import { UserPlus, Shield, Mail, Trash2, Edit2, X, ShieldCheck, UserCog, MoreVertical } from "lucide-react";
import { UserRole, User as UserType } from "../types";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

export default function Users() {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "STAFF" as UserRole });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    const res = await fetch("/api/users", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await res.json();
    setUsers(data);
    setLoading(false);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, there would be a POST /api/users endpoint. 
    // For this prototype, we'll demonstrate the UI.
    alert("In this prototype, user creation is handled by the admin. Real endpoints would be added here.");
    setIsModalOpen(false);
  };

  if (loading) return <div className="text-center p-10 text-slate-400 font-medium">Loading user directory...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Identity & Access Control</h1>
          <div className="flex items-center gap-2 mt-0.5">
             <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Directory Sync Active</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md text-xs font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all active:scale-95 shadow-md shadow-indigo-600/20 uppercase tracking-widest"
        >
          <UserPlus size={14} /> Provision Account
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {users.map((u) => (
          <motion.div 
            layout
            key={u.id}
            className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all group relative overflow-hidden"
          >
            <div className="flex items-start justify-between relative z-10 mb-4">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm shadow border transition-colors",
                u.role === 'ADMIN' ? 'bg-indigo-600 text-white border-indigo-700' : 
                u.role === 'MANAGER' ? 'bg-slate-800 text-white border-slate-900' : 
                'bg-slate-100 text-slate-500 border-slate-200'
              )}>
                {u.name.charAt(0)}
              </div>
              <div className="flex flex-col items-end">
                  <div className={cn(
                    "flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest leading-none mb-1 shadow-sm",
                    u.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-700' : 
                    u.role === 'MANAGER' ? 'bg-slate-100 text-slate-700' : 
                    'bg-slate-50 text-slate-500'
                  )}>
                    {u.role === 'ADMIN' ? <ShieldCheck size={10} /> : u.role === 'MANAGER' ? <Shield size={10} /> : <UserCog size={10} />}
                    {u.role}
                  </div>
                  <button className="p-1 text-slate-300 hover:text-slate-900 transition-colors">
                     <MoreVertical size={14} />
                  </button>
              </div>
            </div>

            <div className="mb-6 relative z-10">
              <h3 className="text-sm font-bold text-slate-900 truncate uppercase tracking-tight">{u.name}</h3>
              <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] mt-0.5 truncate">
                <Mail size={10} className="shrink-0" />
                {u.email}
              </div>
            </div>

            <div className="flex items-center justify-between relative z-10 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                 <div className={cn("w-2 h-2 rounded-full", u.id === currentUser?.id ? "bg-emerald-500 animate-pulse" : "bg-slate-300")} />
                 <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{u.id === currentUser?.id ? 'Active Session' : 'Offline'}</span>
              </div>
              
              {u.id !== currentUser?.id && (
                 <button className="text-[9px] font-black uppercase text-rose-500 hover:text-rose-700 tracking-widest transition-colors hover:underline underline-offset-4">
                   Revoke Access
                 </button>
              )}
            </div>
            
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -translate-y-16 translate-x-16 group-hover:bg-indigo-500/10 transition-colors" />
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl relative border border-slate-200"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
              >
                <X size={18} />
              </button>

              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-indigo-600 text-white rounded flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-600/20">
                  <UserPlus size={24} />
                </div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Account Provisioning</h3>
                <p className="text-slate-500 font-medium text-[10px] mt-1 italic">Define access parameters and security context</p>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                 <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Full Legal Name</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
                    placeholder="Staff Full Name"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Directory Email</label>
                  <input 
                    required
                    type="email" 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
                    placeholder="staff@hamromart.com"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Security Privilege</label>
                  <select 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 font-bold text-xs"
                  >
                    <option value="STAFF">Standard Clerk (STAFF)</option>
                    <option value="MANAGER">Operational (MANAGER)</option>
                    <option value="ADMIN">Superuser (ADMIN)</option>
                  </select>
                </div>
                <button 
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 text-white rounded text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 mt-2"
                >
                  Confirm Provisioning
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
