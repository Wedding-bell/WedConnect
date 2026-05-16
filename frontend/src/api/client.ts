import axios from "axios";

const baseURL =
  typeof import.meta.env.VITE_API_BASE_URL === "string"
    ? import.meta.env.VITE_API_BASE_URL
    : "http://localhost:8000";

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token in a request interceptor
apiClient.interceptors.request.use((config) => {
  // Check for both admin and vendor tokens
  const token = localStorage.getItem("token") || localStorage.getItem("vendor_access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isVendorPath = window.location.pathname.startsWith("/vendor");
    const loginPath = isVendorPath ? "/vendor/login" : "/admin/login";
    const accessKey = isVendorPath ? "vendor_access_token" : "token";
    const refreshKey = isVendorPath ? "vendor_refresh_token" : "refreshToken";

    // If error is 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem(refreshKey);

      if (refreshToken) {
        try {
          // Attempt to refresh the token
          const { data } = await axios.post(`${baseURL}/api/v1/token/refresh/`, {
            refresh: refreshToken,
          });

          const newAccessToken = data.access;
          localStorage.setItem(accessKey, newAccessToken);

          // Update the header and retry the original request
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          // If refresh fails, log out the user
          console.error("Token refresh failed:", refreshError);
          localStorage.removeItem(accessKey);
          localStorage.removeItem(refreshKey);
          window.location.href = loginPath;
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token found, log out
        localStorage.removeItem(accessKey);
        window.location.href = loginPath;
      }
    }

    return Promise.reject(error);
  }
);
