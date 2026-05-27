import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  History, 
  Users as UsersIcon, 
  UserCog, 
  LogOut,
  Menu,
  X,
  Store,
  Search
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { section: "Management", items: [
      { name: "Dashboard", path: "/", icon: LayoutDashboard, roles: ["ADMIN", "MANAGER", "STAFF"] },
      { name: "Inventory", path: "/inventory", icon: Package, roles: ["ADMIN", "MANAGER", "STAFF"] },
      { name: "POS Terminal", path: "/pos", icon: ShoppingCart, roles: ["ADMIN", "MANAGER", "STAFF"] },
    ]},
    { section: "Analysis & Records", items: [
      { name: "Sales History", path: "/sales", icon: History, roles: ["ADMIN", "MANAGER", "STAFF"] },
      { name: "Customers", path: "/customers", icon: UsersIcon, roles: ["ADMIN", "MANAGER", "STAFF"] },
    ]},
    { section: "Administration", items: [
      { name: "Staff Management", path: "/users", icon: UserCog, roles: ["ADMIN"] },
    ]}
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-[#F1F5F9] font-sans text-slate-800 overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#1E293B] border-r border-slate-700">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
            HM
          </div>
          <div>
            <h1 className="text-white font-bold text-lg tracking-tight leading-none">Hamro Mart</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">ERP v1.4</p>
          </div>
        </div>

        <nav className="flex-1 mt-4 px-4 overflow-y-auto space-y-6 scrollbar-hide">
          {menuItems.map((section) => {
            const visibleItems = section.items.filter(item => item.roles.includes(user?.role || ""));
            if (visibleItems.length === 0) return null;
            
            return (
              <div key={section.section}>
                <h3 className="text-slate-500 text-[10px] uppercase font-bold tracking-widest px-3 mb-2">{section.section}</h3>
                <div className="space-y-1">
                  {visibleItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium",
                        location.pathname === item.path
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      )}
                    >
                      <item.icon size={16} className={cn(location.pathname === item.path ? "text-white" : "text-slate-400")} />
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-slate-700 bg-slate-900">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center font-bold text-indigo-400 text-xs">
              {user?.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-indigo-400 uppercase font-bold tracking-tight">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-colors text-xs font-bold"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8 shrink-0 z-10">
          <div className="lg:hidden flex items-center gap-3">
             <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
              >
                <Menu size={20} />
              </button>
              <span className="font-bold text-slate-900">Hamro Mart</span>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <h1 className="text-lg font-bold text-slate-900">
              {(() => {
                const flatItems = menuItems.flatMap(s => s.items);
                return flatItems.find(i => i.path === location.pathname)?.name || "Hamro Mart";
              })()}
            </h1>
            <div className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded uppercase border border-indigo-100 italic">
              Live Terminal
            </div>
          </div>

          <div className="flex items-center gap-4 lg:gap-6">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="Search inventory, orders..." 
                className="bg-slate-100 border-none rounded-lg py-2 pl-9 pr-4 text-[11px] w-48 lg:w-64 focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
              />
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-slate-400 hover:text-slate-600 relative">
                <LayoutDashboard size={18} />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full border-2 border-white"></span>
              </button>
               <div className="w-px h-6 bg-slate-200 mx-1 hidden lg:block" />
               <div className="hidden lg:block text-right pr-2">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">System Pulse</p>
                 <p className="text-xs font-bold text-emerald-600">Optimal</p>
               </div>
            </div>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-0 bg-[#1E293B] z-30 lg:hidden flex flex-col"
            >
              <div className="p-6 flex items-center justify-between border-b border-slate-700">
                <div className="flex items-center gap-3 text-white">
                  <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center font-bold tracking-tight">HM</div>
                  <h1 className="font-bold text-lg">Hamro Mart</h1>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-slate-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 p-6 space-y-6 overflow-y-auto">
                {menuItems.map((section) => {
                   const visibleItems = section.items.filter(item => item.roles.includes(user?.role || ""));
                   if (visibleItems.length === 0) return null;
                   return (
                    <div key={section.section}>
                      <h3 className="text-slate-500 text-[10px] uppercase font-bold tracking-widest px-3 mb-3">{section.section}</h3>
                      <div className="space-y-1">
                        {visibleItems.map((item) => (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={cn(
                              "flex items-center gap-4 px-4 py-3 rounded-lg text-sm transition-colors",
                              location.pathname === item.path
                                ? "bg-indigo-600 text-white"
                                : "text-slate-300"
                            )}
                          >
                            <item.icon size={18} />
                            <span className="font-medium">{item.name}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </nav>

              <div className="p-6 border-t border-slate-700">
                 <button
                  onClick={handleLogout}
                  className="flex items-center gap-4 w-full px-4 py-4 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut size={20} />
                  <span className="font-bold">Sign Out</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 overflow-y-auto p-4 lg:p-6 scroll-smooth">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
