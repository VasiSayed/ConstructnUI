import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SiteBarHome from "./SiteBarHome";
import { useTheme } from "../ThemeContext";
import projectImage from "../Images/Project.png"; // Placeholder image

// --- Import your API functions here ---
import { getProjectsByOwnership, getProjectUserDetails } from "../api";
import toast from "react-hot-toast";

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
  const [loading, setLoading] = useState(true);

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
    const fetchProjects = async () => {
      setLoading(true);

      // 1. Try to get userData from localStorage, else from token
      let userData = null;
      try {
        const userDataStr = localStorage.getItem("USER_DATA");
        if (userDataStr) {
          userData = JSON.parse(userDataStr);
        } else {
          const token =
            localStorage.getItem("ACCESS_TOKEN") ||
            localStorage.getItem("TOKEN") ||
            localStorage.getItem("token");
          if (token) userData = decodeJWT(token);
        }
      } catch {}

      // 2. Try to get USER_ROLE for direct access (if needed)
      const rolee =
        localStorage.getItem("USER_ROLE") ||
        userData?.role ||
        userData?.roles?.[0] ||
        "";

      // 3. For admin/manager/superadmin/client, use your existing API logic
      const isManager = userData?.is_manager;
      const isSuperadmin = userData?.is_staff || userData?.superadmin;
      const isClient = userData?.is_client;

      try {
        let response = null;
        if (isManager) {
          if (userData.entity_id) {
            response = await getProjectsByOwnership({ entity_id: userData.entity_id });
          } else if (userData.company_id) {
            response = await getProjectsByOwnership({ company_id: userData.company_id });
          } else if (userData.org || userData.organization_id) {
            const orgId = userData.org || userData.organization_id;
            response = await getProjectsByOwnership({ organization_id: orgId });
          } else {
            toast.error("No entity, company, or organization found for this manager.");
            setProjects([]);
            setLoading(false);
            return;
          }
        } else if (isSuperadmin || isClient) {
          response = await getProjectUserDetails();
        }

        if (response && response.status === 200) {
          // API response case (admin/manager/superadmin/client)
          // Patch: If your backend sends projects as array
          setProjects(
            Array.isArray(response.data)
              ? response.data
              : response.data.results || []
          );
        } else if (response) {
          toast.error(response.data?.message || "Failed to fetch projects.");
          setProjects([]);
        } else {
          // 4. For all other users: fallback to JWT token for project/roles
          // This is your previous "accesses" logic
          const token =
            localStorage.getItem("ACCESS_TOKEN") ||
            localStorage.getItem("TOKEN") ||
            localStorage.getItem("token");
          if (token) {
            const data = decodeJWT(token);
            if (data && Array.isArray(data.accesses)) {
              const uniqueProjects = [];
              const seenIds = new Set();
              data.accesses.forEach((access) => {
                if (access.project_id && !seenIds.has(access.project_id)) {
                  uniqueProjects.push({
                    id: access.project_id,
                    roles: access.roles,
                  });
                  seenIds.add(access.project_id);
                }
              });
              setProjects(uniqueProjects);
            } else {
              setProjects([]);
            }
          } else {
            setProjects([]);
          }
        }
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Error fetching projects."
        );
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
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
          {loading ? (
            <div className="flex justify-center items-center py-14 text-lg">
              <svg className="animate-spin h-8 w-8 text-purple-500 mr-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading projects...
            </div>
          ) : projects.length === 0 ? (
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
                    {project.project_name || `Project ${project.id}`}
                  </div>
                  {/* Role Badges */}
                  <div className="absolute top-2 left-2 flex gap-2 flex-wrap">
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
