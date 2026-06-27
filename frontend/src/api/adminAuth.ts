import axios from "axios";
import { apiBaseURL, apiClient } from "./client";
import type { AdminLoginCredentials } from "../types";

export async function adminLogin(credentials: AdminLoginCredentials) {
  const { data } = await apiClient.post("/api/v1/accounts/login/", credentials);
  return data;
}
export async function adminLogout() {
  const refresh = localStorage.getItem("refreshToken");
  if (!refresh) return { message: "No active session." };

  const { data } = await axios.post(`${apiBaseURL}/api/v1/accounts/logout/`, { refresh });
  return data;
}
