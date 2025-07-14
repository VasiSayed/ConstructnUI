import { useState, useEffect } from "react";
import ChecklistForm from "./ChecklistForm";
import Checklistdetails from "./ChecklistDetails";
import SideBarSetup from "../../components/SideBarSetup";
import UserSelectionTable from "../../components/UserSelectionTable"; // Update import
import {
  getProjectsByOwnership,
  getchecklistbyProject,
  getMyChecklists,
  deleteChecklistById, // Add this
} from "../../api";
// import { showToast } from "../../utils/toast";

import { showToast } from "../../utils/toast";
import { useTheme } from "../../ThemeContext"; // <-- make sure path is correct

const Checklist = () => {
  const { theme } = useTheme();
  // --- Theme Palette ---
  const palette =
    theme === "dark"
      ? {
          bg: "#191921",
          card: "bg-[#23232e]",
          text: "text-amber-200",
          border: "border-[#facc1530]",
          input: "bg-[#181820] text-amber-200",
          tableHead: "bg-[#181820] text-[#facc15]",
          trHover: "hover:bg-[#23232e]",
          shadow: "shadow-xl",
          btn: "bg-purple-700 text-white hover:bg-purple-800",
          btnSec: "bg-gray-600 text-amber-100 hover:bg-gray-700",
          badge: "bg-[#fde047] text-[#181820]",
        }
      : {
          bg: "#f7f8fa",
          card: "bg-white",
          text: "text-[#22223b]",
          border: "border-[#ececf0]",
          input: "bg-white text-[#22223b]",
          tableHead: "bg-[#f6f8fd] text-[#9aa2bc]",
          trHover: "hover:bg-[#f6f8fd]",
          shadow: "shadow",
          btn: "bg-purple-700 text-white hover:bg-purple-800",
          btnSec: "bg-gray-500 text-white hover:bg-gray-600",
          badge: "bg-[#4375e8] text-white",
        };

  // ... your existing state logic
  const [userData, setUserData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [checklistData, setChecklistData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [detailForm, setDetailForm] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState(null);

  const [showUserSelection, setShowUserSelection] = useState(false);
  const [userAccessProjectId, setUserAccessProjectId] = useState(null);
  const [userAccessCategoryId, setUserAccessCategoryId] = useState(null);
  const [currentChecklistId, setCurrentChecklistId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [checklistToDelete, setChecklistToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter checklist data by selected project, or show all if not selected
  const filteredChecklistData = selectedProjectId
    ? checklistData.filter(
        (item) => String(item.project_id) === String(selectedProjectId)
      )
    : checklistData;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredChecklistData.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredChecklistData.length / itemsPerPage);

  useEffect(() => {
    const userString = localStorage.getItem("USER_DATA");
    if (userString && userString !== "undefined") {
      setUserData(JSON.parse(userString));
    }
  }, []);

  useEffect(() => {
    // Adjust this according to how your userData structure is!
    if (!userData) return;

    // Prefer entity > company > organization (or customize as needed)
    const entity_id = userData.entity_id || null;
    const company_id = userData.company_id || null;
    const organization_id = userData.org || userData.organization_id || null;

    // Only call if we have some ownership info
    if (!entity_id && !company_id && !organization_id) return;

    const fetchProjects = async () => {
      try {
        const response = await getProjectsByOwnership({
          entity_id,
          company_id,
          organization_id,
        });
        if (response.status === 200) {
          setProjects(response.data || []);
        } else {
          setProjects([]);
          showToast("Failed to fetch projects.", "error");
        }
      } catch (err) {
        setProjects([]);

        showToast("Failed to fetch projects.", "error");
      }
    };
    fetchProjects();
  }, [userData]);

  useEffect(() => {
    // Fetch "my checklists" if no project is selected
    if (!selectedProjectId) {
      const fetchMyChecklists = async () => {
        try {
          const response = await getMyChecklists();
          if (response.status === 200) {
            setChecklistData(response.data || []);
          } else {
            setChecklistData([]);
            showToast("Failed to fetch your checklists.", "error");
          }
        } catch (err) {
          setChecklistData([]);
          showToast("Failed to fetch your checklists.", "error");
        }
      };
      fetchMyChecklists();
    }
  }, [selectedProjectId]);

  // useEffect(() => {
  //   if (!selectedProjectId) {
  //     setChecklistData([]);
  //     return;
  //   }
  //   const fetchChecklists = async () => {
  //     try {
  //       const response = await getchecklistbyProject(selectedProjectId);
  //       if (response.status === 200) {
  //         setChecklistData(response.data || []);
  //       } else {
  //         setChecklistData([]);
  //         showToast("Failed to fetch checklists.", "error");
  //       }
  //     } catch (err) {
  //       setChecklistData([]);
  //       showToast("Failed to fetch checklists.", "error");
  //     }
  //   };
  //   fetchChecklists();
  // }, [selectedProjectId, showForm, detailForm]);

  const handleChecklistCreated = (newChecklist) => {
    if (
      newChecklist.project_id &&
      newChecklist.category_id &&
      newChecklist.id
    ) {
      setUserAccessProjectId(newChecklist.project_id);
      setUserAccessCategoryId(newChecklist.category_id);
      setCurrentChecklistId(newChecklist.id);
      setShowUserSelection(true);
      setRefreshTrigger((prev) => prev + 1);

      console.log("🔄 State updated - showUserSelection should be true");
      showToast(
        "Checklist created! Assign users to this checklist.",
        "success"
      );
    } else {
      console.log("❌ Missing project_id, category_id, or id:", newChecklist);
    }
  };

  const hideUserSelection = () => {
    setShowUserSelection(false);
    setUserAccessProjectId(null);
    setUserAccessCategoryId(null);
    setCurrentChecklistId(null);
  };

  const handleSendUsers = async (selectedUserIds, usersByRole, checklistId) => {
    console.log("📤 Assigning users to checklist:", selectedUserIds);
    console.log("📋 Users by role:", usersByRole);
    console.log("📝 Checklist ID:", checklistId);

    try {
      // Success message already handled in UserSelectionTable
      showToast(
        `Successfully assigned ${selectedUserIds.length} users to checklist!`,
        "success"
      );

      // Optionally hide the selection after assigning
      // hideUserSelection();
    } catch (error) {
      console.error("Error in parent handler:", error);
      // Error already handled in UserSelectionTable
      throw error;
    }
  };

  const renderPagination = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-1 rounded ${
            i === currentPage ? palette.btn : "bg-gray-200"
          }`}
        >
          {i}
        </button>
      );
    }
    return pageNumbers;
  };

  if (!userData) return <div>Loading...</div>;
  if (showForm) {
    return (
      <ChecklistForm
        setShowForm={setShowForm}
        checklist={selectedChecklist}
        projectOptions={projects}
        onChecklistCreated={handleChecklistCreated}
      />
    );
  } else if (detailForm && selectedChecklist) {
    return (
      <Checklistdetails
        setShowForm={setShowForm}
        setDetailForm={setDetailForm}
        checklist={selectedChecklist}
        projectId={selectedProjectId}
      />
    );
  }

  // Handle delete button click
  const handleDeleteClick = (checklist) => {
    setChecklistToDelete(checklist);
    setShowDeleteConfirm(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!checklistToDelete) return;

    setIsDeleting(true);
    try {
      await deleteChecklistById(checklistToDelete.id);

      // Remove from local state
      setChecklistData((prev) =>
        prev.filter((item) => item.id !== checklistToDelete.id)
      );

      showToast(
        `Checklist "${checklistToDelete.name}" deleted successfully!`,
        "success"
      );

      // Close modal
      setShowDeleteConfirm(false);
      setChecklistToDelete(null);
    } catch (error) {
      console.error("Error deleting checklist:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to delete checklist";
      showToast(errorMessage, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle delete cancellation
  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setChecklistToDelete(null);
  };

  return (
    <div className="flex min-h-screen" style={{ background: palette.bg }}>
      <SideBarSetup />
      <div className="my-5 w-[85%] mt-5 ml-[16%] mr-[1%]">
        <div
          className={`max-w-7xl mx-auto p-6 rounded-lg ${palette.card} ${palette.shadow}`}
        >
          <h1 className={`text-2xl font-bold mb-4 ${palette.text}`}>
            Checklist
          </h1>

          {/* Project Dropdown */}
          <div className="mb-4">
            <label className={`block text-lg font-medium mb-2 ${palette.text}`}>
              Select Project:
            </label>
            <select
              className={`p-2 border rounded w-1/2 ${palette.input} ${palette.border}`}
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
            >
              <option value="">-- Select Project --</option>
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id}>
                  {proj.name}
                </option>
              ))}
            </select>
          </div>

          {/* Add Checklist Button */}
          <div className="flex items-center gap-4 mb-4">
            <button
              className={`px-4 py-2 rounded ${palette.btn}`}
              onClick={() => {
                setSelectedChecklist(null);
                setShowForm(true);
                hideUserSelection();
              }}
            >
              + Add Checklist
            </button>
            {showUserSelection && (
              <button
                className={`px-4 py-2 rounded ${palette.btnSec}`}
                onClick={hideUserSelection}
              >
                Hide User Selection
              </button>
            )}
          </div>

          {/* User Selection Table */}
          {showUserSelection &&
            userAccessProjectId &&
            userAccessCategoryId &&
            currentChecklistId && (
              <div className="mb-6">
                <div
                  className="border rounded-lg p-4 mb-4"
                  style={{ background: "#283a16" }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="text-green-400 mr-2">✅</div>
                      <div>
                        <h3 className="text-green-100 font-medium">
                          Checklist Created Successfully!
                        </h3>
                        <p className="text-green-300 text-sm">
                          Assign specific users below to handle this checklist.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={hideUserSelection}
                      className="text-green-200 hover:text-green-100 text-xl"
                    >
                      ×
                    </button>
                  </div>
                </div>
                <UserSelectionTable
                  projectId={userAccessProjectId}
                  categoryId={userAccessCategoryId}
                  checklistId={currentChecklistId}
                  refreshTrigger={refreshTrigger}
                  onSendUsers={handleSendUsers}
                />
              </div>
            )}

          {/* Checklist Table */}
          <div className="overflow-x-auto">
            <table
              className="min-w-full rounded"
              style={{ borderCollapse: "separate", borderSpacing: 0 }}
            >
              <thead className={palette.tableHead}>
                <tr>
                  <th className="font-semibold p-2 text-left">ID</th>
                  <th className="font-semibold p-2 text-left">Name</th>
                  <th className="font-semibold p-2 text-left">No. of Ques</th>
                  <th className="font-semibold p-2 text-left">View</th>
                  <th className="font-semibold p-2 text-left">Edit</th>
                  <th className="font-semibold p-2 text-left">Access</th>
                  <th className="font-semibold p-2 text-left">Delete</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((item) => (
                    <tr key={item.id} className={palette.trHover}>
                      <td className={`p-2 ${palette.text}`}>{item.id}</td>
                      <td className={`p-2 ${palette.text}`}>
                        {item.name || item.random_num}
                      </td>
                      <td className={`p-2 ${palette.text}`}>
                        {item.questions?.length || 0}
                      </td>
                      <td className="p-2">
                        <button
                          className="bg-gray-200 px-2 py-1 rounded"
                          onClick={() => {
                            setSelectedChecklist(item);
                            setDetailForm(true);
                          }}
                        >
                          👁
                        </button>
                      </td>
                      <td className="p-2">
                        <button
                          className="bg-gray-200 px-2 py-1 rounded"
                          onClick={() => {
                            setSelectedChecklist(item);
                            setShowForm(true);
                          }}
                        >
                          ✎
                        </button>
                      </td>
                      <td className="p-2">
                        <button
                          className="bg-blue-200 px-2 py-1 rounded text-sm"
                          onClick={() => {
                            if (item.project_id && item.category_id) {
                              setUserAccessProjectId(item.project_id);
                              setUserAccessCategoryId(item.category_id);
                              setCurrentChecklistId(item.id);
                              setShowUserSelection(true);
                              setRefreshTrigger((prev) => prev + 1);
                            } else {
                              showToast(
                                "Project or Category ID not found for this checklist",
                                "error"
                              );
                            }
                          }}
                        >
                          👥 Assign Users
                        </button>
                      </td>
                      <td className="p-2">
                        <button
                          className="bg-red-200 hover:bg-red-300 px-2 py-1 rounded text-sm transition-colors"
                          onClick={() => handleDeleteClick(item)}
                          title="Delete Checklist"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className={`text-center py-4 ${palette.text}`}
                    >
                      No checklists found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="mt-4 flex justify-start gap-2">
            {renderPagination()}
          </div>
        </div>
        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div
              className={`${palette.card} rounded-lg p-6 max-w-md w-full mx-4 ${palette.shadow}`}
            >
              <div className="text-center">
                {/* Warning Icon */}
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <svg
                    className="h-6 w-6 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>

                {/* Title */}
                <h3 className={`text-lg font-medium ${palette.text} mb-2`}>
                  Delete Checklist
                </h3>

                {/* Message */}
                <p className={`text-sm ${palette.text} opacity-80 mb-2`}>
                  Are you sure you want to delete this checklist?
                </p>

                {/* Checklist Info */}
                {checklistToDelete && (
                  <div
                    className={`bg-red-50 border border-red-200 rounded p-3 mb-4`}
                  >
                    <p className="text-red-800 font-medium">
                      "
                      {checklistToDelete.name ||
                        `Checklist ${checklistToDelete.id}`}
                      "
                    </p>
                    <p className="text-red-600 text-sm">
                      This action cannot be undone. All questions and data will
                      be permanently removed.
                    </p>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleDeleteCancel}
                    disabled={isDeleting}
                    className={`px-4 py-2 rounded ${palette.btnSec} transition-colors disabled:opacity-50`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    disabled={isDeleting}
                    className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isDeleting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Deleting...
                      </>
                    ) : (
                      "Yes, Delete"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checklist;