import { useEffect, useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar as CalendarIcon,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { getCalendar } from "../../api/vendorBookings";
import type { CalendarEntry } from "../../api/vendorBookings";
import type { Booking } from "../../types";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAYS_SHORT = ["Su","Mo","Tu","We","Th","Fr","Sa"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toKey(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function todayKey() {
  const t = new Date();
  return toKey(t.getFullYear(), t.getMonth(), t.getDate());
}

// ─── Payment Badge ─────────────────────────────────────────────────────────────

const PAYMENT_CONFIG = {
  PAID: {
    label: "Paid",
    Icon: CheckCircle2,
    cls: "bg-green-50 text-green-800 border-green-200",
  },
  PARTIAL: {
    label: "Partial",
    Icon: AlertCircle,
    cls: "bg-amber-50 text-amber-800 border-amber-200",
  },
  NOT_PAID: {
    label: "Unpaid",
    Icon: XCircle,
    cls: "bg-red-50 text-red-800 border-red-200",
  },
} as const;

function PaymentBadge({ status }: { status: Booking["payment_status"] }) {
  const { label, Icon, cls } = PAYMENT_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${cls}`}
    >
      <Icon className="w-2.5 h-2.5" />
      {label}
    </span>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="bg-zinc-50 rounded-xl p-3 text-center">
      <div className="text-[18px] font-semibold text-zinc-900 leading-none">{value}</div>
      <div className="text-[10px] text-zinc-400 mt-1 uppercase tracking-wider">{label}</div>
    </div>
  );
}

// ─── Booking Card ──────────────────────────────────────────────────────────────

function BookingCard({ entry }: { entry: CalendarEntry }) {
  const balance = entry.balance_amount;
  return (
    <div className="bg-zinc-50 rounded-2xl p-4">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-zinc-900 truncate">
            {entry.customer_name}
          </p>
          <p className="text-[12px] text-zinc-400 mt-0.5">{entry.phone_number}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[15px] font-semibold text-zinc-900">
            ₹{entry.total_amount.toLocaleString("en-IN")}
          </p>
          <div className="mt-1">
            <PaymentBadge status={entry.payment_status} />
          </div>
          {balance > 0 && (
            <p className="text-[10px] text-zinc-400 mt-1">
              ₹{balance.toLocaleString("en-IN")} due
            </p>
          )}
        </div>
      </div>

      {/* Slots */}
      <div className="flex flex-wrap gap-1.5 pt-3 border-t border-zinc-200">
        {entry.slots.map((slot, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 text-[11px] text-zinc-500 bg-white border border-zinc-200 rounded-full px-2.5 py-1"
          >
            <Clock className="w-2.5 h-2.5" />
            {slot.start_time}–{slot.end_time}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Empty Detail State ────────────────────────────────────────────────────────

function EmptyDetail({ hasDate }: { hasDate: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-2">
      <CalendarIcon className="w-8 h-8 text-zinc-200" />
      <p className="text-[13px] text-zinc-400">
        {hasDate ? "No bookings on this day" : "Tap a date to see bookings"}
      </p>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function VendorCalendar() {
  const today = new Date();
  const tk = todayKey();

  const [calendarData, setCalendarData] = useState<Record<string, CalendarEntry[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getCalendar();
        setCalendarData(data || {});
      } catch (e) {
        console.error("Calendar fetch failed", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Calendar grid ──
  const { calendarDays, daysInMonth } = useMemo(() => {
    const dim = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= dim; d++) days.push(d);
    return { calendarDays: days, daysInMonth: dim };
  }, [currentMonth, currentYear]);

  // ── Stats ──
  const stats = useMemo(() => {
    let monthCount = 0;
    let upcoming = 0;
    let due = 0;
    Object.entries(calendarData).forEach(([k, entries]) => {
      const [y, m] = k.split("-").map(Number);
      if (y === currentYear && m === currentMonth + 1) monthCount += entries.length;
      if (k >= tk) {
        upcoming += entries.length;
        entries.forEach((e) => {
          due += e.balance_amount;
        });
      }
    });
    const dueStr =
      due >= 100000
        ? `₹${(due / 100000).toFixed(1)}L`
        : due >= 1000
        ? `₹${Math.round(due / 1000)}k`
        : `₹${due}`;
    return { monthCount, upcoming, dueStr };
  }, [calendarData, currentMonth, currentYear, tk]);

  // ── Navigation ──
  const prevMonth = () => {
    setSelectedDate(null);
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1); }
    else setCurrentMonth((m) => m - 1);
  };
  const nextMonth = () => {
    setSelectedDate(null);
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1); }
    else setCurrentMonth((m) => m + 1);
  };

  const toggleDate = (key: string) =>
    setSelectedDate((prev) => (prev === key ? null : key));

  const selectedEntries = selectedDate ? (calendarData[selectedDate] ?? []) : [];

  return (
    <div className="space-y-0 pb-24 lg:pb-0">

      {/* Page header */}
      <div className="px-1 pb-4">
        <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">Calendar</h1>
        <p className="text-xs text-zinc-400 mt-0.5">Your booked events at a glance</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <StatCard value={stats.monthCount} label="This month" />
        <StatCard value={stats.upcoming} label="Upcoming" />
        <StatCard value={stats.dueStr} label="Balance due" />
      </div>

      {/* Calendar card */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">

        {/* Month nav */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
          <button
            onClick={prevMonth}
            className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 hover:bg-zinc-100 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-[15px] font-semibold text-zinc-900">
            {MONTHS[currentMonth]} {currentYear}
          </span>
          <button
            onClick={nextMonth}
            className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 hover:bg-zinc-100 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 px-3 pt-2 pb-1">
          {DAYS_SHORT.map((d) => (
            <div
              key={d}
              className="text-center text-[10px] font-medium text-zinc-400 uppercase tracking-wider py-1"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-0.5 px-3 pb-3">
          {loading
            ? Array.from({ length: 35 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-xl bg-zinc-50 animate-pulse"
                />
              ))
            : calendarDays.map((day, i) => {
                if (!day)
                  return <div key={`e-${i}`} className="aspect-square" />;

                const key = toKey(currentYear, currentMonth, day);
                const events = calendarData[key] ?? [];
                const isToday = key === tk;
                const isSelected = key === selectedDate;
                const hasEvents = events.length > 0;

                return (
                  <button
                    key={key}
                    onClick={() => toggleDate(key)}
                    aria-label={`${day} ${MONTHS[currentMonth]}, ${events.length} bookings`}
                    className={[
                      "aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all",
                      isSelected
                        ? "bg-zinc-900"
                        : isToday
                        ? "bg-zinc-100"
                        : hasEvents
                        ? "hover:bg-zinc-50"
                        : "hover:bg-zinc-50",
                    ].join(" ")}
                  >
                    {/* Day number */}
                    {isToday && !isSelected ? (
                      <div className="w-6 h-6 rounded-full border-[1.5px] border-zinc-900 flex items-center justify-center">
                        <span className="text-[12px] font-semibold text-zinc-900 leading-none">
                          {day}
                        </span>
                      </div>
                    ) : (
                      <span
                        className={[
                          "text-[13px] leading-none",
                          isSelected
                            ? "text-white font-semibold"
                            : "text-zinc-700",
                        ].join(" ")}
                      >
                        {day}
                      </span>
                    )}

                    {/* Booking dots */}
                    {hasEvents && (
                      <div className="flex gap-[3px]">
                        {Array.from({ length: Math.min(events.length, 3) }).map(
                          (_, di) => (
                            <div
                              key={di}
                              className={[
                                "w-[4px] h-[4px] rounded-full",
                                isSelected ? "bg-white/70" : "bg-zinc-800",
                              ].join(" ")}
                            />
                          )
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
        </div>

        {/* Dot legend */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-t border-zinc-100">
          <div className="flex gap-1">
            <div className="w-[4px] h-[4px] rounded-full bg-zinc-800 mt-[1px]" />
            <div className="w-[4px] h-[4px] rounded-full bg-zinc-800 mt-[1px]" />
          </div>
          <span className="text-[11px] text-zinc-400">Each dot = 1 booking</span>
        </div>
      </div>

      {/* Detail panel */}
      <div className="mt-3 bg-white rounded-2xl border border-zinc-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between">
          <p className="text-[13px] font-semibold text-zinc-900">
            {selectedDate
              ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })
              : "Bookings"}
          </p>
          {selectedDate && selectedEntries.length > 0 && (
            <span className="text-[11px] font-medium text-zinc-400 bg-zinc-100 rounded-full px-2.5 py-0.5">
              {selectedEntries.length} booking{selectedEntries.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="p-3 space-y-2">
          {!selectedDate || selectedEntries.length === 0 ? (
            <EmptyDetail hasDate={!!selectedDate} />
          ) : (
            selectedEntries.map((entry) => (
              <BookingCard key={entry.booking_id} entry={entry} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}