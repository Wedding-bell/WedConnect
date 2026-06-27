import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { vendorLogin } from "../../api/vendorAuth";

export function VendorLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await vendorLogin({ email, password });
      if (response.access) {
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
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center py-12 sm:px-6 lg:px-8 font-sans">

      {/* Vendor Portal Title on TOP */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          Vendor Portal
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Manage your bookings, portfolio, and payments cleanly.
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white py-8 px-4 shadow-xl shadow-zinc-200/50 sm:rounded-2xl sm:px-10 border border-zinc-100">

        <h2 className="text-2xl font-bold text-zinc-900 text-center mb-6">
          Sign in
        </h2>

        {error && (
          <div className="mb-4 bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleLogin}>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Email Address
            </label>
            <div className="mt-1">
              <Input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full appearance-none rounded-lg border border-zinc-300 px-3 py-2 placeholder-zinc-400 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-zinc-500 sm:text-sm"
                placeholder="vendor@company.com"
              />
            </div>
          </div>

          {/* Password with show/hide */}
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Password
            </label>
            <div className="mt-1 relative">
              <Input
                required
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full appearance-none rounded-lg border border-zinc-300 px-3 py-2 placeholder-zinc-400 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-zinc-500 sm:text-sm pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-zinc-400 hover:text-zinc-700"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-zinc-600 hover:text-zinc-900">
                Forgot your password?
              </Link>
            </div>
          </div>

          {/* Button */}
          <Button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center rounded-lg border border-transparent bg-zinc-900 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-black focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Sign in to Dashboard"
            )}
          </Button>

        </form>
      </div>
    </div>
  );
}
