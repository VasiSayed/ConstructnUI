import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import projectImage from "../Images/Project.png"; // Use your existing project images here
import { getProjectLevelDetails } from "../api";
import toast from "react-hot-toast";
import SiteBarHome from "./SiteBarHome";
const ProjectDetailsPage = () => {
  const { state } = useLocation();
  console.log(state);
  const projectId = state.project.project_id;
  const projectImg = state?.project?.image_url || projectImage;
  console.log("line 11", projectImg);
  const navigate = useNavigate();
  const [projectLevelData, setProjectLevelData] = useState([]);

  useEffect(() => {
    const fetchProjectTower = async () => {
      const response = await getProjectLevelDetails(projectId);
      console.log("line 16", response.data.data.tower);
      if (response.status === 200) {
        setProjectLevelData(response.data.data.tower);
      } else {
        toast.error(response.data.message);
      }
    };

    fetchProjectTower();
  }, [projectId]);

  const handleImageClick = (proj) => {
    console.log("line 30", proj);
    navigate(`/snagging/${proj}`, {
      state: { projectLevelData },
    });
  };
  const handleBack = () => {
    navigate(-1); // Navigate to the previous page
  };
  // Example of all projects (same as used on the first page)
  const projects = [
    { name: "Tower 1", image: projectImage, id: 1 },
    { name: "Tower 2", image: projectImage, id: 2 },
    { name: "Tower 3", image: projectImage, id: 3 },
    { name: "Tower 4", image: projectImage, id: 4 },
    { name: "Tower 5", image: projectImage, id: 5 },
  ];

  if (!state || !state.project) {
    // Redirect back to the main page if accessed directly
    navigate("/");
    return null;
  }

  const { project } = state;
  return (
    <div className="flex">
      <SiteBarHome />
      <div className="my-5 w-[85%] mt-5 ml-[16%] mr-[1%]">
        <div className="max-w-7xl mx-auto pt-3 px-5 pb-8 bg-white rounded shadow-lg">
          {/* Back Button */}
          {/* <button
            className="px-4 py-2 mb-4 bg-gray-100 text-gray-800 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
            onClick={handleBack}
          >
            &larr; Back
          </button> */}

          {/* Selected Project Name */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-center text-purple-800 mb-4 ">
              {state.project.project_name}
            </h2>
          </div>

          {/* All Projects */}
          <div>
            <h2 className="text-3xl font-bold text-green-800 mb-6"></h2>
            <div>
              {projectLevelData && projectLevelData.length > 0 ? (
                <div className="grid grid-cols-5 gap-6">
                  {projectLevelData.map((proj) => (
                    <div
                      key={proj.id}
                      className={`relative bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer ${
                        proj.id === project.id ? "ring-4 ring-purple-50" : ""
                      }`}
                      onClick={() => handleImageClick(proj.id)}
                    >
                      <img
                        src={projectImg}
                        // src={proj.image}
                        alt={`${proj.name} Background`}
                        className="w-full h-80"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gray-800 bg-opacity-50 text-white text-sm font-semibold p-2">
                        {proj.naming_convention}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 text-lg font-semibold mt-10">
                  No projects available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsPage;
