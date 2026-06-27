import { useEffect, useMemo, useState } from "react";
import { CalendarDays, IndianRupee, Receipt, TrendingUp, Users, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { getBookings } from "../../api/vendorBookings";
import type { Booking } from "../../types";

function money(value: string | number | undefined) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function StatTile({ label, value, tone, icon: Icon }: { label: string; value: string | number; tone: string; icon: typeof IndianRupee }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm shadow-slate-200/50">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</span>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${tone}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="text-xl font-bold text-slate-950">{value}</p>
    </div>
  );
}

function BookingPreview({ booking }: { booking: Booking }) {
  return (
    <Link
      to="/vendor/bookings"
      className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm shadow-slate-200/40"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-950">{booking.customer_name}</p>
        <p className="mt-0.5 text-xs text-slate-400">{booking.dates?.[0]?.event_date ?? "Date pending"}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-slate-950">{money(booking.total_amount)}</p>
        <p className="text-xs text-emerald-600">{money(booking.profit_amount)} profit</p>
      </div>
    </Link>
  );
}

export function VendorDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getBookings();
        setBookings(data || []);
      } catch (err) {
        console.error("Failed to load dashboard bookings", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const summary = useMemo(() => {
    return bookings.reduce(
      (acc, booking) => {
        acc.revenue += Number(booking.total_amount || 0);
        acc.received += Number(booking.total_paid || 0);
        acc.expenses += Number(booking.total_expense || 0);
        acc.profit += Number(booking.profit_amount || 0);
        if (booking.event_status === "TODAY") acc.today += 1;
        if (booking.event_status === "UPCOMING") acc.upcoming += 1;
        return acc;
      },
      { revenue: 0, received: 0, expenses: 0, profit: 0, today: 0, upcoming: 0 }
    );
  }, [bookings]);

  const chartMax = Math.max(summary.revenue, summary.profit, summary.expenses, 1);
  const recent = bookings.slice(0, 4);

  return (
    <div className="space-y-5 pb-4">
      <section className="rounded-lg bg-slate-950 p-5 text-white shadow-lg shadow-slate-300/50">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-200">Welcome back</p>
            <h2 className="mt-2 text-2xl font-bold leading-tight">Your wedding work, beautifully organized.</h2>
          </div>
          <Link
            to="/vendor/bookings"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-slate-950"
            aria-label="Create booking"
          >
            <Plus className="h-5 w-5" />
          </Link>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-white/10 p-3">
            <p className="text-xs text-slate-300">Today</p>
            <p className="mt-1 text-2xl font-bold">{summary.today}</p>
          </div>
          <div className="rounded-lg bg-white/10 p-3">
            <p className="text-xs text-slate-300">Upcoming</p>
            <p className="mt-1 text-2xl font-bold">{summary.upcoming}</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <StatTile label="Revenue" value={money(summary.revenue)} tone="bg-sky-50 text-sky-700" icon={IndianRupee} />
        <StatTile label="Received" value={money(summary.received)} tone="bg-emerald-50 text-emerald-700" icon={TrendingUp} />
        <StatTile label="Expenses" value={money(summary.expenses)} tone="bg-rose-50 text-rose-700" icon={Receipt} />
        <StatTile label="Profit" value={money(summary.profit)} tone="bg-amber-50 text-amber-700" icon={Users} />
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/50">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-950">Business pulse</h3>
          <CalendarDays className="h-4 w-4 text-slate-400" />
        </div>
        <div className="space-y-3">
          {[
            { label: "Revenue", value: summary.revenue, cls: "bg-sky-500" },
            { label: "Profit", value: summary.profit, cls: "bg-emerald-500" },
            { label: "Expenses", value: summary.expenses, cls: "bg-rose-400" },
          ].map((item) => (
            <div key={item.label} className="grid grid-cols-[74px_1fr_82px] items-center gap-2 text-xs">
              <span className="font-medium text-slate-500">{item.label}</span>
              <div className="h-2 rounded-full bg-slate-100">
                <div className={`h-2 rounded-full ${item.cls}`} style={{ width: `${Math.max(6, (item.value / chartMax) * 100)}%` }} />
              </div>
              <span className="text-right font-semibold text-slate-900">{money(item.value)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-950">Recent bookings</h3>
          <Link to="/vendor/bookings" className="text-xs font-semibold text-rose-600">View all</Link>
        </div>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((item) => <div key={item} className="h-16 animate-pulse rounded-lg bg-white" />)}
          </div>
        ) : recent.length ? (
          <div className="space-y-2">
            {recent.map((booking) => <BookingPreview key={booking.id} booking={booking} />)}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-5 text-center">
            <p className="text-sm font-semibold text-slate-700">No bookings yet</p>
            <Link to="/vendor/bookings" className="mt-3 inline-flex h-10 items-center rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white">
              Add booking
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
