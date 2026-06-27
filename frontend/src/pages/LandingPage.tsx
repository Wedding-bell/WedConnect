import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, IndianRupee, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "../components/ui/button";
import landingMobileImage from "../assets/images/landing-mobile.png";

const highlights = [
  { label: "Bookings", value: "All events", icon: CalendarDays, tone: "bg-sky-50 text-sky-700" },
  { label: "Income", value: "Clear totals", icon: IndianRupee, tone: "bg-emerald-50 text-emerald-700" },
  { label: "Clients", value: "Quick follow-up", icon: MessageCircle, tone: "bg-rose-50 text-rose-700" },
];

export function LandingPage() {
  return (
    <main className="min-h-screen bg-[#fbfaf8] text-slate-950">
      <section className="relative min-h-[92svh] overflow-hidden px-5 pb-6 pt-[env(safe-area-inset-top)] sm:px-8 lg:min-h-screen lg:px-12">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 lg:opacity-25"
          style={{ backgroundImage: `url(${landingMobileImage})` }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(251,250,248,0.94)_0%,rgba(251,250,248,0.86)_48%,rgba(251,250,248,1)_100%)]" aria-hidden />

        <div className="relative z-10 mx-auto flex min-h-[92svh] max-w-6xl flex-col lg:min-h-screen">
          <header className="flex items-center justify-between py-5">
            <Link to="/" className="flex items-center gap-2" aria-label="WedConnect home">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-white shadow-sm">
                <Sparkles className="h-5 w-5" />
              </span>
              <span className="text-base font-bold tracking-tight">WedConnect</span>
            </Link>
            <Link to="/vendor/login" className="text-sm font-semibold text-slate-600 hover:text-slate-950">
              Sign in
            </Link>
          </header>

          <div className="grid flex-1 items-center gap-8 py-8 lg:grid-cols-[1fr_0.78fr] lg:py-10">
            <div className="max-w-xl">
              <p className="inline-flex rounded-full border border-rose-100 bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-rose-600 shadow-sm">
                For wedding professionals
              </p>
              <h1 className="mt-5 text-[2.75rem] font-black leading-[0.95] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                Run your wedding work with grace.
              </h1>
              <p className="mt-5 max-w-md text-base leading-7 text-slate-600 sm:text-lg">
                Keep clients, payments, expenses, and event dates in one simple mobile hub made for busy vendor days.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="h-13 rounded-lg bg-slate-950 px-6 text-base font-bold text-white shadow-lg shadow-slate-300/60 hover:bg-slate-800">
                  <Link to="/vendor/login" className="inline-flex items-center justify-center gap-2">
                    Get started <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-13 rounded-lg border-slate-200 bg-white/80 px-6 text-base font-bold text-slate-700 hover:bg-white">
                  <Link to="/help">Need help?</Link>
                </Button>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[360px] lg:max-w-[430px]">
              <div className="rounded-[2rem] border border-white bg-white/75 p-4 shadow-2xl shadow-slate-300/50 backdrop-blur">
                <div className="rounded-[1.5rem] bg-[#f6f0ea] p-6">
                  <img src={landingMobileImage} alt="WedConnect mobile business dashboard" className="mx-auto h-56 w-56 object-contain sm:h-64 sm:w-64" />
                  <div className="mt-4 rounded-lg bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold text-slate-400">Today</p>
                        <p className="mt-1 text-lg font-bold text-slate-950">3 events</p>
                      </div>
                      <div className="rounded-lg bg-emerald-50 px-3 py-2 text-right">
                        <p className="text-xs font-semibold text-emerald-600">Profit</p>
                        <p className="text-sm font-bold text-emerald-700">₹24k</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 grid gap-3 pb-4 sm:grid-cols-3 lg:pb-7">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-lg border border-white bg-white/80 p-4 shadow-sm shadow-slate-200/50 backdrop-blur">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.tone}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-950">{item.label}</p>
                      <p className="text-xs text-slate-400">{item.value}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
