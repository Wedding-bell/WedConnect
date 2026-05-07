import { useEffect, useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon } from "lucide-react";
import { getCalendar } from "../../api/vendorBookings";
import type { CalendarEntry } from "../../api/vendorBookings";
import type { Booking } from "../../types";
import { CheckCircle2, AlertCircle } from "lucide-react";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function PaymentBadge({ status }: { status: Booking["payment_status"] }) {
  const config = {
    PAID: { color: "bg-green-50 text-green-700 border-green-200", label: "Paid", icon: CheckCircle2 },
    PARTIAL: { color: "bg-amber-50 text-amber-700 border-amber-200", label: "Partial", icon: AlertCircle },
    NOT_PAID: { color: "bg-red-50 text-red-600 border-red-200", label: "Unpaid", icon: AlertCircle },
  }[status];
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
      <Icon className="w-3 h-3" /> {config.label}
    </span>
  );
}

export function VendorCalendar() {
  const today = new Date();
  const [calendarData, setCalendarData] = useState<Record<string, CalendarEntry[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  useEffect(() => {
    fetchCalendar();
  }, []);

  const fetchCalendar = async () => {
    setLoading(true);
    try {
      const calData = await getCalendar();
      setCalendarData(calData || {});
    } catch (err) {
      console.error("Failed to load calendar:", err);
    } finally {
      setLoading(false);
    }
  };

  // Calendar calculation
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [currentMonth, currentYear, firstDayOfMonth, daysInMonth]);

  const dateKey = (d: number) => {
    const mm = String(currentMonth + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    return `${currentYear}-${mm}-${dd}`;
  };

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const todayKey = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
  const selectedEntries = selectedDate ? (calendarData[selectedDate] || []) : [];

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 lg:pb-0">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-stone-900 tracking-tight">Event Calendar</h2>
        <p className="text-xs sm:text-sm text-stone-500">View and manage your upcoming events day-by-day.</p>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          {/* Month navigation */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
            <button onClick={prevMonth} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
              <ChevronLeft className="w-5 h-5 text-stone-600" />
            </button>
            <h3 className="text-base font-semibold text-stone-900">{MONTHS[currentMonth]} {currentYear}</h3>
            <button onClick={nextMonth} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
              <ChevronRight className="w-5 h-5 text-stone-600" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-stone-100">
            {DAYS.map(d => (
              <div key={d} className="py-2 text-center text-[10px] sm:text-xs font-semibold text-stone-400 uppercase tracking-wider">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {loading ? (
                // Simple skeleton
                [...Array(35)].map((_, i) => (
                    <div key={i} className="h-12 sm:h-16 border-b border-r border-stone-50 animate-pulse" />
                ))
            ) : (
                calendarDays.map((day, i) => {
                    if (!day) return <div key={`empty-${i}`} className="h-12 sm:h-16 border-b border-r border-stone-50" />;
                    const key = dateKey(day);
                    const events = calendarData[key] || [];
                    const isToday = key === todayKey;
                    const isSelected = key === selectedDate;
    
                    return (
                      <button key={key} onClick={() => setSelectedDate(isSelected ? null : key)}
                        className={`h-12 sm:h-16 p-1 sm:p-2 border-b border-r border-stone-50 flex flex-col transition-colors relative ${isSelected ? "bg-stone-900" : isToday ? "bg-stone-50" : "hover:bg-stone-50"}`}>
                        <span className={`text-xs sm:text-sm font-medium self-end leading-none ${isSelected ? "text-white" : isToday ? "text-stone-900 font-bold" : "text-stone-700"}`}>{day}</span>
                        {events.length > 0 && (
                          <div className="mt-auto flex gap-0.5 flex-wrap">
                            {events.slice(0, 3).map((_, ei) => (
                              <div key={ei} className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white/70" : "bg-stone-700"}`} />
                            ))}
                            {events.length > 3 && <span className={`text-[8px] leading-none ${isSelected ? "text-white/60" : "text-stone-400"}`}>+{events.length - 3}</span>}
                          </div>
                        )}
                      </button>
                    );
                  })
            )}
          </div>
        </div>

        {/* Selected date detail panel */}
        {selectedDate && (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5">
            <h4 className="font-semibold text-stone-900 mb-3">
              {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </h4>
            {selectedEntries.length === 0 ? (
              <p className="text-sm text-stone-400">No bookings on this day.</p>
            ) : (
              <div className="space-y-3">
                {selectedEntries.map(entry => (
                  <div key={entry.booking_id} className="flex items-start justify-between py-3 border-b border-stone-100 last:border-0">
                    <div>
                      <p className="font-medium text-stone-900">{entry.customer_name}</p>
                      <p className="text-sm text-stone-500">{entry.phone_number}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {entry.slots.map((s, i) => (
                          <span key={i} className="inline-flex items-center gap-1 text-xs text-stone-500">
                            <Clock className="w-3 h-3" /> {s.start_time} – {s.end_time}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right space-y-1.5 flex-shrink-0 ml-4">
                      <p className="font-semibold text-stone-900 text-sm">₹{entry.total_amount.toLocaleString()}</p>
                      <PaymentBadge status={entry.payment_status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
