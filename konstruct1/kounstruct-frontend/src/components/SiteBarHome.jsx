// import React from "react";
// import { NavLink } from "react-router-dom";
// import { useTheme } from "../ThemeContext";

// // COLORS
// const ORANGE = "#ea6822";
// const ORANGE_DARK = "#e44a22";
// const ORANGE_LIGHT = "#fff8f2";
// const GOLD_DARK = "#facc15";

// // Utility to get normalized role
// function getUserRole() {
//   try {
//     // Use saved value in localStorage or fallback to "Intializer" if not found
//     return (localStorage.getItem("ROLE") || "").trim();
//   } catch {
//     return "";
//   }
// }

// // Utility to extract all unique roles from accesses (for advanced filtering)
// function getUserRoles() {
//   try {
//     const accesses = JSON.parse(localStorage.getItem("ACCESSES") || "[]");
//     let roles = [];
//     accesses.forEach((access) => {
//       if (Array.isArray(access.roles)) {
//         access.roles.forEach((role) => {
//           const roleStr = typeof role === "string" ? role : role?.role;
//           if (roleStr && !roles.includes(roleStr)) roles.push(roleStr);
//         });
//       }
//     });
//     return roles;
//   } catch {
//     return [];
//   }
// }

// const role = localStorage.getItem("USER_ROLE");


// function SiteBarHome() {
//   const { theme } = useTheme();
//   const userRole = getUserRole();
//   const userRoles = getUserRoles();

//   // All possible navs
//   const navItems = [
//     { name: "Projects", path: "/config", key: "projects" },
//     // { name: "My In-Progress Items", path: "/my-inprogress-submissions", key: "my_inprogress" },
//     // { name: "Inspector", path: "/checker-verified-inspector-pending" },
//     // { name: "Checklists", path: "/accessible-checklists", key: "checklists" },
//     // { name: "Checker Inbox", path: "/checker-inbox", key: "checker_inbox" },

//     // {
//     //   name: "Verifications",
//     //   path: "/hierarchical-verifications",
//     //   key: "verifications",
//     // },

//     {
//       name: "InitializeChecklist",
//       path: "/Initialize-Checklist",
//       key: "InitializeChecklist",
//     },
//     {
//       name: "PendingInspectorChecklists",
//       path: "/PendingInspector-Checklist",
//       key: "PendingInspectorChecklists",
//     },
//     {
//       name: "PendingForMakerItems",
//       path: "/Pending-For-MakerItems",
//       key: "PendingForMakerItems",
//     },
//     {
//       name: "PendingSupervisorItems",
//       path: "/PendingSupervisorItems",
//       key: "PendingSupervisorItems",
//     },
//     {
//       name: "UsersManagement",
//       path: "/UsersManagement",
//       key: "UsersManagement",
//     },

//   ];

//   // Filtering logic:
//   let filteredItems = navItems;
//   if (userRole === "Intializer") {
//     filteredItems = navItems.filter((item) => item.key === "InitializeChecklist");
//   } else {
//     if (userRoles.includes("MAKER")) {
//       filteredItems = navItems.filter(
//         (item) => item.key !== "checker_inbox" && item.key !== "verifications"
//       );
//     }
//     if (userRoles.includes("CHECKER")) {
//       filteredItems = filteredItems.filter(
//         (item) => item.key !== "checklists" && item.key !== "my_inprogress"
//       );
//     }
//   }

//   // THEME palette
//   const palette = theme === "dark"
//     ? {
//         bg: "linear-gradient(135deg, #23232e, #181820 100%)",
//         border: `3px solid ${GOLD_DARK}`,
//         shadow: "0 4px 32px #fffbe022",
//         title: GOLD_DARK,
//         linkActiveBg: `linear-gradient(90deg, #fde047 80%, #facc15)`,
//         linkActive: "#23232e",
//         linkInactive: GOLD_DARK,
//         linkBgInactive: "#191921",
//         footer: GOLD_DARK
//       }
//     : {
//         bg: `linear-gradient(135deg, ${ORANGE_LIGHT}, #fff)`,
//         border: `3px solid ${ORANGE}`,
//         shadow: "0 4px 32px #ea682220",
//         title: ORANGE_DARK,
//         linkActiveBg: `linear-gradient(90deg, ${ORANGE} 80%, ${ORANGE_DARK})`,
//         linkActive: "#fff",
//         linkInactive: ORANGE_DARK,
//         linkBgInactive: "#fff",
//         footer: ORANGE_DARK
//       };

//   return (
//     <div
//       className="fixed w-[15%] h-screen shadow-lg p-4 flex flex-col"
//       style={{
//         background: palette.bg,
//         borderRight: palette.border,
//         boxShadow: palette.shadow,
//         transition: "all 0.3s"
//       }}
//     >
//       <div className="mb-6 text-center">
//         <div
//           className="text-lg font-bold tracking-wide"
//           style={{ color: palette.title, letterSpacing: "2px" }}
//         >
//           Main Menu
//         </div>
//       </div>
//       <nav className="space-y-2 flex-1">
//         {filteredItems.map((item) => (
//           <NavLink
//             key={item.name}
//             to={item.path}
//             className="block px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200"
//             style={({ isActive }) =>
//               isActive
//                 ? {
//                     background: palette.linkActiveBg,
//                     color: palette.linkActive,
//                     boxShadow: theme === "dark"
//                       ? "0 2px 12px #fffbe022"
//                       : "0 2px 12px #ea682238",
//                   }
//                 : {
//                     color: palette.linkInactive,
//                     background: palette.linkBgInactive,
//                   }
//             }
//           >
//             {item.name}
//           </NavLink>
//         ))}
//       </nav>
//       <div className="mt-8 text-xs text-center" style={{ color: palette.footer }}>
//         &copy; {new Date().getFullYear()} Your Company
//       </div>
//     </div>
//   );
// }

