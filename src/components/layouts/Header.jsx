import { useState } from "react";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  User,
  LockKeyhole,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const pageTitles = {
  "/": "Dashboard",
  "/patients": "Patient Directory",
  "/doctors": "Doctor Management",
  "/patients/register": "Add Patient",
  "/settings": "Settings",
  "/profile": "My Profile",
  "/expenses": "Expense Tracker"
};

const Header = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
console.log("user",user);

  const [showProfile, setShowProfile] = useState(false);

  const username = user?.username || "User";
  const initial = username.charAt(0).toUpperCase();

  const pageTitle =
    pageTitles[location.pathname] ||
    getPageTitle(location.pathname);

  const today = new Date();

  const formattedDate = today.toLocaleDateString(
    "en-IN",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/login");
    }
  };

  return (
    <header className="sticky top-0 z-40 h-[72px] border-b border-slate-200 bg-white">

      <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* =====================================
            LEFT
        ===================================== */}

        <div className="flex items-center gap-3">

          {/* Mobile Menu */}

          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[#0B1E41] transition hover:bg-[#F4F7F9] lg:hidden"
          >
            <Menu size={21} />
          </button>

          {/* Page Title */}

          <div>
            <h1 className="text-lg font-bold text-[#0B1E41] sm:text-xl">
              {pageTitle}
            </h1>

            <p className="hidden text-xs text-[#64748B] sm:block">
              {formattedDate}
            </p>
          </div>

        </div>

        {/* =====================================
            RIGHT
        ===================================== */}

        <div className="flex items-center gap-2 sm:gap-4">

          {/* Notification */}

          {/* <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-[#0B1E41] transition hover:bg-[#F4F7F9]"
            aria-label="Notifications"
          >
            <Bell size={20} />

            <span className="absolute right-[10px] top-[9px] h-2 w-2 rounded-full bg-[#376D0E] ring-2 ring-white" />
          </button> */}

          {/* Divider */}

          {/* <div className="hidden h-8 w-px bg-slate-200 sm:block" /> */}

          {/* =====================================
              PROFILE
          ===================================== */}

          <div className="relative">

            <button
              type="button"
              onClick={() =>
                setShowProfile((prev) => !prev)
              }
              className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-[#F4F7F9]"
            >

              {/* Avatar */}

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0B1E41] text-sm font-bold text-white">
                {initial}
              </div>

              {/* User */}

              {/* <div className="hidden text-left sm:block">

                <p className="text-sm font-semibold leading-tight text-[#0B1E41]">
                  {username}
                </p>

                <p className="mt-0.5 text-[11px] text-[#64748B]">
                  Clinic Administrator
                </p>

              </div> */}

              <ChevronDown
                size={16}
                className={`hidden text-[#64748B] transition sm:block ${
                  showProfile
                    ? "rotate-180"
                    : ""
                }`}
              />

            </button>

            {/* =================================
                DROPDOWN
            ================================= */}

            {showProfile && (
              <>

                {/* Outside click */}

                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() =>
                    setShowProfile(false)
                  }
                  className="fixed inset-0 z-[-1] h-screen w-screen cursor-default"
                />

                <div className="absolute right-0 top-14 z-50 w-64 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl">

                  {/* Profile Header */}

                  <div className="bg-[#F4F7F9] px-4 py-4">

                    <div className="flex items-center gap-3">

                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0B1E41] font-bold text-white">
                        {initial}
                      </div>

                      <div className="min-w-0">

                        <p className="truncate text-sm font-bold text-[#0B1E41]">
                          {username}
                        </p>

                        <p className="text-xs text-[#64748B]">
                          Clinic Administrator
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* Menu Items */}

                  <div className="p-2">

                    <button
                      type="button"
                      onClick={() => {
                        setShowProfile(false);
                        navigate("/profile");
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#0B1E41] transition hover:bg-[#F4F7F9]"
                    >
                      <User
                        size={17}
                        className="text-[#64748B]"
                      />

                      My Profile
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowProfile(false);
                        navigate("/settings");
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#0B1E41] transition hover:bg-[#F4F7F9]"
                    >
                      <LockKeyhole
                        size={17}
                        className="text-[#64748B]"
                      />

                      Change Password
                    </button>

                  </div>

                  {/* Logout */}

                  <div className="border-t border-slate-100 p-2">

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut size={17} />

                      Logout
                    </button>

                  </div>

                </div>

              </>
            )}

          </div>

        </div>

      </div>

    </header>
  );
};

/* ==========================================
   PAGE TITLE HELPER
========================================== */

function getPageTitle(pathname) {

  if (pathname.startsWith("/patients/")) {
    return "Patient Details";
  }

  if (pathname.startsWith("/reports")) {
    return "Reports";
  }

  if (pathname.startsWith("/visits")) {
    return "Visits";
  }

  return "Navdant Dental Clinic";
}

export default Header;