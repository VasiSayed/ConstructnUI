import { useState, useEffect } from "react";
import ChecklistForm from "./ChecklistForm";
import Checklistdetails from "./ChecklistDetails";
import SideBarSetup from "../../components/SideBarSetup";
import UserSelectionTable from "../../components/UserSelectionTable"; // Update import
import {
  getProjectsByOwnership,
  getchecklistbyProject,
  getMyChecklists,
} from "../../api";
// import { showToast } from "../../utils/toast";
import { showToast } from "../../utils/toast";


const Checklist = () => {
  const [userData, setUserData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [checklistData, setChecklistData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [detailForm, setDetailForm] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState(null);

  // New state for UserSelectionTable
  const [showUserSelection, setShowUserSelection] = useState(false);
  const [userAccessProjectId, setUserAccessProjectId] = useState(null);
  const [userAccessCategoryId, setUserAccessCategoryId] = useState(null);
  const [currentChecklistId, setCurrentChecklistId] = useState(null); // Add this
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // pagination
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

  // Get userData from localStorage on mount
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

  // Function to handle checklist creation success
  const handleChecklistCreated = (newChecklist) => {
    console.log("🎯 handleChecklistCreated called with:", newChecklist);
    console.log("Checklist created successfully:", newChecklist);

    // Show user selection with the created checklist's project and category
    if (
      newChecklist.project_id &&
      newChecklist.category_id &&
      newChecklist.id
    ) {
      console.log("✅ Setting user access data:", {
        projectId: newChecklist.project_id,
        categoryId: newChecklist.category_id,
        checklistId: newChecklist.id,
      });

      setUserAccessProjectId(newChecklist.project_id);
      setUserAccessCategoryId(newChecklist.category_id);
      setCurrentChecklistId(newChecklist.id); // Set the checklist ID
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

  // Function to hide user selection
  const hideUserSelection = () => {
    setShowUserSelection(false);
    setUserAccessProjectId(null);
    setUserAccessCategoryId(null);
    setCurrentChecklistId(null); // Reset checklist ID
  };

  // Function to handle sending users
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

  // Pagination render
  const renderPagination = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-1 rounded ${
            i === currentPage ? "bg-purple-700 text-white" : "bg-gray-200"
          }`}
        >
          {i}
        </button>
      );
    }
    return pageNumbers;
  };

  // Early loading state
  if (!userData) return <div>Loading...</div>;

  // Form modals
  if (showForm) {
    return (
      <ChecklistForm
        setShowForm={setShowForm}
        checklist={selectedChecklist}
        projectOptions={projects}
        onChecklistCreated={handleChecklistCreated} // Pass callback function
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

  return (
    <div className="flex">
      <SideBarSetup />
      <div className="my-5 w-[85%] mt-5 ml-[16%] mr-[1%]">
        <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Checklist</h1>

          {/* Project Dropdown */}
          <div className="mb-4">
            <label className="block text-lg font-medium mb-2">
              Select Project:
            </label>
            <select
              className="p-2 border border-gray-300 rounded w-1/2"
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
              className="bg-purple-700 text-white px-4 py-2 rounded"
              onClick={() => {
                setSelectedChecklist(null);
                setShowForm(true);
                hideUserSelection(); // Hide user selection when creating new checklist
              }}
            >
              + Add Checklist
            </button>

            {/* Hide User Selection Button (shown when user selection is visible) */}
            {showUserSelection && (
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded"
                onClick={hideUserSelection}
              >
                Hide User Selection
              </button>
            )}
          </div>

          {/* User Selection Table - Shows after checklist creation */}
          {showUserSelection &&
            userAccessProjectId &&
            userAccessCategoryId &&
            currentChecklistId && (
              <div className="mb-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="text-green-500 mr-2">✅</div>
                      <div>
                        <h3 className="text-green-800 font-medium">
                          Checklist Created Successfully!
                        </h3>
                        <p className="text-green-600 text-sm">
                          Assign specific users below to handle this checklist.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={hideUserSelection}
                      className="text-green-600 hover:text-green-800 text-xl"
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

          {/* Debug info */}
          {console.log(
            "🎨 Rendering - showUserSelection:",
            showUserSelection,
            "projectId:",
            userAccessProjectId,
            "categoryId:",
            userAccessCategoryId
          )}

          <table className="min-w-full bg-white shadow rounded">
            <thead className="bg-gray-200">
              <tr>
                <th className="font-semibold p-2 text-left">ID</th>
                <th className="font-semibold p-2 text-left">Name</th>
                <th className="font-semibold p-2 text-left">Status</th>
                <th className="font-semibold p-2 text-left">Project ID</th>
                <th className="font-semibold p-2 text-left">Category</th>
                <th className="font-semibold p-2 text-left">Purpose ID</th>
                <th className="font-semibold p-2 text-left">Created By</th>
                <th className="font-semibold p-2 text-left">Created At</th>
                <th className="font-semibold p-2 text-left">No. of Ques</th>
                <th className="font-semibold p-2 text-left">View</th>
                <th className="font-semibold p-2 text-left">Edit</th>
                <th className="font-semibold p-2 text-left">Access</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="p-2">{item.id}</td>
                    <td className="p-2">{item.name || item.random_num}</td>
                    <td className="p-2 capitalize">{item.status}</td>
                    <td className="p-2">{item.project_id}</td>
                    <td className="p-2">{item.category}</td>
                    <td className="p-2">{item.purpose_id}</td>
                    <td className="p-2">{item.created_by_id}</td>
                    <td className="p-2">
                      {item.created_at
                        ? new Date(item.created_at).toLocaleString()
                        : ""}
                    </td>
                    <td className="p-2">
                      {item.items?.length ?? item.questions?.length ?? 0}
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
                          if (item.project_id && item.category) {
                            setUserAccessProjectId(item.project_id);
                            setUserAccessCategoryId(item.category);
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={12} className="text-center py-4 text-gray-500">
                    No checklists found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="mt-4 flex justify-start gap-2">
            {renderPagination()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checklist;