// export default SiteBarHome;

import React from "react";
import { NavLink } from "react-router-dom";
import { useTheme } from "../ThemeContext";

// COLORS
const ORANGE = "#ea6822";
const ORANGE_DARK = "#e44a22";
const ORANGE_LIGHT = "#fff8f2";
const GOLD_DARK = "#facc15";

function getUserRole() {
  try {
    return (localStorage.getItem("USER_ROLE") || "").trim();
  } catch {
    return "";
  }
}

function getUserRoles() {
  try {
    const accesses = JSON.parse(localStorage.getItem("ACCESSES") || "[]");
    let roles = [];
    accesses.forEach((access) => {
      if (Array.isArray(access.roles)) {
        access.roles.forEach((role) => {
          const roleStr = typeof role === "string" ? role : role?.role;
          if (roleStr && !roles.includes(roleStr)) roles.push(roleStr);
        });
      }
    });
    return roles;
  } catch {
    return [];
  }
}

function SiteBarHome() {
  const { theme } = useTheme();
  const userRole = getUserRole();
  const userRoles = getUserRoles();

  // All possible navs
  const navItems = [
    { name: "Projects", path: "/config", key: "projects" },
    { name: "My In-Progress Items", path: "/my-inprogress-submissions", key: "my_inprogress" },
    { name: "Inspector", path: "/checker-verified-inspector-pending", key: "inspector" },
    { name: "Checklists", path: "/accessible-checklists", key: "checklists" },
    { name: "Checker Inbox", path: "/checker-inbox", key: "checker_inbox" },
    { name: "Verifications", path: "/hierarchical-verifications", key: "verifications" },
    { name: "Initialize Checklist", path: "/Initialize-Checklist", key: "InitializeChecklist" },
    { name: "Pending Inspector Checklists", path: "/PendingInspector-Checklist", key: "PendingInspectorChecklists" },
    { name: "Pending For Maker Items", path: "/Pending-For-MakerItems", key: "PendingForMakerItems" },
    { name: "Pending Supervisor Items", path: "/PendingSupervisorItems", key: "PendingSupervisorItems" },
    { name: "Users Management", path: "/UsersManagement", key: "UsersManagement" },
  ];

  // ---- Filtering Logic ----
  let filteredItems = navItems;

  // Convert for easy role comparison
  const _role = (userRole || "").toUpperCase();

  if (
    _role === "ADMIN" ||
    _role === "MANAGER" ||
    _role === "SUPERADMIN"
  ) {
    // Show everything
    filteredItems = navItems;
  } else if (_role === "INTIALIZER") {
    filteredItems = navItems.filter(
      (item) => item.key === "InitializeChecklist"
    );
  } else if (_role === "SUPERVISOR") {
    filteredItems = navItems.filter(
      (item) => item.key === "PendingSupervisorItems"
    );
  } else if (_role === "MAKER") {
    filteredItems = navItems.filter(
      (item) => item.key === "PendingForMakerItems"
    );
  } else if (_role === "CHECKER" || _role === "INSPECTOR") {
    filteredItems = navItems.filter(
      (item) => item.key === "PendingInspectorChecklists"
    );
  }
  // Extend logic for other roles if needed

  // THEME palette
  const palette =
    theme === "dark"
      ? {
          bg: "linear-gradient(135deg, #23232e, #181820 100%)",
          border: `3px solid ${GOLD_DARK}`,
          shadow: "0 4px 32px #fffbe022",
          title: GOLD_DARK,
          linkActiveBg: `linear-gradient(90deg, #fde047 80%, #facc15)`,
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


// Sidebar config for each role
const NAV_CONFIG = {
  ADMIN: [
    { name: "Projects", path: "/config" },
    { name: "My In-Progress Items", path: "/my-inprogress-submissions" },
    { name: "Inspector", path: "/checker-verified-inspector-pending" },
    { name: "Checklists", path: "/accessible-checklists" },
    { name: "Checker Inbox", path: "/checker-inbox" },
    { name: "Verifications", path: "/hierarchical-verifications" },
    { name: "Initialize Checklist", path: "/Initialize-Checklist" },
    { name: "Pending Inspector Checklist", path: "/PendingInspector-Checklist" },
    { name: "Pending For Maker Items", path: "/Pending-For-MakerItems" },
    { name: "Pending Supervisor Items", path: "/PendingSupervisorItems" },
    { name: "Users Management", path: "/UsersManagement" },
  ],
  Intializer: [
    { name: "Initialize Checklist", path: "/Initialize-Checklist" },
  ],
  INSPECTOR: [
    { name: "Pending Inspector Checklist", path: "/PendingInspector-Checklist" },
  ],
  CHECKER: [
    { name: "Pending Inspector Checklist", path: "/PendingInspector-Checklist" },
  ],
  MAKER: [
    { name: "Pending For Maker Items", path: "/Pending-For-MakerItems" },
  ],
  SUPERVISOR: [
    { name: "Pending Supervisor Items", path: "/PendingSupervisorItems" },
  ],
  // fallback: []
};

// function SiteBarHome() {
//   const { theme } = useTheme();
//   const userRole = getUserRole();

//   // Get the right menu or fallback
//   const navItems = NAV_CONFIG[userRole] || [];

//   const palette = getPalette(theme);

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