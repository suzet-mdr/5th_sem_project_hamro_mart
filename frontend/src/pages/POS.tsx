import { useState, useEffect, useRef } from "react";
import { useAuth } from "../App";
import { 
  Plus,
  Minus,
  Trash2, 
  Search, 
  ShoppingCart, 
  Printer, 
  UserPlus,
  Loader2,
  CheckCircle2,
  ScanBarcode,
  CreditCard,
  Banknote,
  X,
  Package
} from "lucide-react";
import { Product, Customer } from "../types";
import { cn, formatCurrency } from "../lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function POS() {
  const { token, user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<any[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [phoneSearch, setPhoneSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState<any>(null);
  
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/products", {
      headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(setProducts);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [token]);

  const addToCart = (product: Product) => {
    if (product.quantity <= 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.quantity) return prev;
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1, product_id: product.id }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const product = products.find(p => p.id === id);
        const newQty = item.quantity + delta;
        if (newQty < 1 || (product && newQty > product.quantity)) return item;
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.selling_price * item.quantity), 0);
  const tax = subtotal * 0.13; // 13% VAT
  const total = subtotal + tax;

  const searchCustomer = async () => {
    if (!phoneSearch) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/customers/search?phone=${phoneSearch}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setCustomer(data.customer);
      } else {
        alert("Customer not found. Please register.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (method: string) => {
    if (cart.length === 0) return;
    setProcessing(true);
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          customer_id: customer?.id || null,
          items: cart,
          total_amount: total,
          discount: 0,
          tax: tax,
          payment_method: method
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess({ id: data.sale_id, total, method, customer: customer?.name || 'Walk-in' });
        setCart([]);
        setCustomer(null);
        setPhoneSearch("");
        // Refresh products to update stock
        fetch("/api/products", {
          headers: { "Authorization": `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(setProducts);
      } else {
        alert(data.error);
      }
    } catch (e) {
      alert("Checkout failed");
    } finally {
      setProcessing(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col gap-6 lg:flex-row animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Left: Product Selection */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 mb-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search by product name or SKU... (Press / to focus)"
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-1 bg-white rounded border border-slate-200 text-[9px] font-bold text-slate-400 pointer-events-none uppercase tracking-wider">
              <ScanBarcode size={10} /> Barcode Mode
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-4 px-1">
          {filteredProducts.map((p) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              key={p.id}
              onClick={() => addToCart(p)}
              className={cn(
                "bg-white rounded-xl p-3 shadow-sm border border-slate-200 flex flex-col items-center text-center cursor-pointer transition-all active:scale-95 group relative overflow-hidden",
                p.quantity <= 0 ? "opacity-50 grayscale" : "hover:border-indigo-300 hover:shadow-indigo-100 hover:shadow-lg"
              )}
            >
              <div className="w-20 h-20 mb-3 rounded-lg bg-slate-50 flex items-center justify-center relative overflow-hidden">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                ) : (
                  <Package size={32} className="text-slate-300" />
                )}
                {p.quantity < 10 && p.quantity > 0 && (
                   <div className="absolute top-0 right-0 p-1">
                     <div className="bg-rose-500 w-2 h-2 rounded-full animate-pulse" />
                   </div>
                )}
              </div>
              <h3 className="font-bold text-slate-900 text-xs line-clamp-1 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{p.name}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{p.sku}</p>
              <div className="mt-2 text-indigo-600 font-black text-base italic">
                {formatCurrency(p.selling_price)}
              </div>
              <div className={cn(
                "mt-2 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter",
                p.quantity > 10 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
              )}>
                {p.quantity} Units Left
              </div>
              
              {/* Overlay add visual */}
              <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/5 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                 <div className="bg-indigo-600 p-2 rounded-full text-white transform translate-y-4 group-hover:translate-y-0 transition-transform shadow-lg shadow-indigo-600/30">
                   <Plus size={18} />
                 </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right: Cart & Checkout */}
      <div className="w-full  lg:w-[380px]shrink-0 flex flex-col gap-6">
        {/* Customer Selection */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
               <UserPlus size={14} className="text-indigo-400" /> Customer Data
             </h3>
             {customer && (
               <button onClick={() => setCustomer(null)} className="text-[10px] font-bold text-rose-500 hover:underline uppercase tracking-tighter">Clear</button>
             )}
          </div>
          
          {!customer ? (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Phone number / Identity..."
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-100 rounded focus:ring-2 focus:ring-indigo-500 text-xs font-semibold"
                value={phoneSearch}
                onChange={(e) => setPhoneSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchCustomer()}
              />
              <button 
                onClick={searchCustomer}
                disabled={loading}
                className="bg-slate-900 text-white px-3 py-2 rounded hover:bg-slate-800 disabled:opacity-50 transition-colors"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
              </button>
            </div>
          ) : (
            <div className="bg-indigo-50/50 p-4 rounded-lg flex items-center justify-between border border-indigo-100 italic">
              <div>
                <p className="font-bold text-indigo-900 text-xs uppercase tracking-tight">{customer.name}</p>
                <p className="text-[10px] text-indigo-700 font-bold">{customer.phone}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">Points</p>
                <p className="font-black text-indigo-600 italic">{customer.points}</p>
              </div>
            </div>
          )}
        </div>

        {/* Cart */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden min-h-[400px]">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <ShoppingCart size={14} className="text-indigo-400" /> Terminal Cart
            </h3>
            <span className="bg-indigo-600 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest">
              {cart.reduce((a, b) => a + b.quantity, 0)} Units
            </span>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 opacity-60">
                <ShoppingCart size={40} strokeWidth={1} />
                <p className="text-xs font-bold uppercase tracking-wider">Cart Empty</p>
                <p className="text-[10px] italic">Scan items or select from list</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3 animate-in slide-in-from-right-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-xs truncate uppercase tracking-tight">{item.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold italic">{formatCurrency(item.selling_price)}</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded border border-slate-200">
                    <button 
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-white rounded hover:shadow-sm"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-5 text-center text-xs font-bold text-slate-800">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-white rounded hover:shadow-sm"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-2">
             <div className="flex justify-between text-[11px] text-slate-500 font-bold uppercase tracking-wider">
               <span>Ext. Subtotal</span>
               <span className="text-slate-900">{formatCurrency(subtotal)}</span>
             </div>
             <div className="flex justify-between text-[11px] text-slate-500 font-bold uppercase tracking-wider">
               <span>Tax / VAT (13%)</span>
               <span className="text-slate-900">{formatCurrency(tax)}</span>
             </div>
             <div className="flex justify-between pt-2 border-t border-slate-200">
               <span className="text-sm font-bold text-slate-900 uppercase tracking-widest">Total Due</span>
               <span className="text-xl font-black text-indigo-600 italic tracking-tight">{formatCurrency(total)}</span>
             </div>
          </div>

          <div className="p-3 grid grid-cols-2 gap-2">
            <button 
              onClick={() => handleCheckout('CASH')}
              disabled={cart.length === 0 || processing}
              className="bg-slate-900 text-white py-3 rounded-lg flex flex-col items-center justify-center gap-1 hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50"
            >
              <Banknote size={18} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Cash Settlement</span>
            </button>
            <button 
              onClick={() => handleCheckout('E-PAY')}
              disabled={cart.length === 0 || processing}
              className="bg-indigo-600 text-white py-3 rounded-lg flex flex-col items-center justify-center gap-1 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/20"
            >
              <CreditCard size={18} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Electronic Pay</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {success && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl relative overflow-hidden border border-slate-200"
            >
              <button onClick={() => setSuccess(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 animate-bounce">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Sale Completed</h3>
                <p className="text-slate-500 text-xs font-semibold mb-6">Ref: #TRS-{success.id.toString().padStart(5, '0')}</p>
                
                <div className="w-full bg-slate-50 rounded-lg p-5 space-y-3 mb-6 text-left border border-slate-100">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    <span>Payment Mode</span>
                    <span className="text-indigo-600">{success.method}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    <span>Account Party</span>
                    <span className="text-slate-700">{success.customer}</span>
                  </div>
                  <div className="h-px border-t border-slate-200 border-dashed" />
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-widest">Total Settled</span>
                    <span className="text-xl font-black text-emerald-600 italic">{formatCurrency(success.total)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 w-full gap-2">
                  <button 
                    onClick={() => window.print()} 
                    className="w-full py-3 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
                  >
                    <Printer size={16} /> Print Receipt
                  </button>
                  <button 
                    onClick={() => setSuccess(null)}
                    className="w-full py-3 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors"
                  >
                    Close Session
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
