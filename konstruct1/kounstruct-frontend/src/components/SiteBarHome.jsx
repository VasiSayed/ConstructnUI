import React from "react";
import { NavLink } from "react-router-dom";
import { useTheme } from "../ThemeContext";

// Color palette for theme
const ORANGE = "#ea6822";
const ORANGE_DARK = "#e44a22";
const ORANGE_LIGHT = "#fff8f2";
const GOLD_DARK = "#facc15";

// --- Role Menu Config ---
const ROLE_MENUS = {
  ADMIN: [
    { name: "Projects", path: "/config" },
    { name: "Initialize Checklist", path: "/Initialize-Checklist" },
    {
      name: "Pending Inspector Checklist",
      path: "/PendingInspector-Checklist",
    },
    { name: "Pending For Maker Items", path: "/Pending-For-MakerItems" },
    { name: "Pending Supervisor Items", path: "/PendingSupervisorItems" },
    { name: "Users Management", path: "/UsersManagement" },
  ],
  MANAGER: [
    { name: "Projects", path: "/config" },
    { name: "Initialize Checklist", path: "/Initialize-Checklist" },
    {
      name: "Pending Inspector Checklist",
      path: "/PendingInspector-Checklist",
    },
    { name: "Pending For Maker Items", path: "/Pending-For-MakerItems" },
    { name: "Pending Supervisor Items", path: "/PendingSupervisorItems" },
    { name: "Users Management", path: "/UsersManagement" },
  ],
  SUPERADMIN: [
    { name: "Projects", path: "/config" },
    { name: "Initialize Checklist", path: "/Initialize-Checklist" },
    {
      name: "Pending Inspector Checklist",
      path: "/PendingInspector-Checklist",
    },
    { name: "Pending For Maker Items", path: "/Pending-For-MakerItems" },
    { name: "Pending Supervisor Items", path: "/PendingSupervisorItems" },
    { name: "Users Management", path: "/UsersManagement" },
  ],
  INTIALIZER: [{ name: "Initialize Checklist", path: "/Initialize-Checklist" }],
  INSPECTOR: [
    {
      name: "Pending Inspector Checklist",
      path: "/PendingInspector-Checklist",
    },
  ],
  CHECKER: [
    {
      name: "Pending Inspector Checklist",
      path: "/PendingInspector-Checklist",
    },
  ],
  MAKER: [{ name: "Pending For Maker Items", path: "/Pending-For-MakerItems" }],
  SUPERVISOR: [
    { name: "Pending Supervisor Items", path: "/PendingSupervisorItems" },
  ],
};

// --- Role getter (matches your login logic) ---
function getUserRole() {
  try {
    return (localStorage.getItem("ROLE") || "").trim().toUpperCase();
  } catch {
    return "";
  }
}

function SiteBarHome() {
  const { theme } = useTheme();
  const userRole = getUserRole();

  // THEME palette (all values are valid JavaScript, not template literals)
  const palette =
    theme === "dark"
      ? {
          bg: "linear-gradient(135deg, #23232e, #181820 100%)",
          border: `3px solid ${GOLD_DARK}`,
          shadow: "0 4px 32px #fffbe022",
          title: GOLD_DARK,
          linkActiveBg: "linear-gradient(90deg, #fde047 80%, #facc15)",
          linkActive: "#23232e",
          linkInactive: GOLD_DARK,
          linkBgInactive: "#191921",
          footer: GOLD_DARK,
        }
      : {
          bg: `linear-gradient(135deg, ${ORANGE_LIGHT}, #fff)`,
          border: `3px solid ${ORANGE}`,
          shadow: "0 4px 32px #ea682220",
          title: ORANGE_DARK,
          linkActiveBg: `linear-gradient(90deg, ${ORANGE} 80%, ${ORANGE_DARK})`,
          linkActive: "#fff",
          linkInactive: ORANGE_DARK,
          linkBgInactive: "#fff",
          footer: ORANGE_DARK,
        };

  // Pick nav based on role
  let navItems = [];
  if (
    userRole === "ADMIN" ||
    userRole === "MANAGER" ||
    userRole === "SUPERADMIN"
  ) {
    navItems = ROLE_MENUS.ADMIN;
  } else if (ROLE_MENUS[userRole]) {
    navItems = ROLE_MENUS[userRole];
  }

  return (
    <div
      className="fixed w-[15%] h-screen shadow-lg p-4 flex flex-col"
      style={{
        background: palette.bg,
        borderRight: palette.border,
        boxShadow: palette.shadow,
        transition: "all 0.3s",
        zIndex: 50,
      }}
    >
      <div className="mb-6 text-center">
        <div
          className="text-lg font-bold tracking-wide"
          style={{ color: palette.title, letterSpacing: "2px" }}
        >
          Main Menu
        </div>
      </div>
      <nav className="space-y-2 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className="block px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200"
            style={({ isActive }) =>
              isActive
                ? {
                    background: palette.linkActiveBg,
                    color: palette.linkActive,
                    boxShadow:
                      theme === "dark"
                        ? "0 2px 12px #fffbe022"
                        : "0 2px 12px #ea682238",
                  }
                : {
                    color: palette.linkInactive,
                    background: palette.linkBgInactive,
                  }
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>
      <div
        className="mt-8 text-xs text-center"
        style={{ color: palette.footer }}
      >
        &copy; {new Date().getFullYear()} Your Company
      </div>
    </div>
  );
}

export default SiteBarHome;
