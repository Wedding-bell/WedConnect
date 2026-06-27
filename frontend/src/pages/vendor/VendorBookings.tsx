import { useEffect, useState } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronDown,
  IndianRupee,
  MessageCircle,
  Phone,
  Plus,
  Receipt,
  TrendingUp,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { getBookings, createBooking, addExpense } from "../../api/vendorBookings";
import { getDistricts } from "../../api/adminVendors";
import { CreateBookingModal } from "../../components/vendor/CreateBookingModal";
import type { Booking, District, CreateBookingExpensePayload, CreateBookingPayload } from "../../types";

function PaymentBadge({ status }: { status: Booking["payment_status"] }) {
  const config = {
    PAID: { color: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Paid", icon: CheckCircle2 },
    PARTIAL: { color: "bg-amber-50 text-amber-700 border-amber-200", label: "Partial", icon: AlertCircle },
    NOT_PAID: { color: "bg-rose-50 text-rose-700 border-rose-200", label: "Unpaid", icon: AlertCircle },
  }[status];
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${config.color}`}>
      <Icon className="h-3 w-3" /> {config.label}
    </span>
  );
}

function EventBadge({ status }: { status: Booking["event_status"] }) {
  const config = {
    TODAY: "bg-sky-50 text-sky-700 border-sky-200",
    UPCOMING: "bg-violet-50 text-violet-700 border-violet-200",
    PAST: "bg-slate-100 text-slate-600 border-slate-200",
    UNKNOWN: "bg-slate-100 text-slate-500 border-slate-200",
  }[status];
  const label = { TODAY: "Today", UPCOMING: "Upcoming", PAST: "Past", UNKNOWN: "Unknown" }[status];
  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${config}`}>{label}</span>;
}

const todayIso = () => new Date().toISOString().split("T")[0];

const emptyExpenseForm = (): CreateBookingExpensePayload => ({
  title: "",
  amount: 0,
  note: "",
  spent_at: todayIso(),
});

function formatCurrency(value: string | number | undefined) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function phoneDigits(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 ? `91${digits}` : digits;
}

function getWhatsAppHref(booking: Booking) {
  const message = encodeURIComponent(`Hi ${booking.customer_name}, this is regarding your booking with us.`);
  return `https://wa.me/${phoneDigits(booking.phone_number)}?text=${message}`;
}

function StatLine({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-2 last:border-0">
      <span className="text-xs font-medium text-slate-400">{label}</span>
      <span className={`text-sm font-bold ${tone ?? "text-slate-950"}`}>{value}</span>
    </div>
  );
}

function BookingSkeleton() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/50">
      <div className="h-4 w-32 animate-pulse rounded bg-slate-100" />
      <div className="mt-3 h-3 w-24 animate-pulse rounded bg-slate-100" />
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="h-14 animate-pulse rounded-lg bg-slate-100" />
        <div className="h-14 animate-pulse rounded-lg bg-slate-100" />
      </div>
    </div>
  );
}

