import { apiClient } from "./client";
import type { AdminLoginCredentials } from "../types";

export async function adminLogin(credentials: AdminLoginCredentials) {
  const { data } = await apiClient.post("/api/v1/accounts/login/", credentials);
  return data;
}
export async function adminLogout() {
  // Optionally you could call a backend endpoint to invalidate the refresh token
  // Here we just make a POST request; adjust URL if your backend expects it
  const { data } = await apiClient.post("/api/v1/accounts/logout/");
  return data;
}
