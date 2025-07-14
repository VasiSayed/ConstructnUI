import React, { useEffect, useState } from "react";
import { showToast } from "../../utils/toast";
import projectImage from "../../Images/Project.png";
import AddProjectModal from "./AddProjectModal";
import { getProjectDetailsById } from "../../api";
import { useDispatch, useSelector } from "react-redux";
import { setProjects, setSelectedProject } from "../../store/userSlice";
import { useTheme } from "../../ThemeContext"; // <- ADD THIS

function Projects({ onProjectSetupComplete }) {
  const dispatch = useDispatch();
  const companyId = useSelector((state) => state.user.company.id);

  const { theme } = useTheme(); // <- GET THEME

  const [projectData, setProjectData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch projects by company
  const projectDetails = async () => {
    try {
      if (companyId) {
        const response = await getProjectDetailsById(companyId);
        if (response.data.data.projects.length > 0) {
          setProjectData(response.data.data.projects);
          dispatch(setProjects(response.data.data.projects));
        } else {
          setProjectData([]);
          dispatch(setProjects(null));
        }
      }
    } catch (err) {
      console.error("Failed to fetch project details:", err);
    }
  };

  // When a project is added, re-fetch projects and call onProjectSetupComplete
  const addProject = async (id) => {
    await projectDetails();
    onProjectSetupComplete(id);
  };

  useEffect(() => {
    if (companyId) {
      projectDetails();
      dispatch(setSelectedProject(null));
    }
    // eslint-disable-next-line
  }, [companyId]);

  // THEME palette
  const palette = theme === "dark"
    ? {
        bg: "bg-[#181820]",
        card: "bg-[#23232e] border border-amber-400/40 shadow-xl",
        gridBg: "bg-[#23232e]",
        nameBg: "bg-amber-900/80 text-yellow-100",
        btnBorder: "border-yellow-400 text-yellow-400",
        btnText: "text-yellow-300",
        plusBorder: "border-yellow-400",
      }
    : {
        bg: "bg-white",
        card: "bg-white border border-orange-200 shadow-lg",
        gridBg: "bg-white",
        nameBg: "bg-gray-800 bg-opacity-50 text-white",
        btnBorder: "border-orange-300 text-orange-500",
        btnText: "text-orange-700",
        plusBorder: "border-red-500",
      };

  return (
    <div className={`w-full h-dvh rounded-md ${palette.bg} gap-4 flex items-start justify-between my-1 transition-colors duration-300`}>
      <div className="w-full p-5 rounded flex flex-col h-full">
        {/* Project Grid */}
        <div className={`grid project-grid w-full h-full overflow-y-auto ${palette.gridBg}`}>
          {projectData.length > 0 &&
            projectData.map((project) => (
              <button
                key={project?.id}
                className={`relative ${palette.card} rounded-xl w-56 h-56 transition-all duration-300`}
                onClick={() => onProjectSetupComplete(project.id)}
                style={{
                  overflow: "hidden",
                }}
              >
                <img
                  src={project?.image_url || projectImage}
                  alt="project"
                  className="w-56 h-60 rounded-t-xl"
                  onError={(e) => {
                    e.target.src = projectImage;
                  }}
                  style={{
                    opacity: "0.85",
                    borderTopLeftRadius: "12px",
                    borderTopRightRadius: "12px",
                  }}
                />
                <div
                  className={`rounded-b-xl p-3 font-semibold ${palette.nameBg}`}
                  style={{
                    textTransform: "capitalize",
                    borderBottomLeftRadius: "12px",
                    borderBottomRightRadius: "12px",
                    fontSize: "1rem",
                  }}
                >
                  {project?.project_name || `Project ${project.id}`}
                </div>
              </button>
            ))}
          {/* Add Project Card */}
          <div className={`flex items-center justify-center ${palette.card} w-56 h-60 rounded-xl transition-all duration-300`}>
            <button
              className={`text-xl font-bold flex flex-col items-center gap-2 ${palette.btnText}`}
              onClick={() => setIsModalOpen(true)}
            >
              <span className={`flex justify-center items-center w-10 h-10 border border-dashed ${palette.plusBorder} rounded-full text-2xl`}>
                +
              </span>
              Add Project
            </button>
          </div>
        </div>
        {isModalOpen && (
          <AddProjectModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={addProject}
          />
        )}
      </div>
    </div>
  );
}

export default Projects;
