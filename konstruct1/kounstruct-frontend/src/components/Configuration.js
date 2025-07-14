import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SiteBarHome from "./SiteBarHome";
import { useTheme } from "../ThemeContext";
import projectImage from "../Images/Project.png"; // Placeholder image

// Helper: Decode JWT (same as your login page)
function decodeJWT(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

const Configuration = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);

  // Color palette for dark/light
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

  useEffect(() => {
    // Get the access token (handle all caps variants)
    const token =
      localStorage.getItem("ACCESS_TOKEN") ||
      localStorage.getItem("TOKEN") ||
      localStorage.getItem("token");
    if (!token) {
      setProjects([]);
      return;
    }
    // Decode token
    const data = decodeJWT(token);
    if (data && Array.isArray(data.accesses)) {
      // Projects assigned by access
      // If you want to display project_id and roles from the token itself:
      const uniqueProjects = [];
      const seenIds = new Set();
      data.accesses.forEach((access) => {
        if (access.project_id && !seenIds.has(access.project_id)) {
          uniqueProjects.push({
            id: access.project_id,
            roles: access.roles,
            // You can store more info if needed
          });
          seenIds.add(access.project_id);
        }
      });
      setProjects(uniqueProjects);
    } else {
      setProjects([]);
    }
  }, []);

  const handleProjectClick = (project) => {
    // Pass the project id as state, adjust as per your routing setup
    navigate(`/project/${project.id}`, { state: { project } });
  };

  return (
    <div className={`flex ${palette.bg} min-h-screen`}>
      <SiteBarHome />
      <div className="my-5 w-[85%] mt-5 ml-[16%] mr-[1%]">
        <div className={`max-w-7xl mx-auto pt-3 px-5 pb-8 rounded ${palette.cardShadow} ${palette.card}`}>
          <h2 className={`text-3xl font-bold mb-6 text-center ${palette.title}`}>
            Projects
          </h2>
          {projects.length === 0 ? (
            <div className="text-center py-10 text-xl font-semibold text-red-400">
              No projects assigned.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className={`relative rounded-xl overflow-hidden cursor-pointer w-56 ${palette.card} ${palette.cardShadow}`}
                  onClick={() => handleProjectClick(project)}
                >
                  <img
                    src={projectImage}
                    alt={`Project ${project.id}`}
                    className="w-56 h-56 object-cover"
                  />
                  <div className={`absolute bottom-0 left-0 right-0 ${palette.overlay} text-white text-lg font-semibold p-2`}>
                    Project {project.id}
                  </div>
                  {/* Optional: Show role badges */}
                  <div className="absolute top-2 left-2 flex gap-2">
                    {Array.isArray(project.roles) && project.roles.map((role, i) => (
                      <span
                        key={i}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold shadow"
                      >
                        {typeof role === "string" ? role : role?.role}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Configuration;
