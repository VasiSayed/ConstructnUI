import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import projectImage from "../Images/Project.png";
import { getProjectUserDetails, getProjectsByOwnership } from "../api";
import toast from "react-hot-toast";
import SiteBarHome from "./SiteBarHome";
import { useTheme } from "../ThemeContext";

const Configuration = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { state } = useLocation();
  const userDataString = localStorage.getItem("USER_DATA");
  const userData = JSON.parse(userDataString);
  const userId = useSelector((state) => state.user.user.id);

  const handleImageClick = (project) => {
    navigate(`/project/${project.id}`, { state: { project } });
  };

  const [allProject, setAllProject] = useState([]);
  // useEffect(() => {
  //   const getAllProject = async () => {
  //     const response = await getAllProjectDetails();
  //     console.log(response.data.data);
  //     if (response.status === 200) {
  //       setAllProject(response.data.data);
  //     } else {
  //       toast.error(response.data.message);
  //     }
  //   };
  //   getAllProject();
  // }, []);
const rolee = localStorage.getItem("USER_ROLE");
console.log(rolee,'this is the roleee');


  useEffect(() => {
    const getAllProject = async () => {
      try {
        let response = null;
        console.log("manager", userData?.is_manager);
        console.log("Superadmin", userData?.is_staff || userData?.superadmin);
        console.log("client", userData ? userData.is_client : null);


        if (userData?.is_manager) {
          if (userData.entity_id) {
            response = await getProjectsByOwnership({ entity_id: userData.entity_id });
          } else if (userData.company_id) {
            response = await getProjectsByOwnership({ company_id: userData.company_id });
          } else if (userData.org || userData.organization_id) {
            const orgId = userData.org || userData.organization_id;
            response = await getProjectsByOwnership({ organization_id: orgId });
          } else {
            toast.error("No entity, company, or organization found for this manager.");
            return;
          }
        } else if (
          userData?.is_staff ||
          userData?.superadmin ||
          userData?.is_client
        ) {
          response = await getProjectUserDetails();
        } else {
          toast.error("You do not have permission to view projects.");
          return;
        }

        if (response?.status === 200) {
          setAllProject(response.data);
        } else {
          toast.error(response?.data?.message || "Failed to fetch projects.");
        }
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Error fetching projects."
        );
      }
    };

    if (userData) {
      getAllProject();
    }
  }, [userData]);

  // Basic palette
  const palette = theme === "dark"
    ? {
        bg: "bg-[#181820]",
        card: "bg-[#23232e] text-yellow-100",
        cardShadow: "shadow-lg border border-yellow-400/20",
        title: "text-yellow-200",
        overlay: "bg-gray-800 bg-opacity-50",
      }
    : {
        bg: "bg-gray-50",
        card: "bg-white text-gray-800",
        cardShadow: "shadow-lg border border-orange-200",
        title: "text-purple-800",
        overlay: "bg-gray-800 bg-opacity-50",
      };

  return (
    <div className={`flex ${palette.bg} min-h-screen`}>
      <SiteBarHome />
      <div className="my-5 w-[85%] mt-5 ml-[16%] mr-[1%]">
        <div className={`max-w-7xl mx-auto pt-3 px-5 pb-8 rounded ${palette.cardShadow} ${palette.card}`}>
          <h2 className={`text-3xl font-bold mb-6 text-center ${palette.title}`}>
            Projects
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {allProject.map((project) => (
              <div
                key={project.id}
                className={`relative rounded-xl overflow-hidden cursor-pointer w-56 ${palette.card} ${palette.cardShadow}`}
                onClick={() => handleImageClick(project)}
              >
                <img
                  src={project?.image_url || projectImage}
                  alt={`${project.name} Background`}
                  className="w-56 h-56 object-cover"
                />
                <div className={`absolute bottom-0 left-0 right-0 ${palette.overlay} text-white text-lg font-semibold p-2`}>
                  {project.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuration;
