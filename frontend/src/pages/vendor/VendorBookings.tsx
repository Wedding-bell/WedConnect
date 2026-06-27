import { Fragment, useEffect, useState } from "react";
import { Plus, CheckCircle2, AlertCircle, Calendar, Phone, MessageCircle, Receipt, TrendingUp } from "lucide-react";
import { Button } from "../../components/ui/button";
import { getBookings, createBooking, addExpense } from "../../api/vendorBookings";
import { getDistricts } from "../../api/adminVendors";
import { CreateBookingModal } from "../../components/vendor/CreateBookingModal";
import type { Booking, District, CreateBookingExpensePayload, CreateBookingPayload } from "../../types";

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

function EventBadge({ status }: { status: Booking["event_status"] }) {
  const config = {
    TODAY: { color: "bg-blue-50 text-blue-700 border-blue-200", label: "Today" },
    UPCOMING: { color: "bg-violet-50 text-violet-700 border-violet-200", label: "Upcoming" },
    PAST: { color: "bg-zinc-100 text-zinc-600 border-zinc-200", label: "Past" },
    UNKNOWN: { color: "bg-zinc-100 text-zinc-500 border-zinc-200", label: "Unknown" },
  }[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
      {config.label}
    </span>
  );
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
    <div className="space-y-4 sm:space-y-6 pb-24 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-stone-900 tracking-tight">Bookings</h2>
          <p className="text-xs sm:text-sm text-stone-500 hidden sm:block">Track events, manage clients and monitor payments.</p>
        </div>
      </div>

      {/* Floating Action Button (Centered Bottom) */}
      <div className="fixed bottom-20 lg:bottom-10 left-0 right-0 flex justify-center z-40 pointer-events-none">
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-stone-900 hover:bg-black text-white px-6 h-12 rounded-full flex items-center gap-2 shadow-xl hover:shadow-2xl transition-all hover:scale-105 pointer-events-auto border-2 border-white/10"
        >
          <Plus className="w-5 h-5" />
          <span className="font-semibold tracking-wide">New Booking</span>
        </Button>
      </div>

      {/* LIST VIEW */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] sm:text-xs text-stone-500 uppercase bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="px-4 sm:px-6 py-3 font-medium">Client</th>
                <th className="px-4 sm:px-6 py-3 font-medium hidden sm:table-cell">Event</th>
                <th className="px-4 sm:px-6 py-3 font-medium">Amount</th>
                <th className="px-4 sm:px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 sm:px-6 py-4"><div className="h-4 bg-stone-100 rounded w-3/4" /></td>
                    <td className="px-4 sm:px-6 py-4 hidden sm:table-cell"><div className="h-4 bg-stone-100 rounded w-20" /></td>
                    <td className="px-4 sm:px-6 py-4"><div className="h-4 bg-stone-100 rounded w-16" /></td>
                    <td className="px-4 sm:px-6 py-4"><div className="h-5 bg-stone-100 rounded-full w-14" /></td>
                  </tr>
                ))
              ) : bookings.length > 0 ? (
                bookings.map((b) => {
                  const isOpen = selectedBookingId === b.id;
                  const form = getExpenseForm(b.id);

                  return (
                    <Fragment key={b.id}>
                      <tr
                        className="hover:bg-stone-50 transition-colors cursor-pointer"
                        onClick={() => setSelectedBookingId(isOpen ? null : b.id)}
                      >
                        <td className="px-4 sm:px-6 py-4">
                          <p className="font-medium text-stone-900">{b.customer_name}</p>
                          <p className="text-xs text-stone-400">{b.phone_number}</p>
                        </td>
                        <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                          <div className="space-y-1">
                            <EventBadge status={b.event_status} />
                            {b.dates?.[0] && <p className="text-xs text-stone-400">{b.dates[0].event_date}</p>}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <p className="font-semibold text-stone-900">{formatCurrency(b.total_amount)}</p>
                          <p className="text-xs text-stone-400">Profit: {formatCurrency(b.profit_amount)}</p>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <PaymentBadge status={b.payment_status} />
                        </td>
                      </tr>
                      {isOpen && (
                        <tr className="bg-stone-50/70">
                          <td colSpan={4} className="px-4 sm:px-6 py-5">
                            <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
                              <div className="space-y-4">
                                <div className="flex flex-wrap items-center gap-2">
                                  <a
                                    href={`tel:${b.phone_number}`}
                                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 text-xs font-medium text-stone-700 hover:bg-stone-100"
                                  >
                                    <Phone className="h-3.5 w-3.5" /> Call
                                  </a>
                                  <a
                                    href={getWhatsAppHref(b)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 text-xs font-medium text-green-700 hover:bg-green-100"
                                  >
                                    <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                                  </a>
                                  {b.map_url && (
                                    <a
                                      href={b.map_url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex h-9 items-center rounded-lg border border-stone-200 bg-white px-3 text-xs font-medium text-stone-700 hover:bg-stone-100"
                                    >
                                      Open map
                                    </a>
                                  )}
                                </div>

                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                  <div className="rounded-xl border border-stone-200 bg-white p-3">
                                    <p className="text-[10px] uppercase text-stone-400">Revenue</p>
                                    <p className="mt-1 font-semibold text-stone-900">{formatCurrency(b.total_amount)}</p>
                                  </div>
                                  <div className="rounded-xl border border-stone-200 bg-white p-3">
                                    <p className="text-[10px] uppercase text-stone-400">Received</p>
                                    <p className="mt-1 font-semibold text-stone-900">{formatCurrency(b.total_paid)}</p>
                                  </div>
                                  <div className="rounded-xl border border-stone-200 bg-white p-3">
                                    <p className="text-[10px] uppercase text-stone-400">Expenses</p>
                                    <p className="mt-1 font-semibold text-red-600">{formatCurrency(b.total_expense)}</p>
                                  </div>
                                  <div className="rounded-xl border border-stone-200 bg-white p-3">
                                    <p className="text-[10px] uppercase text-stone-400">Profit</p>
                                    <p className="mt-1 font-semibold text-emerald-700">{formatCurrency(b.profit_amount)}</p>
                                  </div>
                                </div>

                                <div className="rounded-xl border border-stone-200 bg-white p-4">
                                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-stone-900">
                                    <Receipt className="h-4 w-4" /> Expenses for this booking
                                  </div>
                                  <div className="space-y-2">
                                    {b.expenses?.length ? b.expenses.map((expense) => (
                                      <div key={expense.id} className="flex items-start justify-between gap-3 rounded-lg bg-stone-50 px-3 py-2">
                                        <div>
                                          <p className="text-sm font-medium text-stone-800">{expense.title}</p>
                                          <p className="text-xs text-stone-400">{expense.spent_at}{expense.note ? ` · ${expense.note}` : ""}</p>
                                        </div>
                                        <p className="text-sm font-semibold text-stone-900">{formatCurrency(expense.amount)}</p>
                                      </div>
                                    )) : (
                                      <p className="rounded-lg bg-stone-50 px-3 py-3 text-xs text-stone-400">No expenses added yet.</p>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="rounded-xl border border-stone-200 bg-white p-4">
                                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-stone-900">
                                  <TrendingUp className="h-4 w-4" /> Add expense
                                </div>
                                <div className="space-y-3">
                                  <input
                                    className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm outline-none focus:border-stone-400 focus:bg-white"
                                    placeholder="Expense title, e.g. travel, mehendi items"
                                    value={form.title}
                                    onChange={(e) => updateExpenseForm(b.id, { title: e.target.value })}
                                  />
                                  <div className="grid grid-cols-2 gap-2">
                                    <input
                                      type="number"
                                      min="0"
                                      className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm outline-none focus:border-stone-400 focus:bg-white"
                                      placeholder="Amount"
                                      value={form.amount || ""}
                                      onChange={(e) => updateExpenseForm(b.id, { amount: Number(e.target.value) })}
                                    />
                                    <input
                                      type="date"
                                      className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm outline-none focus:border-stone-400 focus:bg-white"
                                      value={form.spent_at}
                                      onChange={(e) => updateExpenseForm(b.id, { spent_at: e.target.value })}
                                    />
                                  </div>
                                  <textarea
                                    className="h-20 w-full resize-none rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm outline-none focus:border-stone-400 focus:bg-white"
                                    placeholder="Optional note"
                                    value={form.note ?? ""}
                                    onChange={(e) => updateExpenseForm(b.id, { note: e.target.value })}
                                  />
                                  <Button
                                    type="button"
                                    disabled={savingExpenseId === b.id || !form.title.trim() || !form.amount}
                                    onClick={() => handleAddExpense(b.id)}
                                    className="w-full bg-stone-900 text-white hover:bg-black"
                                  >
                                    {savingExpenseId === b.id ? "Saving..." : "Add expense"}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Calendar className="w-10 h-10 mx-auto text-stone-200 mb-3" />
                    <p className="text-stone-400 text-sm">No bookings yet. Create your first one!</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateBookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateBooking}
        districts={districts}
      />
    </div>
  );
}
