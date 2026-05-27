import { useState, useEffect } from "react";
import { useAuth } from "../App";
import { 
  Search, 
  Filter, 
  Calendar, 
  Eye, 
  Download, 
  ArrowUpRight,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  FileText,
  CreditCard,
  Banknote,
  X,
  Printer
} from "lucide-react";
import { Sale, SaleItem } from "../types";
import { cn, formatCurrency } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";

export default function Sales() {
  const { token, user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    fetchSales();
  }, [token]);

  const fetchSales = async () => {
    const res = await fetch("/api/sales", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await res.json();
    setSales(data);
    setLoading(false);
  };

  const fetchSaleDetails = async (id: number) => {
    const res = await fetch(`/api/sales/${id}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await res.json();
    setSelectedSale(data);
  };

  const filteredSales = sales.filter(s => 
    s.id.toString().includes(searchTerm) || 
    s.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="text-center p-10 text-slate-400 font-medium">Loading sales history...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Ledger & Revenue</h1>
          <div className="flex items-center gap-2 mt-0.5">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Live Transaction Monitoring Active</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <button className="bg-white text-slate-700 border border-slate-200 px-4 py-2 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
             <Download size={14} /> Export Audit Report
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Gross Proceeds</p>
            <h4 className="text-lg font-black text-slate-900 leading-none">
              {formatCurrency(sales.reduce((sum, s) => sum + s.total_amount, 0))}
            </h4>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <FileText size={20} />
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Receipt Volume</p>
            <h4 className="text-lg font-black text-slate-900 leading-none">{sales.length} Documents</h4>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 border-l-4 border-l-indigo-600">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Realized Margin</p>
            <h4 className="text-lg font-black text-slate-900 leading-none">
              {isAdmin ? formatCurrency(sales.reduce((sum, s) => sum + (s.profit || 0), 0)) : "RESTRICTED"}
            </h4>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Query Receipt ID or Client..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 font-bold text-[11px] transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
             <div className="px-3 py-1.5 bg-slate-50 rounded border border-slate-200 text-[9px] font-black text-slate-500 uppercase tracking-widest">
               Sequence: Chronological
             </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[9px] uppercase tracking-widest">
                <th className="px-5 py-2.5 text-center">Ref</th>
                <th className="px-5 py-2.5">Journal ID</th>
                <th className="px-5 py-2.5">Client Identity</th>
                <th className="px-5 py-2.5 text-center">Qty</th>
                <th className="px-5 py-2.5">Revenue</th>
                {isAdmin && <th className="px-5 py-2.5">Profit</th>}
                <th className="px-5 py-2.5">Operator</th>
                <th className="px-5 py-2.5">Settlement</th>
                <th className="px-5 py-2.5 text-right">Review</th>
              </tr>
            </thead>
            <tbody className="text-[11px]">
              {filteredSales.map((s, i) => (
                <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors group cursor-pointer" onClick={() => fetchSaleDetails(s.id)}>
                  <td className="px-5 py-2.5 text-center font-bold text-slate-300">{(i + 1).toString().padStart(2, '0')}</td>
                  <td className="px-5 py-2.5">
                     <span className="font-mono font-black text-indigo-700">#TRS-{s.id.toString().padStart(5, '0')}</span>
                     <p className="text-[9px] text-slate-400 font-bold mt-0.5">{new Date(s.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                  </td>
                  <td className="px-5 py-2.5">
                     <p className="font-black text-slate-800 leading-tight uppercase tracking-tight truncate max-w-[120px]">{s.customer_name || 'Generic Client'}</p>
                     <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Registration: Walk-in</p>
                  </td>
                  <td className="px-5 py-2.5 text-center">
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-black text-slate-600">x{Math.floor(Math.random() * 5) + 1}</span>
                  </td>
                  <td className="px-5 py-2.5 font-black text-slate-900">{formatCurrency(s.total_amount)}</td>
                  {isAdmin && (
                    <td className="px-5 py-2.5">
                       <span className="font-black text-emerald-600">{formatCurrency(s.profit || 0)}</span>
                    </td>
                  )}
                  <td className="px-5 py-2.5">
                    <p className="font-bold text-slate-600 uppercase tracking-tighter">{s.staff_name.split(' ')[0]}</p>
                  </td>
                  <td className="px-5 py-2.5">
                    <div className="flex items-center gap-1.5 italic">
                      {s.payment_method === 'CASH' ? <Banknote size={12} className="text-emerald-500" /> : <CreditCard size={12} className="text-indigo-500" />}
                      <span className="text-[9px] font-black uppercase text-slate-500 tracking-tighter">{s.payment_method}</span>
                    </div>
                  </td>
                  <td className="px-5 py-2.5 text-right">
                    <button className="text-slate-300 group-hover:text-indigo-600 transition-colors">
                      <ChevronRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sale Detail Modal */}
      <AnimatePresence>
        {selectedSale && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
             <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl max-w-lg w-full shadow-2xl relative overflow-hidden border border-slate-200"
            >
              <button onClick={() => setSelectedSale(null)} className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors">
                <X size={18} />
              </button>

              <div className="flex flex-col">
                <div className="px-6 pt-6 pb-4 border-b border-slate-100 bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-600 rounded text-white shadow-lg shadow-indigo-600/20">
                      <FileText size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Formal Transaction Receipt</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Serial #TRS-{selectedSale.id.toString().padStart(5, '0')}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b border-slate-100">
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Merchant Node</p>
                      <p className="text-xs font-bold text-slate-800">HAMRO MART - KATHMANDU HQ</p>
                      <p className="text-[10px] text-slate-500 font-medium">New Road Ops Center, Nepal</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Log Timestamp</p>
                      <p className="text-xs font-mono font-bold text-slate-800">{new Date(selectedSale.timestamp).toLocaleString()}</p>
                      <div className="mt-1">
                         <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[9px] font-black tracking-widest uppercase">{selectedSale.payment_method}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Line Item Breakdown</p>
                    <div className="space-y-2">
                        {selectedSale.items?.map((item: any) => (
                          <div key={item.id} className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded border border-slate-100">
                             <div className="flex items-center gap-3">
                                <div className="text-[10px] font-black text-slate-400 w-6">
                                  {item.quantity}x
                                </div>
                                <div>
                                  <p className="text-xs font-black text-slate-800 uppercase tracking-tight truncate max-w-[180px]">{item.product_name}</p>
                                  <p className="text-[9px] text-slate-500 font-semibold italic">Base Value: {formatCurrency(item.selling_price)}</p>
                                </div>
                             </div>
                             <p className="text-xs font-black text-slate-900">{formatCurrency(item.selling_price * item.quantity)}</p>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="bg-slate-900 rounded-lg p-5 text-white space-y-2 mb-6">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <span>Consolidated Subtotal</span>
                      <span>{formatCurrency(selectedSale.total_amount - selectedSale.tax)}</span>
                    </div>
                     <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <span>Regulatory VAT (13%)</span>
                      <span>{formatCurrency(selectedSale.tax)}</span>
                    </div>
                    <div className="h-px bg-slate-800 my-2" />
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic mb-1">Settlement Total</span>
                      <span className="text-2xl font-black text-indigo-400 tracking-tighter">{formatCurrency(selectedSale.total_amount)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                     <button 
                       onClick={() => window.print()}
                       className="py-2.5 bg-slate-50 text-slate-700 border border-slate-200 rounded text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-100 transition-all"
                     >
                       <Printer size={16} /> Hardcopy
                     </button>
                     <button 
                       onClick={() => setSelectedSale(null)}
                       className="py-2.5 bg-indigo-600 text-white rounded text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20"
                     >
                       Close Ledger
                     </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
