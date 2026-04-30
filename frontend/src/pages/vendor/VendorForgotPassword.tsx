import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { vendorForgotPassword } from "../../api/vendorAuth";

export function VendorForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await vendorForgotPassword(email);
      setSuccess(true);
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errResp = (err as Record<string, any>)?.response?.data;
      setError(
        errResp?.message || 
        errResp?.error || 
        (err instanceof Error ? err.message : "Failed to send reset link. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-zinc-900">
          Reset Password
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-600">
          Enter your email to receive a password reset link.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-zinc-200/50 sm:rounded-2xl sm:px-10 border border-zinc-100">
          
          {error && (
            <div className="mb-4 bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 text-green-700 text-sm p-3 rounded-lg border border-green-100">
              If an account with that email exists, we've sent a password reset link. Please check your inbox.
            </div>
          )}

          {!success && (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-zinc-700">Email Address</label>
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

              <div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex w-full justify-center rounded-lg border border-transparent bg-zinc-900 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-black focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center text-sm">
            <Link to="/vendor/login" className="font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
