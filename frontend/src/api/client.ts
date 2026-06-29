import axios from "axios";

export const apiBaseURL =
  typeof import.meta.env.VITE_API_BASE_URL === "string"
    ? import.meta.env.VITE_API_BASE_URL
    : "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: apiBaseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

function isVendorRequest(url?: string) {
  if (!url) return window.location.pathname.startsWith("/vendor");
  return (
    url.includes("/api/v1/bookings/") ||
    url.includes("/api/v1/vendors/vendors/me/")
  );
}

function isPublicAuthRequest(url?: string) {
  if (!url) return false;
  return (
    url.includes("/login/") ||
    url.includes("/forgot-password/") ||
    url.includes("/reset-password/")
  );
}

// Add auth token in a request interceptor
apiClient.interceptors.request.use((config) => {
  if (isPublicAuthRequest(config.url)) return config;

  const token = isVendorRequest(config.url)
    ? localStorage.getItem("vendor_access_token")
    : localStorage.getItem("token");

  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isVendor = isVendorRequest(originalRequest?.url);
    const loginPath = isVendor ? "/vendor/login" : "/admin/login";
    const accessKey = isVendor ? "vendor_access_token" : "token";
    const refreshKey = isVendor ? "vendor_refresh_token" : "refreshToken";

    // If error is 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem(refreshKey);

      if (refreshToken) {
        try {
          // Attempt to refresh the token
          const { data } = await axios.post(`${apiBaseURL}/api/v1/token/refresh/`, {
            refresh: refreshToken,
          });

          const newAccessToken = data.access;
          const newRefreshToken = data.refresh;
          localStorage.setItem(accessKey, newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem(refreshKey, newRefreshToken);
          }

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
