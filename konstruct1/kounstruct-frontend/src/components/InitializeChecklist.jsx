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
        <h2 className="text-2xl font-bold mb-4">Initialize Checklist</h2>

        {/* Project Dropdown */}
        <div className="mb-6">
          <label className="block mb-2 font-semibold">Select Project:</label>
          {loadingProjects ? (
            <p>Loading projects...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <select
              className="p-2 border rounded"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(Number(e.target.value))}
              disabled={projects.length === 0}
            >
              {projects.length === 0 && <option>No projects</option>}
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
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h3 className="font-semibold mb-2">Selected Project:</h3>
            <p>Project ID: {selectedProjectId}</p>
            <p>
              Project Name:{" "}
              {projects.find((p) => p.id === selectedProjectId)?.name || "N/A"}
            </p>
          </div>
        )}

        {/* Checklists Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">
            Available Checklists to Initialize
          </h3>

          {/* Debug info */}
          <div className="mb-4 p-2 bg-gray-100 rounded text-sm">
            <p>Loading: {loadingChecklists.toString()}</p>
            <p>Error: {checklistError || "None"}</p>
            <p>Checklists count: {checklists.length}</p>
          </div>

          {loadingChecklists ? (
            <p>Loading checklists...</p>
          ) : checklistError ? (
            <p className="text-red-500">{checklistError}</p>
          ) : !checklists.length ? (
            <p className="text-gray-600">
              No checklists available to initialize for this project.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {checklists.map((checklist) => (
                <div
                  key={checklist.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-lg">{checklist.name}</h4>
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                      ID: {checklist.id}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600 mb-3">
                    <p>Category: {checklist.category || "--"}</p>
                    <p>Building: {checklist.building_id || "--"}</p>
                    <p>Zone: {checklist.zone_id || "--"}</p>
                    <p>Flat: {checklist.flat_id || "--"}</p>
                    <p>Items: {checklist.items?.length || 0}</p>
                    <p>
                      Status:{" "}
                      <span className="font-medium text-orange-600">
                        {checklist.status}
                      </span>
                    </p>
                  </div>

                  <button
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition-colors"
                    onClick={() => handleInitializeChecklist(checklist.id)}
                  >
                    Initialize Checklist
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default InitializeChecklist;
