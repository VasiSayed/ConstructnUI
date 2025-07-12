import React, { useEffect, useState } from "react";
import SiteBarHome from "./SiteBarHome";
import { projectInstance, NEWchecklistInstance } from "../api/axiosInstance";
import { useTheme } from "../ThemeContext";

// UTILITY: Detect if current user is Intializer
function isInitializerRole() {
  try {
    const userStr = localStorage.getItem("USER_DATA");
    if (!userStr || userStr === "undefined") return false;
    const userData = JSON.parse(userStr);

    // .role (string)
    if (userData.role === "Intializer") return true;
    // .roles (array of strings or objects)
    if (Array.isArray(userData.roles)) {
      if (
        userData.roles.some(
          (r) =>
            (typeof r === "string" && r === "Intializer") ||
            (typeof r === "object" && r && r.role === "Intializer")
        )
      )
        return true;
    }
    // .accesses (optional, array with roles inside)
    if (Array.isArray(userData.accesses)) {
      for (let a of userData.accesses) {
        if (
          Array.isArray(a.roles) &&
          a.roles.some(
            (r) =>
              (typeof r === "string" && r === "Intializer") ||
              (typeof r === "object" && r && r.role === "Intializer")
          )
        )
          return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

function InitializeChecklist() {
  const { theme, toggleTheme } = useTheme();
  const isInitializer = isInitializerRole();

  const palette = theme === "dark"
    ? {
        pageBg: "bg-[#181820]",
        card: "bg-[#23232e] border border-amber-400/30 shadow-lg",
        section: "bg-[#23232e]",
        text: "text-yellow-100",
        textDim: "text-yellow-200",
        border: "border-yellow-400/50",
        select: "bg-[#191921] text-yellow-100 border-yellow-400/30",
        button: "bg-yellow-400 hover:bg-yellow-300 text-black font-semibold",
        input: "bg-[#23232e] text-yellow-100 border-yellow-400/30",
        badge: "bg-yellow-800 text-yellow-200"
      }
    : {
        pageBg: "bg-gray-50",
        card: "bg-white border border-orange-200 shadow",
        section: "bg-white",
        text: "text-gray-800",
        textDim: "text-gray-500",
        border: "border-orange-300",
        select: "bg-white text-gray-800 border-orange-300",
        button: "bg-orange-500 hover:bg-orange-600 text-white font-semibold",
        input: "bg-white text-gray-800 border-orange-300",
        badge: "bg-orange-100 text-orange-700"
      };

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [error, setError] = useState(null);

  // Checklists state
  const [checklists, setChecklists] = useState([]);
  const [loadingChecklists, setLoadingChecklists] = useState(false);
  const [checklistError, setChecklistError] = useState(null);

  // Get user/checker accesses from localStorage
  const accessesStr = localStorage.getItem("ACCESSES");
  const accesses = accessesStr ? JSON.parse(accessesStr) : [];

  // Function to refresh checklists
  const refreshChecklists = async () => {
    if (!selectedProjectId) {
      setChecklists([]);
      return;
    }
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
      const checklistData = Array.isArray(res.data) ? res.data : [];
      setChecklists(checklistData);
    } catch (err) {
      setChecklistError("Failed to load checklists");
      setChecklists([]);
    } finally {
      setLoadingChecklists(false);
    }
  };

  // Initialize checklist function
  const handleInitializeChecklist = async (checklistId) => {
    try {
      await NEWchecklistInstance.post(
        `/start-checklist/${checklistId}/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );
      alert("Checklist initialized successfully!");
      await refreshChecklists();
    } catch (err) {
      alert("Failed to initialize checklist. Please try again.");
    }
  };

  // Fetch projects
  useEffect(() => {
    async function fetchProjects() {
      setLoadingProjects(true);
      setError(null);
      try {
        // Filter projects where user has access
        const userProjects = accesses
          .filter((a) => a.active)
          .map((a) => Number(a.project_id));

        const res = await projectInstance.get("/projects/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        });

        const allProjects = Array.isArray(res.data)
          ? res.data
          : res.data.results;

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
    // eslint-disable-next-line
  }, []);

  // Fetch checklists when project is selected
  useEffect(() => {
    refreshChecklists();
    // eslint-disable-next-line
  }, [selectedProjectId]);

  // --- THEME TOGGLE BUTTON (only for Initializer)
  const ThemeToggle = () =>
    isInitializer ? (
      <button
        className={`fixed top-5 right-7 z-50 px-4 py-2 rounded-xl shadow-md font-semibold text-sm
        ${theme === "dark"
          ? "bg-yellow-400 text-black hover:bg-yellow-300"
          : "bg-gray-800 text-yellow-300 hover:bg-gray-900"}
        transition-all duration-200`}
        style={{ border: "2px solid #facc15" }}
        onClick={toggleTheme}
      >
        {theme === "dark" ? "Light Mode" : "Dark Mode"}
      </button>
    ) : null;

  return (
    <div className={`flex min-h-screen ${palette.pageBg}`}>
      <SiteBarHome />
      <ThemeToggle />
      <main className="ml-[15%] w-full p-6">
        <h2 className={`text-2xl font-bold mb-4 ${palette.text}`}>Initialize Checklist</h2>

        {/* Project Dropdown */}
        <div className="mb-6">
          <label className={`block mb-2 font-semibold ${palette.text}`}>Select Project:</label>
          {loadingProjects ? (
            <p className={palette.textDim}>Loading projects...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <select
              className={`p-2 rounded ${palette.select} ${palette.border}`}
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
          <div className={`rounded-lg shadow p-4 mb-6 ${palette.card}`}>
            <h3 className={`font-semibold mb-2 ${palette.text}`}>Selected Project:</h3>
            <p className={palette.textDim}>Project ID: {selectedProjectId}</p>
            <p className={palette.textDim}>
              Project Name: {projects.find((p) => p.id === selectedProjectId)?.name || "N/A"}
            </p>
          </div>
        )}

        {/* Checklists Section */}
        <div className={`rounded-lg shadow p-6 ${palette.card}`}>
          <h3 className={`text-xl font-semibold mb-4 ${palette.text}`}>
            Available Checklists to Initialize
          </h3>
          {loadingChecklists ? (
            <p className={palette.textDim}>Loading checklists...</p>
          ) : checklistError ? (
            <p className="text-red-500">{checklistError}</p>
          ) : !checklists.length ? (
            <p className={palette.textDim}>
              No checklists available to initialize for this project.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {checklists.map((checklist) => (
                <div
                  key={checklist.id}
                  className={`rounded-lg border p-4 hover:shadow-md transition-shadow ${palette.card}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className={`font-semibold text-lg ${palette.text}`}>{checklist.name}</h4>
                    <span className={`px-2 py-1 rounded text-xs ${palette.badge}`}>
                      ID: {checklist.id}
                    </span>
                  </div>
                  <div className={`text-sm mb-3 ${palette.textDim}`}>
                    <p>Category: {checklist.category || "--"}</p>
                    <p>Building: {checklist.building_id || "--"}</p>
                    <p>Zone: {checklist.zone_id || "--"}</p>
                    <p>Flat: {checklist.flat_id || "--"}</p>
                    <p>Items: {checklist.items?.length || 0}</p>
                    <p>
                      Status: <span className="font-medium text-orange-600">{checklist.status}</span>
                    </p>
                  </div>
                  <button
                    className={`w-full py-2 px-4 rounded ${palette.button} transition-colors`}
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
