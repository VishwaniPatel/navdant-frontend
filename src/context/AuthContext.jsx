import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

import {
  clearTokens,
  getTokens,
  setTokens,
  isTokenExpired,
} from "../services/token.service";

const AuthContext = createContext(undefined);

let globalLogout = null;

export const setGlobalLogout = (fn) => {
  globalLogout = fn;
};

export const triggerGlobalLogout = async () => {
  if (globalLogout) {
    await globalLogout();
  }
};

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // =========================
  // CLEAR SESSION
  // =========================
  const clearSession = useCallback(async () => {
    await clearTokens();

    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");

    setUser(null);
    setIsLoggedIn(false);
  }, []);

  // =========================
  // LOGOUT
  // =========================
  const logout = useCallback(async () => {
    await clearSession();
  }, [clearSession]);

  // =========================
  // REGISTER GLOBAL LOGOUT
  // =========================
  useEffect(() => {
    setGlobalLogout(logout);

    return () => {
      setGlobalLogout(null);
    };
  }, [logout]);

  // =========================
  // CHECK LOGIN
  // =========================
  const checkLogin = useCallback(async () => {
    try {
      const storedUser = localStorage.getItem("user");
      const tokens = await getTokens();

      if (
        storedUser &&
        tokens.access_token &&
        tokens.refresh_token
      ) {
        // Refresh token expired
        if (isTokenExpired(tokens.refresh_token)) {
          await clearSession();
          return;
        }

        const userData = JSON.parse(storedUser);

        setUser(userData);
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error("Auth check error:", error);

      setUser(null);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  }, [clearSession]);

  useEffect(() => {
    checkLogin();
  }, [checkLogin]);

  // =========================
  // LOGIN
  // =========================
  const login = useCallback(
    async (userData, accessToken, refreshToken) => {
      try {
        // Store tokens
        await setTokens(
          accessToken,
          refreshToken
        );

        // IMPORTANT:
        // Store USER object, NOT access token
        localStorage.setItem(
          "user",
          JSON.stringify(userData)
        );

        localStorage.setItem(
          "isLoggedIn",
          "true"
        );

        setUser(userData);
        setIsLoggedIn(true);

      } catch (error) {
        console.error("Login error:", error);
      }
    },
    []
  );

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// =========================
// USE AUTH
// =========================
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return context;
};