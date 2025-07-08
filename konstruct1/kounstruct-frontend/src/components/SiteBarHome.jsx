import React from "react";
import { NavLink } from "react-router-dom";

function SiteBarHome() {
  const navItems = [
    { name: "Projects", path: "/config" },
    { name: "User Snag", path: "/user-snag" },
    { name: "My Snag", path: "/my-snag" },
    { name: "Observation", path: "/observation" },
    { name: "Schedule", path: "/schedule" },
    { name: "Attendance", path: "/attendance" },

    { name: "My In-Progress Items", path: "/my-inprogress-submissions" },
    { name: "Checker Inbox", path: "/checker-inbox" },

    // { name: "Checklists", path: "/accessible-checklists" },
    // { name: "My Checklists", path: "/my-checklists" },  // ← NEW
    { name: "Verifications", path: "/hierarchical-verifications" }
  ];

  return (
    <div className="fixed  w-[15%] h-screen bg-[#489CE2] shadow-lg p-4">
      <nav className="space-y-2 ">
        {navItems.map((item) => (
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
