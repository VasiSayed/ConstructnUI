// import React, { useEffect, useState } from "react";
// import SiteBarHome from "./SiteBarHome";
// import { projectInstance, NEWchecklistInstance } from "../api/axiosInstance";

// function InitializeChecklist() {
//   const [projects, setProjects] = useState([]);
//   const [selectedProjectId, setSelectedProjectId] = useState("");
//   const [loadingProjects, setLoadingProjects] = useState(true);
//   const [error, setError] = useState(null);

//   // Checklists state
//   const [checklists, setChecklists] = useState([]);
//   const [loadingChecklists, setLoadingChecklists] = useState(false);
//   const [checklistError, setChecklistError] = useState(null);

//   // Get user/checker accesses from localStorage
//   const userStr = localStorage.getItem("user");

//   const accessesStr = localStorage.getItem("ACCESSES");
//   const accesses = accessesStr ? JSON.parse(accessesStr) : [];
//   console.log("Current accesses:", accesses);

//   // Function to refresh checklists
//   const refreshChecklists = async () => {
//     if (!selectedProjectId) {
//       setChecklists([]);
//       return;
//     }

//     console.log("Fetching checklists for project:", selectedProjectId);
//     setLoadingChecklists(true);
//     setChecklistError(null);
//     try {
//       const res = await NEWchecklistInstance.get(
//         `/initializer-accessible-checklists/`,
//         {
//           params: { project_id: selectedProjectId },
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("access")}`,
//           },
//         }
//       );

//       console.log("Checklists response:", res.data);
//       console.log("Is array?", Array.isArray(res.data));
//       console.log("Data length:", res.data?.length);

//       const checklistData = Array.isArray(res.data) ? res.data : [];
//       console.log("Setting checklists:", checklistData);
//       setChecklists(checklistData);
//     } catch (err) {
//       console.error("Checklist fetch error:", err);
//       setChecklistError("Failed to load checklists");
//       setChecklists([]);
//     } finally {
//       setLoadingChecklists(false);
//     }
//   };

//   // Initialize checklist function
//   const handleInitializeChecklist = async (checklistId) => {
//     try {
//       console.log("Initializing checklist:", checklistId);

//       // Hit the start-checklist API
//       await NEWchecklistInstance.post(
//         `/start-checklist/${checklistId}/`,
//         {},
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("access")}`,
//           },
//         }
//       );

//       console.log("Checklist initialized successfully:", checklistId);
//       alert("Checklist initialized successfully!");

//       // Refresh the checklist list to remove the initialized checklist
//       await refreshChecklists();
//     } catch (err) {
//       console.error("Initialize checklist error:", err);
//       alert("Failed to initialize checklist. Please try again.");
//     }
//   };

//   // Fetch projects
//   useEffect(() => {
//     async function fetchProjects() {
//       setLoadingProjects(true);
//       setError(null);
//       try {
//         // Filter projects where user has access (you can modify the role filter as needed)
//         const userProjects = accesses
//           .filter((a) => a.active) // Add specific role filter here if needed
//           .map((a) => Number(a.project_id));

//         const res = await projectInstance.get("/projects/", {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("access")}`,
//           },
//         });

//         const allProjects = Array.isArray(res.data)
//           ? res.data
//           : res.data.results;
//         console.log("all projects:", allProjects);

//         const filtered = allProjects.filter((p) => userProjects.includes(p.id));

//         setProjects(filtered);
//         if (filtered.length > 0 && !selectedProjectId) {
//           setSelectedProjectId(filtered[0].id);
//         }
//       } catch (err) {
//         setError("Failed to load projects");
//         setProjects([]);
//       } finally {
//         setLoadingProjects(false);
//       }
//     }

//     if (accesses.length > 0) {
//       fetchProjects();
//     }
//   }, []); // Remove userStr dependency to prevent re-renders

//   // Fetch checklists when project is selected
//   useEffect(() => {
//     refreshChecklists();
//   }, [selectedProjectId]);

//   return (
//     <div className="flex min-h-screen bg-gray-50">
//       <SiteBarHome />
//       <main className="ml-[15%] w-full p-6">
//         <h2 className="text-2xl font-bold mb-4">Initialize Checklist</h2>

//         {/* Project Dropdown */}
//         <div className="mb-6">
//           <label className="block mb-2 font-semibold">Select Project:</label>
//           {loadingProjects ? (
//             <p>Loading projects...</p>
//           ) : error ? (
//             <p className="text-red-500">{error}</p>
//           ) : (
//             <select
//               className="p-2 border rounded"
//               value={selectedProjectId}
//               onChange={(e) => setSelectedProjectId(Number(e.target.value))}
//               disabled={projects.length === 0}
//             >
//               {projects.length === 0 && <option>No projects</option>}
//               {projects.map((p) => (
//                 <option key={p.id} value={p.id}>
//                   {p.name || `Project #${p.id}`}
//                 </option>
//               ))}
//             </select>
//           )}
//         </div>

