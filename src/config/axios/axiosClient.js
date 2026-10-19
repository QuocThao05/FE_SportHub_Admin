import axios from "axios";

// Admin gọi CMS backend (port 3000)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
const REFRESH_ENDPOINT = "/auth/refresh-token";

const ACCESS_KEY = "cms_access_token";
const REFRESH_KEY = "cms_refresh_token";

// Helpers lưu/đọc token từ localStorage (không đụng cookie)
export const tokenStorage = {
  getAccess: () => localStorage.getItem(ACCESS_KEY),
  setAccess: (t) => localStorage.setItem(ACCESS_KEY, t),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  setRefresh: (t) => localStorage.setItem(REFRESH_KEY, t),
  clear: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

// Tạo axios instance — KHÔNG dùng withCredentials để tránh gửi cookie
const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

// Tự động đính kèm access token vào mỗi request
axiosClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess();
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

const emitter = new EventTarget();

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRefreshed() {
  refreshSubscribers.forEach((cb) => cb());
  refreshSubscribers = [];
}

function notifyLogout() {
  emitter.dispatchEvent(new Event("logout"));
}

export function onLogout(handler) {
  emitter.addEventListener("logout", handler);
}

// Response interceptor — tự động refresh token khi 401
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      return Promise.reject({
        response: {
          data: {
            status: 500,
            message: "Không thể kết nối đến máy chủ!",
          },
        },
      });
    }

    const status = error.response.status;
    const requestUrl = originalRequest.url || "";

    if (status === 403) {
      return Promise.reject(error);
    }

    if (status === 401 && !originalRequest._retry) {
      if (requestUrl.includes("/auth/sign-in") || requestUrl.includes(REFRESH_ENDPOINT)) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh(() => {
            axiosClient(originalRequest).then(resolve).catch(reject);
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = tokenStorage.getRefresh();
        if (!refreshToken) throw new Error("No refresh token");

        // Gửi refresh token qua body, không dùng cookie
        const res = await axios.post(
          `${API_BASE_URL}${REFRESH_ENDPOINT}`,
          { token: refreshToken },
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: false,
          }
        );

        const newAccess = res.data?.data?.accessToken;
        const newRefresh = res.data?.data?.refreshToken;
        if (newAccess) tokenStorage.setAccess(newAccess);
        if (newRefresh) tokenStorage.setRefresh(newRefresh);

        isRefreshing = false;
        onRefreshed();
        return axiosClient(originalRequest);
      } catch (refreshErr) {
        isRefreshing = false;
        tokenStorage.clear();
        notifyLogout();
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
