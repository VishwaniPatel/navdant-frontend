import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import {
  LayoutDashboard,
  Users,
  Receipt,
  BarChart3,
  Settings,
  LogOut,
  X,
} from "lucide-react";

const menuItems = [
  {
    label: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Patients",
    path: "/patients",
    icon: Users,
  },
  {
    label: "Expenses",
    path: "/expenses",
    icon: Receipt,
  },
  {
    label: "Reports",
    path: "/reports",
    icon: BarChart3,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { logout } = useAuth();

  return (
    <>
      {/* =========================================
          DESKTOP SIDEBAR
      ========================================= */}

      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[280px] bg-primary lg:block">

        {/* Logo */}
        <div className="flex h-[72px] items-center gap-3 border-b border-white/10 px-6">

          <img
            src="/assets/images/logo/navdant_logo.png"
            alt="Navdant"
            className="h-11 w-11 rounded-lg bg-white object-contain p-1"
          />

          <img
            src="/assets/images/logo/name_logo.png"
            alt="Navdant Dental Clinic"
            className="h-9 w-auto object-contain"
          />

        </div>

        {/* Navigation */}
        <nav className="space-y-2 p-4">

          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-secondary text-white shadow-sm"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <Icon
                  size={19}
                  strokeWidth={2}
                  className="shrink-0"
                />

                <span>{item.label}</span>
              </NavLink>
            );
          })}

        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 w-full border-t border-white/10 p-4">

          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut size={19} strokeWidth={2} />

            <span>Logout</span>
          </button>

        </div>

      </aside>


      {/* =========================================
          MOBILE OVERLAY
      ========================================= */}

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}


      {/* =========================================
          MOBILE SIDEBAR
      ========================================= */}

      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-[260px] bg-primary transition-transform duration-300 lg:hidden ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >

        {/* Logo */}
        <div className="flex h-[72px] items-center justify-between border-b border-white/10 px-5">

          <div className="flex items-center gap-3">

            <img
              src="/assets/images/logo/navdant_logo.png"
              alt="Navdant"
              className="h-10 w-10 rounded-lg bg-white object-contain p-1"
            />

            <img
              src="/assets/images/logo/name_logo.png"
              alt="Navdant Dental Clinic"
              className="h-8 w-auto object-contain"
            />

          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <X size={21} />
          </button>

        </div>


        {/* Navigation */}
        <nav className="space-y-2 p-4">

          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-secondary text-white shadow-sm"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <Icon
                  size={19}
                  strokeWidth={2}
                  className="shrink-0"
                />

                <span>{item.label}</span>
              </NavLink>
            );
          })}

        </nav>


        {/* Logout */}
        <div className="absolute bottom-0 left-0 w-full border-t border-white/10 p-4">

          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut size={19} strokeWidth={2} />

            <span>Logout</span>
          </button>

        </div>

      </aside>
    </>
  );
}

export default Sidebar;