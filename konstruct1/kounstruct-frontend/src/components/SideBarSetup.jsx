import React from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

function SideBarSetup() {

  const isManager = useSelector((state) => state.user.user.is_manager);

  const navItems = [
    { name: "User Setup", path: "/user-setup" },
    { name: "Unit Setup", path: "/setup" },
    { name: "CA Setup", path: "/casetup" },
    { name: "User & Role", path: "/user" },
    { name: "Checklist", path: "/Checklist" },
    { name: "Category Sidebar", path: "/category-sidebar" },
    { name: "Escalation Setup", path: "/escalation-setup" },
    { name: "Contractors", path: "/contractors" },
    { name: "Geo Tag", path: "/geo-tag" },
    { name: "Project Setup", path: "/project-setup" },
    { name: "Import/Export", path: "/import-export" },
  ];



    let userData = null;
    const userString = localStorage.getItem("USER_DATA");
    if (userString && userString !== "undefined") {
      try {
        userData = JSON.parse(userString);
      } catch (e) {
        userData = null;
      }
    }

    let role = "User";
    if (userData) {
      if (userData.superadmin) {
        role = "Super Admin";
      } else if (userData.is_manager) {
        role = "Manager";
      } else if (!userData.is_client) {
        role = "Admin";
      } else {
        role = "User";
      }
    }


    const filteredNavItems =
      role === "Manager"
        ? navItems.filter(
            (item) => item.name !== "Unit Setup" && item.name !== "User Setup"
          )
        : navItems;

  return (
    <div className="fixed  w-[15%] h-screen bg-[#489CE2] shadow-lg p-4">
      <nav className="space-y-2 ">
        {filteredNavItems.map((item) => (
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
