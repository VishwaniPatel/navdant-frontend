import { useState } from "react";
import {
  User,
  Lock,
  LogOut,
  ChevronRight,
  Eye,
  EyeOff,
  X,
  Loader2,
  Stethoscope,
} from "lucide-react";

import authService from "../services/auth.service";
import { useAuth } from "../context/AuthContext";

const COLORS = {
  primary: "#0B1E41",
  secondary: "#376D0E",
  tertiary: "#F4F7F9",
  neutral: "#64748B",
  background: "#F9FAFB",
  white: "#FFFFFF",
  danger: "#DC2626",
};

const Settings = () => {
  const { user, logout } = useAuth();
  console.log("user ",user);
  
  const [modalVisible, setModalVisible] = useState(false);

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({});

  const [message, setMessage] = useState(null);

  const username =
    user?.username || "Guest User";

  const initial =
    username.charAt(0).toUpperCase() || "U";

  // ==========================================
  // CHANGE PASSWORD
  // ==========================================

  const handleChangePassword = async () => {
    const newErrors = {};

    if (!currentPassword) {
      newErrors.currentPassword =
        "Current password is required";
    }

    if (!newPassword) {
      newErrors.newPassword =
        "New password is required";
    } else if (newPassword.length < 6) {
      newErrors.newPassword =
        "New password must be at least 6 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword =
        "Please confirm your new password";
    } else if (
      newPassword !== confirmPassword
    ) {
      newErrors.confirmPassword =
        "Passwords do not match";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response =
        await authService.changePassword({
          old_password: currentPassword,
          new_password: newPassword,
        });

      if (
        response?.data?.status === "success"
      ) {
        setMessage({
          type: "success",
          text: "Password changed successfully",
        });

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        setTimeout(() => {
          setModalVisible(false);
          setMessage(null);
        }, 1200);
      } else {
        setMessage({
          type: "error",
          text:
            response?.data?.message ||
            "Failed to change password",
        });
      }
    } catch (error) {
      console.error(
        "Change password error:",
        error
      );

      setMessage({
        type: "error",
        text:
          error?.response?.data?.message ||
          "Failed to change password",
      });
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmed) return;

    try {
      await logout();
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );

      await logout();
    }
  };

  // ==========================================
  // INPUT
  // ==========================================

  const PasswordInput = ({
    label,
    value,
    onChange,
    showPassword,
    setShowPassword,
    error,
    placeholder,
  }) => {
    return (
      <div>
        <label className="mb-2 block text-sm font-medium text-[#0B1E41]">
          {label}
        </label>

        <div className="relative">

          <input
            type={
              showPassword
                ? "text"
                : "password"
            }
            value={value}
            onChange={(e) => {
              onChange(e.target.value);

              if (error) {
                setErrors((prev) => ({
                  ...prev,
                  [error.key]: "",
                }));
              }
            }}
            placeholder={placeholder}
            className={`w-full rounded-xl border bg-white px-4 py-3 pr-12 text-sm text-[#0B1E41] outline-none transition
              ${
                error
                  ? "border-red-500 focus:ring-2 focus:ring-red-100"
                  : "border-slate-200 focus:border-[#0B1E41] focus:ring-2 focus:ring-blue-50"
              }
            `}
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(!showPassword)
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]"
          >
            {showPassword ? (
              <EyeOff size={19} />
            ) : (
              <Eye size={19} />
            )}
          </button>

        </div>

        {error && (
          <p className="mt-1 text-xs text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">

      {/* Page Header */}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0B1E41]">
          Settings
        </h1>

        <p className="mt-1 text-sm text-[#64748B]">
          Manage your clinic account and
          application settings
        </p>
      </div>

      <div className="mx-auto max-w-4xl space-y-6">

        {/* =====================================
            PROFILE
        ===================================== */}

        <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">

          <div className="flex flex-col items-center px-6 py-8 sm:py-10">

            <div className="relative">

              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#0B1E41] text-3xl font-bold text-white shadow-md">
                {initial}
              </div>

              {/* Online */}

              <span className="absolute bottom-1 right-1 h-5 w-5 rounded-full border-4 border-white bg-green-500" />

            </div>

            <h2 className="mt-4 text-xl font-bold text-[#0B1E41]">
              {username}
            </h2>

            <span className="mt-2 rounded-full bg-[#0B1E41]/10 px-4 py-1.5 text-xs font-medium text-[#0B1E41]">
              Clinic Administrator
            </span>

          </div>

        </section>

        {/* =====================================
            DOCTOR MANAGEMENT
        ===================================== */}

        <section>

          <h2 className="mb-3 px-1 text-sm font-semibold uppercase tracking-wide text-[#64748B]">
            Doctor Management
          </h2>

          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">

            <button
              className="flex w-full items-center justify-between px-5 py-5 text-left transition hover:bg-[#F4F7F9]"
            >

              <div className="flex items-center gap-4">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0B1E41]/10">
                  <Stethoscope
                    size={21}
                    className="text-[#0B1E41]"
                  />
                </div>

                <div>
                  <p className="font-semibold text-[#0B1E41]">
                    Doctor Management
                  </p>

                  <p className="mt-1 text-xs text-[#64748B]">
                    Manage doctors and signatures
                  </p>
                </div>

              </div>

              <ChevronRight
                size={20}
                className="text-[#64748B]"
              />

            </button>

          </div>

        </section>

        {/* =====================================
            ACCOUNT SETTINGS
        ===================================== */}

        <section>

          <h2 className="mb-3 px-1 text-sm font-semibold uppercase tracking-wide text-[#64748B]">
            Account Settings
          </h2>

          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">

            {/* Change Password */}

            <button
              onClick={() => {
                setModalVisible(true);
                setMessage(null);
              }}
              className="flex w-full items-center justify-between px-5 py-5 text-left transition hover:bg-[#F4F7F9]"
            >

              <div className="flex items-center gap-4">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0B1E41]/10">
                  <Lock
                    size={20}
                    className="text-[#0B1E41]"
                  />
                </div>

                <div>
                  <p className="font-semibold text-[#0B1E41]">
                    Change Password
                  </p>

                  <p className="mt-1 text-xs text-[#64748B]">
                    Update your account password
                  </p>
                </div>

              </div>

              <ChevronRight
                size={20}
                className="text-[#64748B]"
              />

            </button>

            <div className="h-px bg-slate-100" />

            {/* Logout */}

            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-between px-5 py-5 text-left transition hover:bg-red-50"
            >

              <div className="flex items-center gap-4">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
                  <LogOut
                    size={20}
                    className="text-red-600"
                  />
                </div>

                <div>
                  <p className="font-semibold text-red-600">
                    Logout
                  </p>

                  <p className="mt-1 text-xs text-[#64748B]">
                    Sign out of your account
                  </p>
                </div>

              </div>

              <ChevronRight
                size={20}
                className="text-[#64748B]"
              />

            </button>

          </div>

        </section>

        {/* Version */}

        <p className="pb-6 text-center text-xs text-[#64748B]">
          Navdant Web • Version 1.0.0
        </p>

      </div>

      {/* =======================================
          CHANGE PASSWORD MODAL
      ======================================= */}

      {modalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* Header */}

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

              <div>
                <h2 className="text-lg font-bold text-[#0B1E41]">
                  Change Password
                </h2>

                <p className="mt-1 text-xs text-[#64748B]">
                  Update your account password
                </p>
              </div>

              <button
                onClick={() =>
                  setModalVisible(false)
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F4F7F9]"
              >
                <X size={20} />
              </button>

            </div>

            {/* Body */}

            <div className="space-y-5 px-6 py-6">

              {message && (
                <div
                  className={`rounded-xl px-4 py-3 text-sm ${
                    message.type === "success"
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {message.text}
                </div>
              )}

              <PasswordInput
                label="Current Password *"
                value={currentPassword}
                onChange={setCurrentPassword}
                showPassword={showCurrentPassword}
                setShowPassword={
                  setShowCurrentPassword
                }
                error={
                  errors.currentPassword
                    ? {
                        key: "currentPassword",
                        text: errors.currentPassword,
                      }
                    : null
                }
                placeholder="Enter current password"
              />

              <PasswordInput
                label="New Password *"
                value={newPassword}
                onChange={setNewPassword}
                showPassword={showNewPassword}
                setShowPassword={
                  setShowNewPassword
                }
                error={
                  errors.newPassword
                    ? {
                        key: "newPassword",
                        text: errors.newPassword,
                      }
                    : null
                }
                placeholder="Enter new password (min 6 characters)"
              />

              <PasswordInput
                label="Confirm New Password *"
                value={confirmPassword}
                onChange={setConfirmPassword}
                showPassword={showConfirmPassword}
                setShowPassword={
                  setShowConfirmPassword
                }
                error={
                  errors.confirmPassword
                    ? {
                        key: "confirmPassword",
                        text: errors.confirmPassword,
                      }
                    : null
                }
                placeholder="Confirm new password"
              />

            </div>

            {/* Footer */}

            <div className="flex gap-3 border-t border-slate-100 px-6 py-5">

              <button
                onClick={() =>
                  setModalVisible(false)
                }
                disabled={loading}
                className="flex-1 rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-[#64748B] transition hover:bg-slate-200"
              >
                Cancel
              </button>

              <button
                onClick={handleChangePassword}
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0B1E41] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#162D59] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading && (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                )}

                {loading
                  ? "Updating..."
                  : "Update Password"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default Settings;