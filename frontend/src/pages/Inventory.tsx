import React, { useState, useEffect } from "react";
import { useAuth } from "../App";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Package, 
  AlertTriangle,
  ChevronDown,
  X,
  PlusCircle,
  Tag,
  Hash,
  Truck
} from "lucide-react";
import { Product, Category } from "../types";
import { cn, formatCurrency } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";

export default function Inventory() {
  const { token, user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Partial<Product> | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    const [pRes, cRes] = await Promise.all([
      fetch("/api/products", { headers: { "Authorization": `Bearer ${token}` } }),
      fetch("/api/categories", { headers: { "Authorization": `Bearer ${token}` } })
    ]);
    const [pData, cData] = await Promise.all([pRes.json(), cRes.json()]);
    setProducts(pData);
    setCategories(cData);
    setLoading(false);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = selectedProduct?.id ? "PUT" : "POST";
    const url = selectedProduct?.id ? `/api/products/${selectedProduct.id}` : "/api/products";
    
    const res = await fetch(url, {
      method,
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(selectedProduct)
    });

    if (res.ok) {
      setIsModalOpen(false);
      fetchData();
    } else {
      const data = await res.json();
      alert(data.error);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    const res = await fetch(`/api/products/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (res.ok) fetchData();
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="text-center p-10 text-slate-400 font-medium">Loading inventory data...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Stock Inventory</h1>
          <div className="flex items-center gap-2 mt-0.5">
             <div className="w-2 h-2 rounded-full bg-emerald-500" />
             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Operational Status: Optimal</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={() => { setSelectedProduct({}); setIsModalOpen(true); }}
             className="bg-indigo-600 text-white px-4 py-2 rounded-md text-xs font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all active:scale-95 shadow-md shadow-indigo-600/20 uppercase tracking-wider"
           >
             <Plus size={14} /> New Catalog Entry
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <Package size={20} />
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Asset valuation</p>
            <h4 className="text-lg font-black text-slate-900 leading-none">
              {isAdmin ? formatCurrency(products.reduce((sum, p) => sum + (p.cost_price || 0) * p.quantity, 0)) : "RESTRICTED"}
            </h4>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <Tag size={20} />
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">SKU Count</p>
            <h4 className="text-lg font-black text-slate-900 leading-none">{products.length} Items</h4>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 border-l-4 border-l-rose-500">
          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-lg">
            <AlertTriangle size={20} />
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Critical Stock</p>
            <h4 className="text-lg font-black text-rose-600 leading-none">
              {products.filter(p => p.quantity < 10).length} Refills Required
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
              placeholder="Search product registry..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded focus:ring-2 focus:ring-indigo-500 font-bold text-[11px] transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
             <button className="px-2 py-1.5 rounded bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors border border-slate-100 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
               <Filter size={12} /> Filters
             </button>
             <div className="h-4 w-px bg-slate-200 hidden md:block" />
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight italic">Registry Matches: {filteredProducts.length}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[9px] uppercase tracking-widest">
                <th className="px-5 py-2.5">Product Identification</th>
                <th className="px-5 py-2.5">Ref No.</th>
                <th className="px-5 py-2.5">Category</th>
                <th className="px-5 py-2.5">Unit Price</th>
                {isAdmin && <th className="px-5 py-2.5">Cost Basis</th>}
                <th className="px-5 py-2.5">Inventory</th>
                <th className="px-5 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                  <td className="px-5 py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-slate-100 rounded flex items-center justify-center overflow-hidden border border-slate-200 shrink-0">
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package size={16} className="text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 leading-tight uppercase tracking-tight truncate">{p.name}</p>
                        <p className="text-[10px] text-slate-500 font-medium italic">{p.brand || 'No Brand'} • {p.size || '-'}/{p.color || '-'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-2.5 font-mono text-[10px] font-bold text-slate-500">{p.sku}</td>
                  <td className="px-5 py-2.5">
                    <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[9px] font-black uppercase tracking-wider italic">
                      {p.category_name}
                    </span>
                  </td>
                  <td className="px-5 py-2.5 font-bold text-slate-900">{formatCurrency(p.selling_price)}</td>
                  {isAdmin && <td className="px-5 py-2.5 text-slate-400 font-semibold">{formatCurrency(p.cost_price || 0)}</td>}
                  <td className="px-5 py-2.5">
                    <div className="flex items-center gap-2">
                       <div className={cn(
                         "w-1.5 h-1.5 rounded-full shrink-0",
                         p.quantity > 10 ? "bg-emerald-500" : p.quantity > 0 ? "bg-amber-500" : "bg-rose-500"
                       )} />
                       <span className={cn(
                         "font-black text-[11px] uppercase tracking-tighter",
                         p.quantity > 10 ? "text-slate-800" : p.quantity > 0 ? "text-amber-600" : "text-rose-600"
                       )}>
                         {p.quantity} Units
                       </span>
                    </div>
                  </td>
                  <td className="px-5 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button 
                         onClick={() => { setSelectedProduct(p); setIsModalOpen(true); }}
                         className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all"
                       >
                         <Edit2 size={14} />
                       </button>
                       {isAdmin && (
                         <button 
                           onClick={() => handleDeleteProduct(p.id)}
                           className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all"
                         >
                           <Trash2 size={14} />
                         </button>
                       )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                 <div>
                   <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">{selectedProduct?.id ? 'Update Catalog' : 'New Registry Entry'}</h3>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-200 transition-colors rounded text-slate-400">
                   <X size={20} />
                 </button>
              </div>

              <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="space-y-4">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Formal Designation</label>
                       <input 
                         required
                         type="text" 
                         className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
                         value={selectedProduct?.name || ''}
                         onChange={(e) => setSelectedProduct({ ...selectedProduct!, name: e.target.value })}
                         placeholder="Ex: Men's Ultra Slim Denim"
                       />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">SKU Identity</label>
                          <input 
                            required
                            type="text" 
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 font-mono text-xs font-bold"
                            value={selectedProduct?.sku || ''}
                            onChange={(e) => setSelectedProduct({ ...selectedProduct!, sku: e.target.value })}
                            placeholder="HM-1XXX"
                          />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Class / Group</label>
                          <select 
                            required
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 font-bold text-xs"
                            value={selectedProduct?.category_id || ''}
                            onChange={(e) => setSelectedProduct({ ...selectedProduct!, category_id: parseInt(e.target.value) })}
                          >
                            <option value="">Select Category</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                       </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                       <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Origin</label>
                          <input 
                            type="text" 
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 font-bold text-xs"
                            value={selectedProduct?.brand || ''}
                            onChange={(e) => setSelectedProduct({ ...selectedProduct!, brand: e.target.value })}
                          />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Spec Size</label>
                          <input 
                            type="text" 
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 font-bold text-center text-xs"
                            value={selectedProduct?.size || ''}
                            onChange={(e) => setSelectedProduct({ ...selectedProduct!, size: e.target.value })}
                          />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Chromatic</label>
                          <input 
                            type="text" 
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 font-bold text-xs"
                            value={selectedProduct?.color || ''}
                            onChange={(e) => setSelectedProduct({ ...selectedProduct!, color: e.target.value })}
                          />
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Acquisition Cost</label>
                          <input 
                               required
                               type="number" 
                               step="0.01"
                               className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 font-black text-slate-600 text-sm"
                               value={selectedProduct?.cost_price || ''}
                               onChange={(e) => setSelectedProduct({ ...selectedProduct!, cost_price: parseFloat(e.target.value) })}
                          />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Terminal Price</label>
                          <input 
                               required
                               type="number" 
                               step="0.01"
                               className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 font-black text-indigo-600 text-sm"
                               value={selectedProduct?.selling_price || ''}
                               onChange={(e) => setSelectedProduct({ ...selectedProduct!, selling_price: parseFloat(e.target.value) })}
                          />
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Initial Ledger</label>
                          <input 
                            required
                            type="number" 
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
                            value={selectedProduct?.quantity || ''}
                            onChange={(e) => setSelectedProduct({ ...selectedProduct!, quantity: parseInt(e.target.value) })}
                          />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Supply Source</label>
                          <input 
                            type="text" 
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 font-bold text-xs"
                            value={selectedProduct?.supplier || ''}
                            onChange={(e) => setSelectedProduct({ ...selectedProduct!, supplier: e.target.value })}
                          />
                       </div>
                    </div>
                </div>

                <div className="pt-6 flex justify-end gap-3 mt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-50 text-slate-500 rounded text-xs font-bold uppercase tracking-widest hover:bg-slate-100 transition-all"
                  >
                    Discard
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-2 bg-indigo-600 text-white rounded text-xs font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20"
                  >
                    Finalize Entry
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