export function VendorBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [districts, setDistricts] = useState<District[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [expenseForms, setExpenseForms] = useState<Record<number, CreateBookingExpensePayload>>({});
  const [savingExpenseId, setSavingExpenseId] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
    getDistricts().then(setDistricts).catch(console.error);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const bookingsData = await getBookings();
      setBookings(bookingsData || []);
    } catch (err) {
      console.error("Failed to load bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBooking = async (payload: CreateBookingPayload) => {
    await createBooking(payload);
    fetchData();
  };

  const getExpenseForm = (bookingId: number) => expenseForms[bookingId] ?? emptyExpenseForm();

  const updateExpenseForm = (bookingId: number, patch: Partial<CreateBookingExpensePayload>) => {
    setExpenseForms((forms) => ({
      ...forms,
      [bookingId]: { ...(forms[bookingId] ?? emptyExpenseForm()), ...patch },
    }));
  };

  const handleAddExpense = async (bookingId: number) => {
    const form = getExpenseForm(bookingId);
    if (!form.title.trim() || !form.amount) return;

    setSavingExpenseId(bookingId);
    try {
      await addExpense(bookingId, { ...form, title: form.title.trim() });
      setExpenseForms((forms) => ({ ...forms, [bookingId]: emptyExpenseForm() }));
      await fetchData();
    } catch (err) {
      console.error("Failed to add expense:", err);
    } finally {
      setSavingExpenseId(null);
    }
  };

  return (
    <div className="space-y-4 pb-24 lg:pb-2">
      <section className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-500">Bookings</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Clients & events</h2>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="h-11 shrink-0 rounded-lg bg-slate-950 px-4 text-white hover:bg-slate-800"
        >
          <Plus className="mr-2 h-4 w-4" /> New
        </Button>
      </section>

      {loading ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {[1, 2, 3, 4].map((item) => <BookingSkeleton key={item} />)}
        </div>
      ) : bookings.length > 0 ? (
        <div className="grid gap-3 xl:grid-cols-2">
          {bookings.map((booking) => {
            const isOpen = selectedBookingId === booking.id;
            const form = getExpenseForm(booking.id);
            const firstDate = booking.dates?.[0]?.event_date;

            return (
              <article key={booking.id} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-200/50">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-base font-bold text-slate-950">{booking.customer_name}</h3>
                        <EventBadge status={booking.event_status} />
                      </div>
                      <p className="mt-1 text-sm text-slate-400">{firstDate ?? "Date pending"}</p>
                    </div>
                    <PaymentBadge status={booking.payment_status} />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-sky-50 p-3">
                      <p className="text-[11px] font-semibold uppercase text-sky-600">Revenue</p>
                      <p className="mt-1 text-lg font-bold text-slate-950">{formatCurrency(booking.total_amount)}</p>
                    </div>
                    <div className="rounded-lg bg-emerald-50 p-3">
                      <p className="text-[11px] font-semibold uppercase text-emerald-600">Profit</p>
                      <p className="mt-1 text-lg font-bold text-slate-950">{formatCurrency(booking.profit_amount)}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <a
                      href={`tel:${booking.phone_number}`}
                      className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700"
                    >
                      <Phone className="h-4 w-4" /> Call
                    </a>
                    <a
                      href={getWhatsAppHref(booking)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 text-sm font-semibold text-white"
                    >
                      <MessageCircle className="h-4 w-4" /> WhatsApp
                    </a>
                    <button
                      type="button"
                      onClick={() => setSelectedBookingId(isOpen ? null : booking.id)}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500"
                      aria-label="Toggle details"
                    >
                      <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-slate-100 bg-slate-50/70 p-4">
                    <div className="rounded-lg bg-white px-3 py-1">
                      <StatLine label="Received" value={formatCurrency(booking.total_paid)} />
                      <StatLine label="Balance" value={formatCurrency(booking.balance_amount)} />
                      <StatLine label="Expenses" value={formatCurrency(booking.total_expense)} tone="text-rose-600" />
                      <StatLine label="Profit" value={formatCurrency(booking.profit_amount)} tone="text-emerald-700" />
                    </div>

                    <div className="mt-4">
                      <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-950">
                        <Receipt className="h-4 w-4 text-rose-500" /> Expenses
                      </div>
                      <div className="space-y-2">
                        {booking.expenses?.length ? booking.expenses.map((expense) => (
                          <div key={expense.id} className="flex items-start justify-between gap-3 rounded-lg bg-white px-3 py-2">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-800">{expense.title}</p>
                              <p className="text-xs text-slate-400">{expense.spent_at}{expense.note ? ` · ${expense.note}` : ""}</p>
                            </div>
                            <p className="shrink-0 text-sm font-bold text-slate-950">{formatCurrency(expense.amount)}</p>
                          </div>
                        )) : (
                          <p className="rounded-lg bg-white px-3 py-3 text-sm text-slate-400">No expenses added yet.</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 rounded-lg bg-white p-3">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-950">
                        <TrendingUp className="h-4 w-4 text-emerald-600" /> Add expense
                      </div>
                      <input
                        className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-slate-400 focus:bg-white"
                        placeholder="Travel, products, helper fee"
                        value={form.title}
                        onChange={(e) => updateExpenseForm(booking.id, { title: e.target.value })}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <div className="relative">
                          <IndianRupee className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            type="number"
                            min="0"
                            className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-slate-400 focus:bg-white"
                            placeholder="Amount"
                            value={form.amount || ""}
                            onChange={(e) => updateExpenseForm(booking.id, { amount: Number(e.target.value) })}
                          />
                        </div>
                        <input
                          type="date"
                          className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-slate-400 focus:bg-white"
                          value={form.spent_at}
                          onChange={(e) => updateExpenseForm(booking.id, { spent_at: e.target.value })}
                        />
                      </div>
                      <textarea
                        className="h-20 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:bg-white"
                        placeholder="Optional note"
                        value={form.note ?? ""}
                        onChange={(e) => updateExpenseForm(booking.id, { note: e.target.value })}
                      />
                      <Button
                        type="button"
                        disabled={savingExpenseId === booking.id || !form.title.trim() || !form.amount}
                        onClick={() => handleAddExpense(booking.id)}
                        className="h-11 w-full rounded-lg bg-slate-950 text-white hover:bg-slate-800"
                      >
                        {savingExpenseId === booking.id ? "Saving..." : "Add expense"}
                      </Button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm shadow-slate-200/50">
          <Calendar className="mx-auto h-10 w-10 text-rose-300" />
          <p className="mt-3 text-base font-bold text-slate-900">No bookings yet</p>
          <Button onClick={() => setIsModalOpen(true)} className="mt-4 h-11 rounded-lg bg-slate-950 px-5 text-white hover:bg-slate-800">
            <Plus className="mr-2 h-4 w-4" /> Add booking
          </Button>
        </div>
      )}

      <CreateBookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateBooking}
        districts={districts}
      />
    </div>
  );
}
