import { useEffect, useState } from "react";
import { Plus, CheckCircle2, AlertCircle, Calendar } from "lucide-react";
import { Button } from "../../components/ui/button";
import { getBookings, createBooking } from "../../api/vendorBookings";
import { getDistricts } from "../../api/adminVendors";
import { CreateBookingModal } from "../../components/vendor/CreateBookingModal";
import type { Booking, District, CreateBookingPayload } from "../../types";

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

export function VendorBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [districts, setDistricts] = useState<District[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
                bookings.map(b => (
                  <tr key={b.id} className="hover:bg-stone-50 transition-colors cursor-pointer">
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
                      <p className="font-semibold text-stone-900">₹{Number(b.total_amount).toLocaleString()}</p>
                      <p className="text-xs text-stone-400">Bal: ₹{Number(b.balance_amount).toLocaleString()}</p>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <PaymentBadge status={b.payment_status} />
                    </td>
                  </tr>
                ))
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