//         {/* Selected Project Info */}
//         {selectedProjectId && (
//           <div className="bg-white rounded-lg shadow p-4 mb-6">
//             <h3 className="font-semibold mb-2">Selected Project:</h3>
//             <p>Project ID: {selectedProjectId}</p>
//             <p>
//               Project Name:{" "}
//               {projects.find((p) => p.id === selectedProjectId)?.name || "N/A"}
//             </p>
//           </div>
//         )}

//         {/* Checklists Section */}
//         <div className="bg-white rounded-lg shadow p-6">
//           <h3 className="text-xl font-semibold mb-4">
//             Available Checklists to Initialize
//           </h3>

//           {/* Debug info */}
//           <div className="mb-4 p-2 bg-gray-100 rounded text-sm">
//             <p>Loading: {loadingChecklists.toString()}</p>
//             <p>Error: {checklistError || "None"}</p>
//             <p>Checklists count: {checklists.length}</p>
//           </div>

//           {loadingChecklists ? (
//             <p>Loading checklists...</p>
//           ) : checklistError ? (
//             <p className="text-red-500">{checklistError}</p>
//           ) : !checklists.length ? (
//             <p className="text-gray-600">
//               No checklists available to initialize for this project.
//             </p>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//               {checklists.map((checklist) => (
//                 <div
//                   key={checklist.id}
//                   className="border rounded-lg p-4 hover:shadow-md transition-shadow"
//                 >
//                   <div className="flex justify-between items-start mb-2">
//                     <h4 className="font-semibold text-lg">{checklist.name}</h4>
//                     <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
//                       ID: {checklist.id}
//                     </span>
//                   </div>

//                   <div className="text-sm text-gray-600 mb-3">
//                     <p>Category: {checklist.category || "--"}</p>
//                     <p>Building: {checklist.building_id || "--"}</p>
//                     <p>Zone: {checklist.zone_id || "--"}</p>
//                     <p>Flat: {checklist.flat_id || "--"}</p>
//                     <p>Items: {checklist.items?.length || 0}</p>
//                     <p>
//                       Status:{" "}
//                       <span className="font-medium text-orange-600">
//                         {checklist.status}
//                       </span>
//                     </p>
//                   </div>

//                   <button
//                     className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition-colors"
//                     onClick={() => handleInitializeChecklist(checklist.id)}
//                   >
//                     Initialize Checklist
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// }

// export default InitializeChecklist;

import React, { useEffect, useState } from "react";
import SiteBarHome from "./SiteBarHome";
import { projectInstance, NEWchecklistInstance } from "../api/axiosInstance";

