import API from "./api.js";

const authService = {
  login: async (username, password) => {
    const res = await API.post("/api/login", {
      username,
      password,
    });

    return res.data;
  },

  logout: async () => {
    // Tokens are cleared by AuthContext
  },

  changePassword: async (data) => {
    try {
      const res = await API.post(
        "/api/change-password",
        data
      );

      return {
        success: true,
        data: res.data,
      };
    } catch (error) {
      console.error("Change password error:", error);

      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to change password";

      return {
        success: false,
        error: message,
      };
    }
  },

  resetPassword: async (data) => {
    try {
      const res = await API.post(
        "/api/reset-password",
        data
      );

      return res.data;
    } catch (error) {
      console.error("Reset password error:", error);

      throw new Error(
        error.response?.data?.message ||
          "Failed to reset password"
      );
    }
  },

  forgotPassword: async (data) => {
    try {
      const res = await API.post(
        "/api/forgot-password",
        data
      );

      return res.data;
    } catch (error) {
      console.error("Forgot password error:", error);

      throw new Error(
        error.response?.data?.message ||
          "Failed to send reset email."
      );
    }
  },
};

export default authService;