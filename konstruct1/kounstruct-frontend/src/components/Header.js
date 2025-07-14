import React, { useState } from "react";
import { IoIosNotificationsOutline } from "react-icons/io";
import { NavLink, useNavigate } from "react-router-dom";
import { HiOutlineBuildingStorefront } from "react-icons/hi2";
import { IoSettingsOutline } from "react-icons/io5";
import { CiSearch } from "react-icons/ci";
import { FaRegCircleUser } from "react-icons/fa6";
import { GoCalendar } from "react-icons/go";
import { CgMenuGridO } from "react-icons/cg";
import Notification from "./Notification";
import Profile from "./Profile";
import { useSelector, useDispatch } from "react-redux";
import { setSelectedProject } from "../store/userSlice";

function Header() {
  const [isNotification, setIsNotification] = useState(false);
  const [isProfile, setIsProfile] = useState(false);

  const dispatch = useDispatch();
  const projects = useSelector((state) => state.user.projects);
  const selectedProject = useSelector((state) => state.user.selectedProject.id);


    const rolee = localStorage.getItem("ROLE");
    const token = localStorage.getItem("TOKEN");
    const allowuser =
      rolee === "Manager" || rolee === "Super Admin" || rolee === "Client";

const navigate = useNavigate();

  const handleProject = (e) => {  
    console.log(e.target.value, "e.target.value");
    dispatch(setSelectedProject(e.target.value));
  };
console.log(allowuser,'yhi is alalow user');

    const handleUserSetupClick = () => {
      if (!token) {
        navigate("/login");
      } else {
        navigate("/user-setup");
      }
    };



  return (
    // <div className="flex lg:flex-row flex-col gap-2 relative items-center justify-center w-full">
    //   <div className="sm:flex grid grid-cols-2 flex-wrap text-sm md:text-base sm:flex-row gap-5 font-medium p-2 xl:rounded-full rounded-md opacity-90 bg-gray-200 ">
    //     <NavLink
    //       to={"/config"}
    //       className={({ isActive }) =>
    //         `  md:rounded-full px-4 cursor-pointer text-center transition-all duration-300 ease-linear ${
    //           isActive && "bg-white text-blue-500 shadow-custom-all-sides"
    //         }`
    //       }
    //     >
    //       Home
    //     </NavLink>

    //     <NavLink
    //       to={"/ChifSetup"}
    //       className={({ isActive }) =>
    //         `  md:rounded-full px-4 cursor-pointer text-center transition-all duration-300 ease-linear ${
    //           isActive && "bg-white text-blue-500 shadow-custom-all-sides"
    //         }`
    //       }
    //     >
    //       Setup
    //     </NavLink>

    //      <NavLink
    //       to={"/casetup"}
    //       className={({ isActive }) =>
    //         `  md:rounded-full px-4 cursor-pointer text-center transition-all duration-300 ease-linear ${
    //           isActive && ""
    //         }`
    //       }
    //     >
    //       CA Setup
    //     </NavLink>

    //   </div>

    // </div>
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white text-gray-900 flex items-center justify-between px-3 py-2 shadow-md border">
        <div className="flex items-center space-x-8">
          <span className="text-lg flex items-center space-x-2">
            <h2 className="text-black font-medium">🔗 Konstruct</h2>
          </span>
          <NavLink
            to="/config"
            className={({ isActive }) =>
              !isActive ? "font-normal" : "text-gray-800 underline font-normal"
            }
          >
            Home
          </NavLink>
        </div>
        <ul className="hidden md:flex justify-end items-center gap-5 py-2 uppercase text-sm">
          {projects.length > 0 && (
            <select
              className="bg-gray-700 text-white rounded-md p-2"
              onChange={handleProject}
              value={selectedProject}
            >
              {projects.map((project) => (
                <option value={project.id}>{project.project_name}</option>
              ))}
            </select>
          )}
          <button
            className={({ isActive }) =>
              !isActive ? "font-normal" : "font-medium"
            }
          >
            <CiSearch className="text-xl" />
          </button>
          <button
            className={({ isActive }) =>
              !isActive ? "font-normal" : "font-medium"
            }
          >
            <IoIosNotificationsOutline className="text-xl" />
          </button>
          <button
            className={({ isActive }) =>
              !isActive ? "font-normal" : "font-medium"
            }
          >
            <GoCalendar className="text-lg" />
          </button>
          <NavLink
            to="/blog"
            className={({ isActive }) =>
              !isActive ? "font-normal" : "font-medium"
            }
          >
            <HiOutlineBuildingStorefront className="text-lg" />
          </NavLink>

          {allowuser && (
  <NavLink
    to={rolee === "Manager" ? "/user" : "/setup"}
    className={({ isActive }) =>
      !isActive ? "font-normal" : "font-medium"
    }
  >
    <IoSettingsOutline className="text-lg" />
  </NavLink>
)}

          <button
            onClick={() => setIsProfile(true)}
            // className={({ isActive }) =>
            //   !isActive ? "font-normal" : "font-medium"
            // }
          >
            <FaRegCircleUser className="text-lg" />
          </button>
          <button
            onClick={() => setIsNotification(true)}
            className={({ isActive }) =>
              !isActive ? "font-normal" : "font-medium"
            }
          >
            <CgMenuGridO className="text-xl" />
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
