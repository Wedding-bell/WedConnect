import { useState, useEffect, useRef } from "react";
import { X, ArrowLeft, ArrowRight, Check, Plus, Trash2, Calendar, Clock } from "lucide-react";
import type { CreateBookingPayload, BookingDate, BookingSlot, District } from "../../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateBookingPayload) => Promise<void>;
  districts: District[];
}

const STEPS = ["Client", "Location", "Payment", "Dates"] as const;
type Step = 0 | 1 | 2 | 3 | 4; // 4 = review

const emptySlot = (): BookingSlot => ({ start_time: "09:00", end_time: "17:00" });
const emptyDate = (): BookingDate => ({
  event_date: new Date().toISOString().split("T")[0],
  slots: [emptySlot()],
});

function fmt(val: string | number) {
  const n = parseFloat(String(val));
  if (!n || isNaN(n)) return "—";
  return "₹" + n.toLocaleString("en-IN");
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex gap-1.5 px-5 pb-3 pt-1">
      {STEPS.map((_, i) => (
        <div
          key={i}
          className="h-[3px] flex-1 rounded-full transition-all duration-300"
          style={{
            background:
              i < step
                ? "#1a1a1a"
                : i === step
                ? "#888"
                : "var(--border-color)",
          }}
        />
      ))}
    </div>
  );
}

function StepHeader({ step, title, sub }: { step: number; title: string; sub?: string }) {
  return (
    <div className="px-5 pb-4">
      <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-400 mb-1">
        Step {step + 1} of {STEPS.length} · {STEPS[step]}
      </p>
      <h2 className="text-[19px] font-semibold text-zinc-900 leading-snug">{title}</h2>
      {sub && <p className="text-sm text-zinc-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function Field({
  label,
  required,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[12px] font-medium text-zinc-500 tracking-wide">
        {label}
        {required && <span className="text-zinc-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-zinc-400">{hint}</p>}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-3 text-[15px] text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-400 focus:bg-white focus:ring-2 focus:ring-zinc-100 transition-all";

function PhoneInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex gap-2">
      <div className="flex items-center rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-[14px] text-zinc-500 select-none shrink-0">
        +91
      </div>
      <input
        type="tel"
        className={inputCls}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "9876543210"}
        inputMode="numeric"
      />
    </div>
  );
}

function CurrencyInput({
  value,
  onChange,
  placeholder,
}: {
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[15px] text-zinc-400 select-none">
        ₹
      </span>
      <input
        type="number"
        min="0"
        className={inputCls + " pl-7"}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "0"}
        inputMode="numeric"
      />
    </div>
  );
}

// ─── Step Screens ─────────────────────────────────────────────────────────────

function Step0Client({
  data,
  onChange,
}: {
  data: CreateBookingPayload;
  onChange: (patch: Partial<CreateBookingPayload>) => void;
}) {
  return (
    <div className="px-5 space-y-4">
      <Field label="Customer name" required>
        <input
          className={inputCls}
          placeholder="e.g. Rahul & Priya"
          value={data.customer_name}
          onChange={(e) => onChange({ customer_name: e.target.value })}
          autoFocus
        />
      </Field>
      <Field label="Phone number" required>
        <PhoneInput
          value={data.phone_number}
          onChange={(v) => onChange({ phone_number: v })}
        />
      </Field>
      <Field label="Alternative phone">
        <PhoneInput
          value={data.alternative_phone_number ?? ""}
          onChange={(v) => onChange({ alternative_phone_number: v })}
          placeholder="Optional"
        />
      </Field>
    </div>
  );
}

