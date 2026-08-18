import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";

import authService from "../services/auth.service";
import { useAuth } from "../context/AuthContext";

import navdantLogo from "../../assets/images/logo/navdant_logo.png";
import nameLogo from "../../assets/images/logo/name_logo.png";

const loginSchema = yup
  .object({
    username: yup
      .string()
      .required("Username is required"),

    password: yup
      .string()
      .min(6, "Min 6 characters")
      .required("Password is required"),
  })
  .required();

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] =
    useState(false);

  const [loginError, setLoginError] =
    useState("");

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
  setLoginError("");

  try {
    const response = await authService.login(
      data.username,
      data.password
    );

    if (response.status === "success") {
      await login(
        response.user,
        response.access_token,
        response.refresh_token
      );

      navigate("/", {
        replace: true,
      });

      return;
    }

    setLoginError(response.message || "Login failed");
  } catch (error) {
    console.error("Login failed:", error);

    setLoginError(
      error.response?.data?.message ||
        "Invalid username or password"
    );
  }
};

  const handleContactAdmin = () => {
    alert(
      "Please contact your clinic administrator for account setup."
    );
  };

  return (
    <div className="min-h-screen bg-background">

      {/* Top dark blue background */}
      <div className="absolute inset-x-0 top-0 h-[48%] rounded-b-[40px] bg-primary" />

      {/* Main content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">

        <div className="w-full max-w-[480px]">

          {/* Logo Section */}
          <div className="mb-6 flex flex-col items-center">

            {/* Logo square */}
            <div className="mb-2 flex h-[90px] w-[90px] items-center justify-center overflow-hidden rounded-[18px] bg-white shadow-lg">
              <img
                src={navdantLogo}
                alt="Navdant"
                className="h-[60px] w-[60px] object-contain"
              />
            </div>

            {/* Name logo */}
            <img
              src={nameLogo}
              alt="Navdant Dental Clinic"
              className="h-[38px] w-[150px] object-contain"
            />
          </div>

          {/* Login Card */}
          <div className="rounded-[18px] bg-white p-5 shadow-lg sm:p-7">

            {/* Heading */}
            <h1 className="mb-5 text-center text-xl font-bold text-primary">
              Welcome Back!
            </h1>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
            >

              {/* API Error */}
              {loginError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger">
                  {loginError}
                </div>
              )}

              {/* Username */}
              <div>
                <label
                  htmlFor="username"
                  className="mb-1 block text-sm font-semibold text-text-primary"
                >
                  Username
                </label>

                <input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  autoComplete="username"
                  disabled={isSubmitting}
                  {...register("username")}
                  className={`w-full rounded-[10px] border bg-white px-3 py-3 text-sm text-text-primary outline-none transition placeholder:text-text-secondary focus:ring-2 focus:ring-primary/10 ${errors.username
                    ? "border-danger"
                    : "border-slate-200 focus:border-primary"
                    }`}
                />

                {errors.username && (
                  <p className="mt-1 text-xs text-danger">
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-1 block text-sm font-semibold text-text-primary"
                >
                  Password
                </label>

                <div
                  className={`flex items-center rounded-[10px] border bg-white ${errors.password
                    ? "border-danger"
                    : "border-slate-200 focus-within:border-primary"
                    }`}
                >
                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={isSubmitting}
                    {...register("password")}
                    className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-text-primary outline-none placeholder:text-text-secondary"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (value) => !value
                      )
                    }
                    className="px-3 text-sm font-medium text-text-secondary hover:text-primary"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword
                      ? "Hide"
                      : "Show"}
                  </button>
                </div>

                {errors.password && (
                  <p className="mt-1 text-xs text-danger">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Forgot Password */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/forgot-password"
                    )
                  }
                  className="text-xs font-medium text-primary hover:underline sm:text-sm"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Sign In */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-[10px] bg-primary px-4 py-3 text-sm font-bold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? "Signing In..."
                  : "Sign In"}
              </button>
            </form>

            {/* Contact Admin */}
            <div className="mt-5 flex flex-wrap justify-center text-center text-xs sm:text-sm">
              <span className="text-text-secondary">
                Don't have an account?{" "}
              </span>

              <button
                type="button"
                onClick={handleContactAdmin}
                className="ml-1 font-semibold text-primary hover:underline"
              >
                Contact Admin
              </button>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-5 text-center text-xs text-white/70">
            © {new Date().getFullYear()} Navdant
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;