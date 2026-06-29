import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { PlaceholderPage } from "./pages/PlaceholderPage";
import { AdminLogin } from "./pages/admin/AdminLogin";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminVendors } from "./pages/admin/AdminVendors";
import { AdminCategories } from "./pages/admin/AdminCategories";
import { AdminLayout } from "./components/layout/AdminLayout";
import { VendorLayout } from "./components/layout/VendorLayout";
import { VendorLogin } from "./pages/vendor/VendorLogin";
import { VendorForgotPassword } from "./pages/vendor/VendorForgotPassword";
import { VendorResetPassword } from "./pages/vendor/VendorResetPassword";
import { VendorDashboard } from "./pages/vendor/VendorDashboard";
import { VendorBookings } from "./pages/vendor/VendorBookings";
import { VendorCalendar } from "./pages/vendor/VendorCalendar";

function getActiveRole() {
  const activeRole = localStorage.getItem("active_role");
  const hasAdminToken = Boolean(localStorage.getItem("token"));
  const hasVendorToken = Boolean(localStorage.getItem("vendor_access_token"));

  if (activeRole === "admin" && hasAdminToken) return "admin";
  if (activeRole === "vendor" && hasVendorToken) return "vendor";
  if (hasAdminToken && !hasVendorToken) return "admin";
  if (hasVendorToken && !hasAdminToken) return "vendor";
  if (hasAdminToken && hasVendorToken) return "admin";
  return null;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const activeRole = getActiveRole();

  if (activeRole === "vendor") {
    return <Navigate to="/vendor/dashboard" replace />;
  }

  if (activeRole !== "admin") {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

function VendorRoute({ children }: { children: React.ReactNode }) {
  const activeRole = getActiveRole();

  if (activeRole === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (activeRole !== "vendor") {
    return <Navigate to="/vendor/login" replace />;
  }

  return children;
}

function AdminPublicRoute({ children }: { children: React.ReactNode }) {
  const activeRole = getActiveRole();

  if (activeRole === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (activeRole === "vendor") {
    return <Navigate to="/vendor/dashboard" replace />;
  }

  return children;
}

function VendorPublicRoute({ children }: { children: React.ReactNode }) {
  const activeRole = getActiveRole();

  if (activeRole === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (activeRole === "vendor") {
    return <Navigate to="/vendor/dashboard" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<PlaceholderPage title="Sign In" />} />
        <Route path="/register" element={<PlaceholderPage title="Get Started" />} />
        <Route path="/help" element={<PlaceholderPage title="Need help?" />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminPublicRoute><AdminLogin /></AdminPublicRoute>} />
        
        {/* Protected Area Layout */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="bookings" element={<PlaceholderPage title="Bookings Table" />} />
          <Route path="vendors" element={<AdminVendors />} />
          <Route path="settings" element={<PlaceholderPage title="Admin Settings" />} />
        </Route>

        <Route path="/vendor/login" element={<VendorPublicRoute><VendorLogin /></VendorPublicRoute>} />
        <Route path="/vendor/forgot-password" element={<VendorPublicRoute><VendorForgotPassword /></VendorPublicRoute>} />
        <Route path="/reset-password/:uid/:token" element={<VendorPublicRoute><VendorResetPassword /></VendorPublicRoute>} />
        <Route path="/vendor" element={<VendorRoute><VendorLayout /></VendorRoute>}>
          <Route path="dashboard" element={<VendorDashboard />} />
          <Route path="bookings" element={<VendorBookings />} />
          <Route path="calendar" element={<VendorCalendar />} />
          <Route path="settings" element={<PlaceholderPage title="Profile Settings" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
