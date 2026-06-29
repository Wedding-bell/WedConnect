import axios from "axios";
import { apiBaseURL, apiClient } from "./client";

export async function vendorLogin(credentials: { email: string; password: string }) {
  const { data } = await apiClient.post("/api/v1/vendors/vendors/login/", credentials);
  return data;
}

export async function vendorForgotPassword(email: string) {
  const { data } = await apiClient.post("/api/v1/vendors/vendors/forgot-password/", { email });
  return data;
}

export async function vendorResetPassword(uid: string, token: string, password: string) {
  const { data } = await apiClient.post(`/api/v1/vendors/vendors/reset-password/${uid}/${token}/`, { password });
  return data;
}
export async function vendorLogout() {
  const refresh = localStorage.getItem("vendor_refresh_token");
  if (!refresh) return { message: "No active session." };

  const { data } = await axios.post(`${apiBaseURL}/api/v1/vendors/vendors/logout/`, { refresh });
  return data;
}
