import React, { useState, useEffect } from "react";
import SideBarSetup from "./SideBarSetup";
import { getProjectsByOwnership } from "../api"; // <-- Make sure this is imported
import { projectInstance } from "../api/axiosInstance";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { useTheme } from "../ThemeContext";

const CATEGORY_LEVELS = [
  {
    id: 1,
    label: "Category 1",
    icon: "📋",
    parentKey: "project",
    parentLabel: "Project",
    listApi: () => `/categories-simple/`,
    createApi: `/categories-simple/`,
    entryParentField: "project",
  },
  {
    id: 2,
    label: "Category 2",
    icon: "📁",
    parentKey: "category",
    parentLabel: "Category 1",
    listApi: () => `/category-level1-simple/`,
    createApi: `/category-level1-simple/`,
    entryParentField: "category",
  },
  {
    id: 3,
    label: "Category 3",
    icon: "📂",
    parentKey: "category_level1",
    parentLabel: "Category 2",
    listApi: () => `/category-level2-simple/`,
    createApi: `/category-level2-simple/`,
    entryParentField: "category_level1",
  },
  {
    id: 4,
    label: "Category 4",
    icon: "🗂️",
    parentKey: "category_level2",
    parentLabel: "Category 3",
    listApi: () => `/category-level3-simple/`,
    createApi: `/category-level3-simple/`,
    entryParentField: "category_level2",
  },
  {
    id: 5,
    label: "Category 5",
    icon: "📑",
    parentKey: "category_level3",
    parentLabel: "Category 4",
    listApi: () => `/category-level4-simple/`,
    createApi: `/category-level4-simple/`,
    entryParentField: "category_level3",
  },
  {
    id: 6,
    label: "Category 6",
    icon: "📄",
    parentKey: "category_level4",
    parentLabel: "Category 5",
    listApi: () => `/category-level5-simple/`,
    createApi: `/category-level5-simple/`,
    entryParentField: "category_level4",
  },
];

