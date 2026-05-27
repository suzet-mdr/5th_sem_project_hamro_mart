import { useState, useEffect } from "react";
import { useAuth } from "../App";
import { 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  DollarSign, 
  ShoppingCart, 
  ArrowUpRight,
  ChevronRight
} from "lucide-react";
import { motion } from "motion/react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from "recharts";
import { cn, formatCurrency } from "../lib/utils";

export default function Dashboard() {
  const { token, user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === "ADMIN") {
      fetch("/api/analytics/dashboard", {
        headers: { "Authorization": `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      });
    } else {
      // Basic data for non-admins (e.g. recent sales)
      fetch("/api/sales", {
        headers: { "Authorization": `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(sales => {
        setData({ recentSales: sales.slice(0, 5) });
        setLoading(false);
      });
    }
  }, [token, user]);

  if (loading) return <div className="flex items-center justify-center h-full text-slate-400 font-medium">Loading analytics...</div>;

  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {isAdmin && data?.stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total Sales (Today)" 
            value={formatCurrency(data.stats.todaySales.total)} 
            icon={TrendingUp} 
            color="indigo" 
            trend="+12.4%"
            progress={66}
          />
          <StatCard 
            title="Monthly Revenue" 
            value={formatCurrency(data.stats.todaySales.total * 30)} // Mocking monthly for density looks
            icon={DollarSign} 
            color="indigo" 
            accent={true}
            trend="+8.2%"
            progress={75}
          />
          <StatCard 
            title="Total Profit" 
            value={formatCurrency(data.stats.todayProfit.total)} 
            icon={TrendingUp} 
            color="amber" 
            trend="Target: 400k"
            progress={92}
          />
          <StatCard 
            title="Low Stock Alerts" 
            value={data.stats.lowStock.count} 
            icon={AlertTriangle} 
            color="rose" 
            accent={true}
            warning={data.stats.lowStock.count > 0}
            progress={25}
          />
        </div>
      ) : (
        <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-indigo-100 rounded-lg text-indigo-600">
            <Store size={32} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-indigo-900 leading-tight">Welcome, {user?.name}!</h2>
            <p className="text-indigo-700 text-sm">You are logged in as {user?.role}. Access Terminal or Sales History using the sidebar.</p>
          </div>
        </div>
      )}

      {isAdmin && data?.salesTrend && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col p-5">
            <div className="flex items-center justify-between mb-6">
               <h3 className="font-bold text-slate-800">Sales Trend Analysis</h3>
               <div className="flex gap-2">
                  <button className="px-3 py-1 bg-slate-100 rounded text-[10px] font-bold">7D</button>
                  <button className="px-3 py-1 bg-slate-800 text-white rounded text-[10px] font-bold">30D</button>
                  <button className="px-3 py-1 bg-slate-100 rounded text-[10px] font-bold">1Y</button>
               </div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.salesTrend}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontStyle: 'italic'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{fontWeight: 700, fontSize: '12px'}}
                  />
                  <Area type="monotone" dataKey="amount" name="Revenue" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col">
            <h3 className="font-bold text-slate-800 mb-4">Best Selling Items</h3>
            <div className="flex-1 space-y-4">
              {data.topProducts?.map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-400 text-xs sm:uppercase">
                    {item.name.substring(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-medium">Sold • {item.sold} units</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold">142 Sold</p>
                    <p className="text-[10px] text-emerald-600 font-bold">+12%</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full py-2 mt-4 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-600 hover:bg-slate-100 transition-colors uppercase tracking-wider">
              View Full Analytics
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[300px]">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
           <h3 className="font-bold text-slate-800 text-sm">Recent Transactions</h3>
           <Link to="/sales" className="text-indigo-600 text-[11px] font-bold uppercase tracking-wider hover:underline">
             View All Activity
           </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-5 py-2.5 text-[10px] font-bold text-slate-500 uppercase">Order ID</th>
                <th className="px-5 py-2.5 text-[10px] font-bold text-slate-500 uppercase">Customer</th>
                <th className="px-5 py-2.5 text-[10px] font-bold text-slate-500 uppercase">Items</th>
                <th className="px-5 py-2.5 text-[10px] font-bold text-slate-500 uppercase">Amount</th>
                <th className="px-5 py-2.5 text-[10px] font-bold text-slate-500 uppercase">Payment</th>
                <th className="px-5 py-2.5 text-[10px] font-bold text-slate-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {data?.recentSales?.map((sale: any) => (
                <tr key={sale.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-2.5 font-mono text-[11px] text-slate-600">#INV-{sale.id.toString().padStart(4, '0')}</td>
                  <td className="px-5 py-2.5 font-medium text-slate-900">{sale.customer_name || 'Walk-in Customer'}</td>
                  <td className="px-5 py-2.5 text-slate-500">Mult. Items</td>
                  <td className="px-5 py-2.5 font-bold text-slate-900">{formatCurrency(sale.total_amount)}</td>
                  <td className="px-5 py-2.5">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                      sale.payment_method === 'CASH' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'
                    )}>
                      {sale.payment_method}
                    </span>
                  </td>
                  <td className="px-5 py-2.5">
                    <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Completed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, trend, warning, progress, accent }: any) {
  const colorMap: any = {
    indigo: "bg-[#4F46E5]",
    amber: "bg-[#F59E0B]",
    rose: "bg-[#E11D48]",
    emerald: "bg-[#10B981]",
  };

  const accentClass: any = {
    indigo: "border-l-indigo-500",
    amber: "border-l-amber-500",
    rose: "border-l-rose-500",
    emerald: "border-l-emerald-500",
  };

  return (
    <div className={cn(
      "bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden",
      accent && `border-l-4 ${accentClass[color]}`
    )}>
      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">{title}</p>
      <div className="flex items-end justify-between">
        <h2 className={cn("text-xl font-bold text-slate-900 tracking-tight", warning && "text-rose-600")}>
          {value}
        </h2>
        {trend && (
          <span className={cn(
            "text-[10px] font-bold px-1.5 py-0.5 rounded",
            trend.includes('+') ? "text-emerald-600" : "text-slate-400"
          )}>
            {trend}
          </span>
        )}
      </div>
      {progress !== undefined && (
        <div className="mt-2.5 w-full bg-slate-100 h-1 rounded-full overflow-hidden">
          <div 
            className={cn("h-full transition-all duration-1000", colorMap[color])} 
            style={{ width: `${progress}%` }} 
          />
        </div>
      )}
    </div>
  );
}

import { Store } from "lucide-react";
import { Link } from "react-router-dom";
