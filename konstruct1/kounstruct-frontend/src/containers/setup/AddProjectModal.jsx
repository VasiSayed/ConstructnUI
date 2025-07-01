import React, { useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { createProject } from "../../api";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";

function AddProjectModal({ onClose, onSave }) {
  const userId = useSelector((state) => state.user.user.id);
  console.log('userId',userId)
  // const companyId = useSelector((state) => state.user.company.id);
  // const organizationId = useSelector((state) => state.user.organization.id);

  const [projectName, setProjectName] = useState("");
  const [useDefaultImage, setUseDefaultImage] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [image, setImage] = useState("");

  const handleChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      console.log(" file", file);
      setIsSaved(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!projectName) {
      toast.error("Project name is required");
      return;
    }

    const formData = new FormData();
    formData.append("name", projectName);
    formData.append("created_by", userId);

    if (!useDefaultImage && image) {
      formData.append("image", image);
    }

    try {
      const res = await createProject(formData);
      toast.success("Project created!");
      onSave(res.data.id || res.data.data?.id);
    } catch (error) {
      console.error("Full error:", error);
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.detail ||
          JSON.stringify(error.response?.data) ||
          error.message ||
          "Error creating not"
      );
    }
  }
  
  

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative">
        <button onClick={onClose} className="absolute top-2 right-2">
          <AiOutlineClose className="text-xl text-gray-600 hover:text-gray-900" />
        </button>

        <h2 className="text-2xl font-bold mb-4">Add New Project</h2>
        <label className="block text-sm font-medium text-gray-700">
          Project Name
        </label>
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="mt-1 p-2 border border-gray-300 rounded-md w-full"
          placeholder="Enter project name"
        />

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            Project Image
          </label>
          <div className="flex items-center mt-2">
            <input
              type="radio"
              checked={useDefaultImage}
              onChange={() => setUseDefaultImage(true)}
            />
            <span className="ml-2">Use Default Image</span>
          </div>

          <div className="flex items-center mt-2">
            <input
              type="radio"
              checked={!useDefaultImage}
              onChange={() => setUseDefaultImage(false)}
            />
            <span className="ml-2">Upload Custom Image</span>
          </div>

          {!useDefaultImage && (
            <input
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="mt-2"
            />
          )}
          {image && !useDefaultImage && (
            <img
              src={URL.createObjectURL(image)}
              alt="Custom Project"
              className="mt-4 w-full h-32 object-cover rounded-md"
            />
          )}
          {/* {image && !useDefaultImage && (
            <img
              src={image}
              alt="Custom Project"
              className="mt-4 w-full h-32 object-cover rounded-md"
            />
          )} */}
        </div>

        <div className="mt-6 flex justify-between">
          <button
            onClick={handleSubmit}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 btn"
            disabled={!projectName}
          >
            Save Project
          </button>
          {isSaved && (
            <button
              onClick={onClose}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddProjectModal;
