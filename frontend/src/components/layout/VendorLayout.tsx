import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  BookOpen,
  Calendar,
  Settings as SettingsIcon,
  Bell,
  LogOut,
  Sparkles,
} from "lucide-react";
import { vendorLogout } from "../../api/vendorAuth";

export function VendorLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await vendorLogout();
    } catch (e) {
      console.error("Vendor logout error", e);
    } finally {
      localStorage.removeItem("vendor_access_token");
      localStorage.removeItem("vendor_refresh_token");
      localStorage.removeItem("active_role");
      navigate("/vendor/login");
    }
  };

  const navItems = [
    { name: "Home", href: "/vendor/dashboard", icon: Home },
    { name: "Bookings", href: "/vendor/bookings", icon: BookOpen },
    { name: "Calendar", href: "/vendor/calendar", icon: Calendar },
    { name: "Settings", href: "/vendor/settings", icon: SettingsIcon },
  ];

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[#f7f7fb] font-sans text-slate-950">
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold tracking-wide text-slate-950">WedConnect</p>
            <p className="text-xs text-slate-400">Vendor Hub</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-slate-950 text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-950"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-100 p-4">
          <div className="mb-3 rounded-lg bg-slate-50 p-3">
            <p className="text-sm font-semibold text-slate-900">Your Business</p>
            <p className="text-xs text-slate-400">vendor@email.com</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </aside>

      <div className="relative flex h-[100dvh] min-w-0 flex-1 flex-col pb-20 lg:pb-0">
        <header className="sticky top-0 z-30 border-b border-white/70 bg-white/85 px-4 py-3 shadow-sm shadow-slate-200/40 backdrop-blur lg:px-8 lg:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-500 lg:hidden">WedConnect</p>
              <h1 className="truncate text-lg font-bold text-slate-950 lg:text-2xl">Vendor Hub</h1>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200" aria-label="Notifications">
                <Bell className="h-5 w-5" />
              </button>
              <button
                onClick={handleLogout}
                title="Log out"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-600 transition-colors hover:bg-rose-100"
                aria-label="Log out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-4 py-4 lg:px-8 lg:py-7">
          <Outlet />
        </main>

        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden">
          <div className="grid h-16 grid-cols-4 gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-semibold transition-colors ${
                    isActive ? "text-rose-700" : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  <span className={`flex h-8 w-10 items-center justify-center rounded-lg ${isActive ? "bg-rose-50" : "bg-transparent"}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
