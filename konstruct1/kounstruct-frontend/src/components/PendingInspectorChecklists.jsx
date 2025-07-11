import React, { useEffect, useState } from "react";
import SiteBarHome from "./SiteBarHome";
import { projectInstance, NEWchecklistInstance } from "../api/axiosInstance";

function PendingInspectorChecklists() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [error, setError] = useState(null);

  // Checklists state
  const [checklists, setChecklists] = useState([]);
  const [loadingChecklists, setLoadingChecklists] = useState(false);
  const [checklistError, setChecklistError] = useState(null);

  // Navigation state for drill-down
  const [currentView, setCurrentView] = useState("checklists"); // 'checklists' | 'checklist' | 'item' | 'option'
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([
    { label: "Checklists", level: "checklists" },
  ]);

  // Enhanced item state - tracks everything per item
  const [itemStates, setItemStates] = useState({});
  // Structure: {
  //   [itemId]: {
  //     selection: 'yes' | 'no' | null,
  //     optionId: null,
  //     remarks: '',
  //     photoFile: null,
  //     photoPreview: null,
  //     isSubmitting: false,
  //     submitted: false,
  //     error: null
  //   }
  // }

  const [bulkMode, setBulkMode] = useState(false);

  // Get user/checker accesses from localStorage
  const userStr = localStorage.getItem("user");
  const accessesStr = localStorage.getItem("ACCESSES");
  const accesses = accessesStr ? JSON.parse(accessesStr) : [];

  // Initialize item state when checklist is selected
  const initializeItemStates = (items) => {
    const newStates = {};
    items.forEach((item) => {
      if (!itemStates[item.id]) {
        newStates[item.id] = {
          selection: null,
          optionId: null,
          remarks: "",
          photoFile: null,
          photoPreview: null,
          isSubmitting: false,
          submitted: false,
          error: null,
        };
      }
    });
    setItemStates((prev) => ({ ...prev, ...newStates }));
  };

  // Function to refresh checklists
  const refreshChecklists = async () => {
    if (!selectedProjectId) {
      setChecklists([]);
      return;
    }

    setLoadingChecklists(true);
    setChecklistError(null);
    try {
      const res = await NEWchecklistInstance.get(`/Chechker-New-checklist/`, {
        params: { project_id: selectedProjectId },
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      });

      const checklistData = Array.isArray(res.data) ? res.data : [];
      setChecklists(checklistData);
    } catch (err) {
      console.error("Pending checklist fetch error:", err);
      setChecklistError("Failed to load pending checklists");
      setChecklists([]);
    } finally {
      setLoadingChecklists(false);
    }
  };

  // Fetch projects
  useEffect(() => {
    async function fetchProjects() {
      setLoadingProjects(true);
      setError(null);
      try {
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
  }, []);

  // Fetch checklists when project is selected
  useEffect(() => {
    refreshChecklists();
    setCurrentView("checklists");
    setSelectedChecklist(null);
    setSelectedItem(null);
    setSelectedOption(null);
    setBreadcrumbs([{ label: "Checklists", level: "checklists" }]);
    setItemStates({});
    setBulkMode(false);
  }, [selectedProjectId]);

  // Navigation functions
  const navigateToChecklist = (checklist) => {
    setSelectedChecklist(checklist);
    setCurrentView("checklist");
    setBreadcrumbs([
      { label: "Checklists", level: "checklists" },
      { label: checklist.name, level: "checklist" },
    ]);
    if (checklist.items) {
      initializeItemStates(checklist.items);
    }
    setBulkMode(false);
  };

  const navigateToItem = (item) => {
    setSelectedItem(item);
    setCurrentView("item");
    setBreadcrumbs([
      { label: "Checklists", level: "checklists" },
      { label: selectedChecklist.name, level: "checklist" },
      { label: item.title || `Item ${item.id}`, level: "item" },
    ]);
  };

  const navigateToOption = (option) => {
    setSelectedOption(option);
    setCurrentView("option");
    setBreadcrumbs([
      { label: "Checklists", level: "checklists" },
      { label: selectedChecklist.name, level: "checklist" },
      { label: selectedItem.title || `Item ${selectedItem.id}`, level: "item" },
      { label: option.name || `Option ${option.id}`, level: "option" },
    ]);
  };

  const navigateToLevel = (level) => {
    setCurrentView(level);
    if (level === "checklists") {
      setSelectedChecklist(null);
      setSelectedItem(null);
      setSelectedOption(null);
      setBreadcrumbs([{ label: "Checklists", level: "checklists" }]);
      setBulkMode(false);
    } else if (level === "checklist") {
      setSelectedItem(null);
      setSelectedOption(null);
      setBreadcrumbs([
        { label: "Checklists", level: "checklists" },
        { label: selectedChecklist.name, level: "checklist" },
      ]);
    } else if (level === "item") {
      setSelectedOption(null);
      setBreadcrumbs([
        { label: "Checklists", level: "checklists" },
        { label: selectedChecklist.name, level: "checklist" },
        {
          label: selectedItem.title || `Item ${selectedItem.id}`,
          level: "item",
        },
      ]);
    }
  };

  // Handle item selection (Yes/No)
  const handleItemSelection = (itemId, selection, item) => {
    // Find the option ID based on selection
    const positiveOption = item.options?.find((opt) => opt.choice === "P");
    const negativeOption = item.options?.find((opt) => opt.choice === "N");
    const optionId =
      selection === "yes" ? positiveOption?.id : negativeOption?.id;

    setItemStates((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        selection: prev[itemId]?.selection === selection ? null : selection,
        optionId:
          prev[itemId]?.selection === selection ? null : optionId || null,
      },
    }));
  };

  // Handle photo upload
  const handlePhotoUpload = (itemId, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setItemStates((prev) => ({
          ...prev,
          [itemId]: {
            ...prev[itemId],
            photoFile: file,
            photoPreview: reader.result,
          },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove photo
  const removePhoto = (itemId) => {
    setItemStates((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        photoFile: null,
        photoPreview: null,
      },
    }));
  };

  // Handle remarks change
  const handleRemarksChange = (itemId, remarks) => {
    setItemStates((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        remarks: remarks,
      },
    }));
  };

  // Submit individual item
  const submitItem = async (itemId) => {
    const itemState = itemStates[itemId];
    const item = selectedChecklist.items.find((i) => i.id === itemId);

    // Validation
    if (!itemState?.selection || !itemState?.optionId) {
      setItemStates((prev) => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          error: "Please select Yes or No",
        },
      }));
      return;
    }

    if (item.photo_required && !itemState.photoFile) {
      setItemStates((prev) => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          error: "Photo is required for this item",
        },
      }));
      return;
    }

    // Start submitting
    setItemStates((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        isSubmitting: true,
        error: null,
      },
    }));

    try {
      const formData = new FormData();
      formData.append("checklist_item_id", itemId);
      formData.append("role", "checker");
      formData.append("option_id", itemState.optionId);
      formData.append("check_remark", itemState.remarks || "");
      if (itemState.photoFile) {
        formData.append("check_photo", itemState.photoFile);
      }

      const response = await NEWchecklistInstance.patch(
        "/Decsion-makeing-forSuer-Inspector/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Success
      setItemStates((prev) => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          isSubmitting: false,
          submitted: true,
          error: null,
        },
      }));

      // Optionally refresh the checklist to get updated status
      await refreshChecklists();
    } catch (error) {
      console.error("Submit error:", error);
      setItemStates((prev) => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          isSubmitting: false,
          error:
            error.response?.data?.detail ||
            "Failed to submit. Please try again.",
        },
      }));
    }
  };

  // Bulk selection
  const handleBulkSelection = (selection) => {
    if (!selectedChecklist?.items) return;

    const updates = {};
    selectedChecklist.items.forEach((item) => {
      const positiveOption = item.options?.find((opt) => opt.choice === "P");
      const negativeOption = item.options?.find((opt) => opt.choice === "N");
      const optionId =
        selection === "yes" ? positiveOption?.id : negativeOption?.id;

      updates[item.id] = {
        ...itemStates[item.id],
        selection: selection,
        optionId: optionId || null,
      };
    });
    setItemStates((prev) => ({ ...prev, ...updates }));
    setBulkMode(false);
  };

  const clearAllSelections = () => {
    if (!selectedChecklist?.items) return;
    const cleared = {};
    selectedChecklist.items.forEach((item) => {
      cleared[item.id] = {
        selection: null,
        optionId: null,
        remarks: "",
        photoFile: null,
        photoPreview: null,
        isSubmitting: false,
        submitted: false,
        error: null,
      };
    });
    setItemStates(cleared);
    setBulkMode(false);
  };

  // Get statistics
  const getSelectionStats = () => {
    if (!selectedChecklist?.items)
      return { total: 0, yes: 0, no: 0, pending: 0, submitted: 0 };

    const total = selectedChecklist.items.length;
    let yes = 0,
      no = 0,
      submitted = 0;

    selectedChecklist.items.forEach((item) => {
      const state = itemStates[item.id];
      if (state?.submitted) submitted++;
      else if (state?.selection === "yes") yes++;
      else if (state?.selection === "no") no++;
    });

    return { total, yes, no, pending: total - yes - no - submitted, submitted };
  };

  const stats = getSelectionStats();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SiteBarHome />
      <main className="ml-[15%] w-full p-6">
        <h2 className="text-2xl font-bold mb-4">
          Pending Inspector Checklists
        </h2>

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

        {/* Breadcrumb Navigation */}
        <div className="mb-4">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              {breadcrumbs.map((breadcrumb, index) => (
                <li key={index} className="inline-flex items-center">
                  {index > 0 && (
                    <svg
                      className="w-6 h-6 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  )}
                  <button
                    onClick={() => navigateToLevel(breadcrumb.level)}
                    className={`ml-1 text-sm font-medium hover:text-blue-700 md:ml-2 ${
                      index === breadcrumbs.length - 1
                        ? "text-gray-500 cursor-default"
                        : "text-blue-600 hover:underline"
                    }`}
                    disabled={index === breadcrumbs.length - 1}
                  >
                    {breadcrumb.label}
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        {/* Checklists View */}
        {currentView === "checklists" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">
              Pending Inspector Checklists
            </h3>

            {loadingChecklists ? (
              <p>Loading pending checklists...</p>
            ) : checklistError ? (
              <p className="text-red-500">{checklistError}</p>
            ) : !checklists.length ? (
              <p className="text-gray-600">
                No pending inspector checklists for this project.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {checklists.map((checklist) => (
                  <div
                    key={checklist.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-lg">
                        {checklist.name}
                      </h4>
                      <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs">
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
                        <span className="font-medium text-blue-600">
                          {checklist.status}
                        </span>
                      </p>
                    </div>

                    <button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors"
                      onClick={() => navigateToChecklist(checklist)}
                    >
                      📋 Start Inspection
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Checklist Detail View with Individual Submit */}
        {currentView === "checklist" && selectedChecklist && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                📋 {selectedChecklist.name}
              </h3>

              <div className="text-sm bg-gray-100 rounded-lg px-3 py-2">
                <span className="font-medium">Progress: </span>
                <span className="text-green-600">{stats.yes} ✓</span>
                <span className="mx-1">|</span>
                <span className="text-red-600">{stats.no} ✗</span>
                <span className="mx-1">|</span>
                <span className="text-blue-600">
                  {stats.submitted} submitted
                </span>
                <span className="mx-1">|</span>
                <span className="text-gray-500">{stats.pending} pending</span>
                <span className="mx-1">of {stats.total}</span>
              </div>
            </div>

            {/* Checklist Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <strong>ID:</strong> {selectedChecklist.id}
                </div>
                <div>
                  <strong>Status:</strong>{" "}
                  <span className="text-blue-600">
                    {selectedChecklist.status}
                  </span>
                </div>
                <div>
                  <strong>Category:</strong>{" "}
                  {selectedChecklist.category || "--"}
                </div>
                <div>
                  <strong>Building:</strong>{" "}
                  {selectedChecklist.building_id || "--"}
                </div>
              </div>
            </div>

            {/* Bulk Actions */}
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold">
                Items ({selectedChecklist.items?.length || 0})
              </h4>

              <div className="flex gap-2">
                {!bulkMode ? (
                  <button
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                    onClick={() => setBulkMode(true)}
                  >
                    ⚡ Quick Actions
                  </button>
                ) : (
                  <div className="flex gap-2 bg-gray-100 rounded-lg p-2">
                    <button
                      className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded"
                      onClick={() => handleBulkSelection("yes")}
                    >
                      ✓ All Yes
                    </button>
                    <button
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded"
                      onClick={() => handleBulkSelection("no")}
                    >
                      ✗ All No
                    </button>
                    <button
                      className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded"
                      onClick={clearAllSelections}
                    >
                      🗑 Clear
                    </button>
                    <button
                      className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-700 text-sm rounded"
                      onClick={() => setBulkMode(false)}
                    >
                      ❌
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Items with Individual Submit */}
            {!selectedChecklist.items?.length ? (
              <p className="text-gray-600">No items in this checklist.</p>
            ) : (
              <div className="space-y-4">
                {selectedChecklist.items.map((item, index) => {
                  const itemState = itemStates[item.id] || {};
                  const isSubmitted = itemState.submitted;

                  return (
                    <div
                      key={item.id}
                      className={`border-2 rounded-lg p-4 transition-all ${
                        isSubmitted
                          ? "border-blue-300 bg-blue-50"
                          : itemState.selection === "yes"
                          ? "border-green-300 bg-green-50"
                          : itemState.selection === "no"
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {/* Item Header */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h5 className="font-semibold text-lg flex items-center gap-2">
                            <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">
                              #{index + 1}
                            </span>
                            {item.title || `Item ${item.id}`}
                            {isSubmitted && (
                              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                                ✓ Submitted
                              </span>
                            )}
                          </h5>
                          <div className="text-sm text-gray-600 mt-1">
                            <span>Status: {item.status}</span>
                            <span className="mx-2">•</span>
                            <span>
                              Photo:{" "}
                              <span
                                className={
                                  item.photo_required
                                    ? "text-red-600 font-semibold"
                                    : ""
                                }
                              >
                                {item.photo_required ? "Required" : "Optional"}
                              </span>
                            </span>
                          </div>
                          {item.description && (
                            <p className="text-sm text-gray-700 mt-2 italic">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs ml-4">
                          ID: {item.id}
                        </span>
                      </div>

                      {!isSubmitted ? (
                        <>
                          {/* Yes/No Selection */}
                          <div className="flex gap-3 mb-4">
                            <button
                              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                                itemState.selection === "yes"
                                  ? "bg-green-600 text-white shadow-lg"
                                  : "bg-green-100 text-green-700 hover:bg-green-200 border border-green-300"
                              }`}
                              onClick={() =>
                                handleItemSelection(item.id, "yes", item)
                              }
                            >
                              ✓ Yes
                            </button>
                            <button
                              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                                itemState.selection === "no"
                                  ? "bg-red-600 text-white shadow-lg"
                                  : "bg-red-100 text-red-700 hover:bg-red-200 border border-red-300"
                              }`}
                              onClick={() =>
                                handleItemSelection(item.id, "no", item)
                              }
                            >
                              ✗ No
                            </button>
                          </div>

                          {/* Remarks Field */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Remarks (Optional)
                            </label>
                            <textarea
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows="2"
                              placeholder="Add any comments or observations..."
                              value={itemState.remarks || ""}
                              onChange={(e) =>
                                handleRemarksChange(item.id, e.target.value)
                              }
                            />
                          </div>

                          {/* Photo Upload */}
                          {item.photo_required && (
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Photo{" "}
                                <span className="text-red-600">*Required</span>
                              </label>
                              {!itemState.photoPreview ? (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                      handlePhotoUpload(
                                        item.id,
                                        e.target.files[0]
                                      )
                                    }
                                    className="hidden"
                                    id={`photo-${item.id}`}
                                  />
                                  <label
                                    htmlFor={`photo-${item.id}`}
                                    className="cursor-pointer"
                                  >
                                    <svg
                                      className="mx-auto h-12 w-12 text-gray-400"
                                      stroke="currentColor"
                                      fill="none"
                                      viewBox="0 0 48 48"
                                    >
                                      <path
                                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                    <p className="mt-2 text-sm text-gray-600">
                                      Click to upload photo
                                    </p>
                                  </label>
                                </div>
                              ) : (
                                <div className="relative">
                                  <img
                                    src={itemState.photoPreview}
                                    alt="Preview"
                                    className="w-full h-48 object-cover rounded-lg"
                                  />
                                  <button
                                    onClick={() => removePhoto(item.id)}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                                  >
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Error Message */}
                          {itemState.error && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
                              {itemState.error}
                            </div>
                          )}

                          {/* Submit Button */}
                          <div className="flex justify-end">
                            <button
                              onClick={() => submitItem(item.id)}
                              disabled={
                                itemState.isSubmitting || !itemState.selection
                              }
                              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                                itemState.isSubmitting
                                  ? "bg-gray-400 cursor-not-allowed"
                                  : !itemState.selection
                                  ? "bg-gray-300 cursor-not-allowed"
                                  : "bg-blue-600 hover:bg-blue-700 text-white"
                              }`}
                            >
                              {itemState.isSubmitting ? (
                                <span className="flex items-center">
                                  <svg
                                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
                                  Submitting...
                                </span>
                              ) : (
                                "Submit Item"
                              )}
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-4">
                          <div className="text-green-600 font-semibold text-lg mb-2">
                            ✓ Item Successfully Submitted
                          </div>
                          <p className="text-sm text-gray-600">
                            Selection:{" "}
                            {itemState.selection === "yes" ? "Yes" : "No"}
                            {itemState.remarks && (
                              <span className="block mt-1">
                                Remarks: {itemState.remarks}
                              </span>
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Summary Section */}
            {stats.total > 0 && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-700">
                    <strong>Summary:</strong> {stats.submitted} of {stats.total}{" "}
                    items submitted
                    {stats.pending > 0 && ` • ${stats.pending} remaining`}
                  </div>
                  {stats.submitted === stats.total && (
                    <div className="text-green-600 font-semibold">
                      ✓ All items have been submitted!
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Item Detail View */}
        {currentView === "item" && selectedItem && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">
              🔍 Item: {selectedItem.title || `Item ${selectedItem.id}`}
            </h3>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <strong>ID:</strong> {selectedItem.id}
                </div>
                <div>
                  <strong>Status:</strong>{" "}
                  <span className="text-green-600">{selectedItem.status}</span>
                </div>
                <div>
                  <strong>Photo Required:</strong>{" "}
                  {selectedItem.photo_required ? "Yes" : "No"}
                </div>
                <div>
                  <strong>Ignore Now:</strong>{" "}
                  {selectedItem.ignore_now ? "Yes" : "No"}
                </div>
                <div>
                  <strong>Checklist ID:</strong> {selectedItem.checklist}
                </div>
                {selectedItem.description && (
                  <div className="col-span-full">
                    <strong>Description:</strong> {selectedItem.description}
                  </div>
                )}
              </div>
            </div>

            <h4 className="text-lg font-semibold mb-3">
              Options ({selectedItem.options?.length || 0})
            </h4>
            {!selectedItem.options?.length ? (
              <p className="text-gray-600">No options for this item.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {selectedItem.options.map((option) => (
                  <div
                    key={option.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-semibold">{option.name}</h5>
                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">
                        ID: {option.id}
                      </span>
                    </div>

                    <div className="text-sm text-gray-600 mb-3">
                      <p>
                        Choice:{" "}
                        <span className="font-medium text-purple-600">
                          {option.choice === "P"
                            ? "Positive (Yes)"
                            : "Negative (No)"}
                        </span>
                      </p>
                      <p>Checklist Item: {option.checklist_item}</p>
                    </div>

                    <button
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded transition-colors"
                      onClick={() => navigateToOption(option)}
                    >
                      View Option Details
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Option Detail View */}
        {currentView === "option" && selectedOption && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">
              ⚙️ Option: {selectedOption.name}
            </h3>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <strong>ID:</strong> {selectedOption.id}
                </div>
                <div>
                  <strong>Name:</strong> {selectedOption.name}
                </div>
                <div>
                  <strong>Choice:</strong>{" "}
                  <span className="text-purple-600 font-medium">
                    {selectedOption.choice === "P"
                      ? "Positive (Yes)"
                      : "Negative (No)"}
                  </span>
                </div>
                <div>
                  <strong>Checklist Item:</strong>{" "}
                  {selectedOption.checklist_item}
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                This is the deepest level of detail available.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default PendingInspectorChecklists;