function Step1Location({
  data,
  onChange,
  districts,
}: {
  data: CreateBookingPayload;
  onChange: (patch: Partial<CreateBookingPayload>) => void;
  districts: District[];
}) {
  return (
    <div className="px-5 space-y-4">
      <Field label="District">
        <select
          className={inputCls + " appearance-none"}
          value={data.district ?? ""}
          onChange={(e) =>
            onChange({ district: Number(e.target.value) || undefined })
          }
        >
          <option value="">Select district</option>
          {districts.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Venue address" required>
        <textarea
          className={inputCls + " resize-none h-[80px] leading-relaxed"}
          placeholder="Full venue address"
          value={data.address}
          onChange={(e) => onChange({ address: e.target.value })}
        />
      </Field>
      <Field
        label="Google Maps link"
        hint="Optional — helps with navigation on event day"
      >
        <input
          type="url"
          className={inputCls}
          placeholder="https://maps.google.com/..."
          value={data.map_url ?? ""}
          onChange={(e) => onChange({ map_url: e.target.value })}
        />
      </Field>
    </div>
  );
}

function Step2Payment({
  data,
  onChange,
}: {
  data: CreateBookingPayload;
  onChange: (patch: Partial<CreateBookingPayload>) => void;
}) {
  const total = parseFloat(String(data.total_amount)) || 0;
  const advance = parseFloat(String(data.advance_amount)) || 0;
  const balance = Math.max(0, total - advance);

  return (
    <div className="px-5 space-y-4">
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 space-y-4">
        <Field label="Total amount" required>
          <CurrencyInput
            value={data.total_amount}
            onChange={(v) => onChange({ total_amount: Number(v) })}
          />
        </Field>
        <Field label="Advance received">
          <CurrencyInput
            value={data.advance_amount}
            onChange={(v) => onChange({ advance_amount: Number(v) })}
          />
        </Field>
        <div className="border-t border-zinc-200 pt-3 flex items-center justify-between">
          <span className="text-sm text-zinc-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Balance due
          </span>
          <span className="text-[17px] font-semibold text-zinc-900">
            {fmt(balance)}
          </span>
        </div>
      </div>
      <p className="text-[11px] text-zinc-400">
        Balance is calculated automatically. You can update payments anytime.
      </p>
    </div>
  );
}

function Step3Dates({
  dates,
  onDatesChange,
}: {
  dates: BookingDate[];
  onDatesChange: (dates: BookingDate[]) => void;
}) {
  const addDate = () =>
    onDatesChange([...dates, emptyDate()]);

  const removeDate = (di: number) =>
    onDatesChange(dates.filter((_, i) => i !== di));

  const updateDateField = (di: number, field: keyof BookingDate, value: string) => {
    const next = [...dates];
    next[di] = { ...next[di], [field]: value };
    onDatesChange(next);
  };

  const addSlot = (di: number) => {
    const next = [...dates];
    next[di] = { ...next[di], slots: [...next[di].slots, emptySlot()] };
    onDatesChange(next);
  };

  const removeSlot = (di: number, si: number) => {
    const next = [...dates];
    next[di] = {
      ...next[di],
      slots: next[di].slots.filter((_, i) => i !== si),
    };
    onDatesChange(next);
  };

  const updateSlot = (
    di: number,
    si: number,
    field: keyof BookingSlot,
    value: string
  ) => {
    const next = [...dates];
    const slots = [...next[di].slots];
    slots[si] = { ...slots[si], [field]: value };
    next[di] = { ...next[di], slots };
    onDatesChange(next);
  };

  return (
    <div className="px-5 space-y-3">
      {dates.map((date, di) => (
        <div
          key={di}
          className="rounded-2xl border border-zinc-200 overflow-hidden"
        >
          {/* Date header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-zinc-50 border-b border-zinc-200">
            <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4 text-zinc-500" />
            </div>
            <input
              type="date"
              required
              className="flex-1 bg-transparent text-[15px] font-medium text-zinc-900 outline-none"
              value={date.event_date}
              onChange={(e) => updateDateField(di, "event_date", e.target.value)}
            />
            {dates.length > 1 && (
              <button
                type="button"
                onClick={() => removeDate(di)}
                className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                aria-label="Remove date"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Slots */}
          <div className="p-3 space-y-2">
            {date.slots.map((slot, si) => (
              <div
                key={si}
                className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2"
              >
                <span className="text-[11px] text-zinc-400 w-7 shrink-0">From</span>
                <input
                  type="time"
                  required
                  className="flex-1 bg-transparent text-[14px] text-zinc-900 outline-none"
                  value={slot.start_time}
                  onChange={(e) => updateSlot(di, si, "start_time", e.target.value)}
                />
                <span className="text-[11px] text-zinc-400">→</span>
                <input
                  type="time"
                  required
                  className="flex-1 bg-transparent text-[14px] text-zinc-900 outline-none"
                  value={slot.end_time}
                  onChange={(e) => updateSlot(di, si, "end_time", e.target.value)}
                />
                {date.slots.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSlot(di, si)}
                    className="p-1 text-zinc-300 hover:text-red-400 transition-colors"
                    aria-label="Remove slot"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addSlot(di)}
              className="flex items-center gap-1.5 text-[13px] text-zinc-400 hover:text-zinc-700 transition-colors pt-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add time slot
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addDate}
        className="w-full flex items-center justify-center gap-2 py-3.5 border border-dashed border-zinc-300 rounded-2xl text-[14px] text-zinc-400 hover:text-zinc-700 hover:border-zinc-400 transition-all"
      >
        <Plus className="w-4 h-4" />
        Add another date
      </button>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start gap-4 py-2.5 border-b border-zinc-100 last:border-0">
      <span className="text-[13px] text-zinc-400 shrink-0">{label}</span>
      <span className="text-[14px] font-medium text-zinc-900 text-right">{value}</span>
    </div>
  );
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-1 mb-3">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 pt-3 pb-1">
        {title}
      </p>
      {children}
    </div>
  );
}

function StepReview({ data }: { data: CreateBookingPayload }) {
  const total = parseFloat(String(data.total_amount)) || 0;
  const advance = parseFloat(String(data.advance_amount)) || 0;
  const balance = Math.max(0, total - advance);

  return (
    <div className="px-5">
      <ReviewSection title="Client">
        <ReviewRow label="Name" value={data.customer_name || "—"} />
        <ReviewRow label="Phone" value={data.phone_number ? `+91 ${data.phone_number}` : "—"} />
        {data.alternative_phone_number && (
          <ReviewRow label="Alt phone" value={`+91 ${data.alternative_phone_number}`} />
        )}
      </ReviewSection>

      <ReviewSection title="Location">
        <ReviewRow label="Address" value={data.address || "—"} />
      </ReviewSection>

      <ReviewSection title="Payment">
        <ReviewRow label="Total" value={fmt(data.total_amount)} />
        <ReviewRow label="Advance" value={fmt(data.advance_amount)} />
        <ReviewRow label="Balance" value={fmt(balance)} />
      </ReviewSection>

      <ReviewSection title="Dates & slots">
        {data.dates.map((d, i) => (
          <ReviewRow
            key={i}
            label={new Date(d.event_date + "T00:00:00").toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
            value={
              <span className="flex flex-col gap-0.5">
                {d.slots.map((s, si) => (
                  <span key={si}>{s.start_time} – {s.end_time}</span>
                ))}
              </span>
            }
          />
        ))}
      </ReviewSection>
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export function CreateBookingModal({ isOpen, onClose, onSubmit, districts }: Props) {
  const [step, setStep] = useState<Step>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<CreateBookingPayload>({
    customer_name: "",
    district: undefined,
    address: "",
    phone_number: "",
    alternative_phone_number: "",
    map_url: "",
    total_amount: 0,
    advance_amount: 0,
    dates: [emptyDate()],
  });

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setVisible(true), 10);
    } else {
      setVisible(false);
      setTimeout(() => {
        setStep(0);
        setError("");
        setFormData({
          customer_name: "",
          district: undefined,
          address: "",
          phone_number: "",
          alternative_phone_number: "",
          map_url: "",
          total_amount: 0,
          advance_amount: 0,
          dates: [emptyDate()],
        });
      }, 300);
    }
  }, [isOpen]);

  // Scroll to top on step change
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  if (!isOpen) return null;

  const patch = (p: Partial<CreateBookingPayload>) =>
    setFormData((prev) => ({ ...prev, ...p }));

  const canProceed = () => {
    if (step === 0) return !!formData.customer_name.trim() && !!formData.phone_number.trim();
    if (step === 1) return !!formData.address.trim();
    if (step === 2) return !!formData.total_amount;
    return true;
  };

  const handleNext = () => {
    setError("");
    if (step < 4) setStep((step + 1) as Step);
  };

  const handleBack = () => {
    setError("");
    if (step > 0) setStep((step - 1) as Step);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const payload: CreateBookingPayload = {
        ...formData,
        customer_name: formData.customer_name.trim(),
        address: formData.address.trim(),
        phone_number: formData.phone_number.trim(),
        alternative_phone_number: formData.alternative_phone_number?.trim() || undefined,
        map_url: formData.map_url?.trim() || undefined,
      };

      await onSubmit(payload);
      onClose();
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const resp = (err as Record<string, any>)?.response?.data;
      if (resp) {
        const key = Object.keys(resp)[0];
        setError(Array.isArray(resp[key]) ? resp[key][0] : String(resp[key]));
      } else {
        setError(err instanceof Error ? err.message : "Failed to create booking.");
      }
    } finally {
      setLoading(false);
    }
  };

  const isReview = step === 4;

  const stepTitles = [
    { title: "Who's the client?", sub: "Basic contact information" },
    { title: "Where's the event?", sub: "Venue and location details" },
    { title: "Payment details", sub: "Total and advance received" },
    { title: "When is the event?", sub: "Dates and time slots" },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end bg-black/50 backdrop-blur-sm">
      {/* Backdrop tap to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet */}
      <div
        className="relative z-10 bg-white rounded-t-3xl flex flex-col overflow-hidden transition-transform duration-300 ease-out"
        style={{
          maxHeight: "92dvh",
          transform: visible ? "translateY(0)" : "translateY(100%)",
        }}
      >
        {/* Drag pill */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-9 h-[4px] rounded-full bg-zinc-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 shrink-0">
          <div>
            <h1 className="text-[17px] font-semibold text-zinc-900">
              {isReview ? "Review booking" : "New Booking"}
            </h1>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress */}
        {!isReview && <ProgressBar step={step} />}

        {/* Step label + title */}
        {!isReview && (
          <StepHeader
            step={step}
            title={stepTitles[step].title}
            sub={stepTitles[step].sub}
          />
        )}
        {isReview && (
          <div className="px-5 pb-4">
            <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-400 mb-1">
              Confirm details
            </p>
            <h2 className="text-[19px] font-semibold text-zinc-900">Looks good?</h2>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mx-5 mb-3 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Scrollable content */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto overscroll-contain pb-4"
        >
          {step === 0 && <Step0Client data={formData} onChange={patch} />}
          {step === 1 && (
            <Step1Location data={formData} onChange={patch} districts={districts} />
          )}
          {step === 2 && <Step2Payment data={formData} onChange={patch} />}
          {step === 3 && (
            <Step3Dates
              dates={formData.dates}
              onDatesChange={(dates) => patch({ dates })}
            />
          )}
          {isReview && <StepReview data={formData} />}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-zinc-100 px-5 py-3 flex items-center gap-3 bg-white">
          {step > 0 && (
            <button
              type="button"
              onClick={handleBack}
              className="w-11 h-11 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-500 hover:bg-zinc-50 transition-colors shrink-0"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          {!isReview ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex-1 h-12 rounded-2xl bg-zinc-900 text-white text-[15px] font-medium flex items-center justify-center gap-2 hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {step === 3 ? "Review booking" : "Continue"}
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 h-12 rounded-2xl bg-zinc-900 text-white text-[15px] font-medium flex items-center justify-center gap-2 hover:bg-black disabled:opacity-50 transition-all"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Save booking
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
