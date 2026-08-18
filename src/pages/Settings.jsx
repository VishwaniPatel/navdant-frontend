import { useState } from "react";
import {
  Lock,
  LogOut,
  ChevronRight,
  Eye,
  EyeOff,
  X,
  Loader2,
  User,
} from "lucide-react";

import authService from "../services/auth.service";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/layouts/DashboardLayout";

const Settings = () => {
  const { user, logout } = useAuth();

  const [modalVisible, setModalVisible] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);

  const username = user?.username || "Guest User";

  const initial = username.charAt(0).toUpperCase() || "U";

  // ==========================================
  // CHANGE PASSWORD
  // ==========================================

  const handleChangePassword = async () => {
    const newErrors = {};

    if (!currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (newPassword.length < 6) {
      newErrors.newPassword =
        "New password must be at least 6 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword =
        "Please confirm your new password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await authService.changePassword({
        old_password: currentPassword,
        new_password: newPassword,
      });

      if (response?.data?.status === "success") {
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
      console.error("Change password error:", error);

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
      console.error("Logout error:", error);
      await logout();
    }
  };

  // ==========================================
  // CLOSE PASSWORD MODAL
  // ==========================================

  const closePasswordModal = () => {
    if (loading) return;

    setModalVisible(false);
    setErrors({});
    setMessage(null);

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  // ==========================================
  // PASSWORD INPUT
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
        <label className="mb-2 block text-sm font-semibold text-[#0B1E41]">
          {label}
        </label>

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
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
            className={`w-full rounded-xl border bg-white px-4 py-3 pr-12 text-sm text-[#0B1E41] outline-none transition ${
              error
                ? "border-red-400 focus:ring-2 focus:ring-red-100"
                : "border-slate-200 focus:border-[#0B1E41] focus:ring-2 focus:ring-[#0B1E41]/10"
            }`}
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(!showPassword)
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-[#0B1E41]"
          >
            {showPassword ? (
              <EyeOff size={19} />
            ) : (
              <Eye size={19} />
            )}
          </button>
        </div>

        {error && (
          <p className="mt-1.5 text-xs text-red-600">
            {error.text}
          </p>
        )}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="w-full">

        {/* =========================================
            PAGE HEADER
        ========================================= */}

        <div className="mb-7">
          <h1 className="text-2xl font-bold text-slate-800">
            Manage Account Settings
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your clinic account and application settings
          </p>
        </div>

        {/* =========================================
            MAIN CONTENT
        ========================================= */}

        <div className="w-full max-w-5xl space-y-7">

          {/* =====================================
              PROFILE
          ===================================== */}

          <section>
            <div className="mb-3">
              <h2 className="text-base font-bold text-slate-800">
                Profile
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Your account information
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">

                {/* Avatar */}

                <div className="relative shrink-0">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#0B1E41] text-2xl font-bold text-white shadow-sm">
                    {initial}
                  </div>

                  {/* <span className="absolute bottom-0 right-0 h-5 w-5 rounded-full border-4 border-white bg-green-500" /> */}
                </div>

                {/* User Info */}

                <div className="min-w-0">
                  <h3 className="text-xl font-bold text-[#0B1E41]">
                    {username}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Clinic Administrator
                  </p>

                  <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#0B1E41]/5 px-3 py-1.5">
                    <User
                      size={14}
                      className="text-[#0B1E41]"
                    />

                    <span className="text-xs font-medium text-[#0B1E41]">
                      Active Account
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* =====================================
              ACCOUNT SETTINGS
          ===================================== */}

          <section>
            <div className="mb-3">
              <h2 className="text-base font-bold text-slate-800">
                Account Settings
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Manage your account security and session
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              {/* CHANGE PASSWORD */}

              <button
                type="button"
                onClick={() => {
                  setModalVisible(true);
                  setMessage(null);
                  setErrors({});
                }}
                className="flex w-full items-center justify-between px-6 py-5 text-left transition hover:bg-slate-50"
              >
                <div className="flex items-center gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0B1E41]/10">
                    <Lock
                      size={20}
                      className="text-[#0B1E41]"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#0B1E41]">
                      Change Password
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Update your account password
                    </p>
                  </div>

                </div>

                <ChevronRight
                  size={20}
                  className="shrink-0 text-slate-400"
                />
              </button>

              <div className="h-px bg-slate-100" />

              {/* LOGOUT */}

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center justify-between px-6 py-5 text-left transition hover:bg-red-50"
              >
                <div className="flex items-center gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50">
                    <LogOut
                      size={20}
                      className="text-red-600"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-red-600">
                      Logout
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Sign out of your account
                    </p>
                  </div>

                </div>

                <ChevronRight
                  size={20}
                  className="shrink-0 text-slate-400"
                />
              </button>

            </div>
          </section>

          {/* =====================================
              APPLICATION INFORMATION
          ===================================== */}

          {/* <section>
            <div className="mb-3">
              <h2 className="text-base font-bold text-slate-800">
                Application
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Application information
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="flex items-center justify-between px-6 py-5">

                <div>
                  <p className="text-sm font-semibold text-[#0B1E41]">
                    Navdant Web
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Clinic Management System
                  </p>
                </div>

                <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500">
                  Version 1.0.0
                </span>

              </div>

            </div>
          </section> */}

        </div>
      </div>

      {/* =========================================
          CHANGE PASSWORD MODAL
      ========================================= */}

      {modalVisible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 py-6">

          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

              <div>
                <h2 className="text-lg font-bold text-[#0B1E41]">
                  Change Password
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Update your account password
                </p>
              </div>

              <button
                type="button"
                onClick={closePasswordModal}
                disabled={loading}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X size={20} />
              </button>

            </div>

            {/* BODY */}

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
                setShowPassword={setShowCurrentPassword}
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
                setShowPassword={setShowNewPassword}
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
                setShowPassword={setShowConfirmPassword}
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

            {/* FOOTER */}

            <div className="flex gap-3 border-t border-slate-100 bg-slate-50 px-6 py-5">

              <button
                type="button"
                onClick={closePasswordModal}
                disabled={loading}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
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
    </DashboardLayout>
  );
};

export default Settings;