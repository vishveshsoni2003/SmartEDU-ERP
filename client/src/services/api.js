import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`
});

// Intercept requests to attach ephemeral accessToken
API.interceptors.request.use((req) => {
  // Graceful fallback for backwards compatibility where 'token' was used
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Response Interceptor: Catch 401s, halt requests, request refresh token, resume queued networks
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Catch strictly 401s avoiding infinite retry loops on explicit login endpoints
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes("/auth/refresh-token") && !originalRequest.url.includes("/auth/login")) {

      // If we are already refreshing, push this subsequent query into the queue
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = 'Bearer ' + token;
          return API(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${API.defaults.baseURL}/auth/refresh-token`, { token: refreshToken });

        localStorage.setItem("accessToken", data.accessToken);
        API.defaults.headers.common["Authorization"] = `Bearer ${data.accessToken}`;

        // Re-process any requests pending while token was renewing
        processQueue(null, data.accessToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return API(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default API;
