import React, { useEffect, useState } from "react";
import SiteBarHome from "./SiteBarHome";
import { projectInstance, NEWchecklistInstance } from "../api/axiosInstance";

function PendingForMakerItems() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [error, setError] = useState(null);

  // Pending items state
  const [pendingItems, setPendingItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [itemsError, setItemsError] = useState(null);

  // Grouping state
  const [groupBy, setGroupBy] = useState("checklist"); // 'checklist' | 'status' | 'none'
  const [expandedGroups, setExpandedGroups] = useState({});

  // Item states for submission
  const [itemStates, setItemStates] = useState({});
  // Structure: {
  //   [itemId]: {
  //     remarks: '',
  //     photoFile: null,
  //     photoPreview: null,
  //     isSubmitting: false,
  //     submitted: false,
  //     error: null
  //   }
  // }

  // Get user/maker accesses from localStorage
  const accessesStr = localStorage.getItem("ACCESSES");
  const accesses = accessesStr ? JSON.parse(accessesStr) : [];

  // Initialize item states
  const initializeItemStates = (items) => {
    const newStates = {};
    items.forEach((item) => {
      if (!itemStates[item.id]) {
        newStates[item.id] = {
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

  // Fetch pending for maker items
  const fetchPendingItems = async () => {
    if (!selectedProjectId) {
      setPendingItems([]);
      return;
    }

    setLoadingItems(true);
    setItemsError(null);
    try {
      const res = await NEWchecklistInstance.get(`/pending-for-maker/`, {
        params: { project_id: selectedProjectId },
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      });

      const items = Array.isArray(res.data) ? res.data : [];
      setPendingItems(items);
      initializeItemStates(items);
    } catch (err) {
      console.error("Pending items fetch error:", err);
      setItemsError("Failed to load pending items");
      setPendingItems([]);
    } finally {
      setLoadingItems(false);
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
          : res.data.results || [];

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

  // Fetch pending items when project changes
  useEffect(() => {
    fetchPendingItems();
    setExpandedGroups({});
  }, [selectedProjectId]);

  // Group items by checklist
  const getGroupedItems = () => {
    if (groupBy === "none") {
      return { "All Items": pendingItems };
    }

    const grouped = {};
    pendingItems.forEach((item) => {
      let key;
      if (groupBy === "checklist") {
        key = item.checklist_details?.name || `Checklist ${item.checklist}`;
      } else if (groupBy === "status") {
        key = item.status || "Unknown Status";
      }

      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
    });
    return grouped;
  };

  // Toggle group expansion
  const toggleGroup = (groupName) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
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

  // Submit item (maker submission)
  const submitItem = async (itemId) => {
    const itemState = itemStates[itemId];
    const item = pendingItems.find((i) => i.id === itemId);

    // Validation - removed photo requirement check since API doesn't handle photos
    if (!itemState?.remarks?.trim()) {
      setItemStates((prev) => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          error: "Please provide fix description/remarks",
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
      // Call the mark-as-done-maker API
      const response = await NEWchecklistInstance.post(
        "/mark-as-done-maker/",
        {
          checklist_item_id: itemId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
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

      // Log the response for debugging
      console.log("Maker submission response:", response.data);

      // Refresh the list after a short delay
      setTimeout(() => {
        fetchPendingItems();
      }, 2000);
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

  // Get statistics
  const getStats = () => {
    const total = pendingItems.length;
    const submitted = Object.values(itemStates).filter(
      (s) => s.submitted
    ).length;
    const withPhotos = Object.values(itemStates).filter(
      (s) => s.photoFile
    ).length;
    return { total, submitted, pending: total - submitted, withPhotos };
  };

  const stats = getStats();
  const groupedItems = getGroupedItems();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SiteBarHome />
      <main className="ml-[15%] w-full p-6">
        <h2 className="text-2xl font-bold mb-4">
          Pending for Maker - Fix Required Items
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
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold mb-2">Selected Project:</h3>
                <p>Project ID: {selectedProjectId}</p>
                <p>
                  Project Name:{" "}
                  {projects.find((p) => p.id === selectedProjectId)?.name ||
                    "N/A"}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm bg-orange-100 rounded-lg px-3 py-2">
                  <span className="font-medium">Items to Fix: </span>
                  <span className="text-orange-600 font-bold">
                    {stats.total}
                  </span>
                  {stats.submitted > 0 && (
                    <>
                      <span className="mx-1">|</span>
                      <span className="text-green-600">
                        {stats.submitted} submitted
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Grouping Controls */}
        <div className="mb-4 flex items-center gap-4">
          <label className="font-medium">Group by:</label>
          <div className="flex gap-2">
            <button
              onClick={() => setGroupBy("checklist")}
              className={`px-3 py-1 rounded ${
                groupBy === "checklist"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              Checklist
            </button>
            <button
              onClick={() => setGroupBy("status")}
              className={`px-3 py-1 rounded ${
                groupBy === "status"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              Status
            </button>
            <button
              onClick={() => setGroupBy("none")}
              className={`px-3 py-1 rounded ${
                groupBy === "none"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              No Grouping
            </button>
          </div>
        </div>

        {/* Main Content */}
        {loadingItems ? (
          <div className="bg-white rounded-lg shadow p-6">
            <p>Loading pending items...</p>
          </div>
        ) : itemsError ? (
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-red-500">{itemsError}</p>
          </div>
        ) : pendingItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600">No pending items for this project.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedItems).map(([groupName, items]) => (
              <div key={groupName} className="bg-white rounded-lg shadow">
                {/* Group Header */}
                {groupBy !== "none" && (
                  <div
                    className="px-6 py-4 border-b cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleGroup(groupName)}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <svg
                          className={`w-5 h-5 transition-transform ${
                            expandedGroups[groupName] ? "rotate-90" : ""
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {groupName}
                      </h3>
                      <span className="text-sm text-gray-600">
                        {items.length} item{items.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                )}

                {/* Group Items */}
                {(groupBy === "none" || expandedGroups[groupName]) && (
                  <div className="p-6 space-y-4">
                    {items.map((item, index) => {
                      const itemState = itemStates[item.id] || {};
                      const isSubmitted = itemState.submitted;
                      const lastSubmission = item.submissions?.find(
                        (sub) =>
                          sub.status === "rejected_by_checker" ||
                          sub.status === "rejected_by_supervisor"
                      );

                      return (
                        <div
                          key={item.id}
                          className={`border-2 rounded-lg p-4 transition-all ${
                            isSubmitted
                              ? "border-green-300 bg-green-50"
                              : "border-red-300 bg-red-50"
                          }`}
                        >
                          {/* Item Header */}
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h5 className="font-semibold text-lg flex items-center gap-2">
                                <span className="bg-red-600 text-white px-2 py-1 rounded text-xs">
                                  Fix Required
                                </span>
                                {item.title || `Item ${item.id}`}
                                {isSubmitted && (
                                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                                    ✓ Fixed & Submitted
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
                                    {item.photo_required
                                      ? "Required"
                                      : "Optional"}
                                  </span>
                                </span>
                                {item.checklist_details?.name && (
                                  <>
                                    <span className="mx-2">•</span>
                                    <span>
                                      Checklist: {item.checklist_details.name}
                                    </span>
                                  </>
                                )}
                              </div>
                              {item.description && (
                                <p className="text-sm text-gray-700 mt-2 italic">
                                  {item.description}
                                </p>
                              )}
                            </div>
                            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs ml-4">
                              ID: {item.id}
                            </span>
                          </div>

                          {/* Rejection Details */}
                          {lastSubmission && (
                            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                              <h6 className="font-semibold text-sm mb-1">
                                Rejection Details:
                              </h6>
                              <div className="text-sm text-gray-700">
                                <p>
                                  <strong>Rejected by:</strong>{" "}
                                  {lastSubmission.status ===
                                  "rejected_by_checker"
                                    ? "Checker"
                                    : "Supervisor"}
                                </p>
                                {lastSubmission.remarks && (
                                  <p>
                                    <strong>Reason:</strong>{" "}
                                    {lastSubmission.remarks}
                                  </p>
                                )}
                                {lastSubmission.checked_at && (
                                  <p>
                                    <strong>Date:</strong>{" "}
                                    {new Date(
                                      lastSubmission.checked_at
                                    ).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {!isSubmitted ? (
                            <>
                              {/* Fix Description */}
                              <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Fix Description / Remarks
                                  <span className="text-red-600 ml-1">*</span>
                                </label>
                                <textarea
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  rows="3"
                                  placeholder="Describe what you fixed or changed..."
                                  value={itemState.remarks || ""}
                                  onChange={(e) =>
                                    handleRemarksChange(item.id, e.target.value)
                                  }
                                  required
                                />
                              </div>

                              {/* Photo Upload */}
                              <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Photo of Fixed Work
                                  {item.photo_required && (
                                    <span className="text-red-600 ml-1">
                                      *Required
                                    </span>
                                  )}
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
                                        Click to upload photo of fixed work
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

                              {/* Error Message */}
                              {itemState.error && (
                                <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
                                  {itemState.error}
                                </div>
                              )}

                              {/* Submit Button */}
                              <div className="flex justify-end gap-3">
                                <button
                                  onClick={() => submitItem(item.id)}
                                  disabled={
                                    itemState.isSubmitting ||
                                    !itemState.remarks?.trim()
                                  }
                                  className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                                    itemState.isSubmitting
                                      ? "bg-gray-400 cursor-not-allowed"
                                      : !itemState.remarks?.trim()
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
                                      Submitting Fix...
                                    </span>
                                  ) : (
                                    "Submit Fixed Item"
                                  )}
                                </button>
                              </div>
                            </>
                          ) : (
                            <div className="text-center py-4">
                              <div className="text-green-600 font-semibold text-lg mb-2">
                                ✓ Fix Submitted Successfully
                              </div>
                              <p className="text-sm text-gray-600">
                                This item has been fixed and resubmitted for
                                review.
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {stats.total > 0 && (
          <div className="mt-6 p-4 bg-orange-50 rounded-lg">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-700">
                <strong>Summary:</strong> {stats.submitted} of {stats.total}{" "}
                items fixed
                {stats.pending > 0 && ` • ${stats.pending} remaining`}
              </div>
              {stats.submitted === stats.total && (
                <div className="text-green-600 font-semibold">
                  ✓ All items have been fixed!
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default PendingForMakerItems;
