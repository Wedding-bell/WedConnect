import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { vendorLogout } from "../../api/vendorAuth";

export function VendorDashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await vendorLogout();
    } catch (e) {
      console.error("Vendor logout error", e);
    } finally {
      localStorage.removeItem("vendor_access_token");
      localStorage.removeItem("vendor_refresh_token");
      navigate("/vendor/login");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-zinc-500">
      <h2 className="text-xl font-medium mb-2 text-zinc-800">Welcome to WedConnect Vendor Dashboard</h2>
      <p className="text-sm">Your vendor tools will appear here.</p>
      <Button onClick={handleLogout} className="mt-4 bg-zinc-900 text-white hover:bg-black">
        Log out
      </Button>
    </div>
  );
}
