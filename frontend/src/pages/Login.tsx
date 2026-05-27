import React, { useState } from "react";
import { useAuth } from "../App";
import { Store, Lock, Mail, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("admin@hamromart.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        login(data.token, data.user);
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-xl shadow-2xl shadow-slate-300/20 p-8 md:p-10 border border-slate-200">
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-14 h-14 bg-indigo-600 rounded flex items-center justify-center shadow-lg shadow-indigo-600/30 mb-5 group cursor-pointer transition-transform hover:scale-110">
              <Store size={28} className="text-white" />
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-widest uppercase">Admin Terminal</h1>
            <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest italic leading-none">Authentication Required for Access</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-rose-50 text-rose-600 p-3 rounded border border-rose-100 text-[10px] mb-6 font-black uppercase tracking-widest flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Officer Email Identity</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 font-bold text-sm transition-all"
                  placeholder="admin@hamromart.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Security Passkey</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 font-bold text-sm transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
               <label className="flex items-center gap-2 cursor-pointer">
                 <input type="checkbox" className="rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                 Maintain Session
               </label>
               <button type="button" className="text-indigo-600 hover:underline">Forgot Key?</button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95 disabled:opacity-70 mt-6"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  Secure Login <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-100 flex items-center justify-center gap-4">
            <div className="h-0.5 w-12 bg-indigo-600/20 rounded-full" />
            <p className="text-slate-400 text-center text-[9px] font-bold uppercase tracking-[0.3em] italic">
              Hamro Mart ERP Terminal
            </p>
            <div className="h-0.5 w-12 bg-indigo-600/20 rounded-full" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
