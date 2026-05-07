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
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        try {
          // Attempt to refresh the token
          const { data } = await axios.post(`${baseURL}/api/v1/token/refresh/`, {
            refresh: refreshToken,
          });

          const newAccessToken = data.access;
          localStorage.setItem("token", newAccessToken);

          // Update the header and retry the original request
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          // If refresh fails, log out the user
          console.error("Token refresh failed:", refreshError);
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          window.location.href = "/admin/login";
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token found, log out
        localStorage.removeItem("token");
        window.location.href = "/admin/login";
      }
    }

    return Promise.reject(error);
  }
);
