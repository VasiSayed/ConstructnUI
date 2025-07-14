import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import projectImage from "../Images/Project.png";
import { getProjectLevelDetails } from "../api";
import toast from "react-hot-toast";
import SiteBarHome from "./SiteBarHome";
import { useTheme } from "../ThemeContext";

const palette = {
  light: {
    bg: "bg-gray-50",
    card: "bg-white",
    text: "text-gray-900",
    title: "text-purple-800",
    shadow: "shadow-lg",
    gridItem: "bg-white hover:shadow-2xl border border-purple-100",
    gridText: "text-white",
    overlay: "bg-gray-800 bg-opacity-50",
  },
  dark: {
    bg: "bg-[#191921]",
    card: "bg-[#22223b]",
    text: "text-yellow-50",
    title: "text-yellow-400",
    shadow: "shadow-2xl",
    gridItem: "bg-[#23232e] hover:shadow-purple-800 border border-yellow-700",
    gridText: "text-yellow-100",
    overlay: "bg-black bg-opacity-70",
  },
};

const ProjectDetailsPage = () => {
  const { id: projectIdFromUrl } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const projectFromState = location.state?.project;
  const projectId =
    projectFromState?.id || projectFromState?.project_id || projectIdFromUrl;

  const projectImg = projectFromState?.image_url || projectImage;
  const [projectLevelData, setProjectLevelData] = useState([]);

  useEffect(() => {
    if (!projectId) {
      // Redirect to home if no project id found
      navigate("/");
      return;
    }
    const fetchProjectTower = async () => {
      const response = await getProjectLevelDetails(projectId);
      if (response.status === 200) {
        setProjectLevelData(response.data);
      } else {
        toast.error(response.data.message);
      }
    };
    fetchProjectTower();
  }, [projectId, navigate]);

  const handleImageClick = (proj) => {
    navigate(`/Level/${proj}`, {
      state: { projectLevelData },
    });
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Pick theme palette
  const p = palette[theme === "dark" ? "dark" : "light"];

  return (
    <div className={`flex min-h-screen ${p.bg}`}>
      <SiteBarHome />
      <div className={`my-5 w-[85%] mt-5 ml-[16%] mr-[1%]`}>
        <div className={`max-w-7xl mx-auto pt-3 px-5 pb-8 ${p.card} rounded ${p.shadow}`}>
          <div className="mb-8">
            <h2 className={`text-4xl font-bold text-center mb-4 ${p.title}`}>
              {projectFromState?.project_name || `Project ${projectId}`}
            </h2>
            <button
              onClick={handleBack}
              className="absolute left-10 top-8 bg-purple-600 hover:bg-purple-800 text-white px-4 py-1 rounded shadow-sm"
              style={{ zIndex: 10 }}
            >
              ← Back
            </button>
          </div>
          <div>
            {projectLevelData && projectLevelData.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {projectLevelData.map((proj) => (
                  <div
                    key={proj.id}
                    className={`relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ${p.gridItem} ${
                      proj.id === projectId ? "ring-4 ring-purple-200" : ""
                    }`}
                    onClick={() => handleImageClick(proj.id)}
                  >
                    <img
                      src={projectImg}
                      alt={`${
                        proj.name || proj.naming_convention || "Project"
                      } Background`}
                      className="w-full h-72 object-cover"
                    />
                    <div className={`absolute bottom-0 left-0 right-0 ${p.overlay} ${p.gridText} text-sm font-semibold p-2`}>
                      {proj.name}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`text-center ${p.text} text-lg font-semibold mt-10`}>
                No projects available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsPage;
