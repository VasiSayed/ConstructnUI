import React, { useEffect, useRef, useState } from "react";

import { FaEdit, FaEnvelope, FaPlus } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
import { MdOutlineCancel } from "react-icons/md";
import Select from "react-select";
import profile from "../../../src/Images/profile.jpg";
import { useSelector } from "react-redux";
import {
  createUserDetails,
  getUsersByOrganizationId,
  updateUserDetails,
} from "../../api";
import { toast } from "react-hot-toast";
import SideBarSetup from "../../components/SideBarSetup";

function User() {
  const dropdownRef = useRef(null);

  const projectId = useSelector((state) => state.user.selectedProject.id);
  const projectsData = useSelector((state) => state.user.projects);
  const organizationId = useSelector((state) => state.user.organization.id);
  const stages = useSelector((state) => state.user.stages);

  const [isAdd, setAdd] = useState(false);
  const [userData, setUserData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    mobile: "",
    password: "",
    profile: "",
  });

  // const [isOpen, setIsOpen] = useState(false);
  const [expandedProject, setExpandedProject] = useState();
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [isProject, setIsProject] = useState(false);
  const [mappedStages, setMappedStages] = useState({});
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const projectOptionsData = projectsData.map((project) => ({
    value: project.id,
    label: project.project_name,
  }));

  const handleAdd = () => {
    setAdd(true);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleChange = (selectedOptions) => {
    setSelectedProjects(selectedOptions);
  };

  const getUserDetails = async () => {
    const response = await getUsersByOrganizationId(organizationId);
    console.log(response, "response");
    if (response.status === 200 || response.data.success) {
      setUsers(response.data.users);
      setSelectedUser(response.data.users[0]);
    }
  };

  useEffect(() => {
    if (organizationId) {
      getUserDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  const handleStageChange = (projectId, stageId, e) => {
    setMappedStages((prev) => ({
      ...prev,
      [projectId]: {
        ...prev[projectId],
        [stageId]: e,
      },
    }));
  };

  const ProfileOptions = [
    { value: "Inspector", label: "Inspector" },
    { value: "Repairer", label: "Repairer" },
    { value: "Reviewer", label: "Reviewer" },
  ];

  const handleCreate = async (e) => {
    e.preventDefault();
    const userApiData = {
      first_name: userData.first_name,
      last_name: userData.last_name,
      email: userData.email,
      mobile: userData.mobile,
      password: userData.password,
      organization: [organizationId],
      profile: userData.profile,
    };

    const projectData = [];
    selectedProjects.forEach((project) => {
      projectData.push({
        id: project.value,
        mappedStages: Object.keys(mappedStages?.[project.value] || {})?.map(
          (stage) => {
            return {
              stageId: stage,
              profile: mappedStages[project.value][stage].map(
                (profile) => profile.value
              ),
            };
          }
        ),
      });
    });

    userApiData.projects = projectData;

    const response = await createUserDetails(userApiData);

    console.log(response, "response");

    if (response.status === 201) {
      toast.success(response.data.message);
      setUserData({
        first_name: "",
        last_name: "",
        email: "",
        mobile: "",
        password: "",
        projects: [],
        profile: "",
      });
      setSelectedProjects([]);
      setMappedStages({});
      setIsProject(false);
      setAdd(false);
      await getUserDetails();
    } else {
      toast.error(response.data.message || "Something went wrong");
    }
  };

  const getProjectDetailsById = (projectId) => {
    return projectsData.find((project) => project.id === projectId);
  };

  const getStageDetailsById = (stageId) => {
    console.log(stages, selectedUser, stages[projectId], "stages");
    return stages[projectId].find((stage) => stage.id === stageId);
  };

  const handleEdit = () => {
    setEditMode(true);
    setAdd(true);
    setUserData({
      first_name: selectedUser?.first_name,
      last_name: selectedUser?.last_name,
      email: selectedUser?.email,
      mobile: selectedUser?.mobile,
      password: selectedUser?.password,
      profile: selectedUser?.profile || userData?.profile,
    });

    // Set selected projects
    const projectSelections = selectedUser?.projects?.map((project) => ({
      value: project.id,
      label: getProjectDetailsById(project.id)?.project_name,
    }));
    setSelectedProjects(projectSelections);

    // Format mapped stages to match the structure needed
    const formattedMappedStages = selectedUser?.projects?.reduce(
      (acc, project) => {
        acc[project.id] = project.mappedStages.reduce((stageAcc, stage) => {
          // Convert profile array to array of objects with value and label
          stageAcc[stage.stageId] = stage.profile.map((profileValue) => ({
            value: profileValue,
            label: profileValue, // You might want to map this to a proper label if needed
          }));
          return stageAcc;
        }, {});
        return acc;
      },
      {}
    );

    console.log(formattedMappedStages, "formattedMappedStages");
    setMappedStages(formattedMappedStages);
    setIsProject(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    console.log(selectedUser, "selectedUser");
    const userApiData = {
      first_name: userData.first_name,
      last_name: userData.last_name,
      email: userData.email,
      mobile: userData.mobile,
      password: userData.password,
      user_id: selectedUser.user_id,
      projects: selectedUser.projects,
      profile: userData.profile,
      organization: [organizationId],
    };
    const projectData = [];
    selectedProjects.forEach((project) => {
      projectData.push({
        id: project.value,
        mappedStages: Object.keys(mappedStages?.[project.value] || {})?.map(
          (stage) => {
            return {
              stageId: Number(stage),
              profile: mappedStages[project.value][stage].map(
                (profile) => profile.value
              ),
            };
          }
        ),
      });
    });

    userApiData.projects = projectData;
    console.log(userApiData, "userApiData");
    const response = await updateUserDetails(userApiData);
    console.log(response, "response");
    if (response.status === 200) {
      toast.success(response.data.message);
      await getUserDetails();
      setEditMode(false);
      setAdd(false);
      setUserData({
        first_name: "",
        last_name: "",
        email: "",
        mobile: "",
        password: "",
        profile: "",
      });
      setSelectedProjects([]);
      setMappedStages({});
      setIsProject(false);
    } else {
      toast.error(response.data.message || "Something went wrong");
    }
  };

  return (
    <div className="flex">
      <SideBarSetup />
      <div className="my-5 w-[85%] mt-5 ml-[16%] mr-[1%]">
        <div className="px-6 py-5 max-w-7xl mx-auto bg-white rounded shadow-lg">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">USERS</h1>
          </div>
          <div className="flex h-full border shadow-md">
            <div className="w-1/3 border-r p-4 bg-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-full bg-purple-600 text-white py-2 mb-4 flex items-center justify-center gap-2 rounded">
                  <button
                    onClick={handleAdd}
                    className="flex gap-2 items-center"
                  >
                    <FaPlus />
                    New User
                  </button>
                </div>
              </div>
              <div className="max-h-[450px] overflow-y-auto flex flex-col gap-2">
                {users?.length > 0 &&
                  users?.map((user, index) => (
                    <div
                      key={index}
                      className={`p-4 flex items-center gap-3 cursor-pointer rounded ${
                        selectedUser?.user_id === user?.user_id
                          ? "bg-gradient-to-r from-purple-500 to=pink-500 text-white"
                          : "bg-white"
                      }`}
                      onClick={() => setSelectedUser(user)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="border w-16 h-16">
                          <img
                            src={profile}
                            className="rounded-md"
                            alt="profile"
                          />
                        </div>
                        <div>
                          <h3 className="font-bold">
                            {user?.first_name} {user?.last_name}
                          </h3>
                          {/* <p className="text-sm">{user.role}</p> */}
                          <p className="text-xs">{user?.email}</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            <div className="w-2/3 p-6">
              {selectedUser ? (
                <>
                  <div className="flex">
                    <div className="flex items-center gap-4">
                      <div className="border w-20 h-20">
                        <img
                          src={profile}
                          className="rounded-md"
                          alt="profile"
                        />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">
                          {selectedUser?.first_name} {selectedUser?.last_name}
                        </h2>
                        {/* <p className="text-gray-600">{selectedUser.role}</p> */}
                        <p className="flex items-center gap-2 text-gray-600">
                          <FaEnvelope /> {selectedUser?.email}
                        </p>
                      </div>
                    </div>
                    <FaEdit
                      className="text-gray-500 cursor-pointer"
                      onClick={() => handleEdit()}
                    />
                  </div>
                  <h3 className="mt-6 text-xl font-bold">User Information</h3>
                  <div className="mt-4">
                    <div className="border rounded p-3 mt-2">
                      <div className="flex flex-col space-y-5">
                        {selectedUser?.projects?.map((project, index) => (
                          <div key={index}>
                            <div className="flex gap-2 items-center">
                              <h2 className="font-semibold">
                                {
                                  getProjectDetailsById(project.id)
                                    ?.project_name
                                }
                              </h2>
                              <button
                                onClick={() =>
                                  setExpandedProject(
                                    expandedProject === index ? null : index
                                  )
                                }
                              >
                                <IoIosArrowDown
                                  size={20}
                                  className={
                                    expandedProject === index
                                      ? "rotate-180"
                                      : ""
                                  }
                                />
                              </button>
                            </div>
                            {expandedProject === index && (
                              <div className="ml-4 border-l pl-4 my-3 space-y-3">
                                {selectedUser?.projects?.map((stage, idx) =>
                                  stage.mappedStages.map((mapStage, idx) => (
                                    <div key={idx}>
                                      <p className="font-medium">
                                        {
                                          getStageDetailsById(mapStage.stageId)
                                            ?.stage
                                        }
                                      </p>
                                      <ul className="ml-8 list-disc space-y-2 my-2">
                                        {mapStage.profile.map((role, i) => (
                                          <li key={i}>{role}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-gray-500">No user selected</p>
              )}
            </div>
          </div>
          {isAdd && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
              <div className="bg-white max-h-[90vh] w-1/3 rounded-lg shadow-lg p-6 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-xl font-semibold text-start">
                    {editMode ? "Update User" : "Add New User"}
                  </h1>
                  <button
                    className="text-gray-600 hover:text-gray-800"
                    onClick={() => setAdd(false)}
                  >
                    <MdOutlineCancel size={24} />
                  </button>
                </div>
                <div className="overflow-y-auto max-h-[90vh]">
                  <form className="space-y-3 px-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="grid grid-cols-5 gap-5 items-center mt-3">
                        <label className="text-sm font-medium whitespace-nowrap text-end">
                          First Name<span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          className="col-span-4 w-full p-1 border rounded focus:outline-none focus:ring-1 focus:ring-purple-700"
                          value={userData.first_name}
                          placeholder="Enter First Name"
                          name="first_name"
                          onChange={(e) =>
                            setUserData({
                              ...userData,
                              first_name: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-5 gap-5 items-center">
                        <label className="text-sm font-medium whitespace-nowrap text-end">
                          Last Name<span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          className="col-span-4 w-full p-1 border rounded focus:outline-none focus:ring-1 focus:ring-purple-700"
                          value={userData.last_name}
                          placeholder="Enter Last Name"
                          name="last_name"
                          onChange={(e) =>
                            setUserData({
                              ...userData,
                              last_name: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-5 gap-5 items-center">
                        <label className="text-sm font-medium whitespace-nowrap text-end">
                          Mobile<span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          className="col-span-4 w-full p-1 border rounded focus:outline-none focus:ring-1 focus:ring-purple-700"
                          value={userData.mobile}
                          placeholder="Enter Mobile Number"
                          name="mobile"
                          onChange={(e) =>
                            setUserData({ ...userData, mobile: e.target.value })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-5 gap-5 items-center">
                        <label className="text-sm font-medium whitespace-nowrap text-end">
                          Email ID<span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          className="col-span-4 w-full p-1 border rounded focus:outline-none focus:ring-1 focus:ring-purple-700"
                          value={userData.email}
                          placeholder="Enter Email ID"
                          name="email"
                          onChange={(e) =>
                            setUserData({ ...userData, email: e.target.value })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-5 gap-5 items-center">
                        <label className="text-sm font-medium whitespace-nowrap text-end">
                          Password<span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          className="col-span-4 w-full p-1 border rounded focus:outline-none focus:ring-1 focus:ring-purple-700"
                          value={userData.password}
                          placeholder="Enter Password"
                          name="password"
                          onChange={(e) =>
                            setUserData({
                              ...userData,
                              password: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-5 gap-5 items-center">
                      <label className="text-sm font-medium whitespace-nowrap text-end">
                        Profile<span className="text-red-500">*</span>
                      </label>
                      <select
                        className="col-span-4 w-full p-1 border rounded focus:outline-none focus:ring-1 focus:ring-purple-700 h-[38px]"
                        value={userData.profile}
                        onChange={(e) =>
                          setUserData({ ...userData, profile: e.target.value })
                        }
                        name="profile"
                      >
                        <option value="">Select Profile</option>
                        <option value="Inspector">Inspector</option>
                        <option value="Repairer">Repairer</option>
                        <option value="Reviewer">Reviewer</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-5 gap-5 items-center">
                      <label className="text-sm font-medium whitespace-nowrap text-end">
                        Project
                      </label>
                      <div className="col-span-4">
                        <Select
                          isMulti
                          options={projectOptionsData}
                          value={selectedProjects}
                          onChange={handleChange}
                          className="w-full"
                          classNamePrefix="select"
                          styles={{
                            control: (provided, state) => ({
                              ...provided,
                              minHeight: "4px",
                              borderRadius: "0.375rem", // Rounded border like select
                              borderColor: state.isFocused
                                ? "#6B46C1"
                                : "#D1D5DB", // Purple focus, gray default
                              boxShadow: state.isFocused
                                ? "0 0 0 1px #6B46C1"
                                : "none",
                              "&:hover": { borderColor: "#6B46C1" },
                            }),
                          }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-5">
                      <div></div>
                      <div className="col-span-4">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-violet-500 border-gray-300 rounded focus:ring-violet-500"
                            checked={isProject}
                            onChange={() => setIsProject(!isProject)}
                          />
                          <span className="text-sm font-medium text-gray-700">
                            Map at the stage
                          </span>
                        </label>
                      </div>
                    </div>
                    {isProject && (
                      <div className="border-t-2 py-5 flex flex-col gap-4">
                        {selectedProjects.map((project) => (
                          <div key={project.value}>
                            <div className="flex gap-3 items-center mb-2">
                              <h2 className="font-medium">{project.label}</h2>
                              <button>
                                <IoIosArrowDown />
                              </button>
                            </div>
                            {stages[project.value].length > 0 ? (
                              <div className="flex flex-col gap-2">
                                {stages[project.value].map((stage) => (
                                  <div className="flex items-center gap-2 mx-3">
                                    <div className="border rounded-md px-5 py-1 whitespace-nowrap">
                                      <h2>{stage.stage}</h2>
                                    </div>
                                    <Select
                                      isMulti
                                      options={ProfileOptions}
                                      value={
                                        mappedStages?.[project.value]?.[
                                          stage.id
                                        ]
                                      }
                                      onChange={(e) =>
                                        handleStageChange(
                                          project.value,
                                          stage.id,
                                          e
                                        )
                                      }
                                      className="w-full"
                                      classNamePrefix="select"
                                    />
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500">No stages found</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {!editMode && (
                      <button
                        type="submit"
                        className="w-full bg-purple-700 text-white py-2 px-4 rounded hover:bg-purple-800 transition duration-200 my-3"
                        onClick={handleCreate}
                      >
                        Create
                      </button>
                    )}
                    {editMode && (
                      <button
                        type="submit"
                        className="w-full bg-purple-700 text-white py-2 px-4 rounded hover:bg-purple-800 transition duration-200 my-3"
                        onClick={handleUpdate}
                      >
                        Update
                      </button>
                    )}
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default User;
