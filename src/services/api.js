import axios from "axios";
import { jwtDecode } from "jwt-decode";

import { baseUrl } from "../environment/environment";

import {
  getTokens,
  isTokenExpired,
  setTokens,
  clearTokens,
} from "./token.service";

import {
  triggerGlobalLogout,
} from "../context/AuthContext";

const API = axios.create({
  baseURL: baseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;

let refreshSubscribers = [];

const subscribeTokenRefresh = (
  resolve,
  reject
) => {
  refreshSubscribers.push({
    resolve,
    reject,
  });
};

const onRefreshed = (token) => {
  refreshSubscribers.forEach(
    ({ resolve }) => resolve(token)
  );

  refreshSubscribers = [];
};

const onRefreshFailed = (error) => {
  refreshSubscribers.forEach(
    ({ reject }) => reject(error)
  );

  refreshSubscribers = [];
};

// Request interceptor
API.interceptors.request.use(
  async (config) => {
    const { access_token } =
      await getTokens();

    const isRefreshRequest =
      config.url?.includes(
        "/refresh-token"
      );

    if (
      access_token &&
      !isRefreshRequest
    ) {
      config.headers.Authorization =
        `Bearer ${access_token}`;
    }

    return config;
  },

  (error) =>
    Promise.reject(error)
);

// Response interceptor
API.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest =
      error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    console.log(
      "🔴 API Error:",
      error.response?.status,
      error.response?.data
    );

    // Don't intercept refresh request
    if (
      originalRequest.url?.includes(
        "/refresh-token"
      )
    ) {
      return Promise.reject(error);
    }

    // Only handle 401
    if (
      error.response?.status !== 401 ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // Refresh already running
    if (isRefreshing) {
      return new Promise(
        (resolve, reject) => {
          subscribeTokenRefresh(
            (token) => {
              originalRequest.headers.Authorization =
                `Bearer ${token}`;

              resolve(
                API(originalRequest)
              );
            },

            (err) => {
              reject(err);
            }
          );
        }
      );
    }

    isRefreshing = true;

    const tokens = await getTokens();

    // Refresh token missing/expired
    if (
      !tokens.refresh_token ||
      isTokenExpired(
        tokens.refresh_token
      )
    ) {
      await clearTokens();

      isRefreshing = false;

      onRefreshFailed(error);

      await triggerGlobalLogout();

      return Promise.reject(error);
    }

    try {
      const refreshResponse =
        await axios.post(
          `${baseUrl}/api/refresh-token`,
          {
            refresh_token:
              tokens.refresh_token,
          }
        );

      const {
        access_token,
        refresh_token:
          newRefreshToken,
      } = refreshResponse.data;

      if (!access_token) {
        throw new Error(
          "Access token missing from refresh response"
        );
      }

      try {
        const decoded =
          jwtDecode(access_token);

        if (decoded.exp) {
          const remaining =
            Math.round(
              (
                decoded.exp * 1000 -
                Date.now()
              ) / 1000
            );

          console.log(
            `🆕 Access token expires in ${remaining}s`
          );
        }
      } catch {
        console.log(
          "Could not decode access token"
        );
      }

      await setTokens(
        access_token,
        newRefreshToken
      );

      onRefreshed(access_token);

      isRefreshing = false;

      originalRequest.headers.Authorization =
        `Bearer ${access_token}`;

      return API(originalRequest);

    } catch (refreshError) {
      console.error(
        "❌ Refresh failed:",
        refreshError
      );

      isRefreshing = false;

      onRefreshFailed(refreshError);

      await clearTokens();

      await triggerGlobalLogout();

      return Promise.reject(
        refreshError
      );
    }
  }
);

export default API;