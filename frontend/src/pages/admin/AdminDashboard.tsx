import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { adminLogout } from "../../api/adminAuth";

export function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await adminLogout();
    } catch (e) {
      console.error("Logout error", e);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      navigate("/admin/login");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-zinc-500">
      <h2 className="text-xl font-medium mb-2 text-zinc-800">Welcome to WedConnect Admin</h2>
      <p className="text-sm">Widgets and analytics will be added here later.</p>
      <Button onClick={handleLogout} className="mt-4 bg-zinc-900 text-white hover:bg-black">
        Log out
      </Button>
    </div>
  );
}

import { Button } from "../../components/ui/button";
import { adminLogout } from "../../api/adminAuth";

export function AdminDashboard() {
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await adminLogout();
    } catch (e) {
      console.error("Logout error", e);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      navigate("/admin/login");
    }
  };
  return (
    <div className="flex flex-col items-center justify-center h-full text-zinc-500">
      <h2 className="text-xl font-medium mb-2 text-zinc-800">Welcome to WedConnect Admin</h2>
      <p className="text-sm">Widgets and analytics will be added here later.</p>
      <Button onClick={handleLogout} className="mt-4 bg-zinc-900 text-white hover:bg-black">Log out</Button>
    </div>
  );
}
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await adminLogout();
    } catch (e) {
      console.error("Logout error", e);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      navigate("/admin/login");
    }
  };
  return (
    <div className="flex flex-col items-center justify-center h-full text-zinc-500">
      <h2 className="text-xl font-medium mb-2 text-zinc-800">Welcome to WedConnect Admin</h2>
      <p className="text-sm">Widgets and analytics will be added here later.</p>
      <Button onClick={handleLogout} className="mt-4 bg-zinc-900 text-white hover:bg-black">Log out</Button>
    </div>
  );
}

  return (
    <div className="flex flex-col items-center justify-center h-full text-zinc-500">
      <h2 className="text-xl font-medium mb-2 text-zinc-800">Welcome to WedConnect Admin</h2>
      <p className="text-sm">Widgets and analytics will be added here later.</p>
    </div>
  );
}
