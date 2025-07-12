import React from "react";
import { NavLink } from "react-router-dom";


// Utility to extract all unique roles from accesses in localStorage
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

const role = localStorage.getItem("USER_ROLE");


function SiteBarHome() {
  const userRoles = getUserRoles();

  // Define nav items with keys for conditional filtering
  const navItems = [
    { name: "Projects", path: "/config", key: "projects" },
    // { name: "User Snag", path: "/user-snag", key: "user_snag" },
    // { name: "My Snag", path: "/my-snag", key: "my_snag" },
    // { name: "Observation", path: "/observation", key: "observation" },
    // { name: "Schedule", path: "/schedule", key: "schedule" },
    // { name: "Attendance", path: "/attendance", key: "attendance" },
    {
      name: "My In-Progress Items",
      path: "/my-inprogress-submissions",
      key: "my_inprogress",
    },
    { name: "Inspector", path: "/checker-verified-inspector-pending" },
    { name: "Checklists", path: "/accessible-checklists", key: "checklists" },

    { name: "Checker Inbox", path: "/checker-inbox", key: "checker_inbox" },

    {
      name: "Verifications",
      path: "/hierarchical-verifications",
      key: "verifications",
    },
    {
      name: "InitializeChecklist",
      path: "/Initialize-Checklist",
      key: "InitializeChecklist",
    },
    {
      name: "PendingInspectorChecklists",
      path: "/PendingInspector-Checklist",
      key: "PendingInspectorChecklists",
    },
    {
      name: "PendingForMakerItems",
      path: "/Pending-For-MakerItems",
      key: "PendingForMakerItems",
    },
    {
      name: "PendingSupervisorItems",
      path: "/PendingSupervisorItems",
      key: "PendingSupervisorItems",
    },
    {
      name: "UsersManagement",
      path: "/UsersManagement",
      key: "UsersManagement",
    },
  ];

  // Filter logic based on roles
  let filteredItems = navItems;
  if (userRoles.includes("MAKER")) {
    // Remove Checker Inbox and Verifications
    filteredItems = navItems.filter(
      (item) => item.key !== "checker_inbox" && item.key !== "verifications"
    );
  }
  if (userRoles.includes("CHECKER")) {
    // Remove Checklists and My In-Progress Items
    filteredItems = filteredItems.filter(
      (item) => item.key !== "checklists" && item.key !== "my_inprogress"
    );
  }

  return (
    <div className="fixed w-[15%] h-screen bg-[#489CE2] shadow-lg p-4">
      <nav className="space-y-2">
        {filteredItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `block px-4 py-2 rounded-md text-sm font-medium ${
                isActive
                  ? "bg-[#3CB0E1] text-white"
                  : "text-gray-700 hover:bg-[#3CB0E1]"
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default SiteBarHome;