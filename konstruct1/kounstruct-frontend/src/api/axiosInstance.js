import axios from "axios";

// Token refresh function (reuse for both instances)
const refreshToken = async () => {
  const refresh = localStorage.getItem("REFRESH_TOKEN");
  if (!refresh) throw new Error("No refresh token available");
  try {
    const response = await axios.post(
      "http://127.0.0.1:8000/api/token/refresh/",
      { refresh }
    );
    localStorage.setItem("ACCESS_TOKEN", response.data.access);
    return response.data.access;
  } catch (error) {
    localStorage.removeItem("ACCESS_TOKEN");
    localStorage.removeItem("REFRESH_TOKEN");
    window.location.href = "/login";
    throw error;
  }
};

// Auth microservice
const axiosInstance = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

// Project microservice
export const projectInstance = axios.create({
  baseURL: "http://127.0.0.1:8001/api/",
});

export const organnizationInstance = axios.create({
  baseURL: "http://127.0.0.1:8002/api",
});

export const checklistInstance = axios.create({
  baseURL: "http://127.0.0.1:8003/api",
});

// Attach token to every request (for both services)
const attachTokenInterceptor = (instance) => {
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("ACCESS_TOKEN");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (
        error.response &&
        error.response.status === 401 &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;
        try {
          const newAccessToken = await refreshToken();
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return instance(originalRequest);
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );
};

// Attach interceptors to both
attachTokenInterceptor(axiosInstance);
attachTokenInterceptor(projectInstance);
attachTokenInterceptor(organnizationInstance);
attachTokenInterceptor(checklistInstance);   

export default axiosInstance;
