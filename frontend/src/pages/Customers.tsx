import React, { useState, useEffect } from "react";
import { useAuth } from "../App";
import { Search, UserPlus, Phone, Star, History, MoreVertical, X, Loader2, User } from "lucide-react";
import { Customer } from "../types";
import { formatCurrency } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";

export default function Customers() {
  const { token } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, [token]);

  const fetchCustomers = async () => {
    const res = await fetch("/api/customers", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await res.json();
    setCustomers(data);
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/customers", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(newCustomer)
    });
    if (res.ok) {
      setIsModalOpen(false);
      setNewCustomer({ name: "", phone: "" });
      fetchCustomers();
    } else {
      const data = await res.json();
      alert(data.error);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Client Relationship Management</h1>
          <div className="flex items-center gap-2 mt-0.5">
             <div className="w-2 h-2 rounded-full bg-indigo-500" />
             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Loyalty Program: Active</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md text-xs font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all active:scale-95 shadow-md shadow-indigo-600/20 uppercase tracking-widest"
        >
          <UserPlus size={14} /> Add New Prospect
        </button>
      </div>

      <div className="bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Query Name or Identifier..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 font-bold text-[11px] transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4">
             <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic leading-none">Database Entry Count: {customers.length}</div>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredCustomers.map((customer) => (
          <motion.div 
            layout
            key={customer.id}
            className="bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all group relative overflow-hidden"
          >
            <div className="flex items-start justify-between mb-4 relative z-10">
              <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-lg border border-slate-100 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <User size={20} />
              </div>
              <div className="text-right">
                <div className="flex items-center gap-0.5 justify-end text-amber-500 mb-1">
                   {[...Array(5)].map((_, i) => (
                     <Star key={i} size={10} fill={i < Math.min(5, Math.floor(customer.points / 100)) ? "currentColor" : "none"} strokeWidth={i < Math.min(5, Math.floor(customer.points / 100)) ? 0 : 2} />
                   ))}
                </div>
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest leading-none">Tier Points</p>
                <p className="text-lg font-black text-slate-900 leading-none mt-1">{customer.points}</p>
              </div>
            </div>

            <div className="relative z-10">
              <h3 className="text-sm font-bold text-slate-900 truncate uppercase tracking-tight">{customer.name}</h3>
              <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px] mt-1 mb-4 italic">
                <Phone size={10} className="text-indigo-500" />
                {customer.phone}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100 relative z-10">
               <button className="flex items-center justify-center gap-2 py-2 bg-slate-50 rounded text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-colors border border-slate-100">
                 <History size={12} /> Log
               </button>
               <button className="flex items-center justify-center gap-2 py-2 bg-indigo-600 text-white rounded text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-600/10">
                 Transact
               </button>
            </div>
            
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/20 rounded-full blur-3xl -translate-y-12 translate-x-12 group-hover:bg-indigo-500/10 transition-colors" />
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
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-3 border border-indigo-100 shadow-sm">
                  <UserPlus size={24} />
                </div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">New Relationship</h3>
                <p className="text-slate-500 font-medium text-[10px] mt-1 italic">Register a new profile for loyalty tracking</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Formal Name</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 font-bold text-sm placeholder:italic placeholder:font-normal"
                    placeholder="Enter full designation"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Telecommunication ID</label>
                  <input 
                    required
                    type="tel" 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
                    placeholder="98XXXXXXXX"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 text-white rounded text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 mt-2"
                >
                  Finalize Registration
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
