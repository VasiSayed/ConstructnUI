import React, { useState, useEffect } from "react";
import SideBarSetup from "./SideBarSetup";
import { getProjectUserDetails } from "../api";
import { projectInstance } from "../api/axiosInstance";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";

// Config for 6 category levels
const CATEGORY_LEVELS = [
  {
    id: 1,
    label: "Category 1",
    icon: "📋",
    parentKey: "project",
    parentLabel: "Project",
    listApi: () => `/categories-simple/`, // Fetch all, filter in FE
    createApi: `/categories-simple/`,
    entryParentField: "project_name", // <- FIELD NAME TO MATCH
    parentNameKey: "name", // project.name
  },
  {
    id: 2,
    label: "Category 2",
    icon: "📁",
    parentKey: "category",
    parentLabel: "Category 1",
    listApi: () => `/category-level1-simple/`,
    createApi: `/category-level1-simple/`,
    entryParentField: "category_name",
    parentNameKey: "name",
  },
  {
    id: 3,
    label: "Category 3",
    icon: "📂",
    parentKey: "category_level1",
    parentLabel: "Category 2",
    listApi: () => `/category-level2-simple/`,
    createApi: `/category-level2-simple/`,
    entryParentField: "category_level1_name",
    parentNameKey: "name",
  },
  {
    id: 4,
    label: "Category 4",
    icon: "🗂️",
    parentKey: "category_level2",
    parentLabel: "Category 3",
    listApi: () => `/category-level3-simple/`,
    createApi: `/category-level3-simple/`,
    entryParentField: "category_level2_name",
    parentNameKey: "name",
  },
  {
    id: 5,
    label: "Category 5",
    icon: "📑",
    parentKey: "category_level3",
    parentLabel: "Category 4",
    listApi: () => `/category-level4-simple/`,
    createApi: `/category-level4-simple/`,
    entryParentField: "category_level3_name",
    parentNameKey: "name",
  },
  {
    id: 6,
    label: "Category 6",
    icon: "📄",
    parentKey: "category_level4",
    parentLabel: "Category 5",
    listApi: () => `/category-level5-simple/`,
    createApi: `/category-level5-simple/`,
    entryParentField: "category_level4_name",
    parentNameKey: "name",
  },
];

