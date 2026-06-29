import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
  Sparkles,
  XCircle,
} from "lucide-react";
import { getCalendar } from "../../api/vendorBookings";
import type { CalendarEntry } from "../../api/vendorBookings";
import type { Booking } from "../../types";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS_SHORT = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

type CalendarFilter = "all" | "pending" | "paid";

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

function money(value: number | string | undefined) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function compactMoney(value: number | string | undefined) {
  const amount = Number(value || 0);
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${Math.round(amount / 1000)}k`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

function phoneDigits(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 ? `91${digits}` : digits;
}

function whatsappLink(entry: CalendarEntry) {
  const message = encodeURIComponent(
    `Hi ${entry.customer_name}, confirming your booking with us. Please let us know if there are any updates.`
  );
  return `https://wa.me/${phoneDigits(entry.phone_number)}?text=${message}`;
}

const PAYMENT_CONFIG = {
  PAID: {
    label: "Paid",
    Icon: CheckCircle2,
    cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  PARTIAL: {
    label: "Partial",
    Icon: AlertCircle,
    cls: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  NOT_PAID: {
    label: "Unpaid",
    Icon: XCircle,
    cls: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
  },
} as const;

function PaymentBadge({ status }: { status: Booking["payment_status"] }) {
  const { label, Icon, cls } = PAYMENT_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold ${cls}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: string | number; tone: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm shadow-slate-200/50">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1 text-lg font-black ${tone}`}>{value}</p>
    </div>
  );
}

function BookingCard({ entry }: { entry: CalendarEntry }) {
  const balance = entry.balance_amount;

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/50">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-black text-slate-950">{entry.customer_name}</p>
          <p className="mt-1 text-sm text-slate-400">{entry.phone_number}</p>
        </div>
        <PaymentBadge status={entry.payment_status} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-sky-50 p-2.5">
          <p className="text-[10px] font-bold uppercase text-sky-600">Revenue</p>
          <p className="mt-1 text-sm font-black text-slate-950">{compactMoney(entry.total_amount)}</p>
        </div>
        <div className="rounded-lg bg-emerald-50 p-2.5">
          <p className="text-[10px] font-bold uppercase text-emerald-600">Profit</p>
          <p className="mt-1 text-sm font-black text-slate-950">{compactMoney(entry.profit_amount)}</p>
        </div>
        <div className="rounded-lg bg-amber-50 p-2.5">
          <p className="text-[10px] font-bold uppercase text-amber-600">Balance</p>
          <p className="mt-1 text-sm font-black text-slate-950">{compactMoney(balance)}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5 border-t border-slate-100 pt-3">
        {entry.slots.map((slot, i) => (
          <span key={i} className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500">
            <Clock className="h-3 w-3" />
            {slot.start_time} - {slot.end_time}
          </span>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <a href={`tel:${entry.phone_number}`} className="flex h-10 items-center justify-center gap-1.5 rounded-lg border border-slate-200 text-sm font-bold text-slate-700">
          <Phone className="h-4 w-4" /> Call
        </a>
        <a href={whatsappLink(entry)} target="_blank" rel="noreferrer" className="flex h-10 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 text-sm font-bold text-white">
          <MessageCircle className="h-4 w-4" /> Chat
        </a>
        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(entry.customer_name)}`} target="_blank" rel="noreferrer" className="flex h-10 items-center justify-center gap-1.5 rounded-lg border border-slate-200 text-sm font-bold text-slate-700">
          <MapPin className="h-4 w-4" /> Map
        </a>
      </div>
    </article>
  );
}

function EmptyDetail({ hasDate }: { hasDate: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
      <CalendarIcon className="h-10 w-10 text-rose-300" />
      <p className="mt-3 text-sm font-bold text-slate-700">
        {hasDate ? "No events on this day" : "Tap a date to see bookings"}
      </p>
      <p className="mt-1 text-xs leading-5 text-slate-400">
        {hasDate ? "A peaceful day. You can add new bookings from the bookings tab." : "Your event details, money status, and quick actions will appear here."}
      </p>
    </div>
  );
}

export function VendorCalendar() {
  const today = new Date();
  const tk = todayKey();

  const [calendarData, setCalendarData] = useState<Record<string, CalendarEntry[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(tk);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [filter, setFilter] = useState<CalendarFilter>("all");

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

  const calendarDays = useMemo(() => {
    const dim = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= dim; d++) days.push(d);
    return days;
  }, [currentMonth, currentYear]);

  const monthEntries = useMemo(() => {
    return Object.entries(calendarData).flatMap(([key, entries]) => {
      const [year, month] = key.split("-").map(Number);
      return year === currentYear && month === currentMonth + 1 ? entries : [];
    });
  }, [calendarData, currentMonth, currentYear]);

  const monthStats = useMemo(() => {
    const revenue = monthEntries.reduce((sum, entry) => sum + entry.total_amount, 0);
    const due = monthEntries.reduce((sum, entry) => sum + entry.balance_amount, 0);
    const profit = monthEntries.reduce((sum, entry) => sum + entry.profit_amount, 0);
    const upcoming = Object.entries(calendarData).reduce((sum, [key, entries]) => key >= tk ? sum + entries.length : sum, 0);

    return { bookings: monthEntries.length, revenue, due, profit, upcoming };
  }, [calendarData, monthEntries, tk]);

  const selectedEntries = selectedDate ? (calendarData[selectedDate] ?? []) : [];
  const filteredEntries = selectedEntries.filter((entry) => {
    if (filter === "paid") return entry.payment_status === "PAID";
    if (filter === "pending") return entry.payment_status !== "PAID";
    return true;
  });

  const selectedSummary = useMemo(() => {
    return selectedEntries.reduce(
      (acc, entry) => {
        acc.revenue += entry.total_amount;
        acc.due += entry.balance_amount;
        acc.profit += entry.profit_amount;
        acc.expenses += entry.expense_amount;
        return acc;
      },
      { revenue: 0, due: 0, profit: 0, expenses: 0 }
    );
  }, [selectedEntries]);

  const prevMonth = () => {
    setSelectedDate(null);
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    setSelectedDate(null);
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const selectDate = (key: string) => {
    setSelectedDate(key);
  };

  return (
    <div className="space-y-4 pb-24 lg:pb-0">
      <section className="rounded-lg bg-slate-950 p-5 text-white shadow-lg shadow-slate-300/50">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-200">Calendar</p>
            <h1 className="mt-2 text-2xl font-black leading-tight">Know your day before it begins.</h1>
            <p className="mt-2 text-sm leading-6 text-slate-300">Bookings, money status, and quick client actions in one view.</p>
          </div>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-slate-950">
            <Sparkles className="h-5 w-5" />
          </span>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard label="Month events" value={monthStats.bookings} tone="text-slate-950" />
        <SummaryCard label="Revenue" value={compactMoney(monthStats.revenue)} tone="text-sky-700" />
        <SummaryCard label="Profit" value={compactMoney(monthStats.profit)} tone="text-emerald-700" />
        <SummaryCard label="Balance due" value={compactMoney(monthStats.due)} tone="text-amber-700" />
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-200/50">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <button onClick={prevMonth} className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 text-slate-600" aria-label="Previous month">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="text-center">
            <p className="text-base font-black text-slate-950">{MONTHS[currentMonth]} {currentYear}</p>
            <p className="text-xs text-slate-400">{monthStats.upcoming} upcoming bookings</p>
          </div>
          <button onClick={nextMonth} className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 text-slate-600" aria-label="Next month">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 px-3 pt-3">
          {DAYS_SHORT.map((day) => (
            <div key={day} className="py-1 text-center text-[10px] font-black uppercase tracking-wide text-slate-400">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 px-3 pb-3">
          {loading
            ? Array.from({ length: 35 }).map((_, i) => <div key={i} className="aspect-square animate-pulse rounded-lg bg-slate-50" />)
            : calendarDays.map((day, i) => {
                if (!day) return <div key={`empty-${i}`} className="aspect-square" />;

                const key = toKey(currentYear, currentMonth, day);
                const events = calendarData[key] ?? [];
                const isToday = key === tk;
                const isSelected = key === selectedDate;
                const hasEvents = events.length > 0;
                const hasDue = events.some((event) => event.payment_status !== "PAID");
                const allPaid = hasEvents && events.every((event) => event.payment_status === "PAID");

                return (
                  <button
                    key={key}
                    onClick={() => selectDate(key)}
                    aria-label={`${day} ${MONTHS[currentMonth]}, ${events.length} bookings`}
                    className={[
                      "relative aspect-square rounded-lg border text-sm transition-all",
                      isSelected
                        ? "border-slate-950 bg-slate-950 text-white shadow-md shadow-slate-300"
                        : isToday
                        ? "border-rose-200 bg-rose-50 text-rose-700"
                        : hasEvents
                        ? "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                        : "border-transparent bg-slate-50/60 text-slate-400 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    <span className="absolute left-2 top-2 font-black">{day}</span>
                    {hasEvents && (
                      <span className="absolute bottom-2 left-2 right-2 flex items-center justify-center gap-1">
                        {Array.from({ length: Math.min(events.length, 3) }).map((_, dotIndex) => (
                          <i
                            key={dotIndex}
                            className={[
                              "h-1.5 w-1.5 rounded-full",
                              isSelected ? "bg-white" : allPaid ? "bg-emerald-500" : hasDue ? "bg-amber-500" : "bg-slate-400",
                            ].join(" ")}
                          />
                        ))}
                      </span>
                    )}
                  </button>
                );
              })}
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 px-4 py-3 text-[11px] font-semibold text-slate-500">
          <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-emerald-500" />Paid</span>
          <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-amber-500" />Pending</span>
          <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-rose-200" />Today</span>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-200/50">
        <div className="border-b border-slate-100 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black text-slate-950">
                {selectedDate
                  ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })
                  : "Selected day"}
              </p>
              <p className="mt-1 text-xs text-slate-400">{selectedEntries.length} booking{selectedEntries.length === 1 ? "" : "s"}</p>
            </div>
            {selectedEntries.length > 0 && (
              <div className="rounded-lg bg-slate-50 px-3 py-2 text-right">
                <p className="text-[10px] font-bold uppercase text-slate-400">Day profit</p>
                <p className="text-sm font-black text-emerald-700">{money(selectedSummary.profit)}</p>
              </div>
            )}
          </div>

          {selectedEntries.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <SummaryCard label="Revenue" value={compactMoney(selectedSummary.revenue)} tone="text-sky-700" />
              <SummaryCard label="Expenses" value={compactMoney(selectedSummary.expenses)} tone="text-rose-700" />
              <SummaryCard label="Balance" value={compactMoney(selectedSummary.due)} tone="text-amber-700" />
              <SummaryCard label="Profit" value={compactMoney(selectedSummary.profit)} tone="text-emerald-700" />
            </div>
          )}

          {selectedEntries.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-1.5">
              {[
                { value: "all", label: "All" },
                { value: "pending", label: "Pending" },
                { value: "paid", label: "Paid" },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value as CalendarFilter)}
                  className={`h-9 rounded-md text-xs font-black transition-colors ${filter === item.value ? "bg-white text-slate-950 shadow-sm" : "text-slate-400"}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3 bg-slate-50/60 p-3">
          {!selectedDate || selectedEntries.length === 0 ? (
            <EmptyDetail hasDate={!!selectedDate} />
          ) : filteredEntries.length ? (
            filteredEntries.map((entry) => <BookingCard key={entry.booking_id} entry={entry} />)
          ) : (
            <div className="rounded-lg bg-white p-6 text-center text-sm font-semibold text-slate-400">No bookings match this filter.</div>
          )}
        </div>
      </section>
    </div>
  );
}