function InitializeChecklist() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [error, setError] = useState(null);

  // Checklists state
  const [checklists, setChecklists] = useState([]);
  const [loadingChecklists, setLoadingChecklists] = useState(false);
  const [checklistError, setChecklistError] = useState(null);

  // Checklist items state
  const [checklistItems, setChecklistItems] = useState([]);
  const [loadingChecklistItems, setLoadingChecklistItems] = useState(false);
  const [viewedChecklistName, setViewedChecklistName] = useState("");

  // Status filter state
  const [statusFilter, setStatusFilter] = useState("all");

  // View state for single page navigation
  const [isViewingItems, setIsViewingItems] = useState(false);

  // Get user/checker accesses from localStorage
  const userStr = localStorage.getItem("user");

  const accessesStr = localStorage.getItem("ACCESSES");
  const accesses = accessesStr ? JSON.parse(accessesStr) : [];
  console.log("Current accesses:", accesses);

  // Function to refresh checklists
  const refreshChecklists = async () => {
    if (!selectedProjectId) {
      setChecklists([]);
      return;
    }

    console.log("Fetching checklists for project:", selectedProjectId);
    setLoadingChecklists(true);
    setChecklistError(null);
    try {
      const res = await NEWchecklistInstance.get(
        `/initializer-accessible-checklists/`,
        {
          params: { project_id: selectedProjectId },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );

      console.log("Checklists response:", res.data);
      console.log("Is array?", Array.isArray(res.data));
      console.log("Data length:", res.data?.length);

      const checklistData = Array.isArray(res.data) ? res.data : [];
      console.log("Setting checklists:", checklistData);
      setChecklists(checklistData);
    } catch (err) {
      console.error("Checklist fetch error:", err);
      setChecklistError("Failed to load checklists");
      setChecklists([]);
    } finally {
      setLoadingChecklists(false);
    }
  };

  // Initialize checklist function
  const handleInitializeChecklist = async (checklistId) => {
    try {
      console.log("Initializing checklist:", checklistId);

      // Hit the start-checklist API
      await NEWchecklistInstance.post(
        `/start-checklist/${checklistId}/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );

      console.log("Checklist initialized successfully:", checklistId);
      alert("Checklist initialized successfully!");

      // Refresh the checklist list to remove the initialized checklist
      await refreshChecklists();
    } catch (err) {
      console.error("Initialize checklist error:", err);
      alert("Failed to initialize checklist. Please try again.");
    }
  };

  // View checklist function
  const handleViewChecklist = async (checklistId) => {
    try {
      console.log("Viewing checklist:", checklistId);
      setLoadingChecklistItems(true);
      setIsViewingItems(true); // Switch to items view

      // Hit the checklist-items API to fetch data
      const response = await NEWchecklistInstance.get(
        `/checklist-items/${checklistId}/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );

      console.log("Checklist data fetched successfully:", response.data);

      // Find checklist name for display
      const checklist = checklists.find((c) => c.id === checklistId);
      setViewedChecklistName(checklist?.name || `Checklist #${checklistId}`);

      // Set checklist items data
      setChecklistItems(response.data);
    } catch (err) {
      console.error("View checklist error:", err);
      alert("Failed to load checklist. Please try again.");
      setChecklistItems([]);
      setIsViewingItems(false); // Return to main view on error
    } finally {
      setLoadingChecklistItems(false);
    }
  };

  // Go back to main view
  const handleGoBack = () => {
    setIsViewingItems(false);
    setChecklistItems([]);
    setViewedChecklistName("");
  };

  // Filter checklists by status
  const filteredChecklists =
    statusFilter === "all"
      ? checklists
      : checklists.filter((checklist) => checklist.status === statusFilter);

  // Status options for filter
  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "not_started", label: "Not Started" },
    { value: "in_progress", label: "In Progress" },
    { value: "work_in_progress", label: "Work in Progress" },
    { value: "completed", label: "Completed" },
  ];

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "not_started":
        return "bg-gray-100 text-gray-700";
      case "in_progress":
        return "bg-blue-100 text-blue-700";
      case "work_in_progress":
        return "bg-yellow-100 text-yellow-700";
      case "completed":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Reset items when filter changes
  useEffect(() => {
    if (isViewingItems) {
      setIsViewingItems(false);
      setChecklistItems([]);
      setViewedChecklistName("");
    }
  }, [statusFilter]);

  // Fetch projects
  useEffect(() => {
    async function fetchProjects() {
      setLoadingProjects(true);
      setError(null);
      try {
        // Filter projects where user has access (you can modify the role filter as needed)
        const userProjects = accesses
          .filter((a) => a.active) // Add specific role filter here if needed
          .map((a) => Number(a.project_id));

        const res = await projectInstance.get("/projects/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        });

        const allProjects = Array.isArray(res.data)
          ? res.data
          : res.data.results;
        console.log("all projects:", allProjects);

        const filtered = allProjects.filter((p) => userProjects.includes(p.id));

        setProjects(filtered);
        if (filtered.length > 0 && !selectedProjectId) {
          setSelectedProjectId(filtered[0].id);
        }
      } catch (err) {
        setError("Failed to load projects");
        setProjects([]);
      } finally {
        setLoadingProjects(false);
      }
    }

    if (accesses.length > 0) {
      fetchProjects();
    }
  }, []); // Remove userStr dependency to prevent re-renders

  // Fetch checklists when project is selected
  useEffect(() => {
    refreshChecklists();
  }, [selectedProjectId]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SiteBarHome />
      <main className="ml-[15%] w-full p-6">
        {/* Conditional Rendering: Main View or Items View */}
        {isViewingItems ? (
          // CHECKLIST ITEMS VIEW
          <div>
            {/* Header with Go Back */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <button
                  onClick={handleGoBack}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium mr-4 transition-colors flex items-center"
                >
                  ← Go Back
                </button>
                <h2 className="text-2xl font-bold text-gray-800">
                  {viewedChecklistName}
                </h2>
              </div>
            </div>

            {/* Checklist Items Content */}
            <div className="bg-white rounded-lg shadow p-6">
              {loadingChecklistItems ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mr-3"></div>
                  <span className="text-gray-600 text-lg">
                    Loading checklist items...
                  </span>
                </div>
              ) : checklistItems.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg">
                    No items found for this checklist.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Checklist Items ({checklistItems.length})
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Review and manage the items in this checklist
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {checklistItems.map((item) => (
                      <div
                        key={item.id}
                        className="border border-gray-200 rounded-lg p-6 bg-gray-50 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-semibold text-lg text-gray-800">
                            {item.title}
                          </h4>
                          <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-medium">
                            ID: {item.id}
                          </span>
                        </div>

                        {item.description && (
                          <div className="mb-4">
                            <p className="text-gray-600 text-sm bg-white p-3 rounded border">
                              {item.description}
                            </p>
                          </div>
                        )}

                        <div className="space-y-3 mb-4">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm text-gray-700">
                              Status:
                            </span>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                item.status
                              )}`}
                            >
                              {item.status.replace("_", " ").toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm text-gray-700">
                              Photo Required:
                            </span>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                item.photo_required
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {item.photo_required ? "Yes" : "No"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm text-gray-700">
                              Ignore Now:
                            </span>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                item.ignore_now
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {item.ignore_now ? "Yes" : "No"}
                            </span>
                          </div>
                        </div>

                        {/* {item.options && item.options.length > 0 && (
                          <div className="mt-4">
                            <p className="font-medium text-sm mb-3 text-gray-700">
                              Available Options:
                            </p>
                            <div className="space-y-2">
                              {item.options.map((option) => (
                                <div
                                  key={option.id}
                                  className="flex items-center justify-between bg-white p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                                >
                                  <span className="text-sm font-medium">
                                    {option.name}
                                  </span>
                                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                                    Choice: {option.choice}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )} */}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          // MAIN VIEW (Project Selection, Filters, Checklists)
          <div>
            <h2 className="text-2xl font-bold mb-6">Initialize Checklist</h2>

            {/* Project Selection and Info - Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Project Dropdown */}
              <div className="bg-white rounded-lg shadow p-4">
                <label className="block mb-2 font-semibold text-gray-700">
                  Select Project:
                </label>
                {loadingProjects ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-gray-600">Loading projects...</span>
                  </div>
                ) : error ? (
                  <p className="text-red-500 text-sm">{error}</p>
                ) : (
                  <select
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={selectedProjectId}
                    onChange={(e) =>
                      setSelectedProjectId(Number(e.target.value))
                    }
                    disabled={projects.length === 0}
                  >
                    {projects.length === 0 && (
                      <option>No projects available</option>
                    )}
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name || `Project #${p.id}`}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Selected Project Info */}
              {selectedProjectId && (
                <div className="bg-white rounded-lg shadow p-4">
                  <h3 className="font-semibold text-gray-700 mb-2">
                    Selected Project Details:
                  </h3>
                  <div className="text-sm text-gray-600">
                    <p>
                      <span className="font-medium">ID:</span>{" "}
                      {selectedProjectId}
                    </p>
                    <p>
                      <span className="font-medium">Name:</span>{" "}
                      {projects.find((p) => p.id === selectedProjectId)?.name ||
                        "N/A"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Status Filter Section */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Filter by Status
              </h3>
              <div className="flex flex-wrap gap-3">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setStatusFilter(option.value)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      statusFilter === option.value
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {statusFilter !== "all" && (
                <p className="text-sm text-gray-600 mt-2">
                  Currently showing:{" "}
                  {
                    statusOptions.find((opt) => opt.value === statusFilter)
                      ?.label
                  }
                </p>
              )}
            </div>

            {/* Checklists Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  Available Checklists
                </h3>
                {filteredChecklists.length > 0 && (
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    {filteredChecklists.length} checklist
                    {filteredChecklists.length !== 1 ? "s" : ""} found
                  </span>
                )}
              </div>

              {loadingChecklists ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                  <span className="text-gray-600">Loading checklists...</span>
                </div>
              ) : checklistError ? (
                <div className="text-center py-8">
                  <p className="text-red-500 mb-2">{checklistError}</p>
                  <button
                    onClick={refreshChecklists}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Try Again
                  </button>
                </div>
              ) : !filteredChecklists.length ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">
                    {statusFilter === "all"
                      ? "No checklists available for this project."
                      : `No checklists found with status: ${
                          statusOptions.find(
                            (opt) => opt.value === statusFilter
                          )?.label
                        }`}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredChecklists.map((checklist) => (
                    <div
                      key={checklist.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-semibold text-lg text-gray-800">
                          {checklist.name}
                        </h4>
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                          #{checklist.id}
                        </span>
                      </div>

                      <div className="text-sm text-gray-600 mb-3 space-y-1">
                        <p>
                          <span className="font-medium">Category:</span>{" "}
                          {checklist.category || "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">Building:</span>{" "}
                          {checklist.building_id || "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">Zone:</span>{" "}
                          {checklist.zone_id || "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">Flat:</span>{" "}
                          {checklist.flat_id || "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">Items:</span>{" "}
                          {checklist.items?.length || 0}
                        </p>
                      </div>

                      <div className="mb-3">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            checklist.status
                          )}`}
                        >
                          {checklist.status.replace("_", " ").toUpperCase()}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        {checklist.status === "not_started" && (
                          <button
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition-colors"
                            onClick={() =>
                              handleInitializeChecklist(checklist.id)
                            }
                          >
                            Initialize
                          </button>
                        )}
                        <button
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors"
                          onClick={() => handleViewChecklist(checklist.id)}
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default InitializeChecklist;