function CategoryChecklist() {
  const userId = useSelector((state) => state.user.user.id);

  // Project list for dropdown
  const [projects, setProjects] = useState([]);
  // Keeps the currently selected value for each level
  const [chain, setChain] = useState({
    project: "",
    category: "",
    category_level1: "",
    category_level2: "",
    category_level3: "",
    category_level4: "",
  });
  // Dropdown options for each parent
  const [options, setOptions] = useState({
    project: [],
    category: [],
    category_level1: [],
    category_level2: [],
    category_level3: [],
    category_level4: [],
  });
  // Table entries for current parent
  const [entries, setEntries] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(CATEGORY_LEVELS[0]);

  // Fetch projects on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await getProjectUserDetails();
        setProjects(res.data || []);
        setOptions((prev) => ({ ...prev, project: res.data || [] }));
      } catch {
        toast.error("Failed to fetch projects");
      }
    })();
  }, []);

  // Helper: Reset all levels below the changed one
  const resetBelow = (chainObj, optionsObj, fromKey) => {
    let found = false;
    for (const key of Object.keys(chainObj)) {
      if (key === fromKey) {
        found = true;
        continue;
      }
      if (found) {
        chainObj[key] = "";
        optionsObj[key] = [];
      }
    }
    return [chainObj, optionsObj];
  };

  // Reset lower chains/options/entries when level or parent changes
  useEffect(() => {
    const chainCopy = { ...chain };
    const optionsCopy = { ...options };
    let cutoff = CATEGORY_LEVELS[selectedLevel.id - 1]?.parentKey || "project";
    resetBelow(chainCopy, optionsCopy, cutoff);
    setChain(chainCopy);
    setOptions(optionsCopy);
    setEntries([]);
    setInputValue("");
    // eslint-disable-next-line
  }, [selectedLevel]);

  // When a dropdown changes, reset all lower dropdowns/options and refetch entries for the table
  const handleParentChange = (key, value) => {
    const newChain = { ...chain, [key]: value };
    const newOptions = { ...options };
    // Reset all dropdowns/options below this key
    resetBelow(newChain, newOptions, key);
    setChain(newChain);
    setOptions(newOptions);
    setInputValue("");
  };

  // Fetch parent dropdown options (for the next level) when a parent value changes
  useEffect(() => {
    // Don't fetch options for level 1 (project) as those are always loaded at mount
    if (selectedLevel.id === 1) return;
    // Parent of the current level
    const prevLevelIdx = selectedLevel.id - 2;
    const prevLevel = CATEGORY_LEVELS[prevLevelIdx];
    const parentKey = prevLevel.parentKey;
    const parentId = chain[parentKey];
    if (!parentId) {
      setOptions((prev) => ({ ...prev, [selectedLevel.parentKey]: [] }));
      return;
    }
    setLoading(true);
    // Fetch ALL and filter below
    projectInstance
      .get(prevLevel.listApi())
      .then((res) => {
        // Get selected parent NAME
        let parentName = "";
        if (prevLevelIdx === 0) {
          // Project
          parentName =
            projects.find((p) => String(p.id) === String(parentId))?.name || "";
        } else {
          parentName =
            options[prevLevel.parentKey].find(
              (p) => String(p.id) === String(parentId)
            )?.name || "";
        }
        // Filter by parent name field
        const filtered =
          (res.data || []).filter(
            (item) =>
              String(item[prevLevel.entryParentField]) === String(parentName)
          );
        setOptions((prev) => ({
          ...prev,
          [selectedLevel.parentKey]: filtered,
        }));
      })
      .catch(() => {
        setOptions((prev) => ({ ...prev, [selectedLevel.parentKey]: [] }));
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, [selectedLevel, ...Object.values(chain).slice(0, -1)]);

  // Fetch table entries for current parent selection at this level
  useEffect(() => {
    // Only run when the relevant parent is selected
    if (!chain[selectedLevel.parentKey]) {
      setEntries([]);
      return;
    }
    setLoading(true);

    // Get parent name for this level
    let parentName = "";
    if (selectedLevel.id === 1) {
      // Project
      parentName =
        projects.find((p) => String(p.id) === String(chain.project))?.name ||
        "";
    } else {
      // For other levels, use dropdown options
      const prevLevel = CATEGORY_LEVELS[selectedLevel.id - 2];
      parentName =
        options[prevLevel.parentKey].find(
          (p) => String(p.id) === String(chain[selectedLevel.parentKey])
        )?.name || "";
    }

    // Fetch all and filter by parent name
    projectInstance
      .get(selectedLevel.listApi())
      .then((res) => {
        // Filter entries based on parent name field
        const filtered = (res.data || []).filter((item) => {
          // For top level (project), filter by project_name
          if (selectedLevel.id === 1) {
            return (
              String(item.project_name) === String(parentName)
            );
          }
          // For other levels, filter by parent name field
          return (
            String(item[selectedLevel.entryParentField]) === String(parentName)
          );
        });
        setEntries(filtered);
      })
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, [selectedLevel, chain[selectedLevel.parentKey], projects, options]);

  // Add a new category/subcategory at current level
  const handleAdd = async (e) => {
    e.preventDefault();
    const val = inputValue.trim();
    if (!chain[selectedLevel.parentKey] || !val) {
      toast.error("Select parent and enter name");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: val,
        [selectedLevel.parentKey]: chain[selectedLevel.parentKey],
        created_by: userId,
      };
      await projectInstance.post(selectedLevel.createApi, payload);
      toast.success("Added successfully");
      setInputValue("");
      // Refresh table entries
      // Just re-run the effect by changing the chain state
      setChain((prev) => ({ ...prev }));
    } catch (err) {
      toast.error("API error");
    }
    setLoading(false);
  };

  // Get parent options for current level's parent dropdown
  const getParentDropdownOptions = (levelIdx) => {
    if (levelIdx === 0) return projects;
    const config = CATEGORY_LEVELS[levelIdx];
    return options[config.parentKey] || [];
  };

  // Render
  return (
    <div className="flex min-h-screen bg-[#f7f8fa]">
      <SideBarSetup />
      <div className="flex-1 ml-[16%] mr-4 my-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-semibold text-[#22223b] mb-2 tracking-tight">
              Category Management
            </h1>
            <p className="text-[#6c6f7e] text-base md:text-lg">
              Organize and manage your project categories efficiently
            </p>
          </div>
          {/* Category Level Selector */}
          <div className="bg-white rounded-xl border border-[#ececf0] p-6 mb-8 shadow-sm">
            <h2 className="text-lg font-semibold text-[#343650] mb-4">
              Select Category Level
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {CATEGORY_LEVELS.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`py-4 px-2 rounded-lg border transition text-center duration-200 text-base font-medium
                  ${
                    selectedLevel.id === cat.id
                      ? "border-[#4375e8] bg-[#f6f8fd] text-[#1e2a44] shadow-sm"
                      : "border-[#ececf0] bg-white text-[#656777] hover:bg-[#f6f8fd] hover:border-[#b4c0e6]"
                  }
                `}
                  onClick={() => setSelectedLevel(cat)}
                >
                  <div className="mb-1 text-xl">{cat.icon}</div>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
          {/* All Parent Dropdowns up to selected level */}
          <div className="bg-white rounded-xl border border-[#ececf0] p-6 mb-8 shadow-sm">
            {[...Array(selectedLevel.id)].map((_, idx) => {
              const config = CATEGORY_LEVELS[idx];
              const label = config.parentLabel;
              const key = config.parentKey;
              // For Project (level 1), always show
              if (idx === 0) {
                return (
                  <div className="mb-6" key={key}>
                    <label className="block mb-2 text-[#343650] font-semibold">
                      Select Project
                    </label>
                    <select
                      value={chain.project}
                      onChange={(e) =>
                        handleParentChange("project", e.target.value)
                      }
                      className="w-full p-4 border border-[#ececf0] rounded-lg bg-white text-[#2d3047] focus:ring-2 focus:ring-[#b4c0e6] focus:border-[#b4c0e6] transition"
                    >
                      <option value="">Choose Project</option>
                      {projects.map((proj) => (
                        <option key={proj.id} value={proj.id}>
                          {proj.name}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }
              // For others, only show if previous parent is selected
              if (chain[CATEGORY_LEVELS[idx - 1].parentKey]) {
                return (
                  <div className="mb-6" key={key}>
                    <label className="block mb-2 text-[#343650] font-semibold">
                      Select {label}
                    </label>
                    <select
                      value={chain[key]}
                      onChange={(e) =>
                        handleParentChange(key, e.target.value)
                      }
                      className="w-full p-4 border border-[#ececf0] rounded-lg bg-white text-[#2d3047] focus:ring-2 focus:ring-[#b4c0e6] focus:border-[#b4c0e6] transition"
                    >
                      <option value="">Choose {label}</option>
                      {(options[key] || []).map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }
              return null;
            })}
          </div>
          {/* Add New Entry */}
          {chain[selectedLevel.parentKey] && (
            <div className="bg-white rounded-xl border border-[#ececf0] p-6 mb-8 shadow-sm">
              <h2 className="text-lg font-semibold text-[#343650] mb-4">
                Add New {selectedLevel.label}
              </h2>
              <div className="flex gap-3">
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAdd(e)}
                  placeholder={`Enter name for ${selectedLevel.label}`}
                  className="flex-1 p-4 border border-[#ececf0] rounded-lg focus:ring-2 focus:ring-[#b4c0e6] focus:border-[#b4c0e6] text-base"
                />
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={loading}
                  className={`px-8 py-4 rounded-lg text-white font-semibold transition 
                    ${
                      loading
                        ? "bg-[#b4c0e6] cursor-not-allowed"
                        : "bg-[#4375e8] hover:bg-[#1e4fb2]"
                    }`}
                >
                  {loading ? "Adding..." : "+ Add"}
                </button>
              </div>
            </div>
          )}
          {/* Entries Table */}
          {chain[selectedLevel.parentKey] && (
            <div className="bg-white rounded-xl border border-[#ececf0] shadow-sm">
              <div className="px-6 py-4 border-b border-[#f1f2f6]">
                <h2 className="text-lg font-semibold text-[#343650]">
                  {selectedLevel.label} List
                </h2>
                <p className="text-[#8b8c97] text-xs mt-1">
                  {entries.length} {entries.length === 1 ? "item" : "items"} found
                </p>
              </div>
              {loading ? (
                <div className="py-10 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4375e8] mx-auto mb-2"></div>
                  <p className="text-[#b4c0e6] text-base">Loading...</p>
                </div>
              ) : entries.length === 0 ? (
                <div className="py-12 text-center text-[#b4c0e6]">
                  No entries yet. Add your first {selectedLevel.label.toLowerCase()}!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-[#f6f8fd] text-[#9aa2bc] text-sm">
                      <tr>
                        <th className="px-6 py-4 font-medium">Name</th>
                        <th className="px-6 py-4 font-medium">ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ececf0]">
                      {entries.map((item, index) => (
                        <tr key={item.id} className="hover:bg-[#f6f8fd]">
                          <td className="px-6 py-4 font-medium text-[#22223b]">
                            {item.name}
                          </td>
                          <td className="px-6 py-4 text-[#6c6f7e]">#{item.id}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CategoryChecklist;