function CategoryChecklist() {
  const userId = useSelector((state) => state.user.user.id);
  const { theme } = useTheme();

  // --- THEME PALETTE ---
  const palette = theme === "dark"
    ? {
        bg: "#191921",
        card: "bg-[#23232e]",
        text: "text-amber-200",
        border: "border-[#facc1530]",
        input: "bg-[#181820] text-amber-200",
        select: "bg-[#23232e] text-amber-200",
        th: "bg-[#181820] text-[#facc15]",
        trHover: "hover:bg-[#23232e]",
        shadow: "shadow-lg",
        badge: "bg-[#fde047] text-[#181820]"
      }
    : {
        bg: "#f7f8fa",
        card: "bg-white",
        text: "text-[#22223b]",
        border: "border-[#ececf0]",
        input: "bg-white text-[#22223b]",
        select: "bg-white text-[#22223b]",
        th: "bg-[#f6f8fd] text-[#9aa2bc]",
        trHover: "hover:bg-[#f6f8fd]",
        shadow: "shadow-sm",
        badge: "bg-[#4375e8] text-white"
      };

  const [projects, setProjects] = useState([]);
  const [chain, setChain] = useState({
    project: "",
    category: "",
    category_level1: "",
    category_level2: "",
    category_level3: "",
    category_level4: "",
  });
  const [options, setOptions] = useState({
    project: [],
    category: [],
    category_level1: [],
    category_level2: [],
    category_level3: [],
    category_level4: [],
  });
  const [entries, setEntries] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(CATEGORY_LEVELS[0]);

  // --- FETCH PROJECTS BY USER'S ORG/COMPANY/ENTITY ---
  useEffect(() => {
    (async () => {
      try {
        // Prefer redux user if available, else localStorage
        let user = null;
        try {
          user = JSON.parse(localStorage.getItem("USER_DATA"));
        } catch {}
        let params = {};
        if (user?.entity_id || user?.entity) params.entity_id = user.entity_id || user.entity;
        else if (user?.company_id || user?.company) params.company_id = user.company_id || user.company;
        else if (user?.org || user?.organization_id) params.organization_id = user.org || user.organization_id;
        if (Object.keys(params).length === 0) {
          setProjects([]);
          setOptions((prev) => ({ ...prev, project: [] }));
          toast.error("No organization/company/entity found.");
          return;
        }
        const res = await getProjectsByOwnership(params);
        setProjects(res.data || []);
        setOptions((prev) => ({ ...prev, project: res.data || [] }));
      } catch {
        toast.error("Failed to fetch user projects");
      }
    })();
  }, []);

  // --- RESET LOWER CHAINS/OPTIONS WHEN LEVEL CHANGES ---
  useEffect(() => {
    const chainCopy = { ...chain };
    const optionsCopy = { ...options };
    let cutoff = CATEGORY_LEVELS[selectedLevel.id - 1]?.parentKey || "project";
    let found = false;
    for (const key of Object.keys(chainCopy)) {
      if (key === cutoff) {
        found = true;
        continue;
      }
      if (found) {
        chainCopy[key] = "";
        optionsCopy[key] = [];
      }
    }
    setChain(chainCopy);
    setOptions(optionsCopy);
    setEntries([]);
    setInputValue("");
  }, [selectedLevel]);

  // --- HANDLE PARENT CHANGE ---
  const handleParentChange = (key, value) => {
    const newChain = { ...chain, [key]: value };
    const newOptions = { ...options };
    let found = false;
    for (const k of Object.keys(chain)) {
      if (k === key) {
        found = true;
        continue;
      }
      if (found) {
        newChain[k] = "";
        newOptions[k] = [];
      }
    }
    setChain(newChain);
    setOptions(newOptions);
    setInputValue("");
  };

  // --- FETCH CHILD DROPDOWN OPTIONS (next level) ---
  useEffect(() => {
    if (selectedLevel.id === 1) return;
    const prevLevelIdx = selectedLevel.id - 2;
    const prevLevel = CATEGORY_LEVELS[prevLevelIdx];
    const parentKey = prevLevel.parentKey;
    const parentId = chain[parentKey];
    if (!parentId) {
      setOptions((prev) => ({ ...prev, [selectedLevel.parentKey]: [] }));
      return;
    }
    setLoading(true);
    projectInstance
      .get(prevLevel.listApi())
      .then((res) => {
        const filtered =
          (res.data || []).filter(
            (item) =>
              String(item[prevLevel.entryParentField]) === String(parentId)
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
  }, [selectedLevel, ...Object.values(chain).slice(0, -1)]);

  // --- FETCH TABLE ENTRIES for current parent selection at this level ---
  useEffect(() => {
    if (!chain[selectedLevel.parentKey]) {
      setEntries([]);
      return;
    }
    setLoading(true);
    projectInstance
      .get(selectedLevel.listApi())
      .then((res) => {
        const filtered = (res.data || []).filter(
          (item) =>
            String(item[selectedLevel.entryParentField]) ===
            String(chain[selectedLevel.parentKey])
        );
        setEntries(filtered);
      })
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [selectedLevel, chain[selectedLevel.parentKey]]);

  // --- ADD NEW ENTRY ---
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
      setChain((prev) => ({ ...prev })); // Triggers table reload
    } catch (err) {
      toast.error("API error");
    }
    setLoading(false);
  };

  return (
    <div className={`flex min-h-screen`} style={{ background: palette.bg }}>
      <SideBarSetup />
      <div className="flex-1 ml-[16%] mr-4 my-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className={`text-2xl md:text-3xl font-semibold mb-2 tracking-tight ${palette.text}`}>
              Category Management
            </h1>
            <p className={`text-base md:text-lg ${palette.text} opacity-80`}>
              Organize and manage your project categories efficiently
            </p>
          </div>
          {/* Category Level Selector */}
          <div className={`${palette.card} rounded-xl ${palette.border} p-6 mb-8 ${palette.shadow}`}>
            <h2 className={`text-lg font-semibold mb-4 ${palette.text}`}>Select Category Level</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {CATEGORY_LEVELS.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`py-4 px-2 rounded-lg border transition text-center duration-200 text-base font-medium
                  ${
                    selectedLevel.id === cat.id
                      ? `${palette.border} bg-[#f6f8fd] text-[#1e2a44] shadow`
                      : `${palette.border} ${palette.card} ${palette.text} hover:bg-[#f6f8fd] hover:border-[#b4c0e6]`
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
          <div className={`${palette.card} rounded-xl ${palette.border} p-6 mb-8 ${palette.shadow}`}>
            {[...Array(selectedLevel.id)].map((_, idx) => {
              const config = CATEGORY_LEVELS[idx];
              const label = config.parentLabel;
              const key = config.parentKey;
              if (idx === 0) {
                return (
                  <div className="mb-6" key={key}>
                    <label className={`block mb-2 font-semibold ${palette.text}`}>
                      Select Project
                    </label>
                    <select
                      value={chain.project}
                      onChange={(e) =>
                        handleParentChange("project", e.target.value)
                      }
                      className={`w-full p-4 border rounded-lg ${palette.select} ${palette.border} focus:ring-2 focus:ring-[#b4c0e6] focus:border-[#b4c0e6] transition`}
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
              if (chain[CATEGORY_LEVELS[idx - 1].parentKey]) {
                return (
                  <div className="mb-6" key={key}>
                    <label className={`block mb-2 font-semibold ${palette.text}`}>
                      Select {label}
                    </label>
                    <select
                      value={chain[key]}
                      onChange={(e) =>
                        handleParentChange(key, e.target.value)
                      }
                      className={`w-full p-4 border rounded-lg ${palette.select} ${palette.border} focus:ring-2 focus:ring-[#b4c0e6] focus:border-[#b4c0e6] transition`}
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
            <div className={`${palette.card} rounded-xl ${palette.border} p-6 mb-8 ${palette.shadow}`}>
              <h2 className={`text-lg font-semibold mb-4 ${palette.text}`}>
                Add New {selectedLevel.label}
              </h2>
              <div className="flex gap-3">
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAdd(e)}
                  placeholder={`Enter name for ${selectedLevel.label}`}
                  className={`flex-1 p-4 border rounded-lg ${palette.input} ${palette.border} text-base`}
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
            <div className={`${palette.card} rounded-xl ${palette.border} ${palette.shadow}`}>
              <div className="px-6 py-4 border-b border-[#f1f2f6]">
                <h2 className={`text-lg font-semibold ${palette.text}`}>
                  {selectedLevel.label} List
                </h2>
                <p className="text-xs mt-1 opacity-70">
                  {entries.length} {entries.length === 1 ? "item" : "items"} found
                </p>
              </div>
              {loading ? (
                <div className="py-10 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4375e8] mx-auto mb-2"></div>
                  <p className="text-base text-[#b4c0e6]">Loading...</p>
                </div>
              ) : entries.length === 0 ? (
                <div className="py-12 text-center text-[#b4c0e6]">
                  No entries yet. Add your first {selectedLevel.label.toLowerCase()}!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className={`${palette.th}`}>
                      <tr>
                        <th className="px-6 py-4 font-medium">Name</th>
                        <th className="px-6 py-4 font-medium">ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ececf0]">
                      {entries.map((item, index) => (
                        <tr key={item.id} className={palette.trHover}>
                          <td className={`px-6 py-4 font-medium ${palette.text}`}>
                            {item.name}
                          </td>
                          <td className={`px-6 py-4 ${palette.text}`}>#{item.id}</td>
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
