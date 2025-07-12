import React, { useEffect, useRef, useState } from "react";
import Drawer from "./Drawer";
import profile from "../../src/Images/profile.jpg";
import { CiCircleQuestion } from "react-icons/ci";
import { IoMdArrowDropdown } from "react-icons/io";
import { useNavigate } from "react-router-dom";

function Profile({ onClose }) {
  const [manage, setManage] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [accesses, setAccesses] = useState([]);

  useEffect(() => {
    // Get user data
    const userString = localStorage.getItem("USER_DATA");
    if (userString && userString !== "undefined") {
      setUserData(JSON.parse(userString));
    }
    // Get accesses data
    const accessString = localStorage.getItem("ACCESSES");
    if (accessString && accessString !== "undefined") {
      try {
        setAccesses(JSON.parse(accessString));
      } catch (e) {
        setAccesses([]);
      }
    }
  }, []);

  // Extract unique roles from accesses, support array of strings or objects
  let allRoles = [];
  if (Array.isArray(accesses)) {
    accesses.forEach((access) => {
      if (access.roles && Array.isArray(access.roles)) {
        access.roles.forEach((role) => {
          // Role may be a string or object
          const roleStr = typeof role === "string" ? role : role?.role;
          if (roleStr && !allRoles.includes(roleStr)) {
            allRoles.push(roleStr);
          }
        });
      }
    });
  }

  // Role logic
  let role = "User";
  if (userData?.superadmin || userData?.is_staff) {
    role = "Super Admin";
  } else if (allRoles.length > 0) {
    role = allRoles.join(", ");
  } else if (userData?.is_manager) {
    role = "Manager";
  } else if (userData?.is_client) {
    role = "Client";
  }

  useEffect(() => {
    if (role) {
      localStorage.setItem("USER_ROLE", role);
    }
  }, [role]);

  // Dropdown outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setManage(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sign out logic
  const handleSignOut = () => {
    localStorage.removeItem("ACCESS_TOKEN");
    localStorage.removeItem("REFRESH_TOKEN");
    localStorage.removeItem("USER_DATA");
    localStorage.removeItem("ACCESSES");
    localStorage.removeItem("USER_ROLE");
    navigate("/login");
    if (typeof onClose === "function") onClose();
  };

  return (
    <Drawer onClose={onClose}>
      <div>
        {/* Profile Picture */}
        <div className="flex justify-center items-center">
          <div className="h-20 w-20 rounded-full flex items-center justify-center border border-green-200">
            <div className="rounded-full p-1">
              <img
                src={profile}
                alt="profile"
                className="h-[75px] w-[75px] rounded-full"
              />
            </div>
          </div>
        </div>
        {/* User Info */}
        <div className="flex justify-center flex-col items-center mt-6">
          <h3 className="text-base font-normal text-gray-500">
            {userData?.username || ""}
          </h3>
          <div className="flex gap-1 items-center mt-2">
            <span className="flex gap-1">
              <h2>User Id:</h2>
              <p>{userData?.user_id || "--"}</p>
            </span>
            <span>
              <CiCircleQuestion size={20} />
            </span>
          </div>
          <div className="mt-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
              Role: {role}
            </span>
          </div>
        </div>
        {/* Show all project roles */}
        {accesses?.length > 0 && (
          <div className="mt-2 text-center">
            <span className="text-sm font-medium">Roles by Project:</span>
            {accesses.map((access, idx) => (
              <div key={idx}>
                <span className="font-bold">Project {access.project_id}:</span>
                {access.roles &&
                  access.roles.map((role, j) => {
                    const roleStr =
                      typeof role === "string" ? role : role?.role;
                    return (
                      <span
                        key={j}
                        className="ml-2 inline-block px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs"
                      >
                        {roleStr}
                      </span>
                    );
                  })}
              </div>
            ))}
          </div>
        )}
        {/* Contact Info */}
        <div className="flex flex-col items-center text-base text-black mt-4">
          <div>
            Email:{" "}
            <span className="font-semibold">{userData?.email || "--"}</span>
          </div>
          <div>
            Phone:{" "}
            <span className="font-semibold">
              {userData?.phone_number || "--"}
            </span>
          </div>
          <div>
            Joined:{" "}
            <span className="font-semibold">
              {userData?.date_joined || "--"}
            </span>
          </div>
          {userData?.last_login && (
            <div>
              Last Login:{" "}
              <span className="font-semibold">{userData.last_login}</span>
            </div>
          )}
        </div>
        {/* Organization Dropdown */}
        <div className="relative flex justify-center mt-6" ref={dropdownRef}>
          <button
            onClick={() => setManage(!manage)}
            className="flex items-center gap-2 px-4 py-2 rounded-md"
          >
            <span className="font-medium">
              {userData?.org || "ORGANIZATION"}
            </span>
            <IoMdArrowDropdown
              size={20}
              className={`transform transition-transform duration-200 ${
                manage ? "rotate-90" : ""
              }`}
            />
          </button>
          {manage && (
            <div className="absolute mt-2 w-64 bg-white rounded-xl shadow-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-red-400 text-white text-lg font-semibold rounded-full">
                  {userData?.organization_name
                    ? userData.organization_name[0]
                    : "O"}
                </div>
                <div>
                  <p className="font-semibold">
                    {userData?.org || "ORGANIZATION"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Org ID: {userData?.org || "--"}
                  </p>
                </div>
              </div>
              <button className="w-full mt-3 text-blue-600 font-medium text-sm py-2 hover:bg-gray-100 rounded-md">
                Manage Organization
              </button>
            </div>
          )}
        </div>
        {/* Account Actions */}
        <div className="border border-black rounded-sm my-5 pt-5 w-full py-2">
          <div className="grid grid-cols-2 text-center">
            <button
              className="hover:underline text-blue-600 font-medium"
              onClick={() => {
                alert("Account details feature coming soon!");
              }}
            >
              My Account
            </button>
            <button
              className="hover:underline text-red-500 font-medium"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </Drawer>
  );
}

export default Profile;
