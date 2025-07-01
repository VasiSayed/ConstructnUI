import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import projectImage from "../Images/Project.png";
import { getProjectUserDetails } from "../api";
import toast from "react-hot-toast";
import SiteBarHome from "./SiteBarHome";
const Configuration = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const userDataString = localStorage.getItem("USER_DATA");
  const userData = JSON.parse(userDataString);
  const userId = userData.id;
  console.log(userId);
  // const projects = [
  //   { name: "Prime Core", image: projectImage, id: 1 },
  //   { name: "Vision Venture", image: projectImage, id: 2 },
  //   { name: "Civil Connect", image: projectImage, id: 3 },
  //   { name: "Unity Hub", image: projectImage, id: 4 },
  //   { name: "Social Circle", image: projectImage, id: 5 },
  // ];

  const handleImageClick = (project) => {
    console.log(project);
    navigate(`/project/${project.project_id}`, { state: { project } });
  };
  const handleBack = () => {
    navigate(-1); // Navigate to the previous page
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

  useEffect(() => {
    const getAllProject = async () => {
      const response = await getProjectUserDetails(userId);
      console.log(response.data.projectData);
      if (response.status === 200) {
        setAllProject(response.data.projectData);
      } else {
        toast.error(response.data.message);
      }
    };
    getAllProject();
  }, [userId]);
  return (
    <div className="flex">
      <SiteBarHome />
      <div className="my-5 w-[85%] mt-5 ml-[16%] mr-[1%]">
        <div className="max-w-7xl mx-auto pt-3 px-5 pb-8 bg-white rounded shadow-lg">
          {/* <div className="flex flex-row">
            <button
              className="px-4 py-2 mb-4 bg-gray-100 text-gray-800 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
              onClick={handleBack}
            >
              &larr; Back
            </button>
          </div> */}

          <h2 className="text-3xl font-bold mb-6 text-purple-800 text-center">
            Projects
          </h2>
          <div className="grid grid-cols-5 gap-5">
            {allProject.map((project) => (
              <div
                key={project.id}
                className="relative bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer w-56"
                onClick={() => handleImageClick(project)}
              >
                <img
                  src={project?.image_url || projectImage}
                  alt={`${project.project_name} Background`}
                  className="w-56 h-56"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gray-800 bg-opacity-50 text-white text-lg font-semibold p-2">
                  {project.project_name}
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
