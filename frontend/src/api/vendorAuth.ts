import { apiClient } from "./client";

export async function vendorLogin(credentials: { email: string; password: string }) {
  const { data } = await apiClient.post("/api/v1/vendors/vendors/login/", credentials);
  return data;
}

export async function vendorForgotPassword(email: string) {
  const { data } = await apiClient.post("/api/v1/vendors/forgot-password/", { email });
  return data;
}

export async function vendorResetPassword(uid: string, token: string, password: string) {
  const { data } = await apiClient.post(`/api/v1/vendors/reset-password/${uid}/${token}/`, { password });
  return data;
}
export async function vendorLogout() {
  // Calls backend logout endpoint; adjust if needed
  const { data } = await apiClient.post("/api/v1/vendors/logout/");
  return data;
}
