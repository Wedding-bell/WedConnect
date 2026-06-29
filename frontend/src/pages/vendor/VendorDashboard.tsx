import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  IndianRupee,
  Plus,
  Receipt,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getDashboardOverview } from "../../api/vendorBookings";
import type { DashboardOverview, DashboardTotals } from "../../api/vendorBookings";
import type { Booking } from "../../types";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function money(value: string | number | undefined) {
  const amount = Number(value || 0);
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${Math.round(amount / 1000)}k`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

function fullMoney(value: string | number | undefined) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function StatTile({
  label,
  value,
  helper,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  tone: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/50">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
          <p className="mt-2 text-xl font-black text-slate-950">{value}</p>
          <p className="mt-1 text-xs text-slate-400">{helper}</p>
        </div>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tone}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
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
        <p className="truncate text-sm font-bold text-slate-950">{booking.customer_name}</p>
        <p className="mt-0.5 text-xs text-slate-400">{booking.dates?.[0]?.event_date ?? "Date pending"}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm font-black text-slate-950">{fullMoney(booking.total_amount)}</p>
        <p className="text-xs font-semibold text-emerald-600">{fullMoney(booking.profit_amount)} profit</p>
      </div>
    </Link>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-44 animate-pulse rounded-lg bg-white" />
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="h-28 animate-pulse rounded-lg bg-white" />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-lg bg-white" />
    </div>
  );
}

function emptyTotals(): DashboardTotals {
  return {
    bookings: 0,
    revenue: 0,
    received: 0,
    expenses: 0,
    profit: 0,
    pending_balance: 0,
    today: 0,
    upcoming: 0,
    past: 0,
  };
}

export function VendorDashboard() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getDashboardOverview({ year, month });
        setOverview(data);
      } catch (err) {
        console.error("Failed to load dashboard overview", err);
        setError("Unable to load dashboard right now.");
      } finally {
        setLoading(false);
      }
    })();
  }, [year, month]);

  const currentMonth = overview?.current_month ?? emptyTotals();
  const totals = overview?.totals ?? emptyTotals();
  const recent = overview?.recent_bookings ?? [];

  const selectedMonthLabel = `${MONTHS[month - 1]} ${year}`;
  const chartMax = useMemo(() => {
    const values = overview?.monthly.flatMap((item) => [item.revenue, item.expenses, item.profit]) ?? [0];
    return Math.max(...values, 1);
  }, [overview]);

  const changeMonth = (direction: -1 | 1) => {
    setMonth((current) => {
      const next = current + direction;
      if (next < 1) {
        setYear((value) => value - 1);
        return 12;
      }
      if (next > 12) {
        setYear((value) => value + 1);
        return 1;
      }
      return next;
    });
  };

  if (loading && !overview) return <DashboardSkeleton />;

  return (
    <div className="space-y-5 pb-4">
      <section className="rounded-lg bg-slate-950 p-5 text-white shadow-lg shadow-slate-300/50">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-200">Monthly overview</p>
            <h2 className="mt-2 text-2xl font-black leading-tight">{selectedMonthLabel}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Revenue, expenses, profit, and pending balance in one place.
            </p>
          </div>
          <Link
            to="/vendor/bookings"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-slate-950"
            aria-label="Add booking"
          >
            <Plus className="h-5 w-5" />
          </Link>
        </div>

        <div className="mt-5 flex items-center justify-between gap-2 rounded-lg bg-white/10 p-2">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="text-center">
            <p className="text-xs text-slate-300">Showing</p>
            <p className="text-sm font-bold">{selectedMonthLabel}</p>
          </div>
          <button
            type="button"
            onClick={() => changeMonth(1)}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-rose-100 bg-rose-50 px-3 py-3 text-sm font-semibold text-rose-700">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <section className="grid grid-cols-2 gap-3">
        <StatTile
          label="Revenue"
          value={money(currentMonth.revenue)}
          helper={`${currentMonth.bookings} bookings`}
          tone="bg-sky-50 text-sky-700"
          icon={IndianRupee}
        />
        <StatTile
          label="Profit"
          value={money(currentMonth.profit)}
          helper="After expenses"
          tone="bg-emerald-50 text-emerald-700"
          icon={TrendingUp}
        />
        <StatTile
          label="Expenses"
          value={money(currentMonth.expenses)}
          helper="This month"
          tone="bg-rose-50 text-rose-700"
          icon={Receipt}
        />
        <StatTile
          label="Balance"
          value={money(currentMonth.pending_balance)}
          helper="Yet to receive"
          tone="bg-amber-50 text-amber-700"
          icon={Wallet}
        />
      </section>

      <section className="grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-slate-200 bg-white p-3 text-center shadow-sm shadow-slate-200/50">
          <p className="text-xl font-black text-slate-950">{totals.today ?? 0}</p>
          <p className="mt-1 text-[11px] font-semibold uppercase text-slate-400">Today</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3 text-center shadow-sm shadow-slate-200/50">
          <p className="text-xl font-black text-slate-950">{totals.upcoming ?? 0}</p>
          <p className="mt-1 text-[11px] font-semibold uppercase text-slate-400">Upcoming</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3 text-center shadow-sm shadow-slate-200/50">
          <p className="text-xl font-black text-slate-950">{totals.bookings}</p>
          <p className="mt-1 text-[11px] font-semibold uppercase text-slate-400">Total</p>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/50">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-slate-950">Yearly graph</h3>
            <p className="mt-1 text-xs text-slate-400">Revenue, profit, and expenses for {year}</p>
          </div>
          <CalendarDays className="h-5 w-5 text-slate-400" />
        </div>

        <div className="flex h-56 items-end gap-2 overflow-x-auto pb-1">
          {(overview?.monthly ?? []).map((item) => {
            const revenueHeight = Math.max(5, (item.revenue / chartMax) * 100);
            const profitHeight = Math.max(5, (item.profit / chartMax) * 100);
            const expenseHeight = Math.max(5, (item.expenses / chartMax) * 100);

            return (
              <div key={item.month} className="flex min-w-[42px] flex-1 flex-col items-center gap-2">
                <div className="flex h-44 w-full items-end justify-center gap-1 rounded-lg bg-slate-50 px-1.5 py-2">
                  <span className="w-2 rounded-full bg-sky-500" style={{ height: `${revenueHeight}%` }} />
                  <span className="w-2 rounded-full bg-emerald-500" style={{ height: `${profitHeight}%` }} />
                  <span className="w-2 rounded-full bg-rose-400" style={{ height: `${expenseHeight}%` }} />
                </div>
                <span className="text-[10px] font-bold uppercase text-slate-400">{MONTHS[item.month - 1].slice(0, 3)}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold text-slate-500">
          <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-sky-500" />Revenue</span>
          <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-emerald-500" />Profit</span>
          <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-rose-400" />Expenses</span>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-950">Recent bookings</h3>
          <Link to="/vendor/bookings" className="text-xs font-bold text-rose-600">View all</Link>
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
