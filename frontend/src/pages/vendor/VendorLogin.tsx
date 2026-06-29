import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, LockKeyhole, Mail, Sparkles } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { vendorLogin } from "../../api/vendorAuth";
import landingMobileImage from "../../assets/images/landing-mobile.png";

export function VendorLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await vendorLogin({ email, password });
      if (response.access) {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.setItem("vendor_access_token", response.access);
        localStorage.setItem("vendor_refresh_token", response.refresh);
        navigate("/vendor/dashboard");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      const errResp = (err as Record<string, any>)?.response?.data;
      setError(
        errResp?.message ||
        errResp?.error ||
        (err instanceof Error ? err.message : "Login failed. Please check your credentials.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fbfaf8] px-5 py-5 text-slate-950 sm:px-6 lg:px-10">
      <div className="mx-auto grid min-h-[calc(100svh-2.5rem)] max-w-6xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="hidden lg:block">
          <Link to="/" className="mb-10 inline-flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-white">
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="font-bold">WedConnect</span>
          </Link>
          <div className="max-w-lg">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-500">Vendor Portal</p>
            <h1 className="mt-4 text-6xl font-black leading-[0.95] tracking-tight">Welcome back to your calm business space.</h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Review bookings, follow up with clients, and keep payments organized before the next event begins.
            </p>
          </div>
          <div className="mt-10 max-w-sm rounded-[2rem] border border-white bg-white/70 p-5 shadow-xl shadow-slate-300/40">
            <img src={landingMobileImage} alt="WedConnect mobile app preview" className="mx-auto h-56 w-56 object-contain" />
          </div>
        </section>

        <section className="mx-auto w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <Link to="/" className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-950 text-white">
              <Sparkles className="h-6 w-6" />
            </Link>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-500">WedConnect</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Welcome back</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">Sign in to manage today’s clients, events, and payments.</p>
          </div>

          <div className="rounded-[1.75rem] border border-white bg-white p-5 shadow-2xl shadow-slate-300/45 sm:p-7">
            <div className="mb-6 hidden lg:block">
              <p className="text-sm font-semibold text-slate-400">Sign in</p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">Vendor account</h2>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-rose-100 bg-rose-50 px-3 py-3 text-sm font-medium text-rose-700">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-700" htmlFor="vendor-email">Email address</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="vendor-email"
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-13 rounded-lg border-slate-200 bg-slate-50 pl-11 pr-4 text-base shadow-none focus:bg-white"
                    placeholder="vendor@company.com"
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <label className="block text-sm font-bold text-slate-700" htmlFor="vendor-password">Password</label>
                  <Link to="/vendor/forgot-password" className="text-xs font-bold text-rose-600 hover:text-rose-700">
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="vendor-password"
                    required
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-13 rounded-lg border-slate-200 bg-slate-50 pl-11 pr-12 text-base shadow-none focus:bg-white"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-700"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="h-13 w-full rounded-lg bg-slate-950 text-base font-bold text-white shadow-lg shadow-slate-300/60 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign in"}
              </Button>
            </form>

            <p className="mt-5 text-center text-xs leading-5 text-slate-400">
              New vendor accounts are created by the WedConnect admin team.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
