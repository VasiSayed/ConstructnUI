import React, { useEffect, useState } from "react";
import projectImage from "../../Images/Project.png";
import AddProjectModal from "./AddProjectModal";
import { NavLink } from "react-router-dom";
import { getProjectDetailsById } from "../../api";
import { useDispatch, useSelector } from "react-redux";
import { setProjects, setSelectedProject } from "../../store/userSlice";

function Projects({ onProjectSetupComplete }) {
  const dispatch = useDispatch();

  const companyId = useSelector((state) => state.user.company.id);
  // const projectsList = useSelector((state) =>
  //   state.user.projects.length > 0 ? state.user.projects : []
  // );

  const [projectData, setProjectData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const projectDetails = async () => {
    try {
      if (companyId) {
        console.log("Project Data:");
        const response = await getProjectDetailsById(companyId);
        console.log("Project Data:", response.data.data.projects);
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

  // const getProjectDataById = async (id) => {
  //   const response = projectData.find((project) => project.id === id);
  //   return response;
  // };

  const addProject = async (id) => {
    await projectDetails();
    // const project = await getProjectDataById(id);
    onProjectSetupComplete(id);
    // console.log(project, "ADD");
  };

  useEffect(() => {
    if (companyId) {
      console.log(companyId, "companyId");
      projectDetails();
      dispatch(setSelectedProject(null));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full h-dvh rounded-md bg-white gap-4 flex items-start justify-between my-1">
      {/* <div className="w-60 border-r p-4">
        <div className="max-h-[450px] overflow-y-auto">
          <NavLink
            to="/setup"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg ${
                isActive ? "bg-gray-200 text-blue-500" : "text-gray-700"
              }`
            }
          >
            Setup
          </NavLink>
          <NavLink
            to="/casetup"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg ${
                isActive ? "bg-gray-500 text-blue-500" : "text-gray-700"
              }`
            }
          >
            CA Setup
          </NavLink>
        </div>
      </div> */}
      <div className="w-full p-5 rounded flex flex-col h-full">
        <div className="grid project-grid w-full h-full overflow-y-auto">
          {/* <pre>{JSON.stringify(projectData, null, 2)}</pre> */}
          {projectData.length > 0 &&
            projectData.map((project) => (
              <button
                key={project?.id}
                className="relative bg-white shadow-lg rounded-xl w-56 h-56"
                onClick={() => onProjectSetupComplete(project.id)}
              >
                <img
                  src={project?.image_url || projectImage}
                  alt="project"
                  className="w-56 h-60 rounded-t-xl"
                  onError={(e) => {
                    e.target.src = projectImage;
                  }}
                  style={{
                    opacity: "0.8",
                    borderTopLeftRadius: "12px",
                    borderTopRightRadius: "12px",
                  }}
                />
                <div
                  className="rounded-b-xl bg-gray-800 bg-opacity-50 w-56 text-white text-md font-semibold p-3"
                  style={{
                    textTransform: "capitalize",
                    borderBottomLeftRadius: "12px",
                    borderBottomRightRadius: "12px",
                  }}
                >
                  {project?.project_name || `Project ${project.id}`}
                </div>
              </button>
            ))}
          <div className="flex items-center justify-center border w-56 h-60 rounded-md">
            <button
              className="text-xl font-bold text-green-700 flex flex-col items-center gap-2"
              onClick={() => setIsModalOpen(true)}
            >
              <span className="flex justify-center items-center w-10 h-10 border border-dashed border-red-500 rounded-full text-2xl">
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
