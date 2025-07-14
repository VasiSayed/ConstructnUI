import React, { useState } from "react";
import { IoIosNotificationsOutline } from "react-icons/io";
import { NavLink, useNavigate } from "react-router-dom";
import { HiOutlineBuildingStorefront } from "react-icons/hi2";
import { IoSettingsOutline } from "react-icons/io5";
import { FaRegCircleUser, FaMoon, FaSun } from "react-icons/fa6";
import Notification from "./Notification";
import Profile from "./Profile";
import { useSelector, useDispatch } from "react-redux";
import { setSelectedProject } from "../store/userSlice";
import { useTheme } from "../ThemeContext";

function Header() {
  const [isNotification, setIsNotification] = useState(false);
  const [isProfile, setIsProfile] = useState(false);

  const dispatch = useDispatch();
  const projects = useSelector((state) => state.user.projects);
  const selectedProject = useSelector((state) => state.user.selectedProject.id);
  const { theme, toggleTheme } = useTheme();

  const rolee = localStorage.getItem("ROLE");
  const token = localStorage.getItem("TOKEN");
  const allowuser =
    rolee === "Manager" || rolee === "Super Admin" || rolee === "Client";

  const navigate = useNavigate();

  const handleProject = (e) => {
    dispatch(setSelectedProject(e.target.value));
  };

  // Themed palette for header
  const palette =
    theme === "dark"
      ? {
          bg: "bg-[#22212b]",
          border: "border-[#444054]",
          text: "text-gray-100",
          logo: "text-yellow-400",
          select: "bg-[#302e41] text-yellow-200",
          nav: "text-yellow-200",
          shadow: "shadow-lg",
          icon: "text-yellow-300",
          iconBtn: "bg-[#2a2736] hover:bg-yellow-500",
        }
      : {
          bg: "bg-white",
          border: "border-gray-200",
          text: "text-gray-900",
          logo: "text-orange-600",
          select: "bg-gray-700 text-white",
          nav: "text-orange-700",
          shadow: "shadow-md",
          icon: "text-yellow-500",
          iconBtn: "bg-gray-800 hover:bg-yellow-400",
        };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 ${palette.bg} ${palette.text} flex items-center justify-between px-3 py-2 ${palette.shadow} ${palette.border} border-b`}
        style={{
          transition: "background 0.2s, color 0.2s",
        }}
      >
        <div className="flex items-center space-x-8">
          <span className="text-lg flex items-center space-x-2">
            <h2 className={`font-medium ${palette.logo}`}>🔗 Konstruct</h2>
          </span>
          <NavLink
            to="/config"
            className={({ isActive }) =>
              isActive
                ? `font-bold underline ${palette.nav}`
                : `font-normal ${palette.nav}`
            }
          >
            Home
          </NavLink>
        </div>
        <ul className="hidden md:flex justify-end items-center gap-5 py-2 uppercase text-sm">
          {projects.length > 0 && (
            <select
              className={`rounded-md p-2 ${palette.select}`}
              onChange={handleProject}
              value={selectedProject}
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.project_name}
                </option>
              ))}
            </select>
          )}

          {allowuser && (
            <NavLink
              to={rolee === "Manager" ? "/user" : "/setup"}
              className={({ isActive }) =>
                isActive
                  ? `font-bold ${palette.nav}`
                  : `font-normal ${palette.nav}`
              }
            >
              <IoSettingsOutline className="text-lg" />
            </NavLink>
          )}

          <button onClick={() => setIsProfile(true)}>
            <FaRegCircleUser className={`text-lg ${palette.icon}`} />
          </button>

          {/* ---- Theme Toggle Button ---- */}
          <button
            onClick={toggleTheme}
            className={`rounded-full p-2 ${palette.iconBtn} transition-colors`}
            title="Toggle-Theme"
          >
            {theme === "dark" ? (
              <FaSun className="text-yellow-300" />
            ) : (
              <FaMoon className="text-gray-700" />
            )}
          </button>
        </ul>
      </nav>
      {isProfile && <Profile onClose={() => setIsProfile(false)} />}
      {isNotification && (
        <Notification onClose={() => setIsNotification(false)} />
      )}
    </>
  );
}

export default Header;
