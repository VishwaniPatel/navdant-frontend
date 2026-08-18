import { jwtDecode } from "jwt-decode";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export const getTokens = async () => {
  return {
    access_token: localStorage.getItem(
      ACCESS_TOKEN_KEY
    ),
    refresh_token: localStorage.getItem(
      REFRESH_TOKEN_KEY
    ),
  };
};

export const setTokens = async (
  accessToken,
  refreshToken
) => {
  localStorage.setItem(
    ACCESS_TOKEN_KEY,
    accessToken
  );

  if (refreshToken) {
    localStorage.setItem(
      REFRESH_TOKEN_KEY,
      refreshToken
    );
  }
};

export const clearTokens = async () => {
  localStorage.removeItem(
    ACCESS_TOKEN_KEY
  );

  localStorage.removeItem(
    REFRESH_TOKEN_KEY
  );
};

export const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);

    if (!decoded.exp) {
      return true;
    }

    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};