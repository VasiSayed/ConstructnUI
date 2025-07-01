import React from "react";
import { NavLink } from "react-router-dom";

function SideBarSetup() {
  const navItems = [
    { name: "User Setup", path: "/user-setup" },
    { name: "Unit Setup", path: "/setup" },
    { name: "CA Setup", path: "/casetup" },
    { name: "User & Role", path: "/user" },
    { name: "Checklist", path: "/Checklist" },
    { name: "Escalation Setup", path: "/escalation-setup" },
    { name: "Contractors", path: "/contractors" },
    { name: "Geo Tag", path: "/geo-tag" },
    { name: "Project Setup", path: "/project-setup" },
    { name: "Import/Export", path: "/import-export" },
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

export default SideBarSetup;
