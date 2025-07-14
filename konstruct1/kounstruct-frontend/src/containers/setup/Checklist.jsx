import { useState, useEffect } from "react";
import ChecklistForm from "./ChecklistForm";
import Checklistdetails from "./ChecklistDetails";
import SideBarSetup from "../../components/SideBarSetup";
import UserSelectionTable from "../../components/UserSelectionTable";
import { getProjectsByOrganization, getchecklistbyProject } from "../../api";
import { showToast } from "../../utils/toast";
import { useTheme } from "../../ThemeContext"; // <-- make sure path is correct

const Checklist = () => {
  const { theme } = useTheme();
  // --- Theme Palette ---
  const palette = theme === "dark"
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
        badge: "bg-[#fde047] text-[#181820]"
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
        badge: "bg-[#4375e8] text-white"
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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = checklistData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(checklistData.length / itemsPerPage);

  useEffect(() => {
    const userString = localStorage.getItem("USER_DATA");
    if (userString && userString !== "undefined") {
      setUserData(JSON.parse(userString));
    }
  }, []);

  useEffect(() => {
    if (!userData?.org) return;
    const fetchProjects = async () => {
      try {
        const response = await getProjectsByOrganization(userData.org);
        if (response.status === 200) {
          setProjects(response.data || []);
        } else {
          showToast("Failed to fetch projects.", "error");
        }
      } catch (err) {
        showToast("Failed to fetch projects.", "error");
      }
    };
    fetchProjects();
  }, [userData]);

  useEffect(() => {
    if (!selectedProjectId) {
      setChecklistData([]);
      return;
    }
    const fetchChecklists = async () => {
      try {
        const response = await getchecklistbyProject(selectedProjectId);
        if (response.status === 200) {
          setChecklistData(response.data || []);
        } else {
          setChecklistData([]);
          showToast("Failed to fetch checklists.", "error");
        }
      } catch (err) {
        setChecklistData([]);
        showToast("Failed to fetch checklists.", "error");
      }
    };
    fetchChecklists();
  }, [selectedProjectId, showForm, detailForm]);

  const handleChecklistCreated = (newChecklist) => {
    if (newChecklist.project_id && newChecklist.category_id && newChecklist.id) {
      setUserAccessProjectId(newChecklist.project_id);
      setUserAccessCategoryId(newChecklist.category_id);
      setCurrentChecklistId(newChecklist.id);
      setShowUserSelection(true);
      setRefreshTrigger((prev) => prev + 1);
      showToast("Checklist created! Assign users to this checklist.", "success");
    }
  };

  const hideUserSelection = () => {
    setShowUserSelection(false);
    setUserAccessProjectId(null);
    setUserAccessCategoryId(null);
    setCurrentChecklistId(null);
  };

  const handleSendUsers = async (selectedUserIds, usersByRole, checklistId) => {
    showToast(`Successfully assigned ${selectedUserIds.length} users to checklist!`, "success");
  };

  const renderPagination = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-1 rounded ${i === currentPage ? palette.btn : "bg-gray-200"}`}
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

  return (
    <div className="flex min-h-screen" style={{ background: palette.bg }}>
      <SideBarSetup />
      <div className="my-5 w-[85%] mt-5 ml-[16%] mr-[1%]">
        <div className={`max-w-7xl mx-auto p-6 rounded-lg ${palette.card} ${palette.shadow}`}>
          <h1 className={`text-2xl font-bold mb-4 ${palette.text}`}>Checklist</h1>

          {/* Project Dropdown */}
          <div className="mb-4">
            <label className={`block text-lg font-medium mb-2 ${palette.text}`}>Select Project:</label>
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
          {showUserSelection && userAccessProjectId && userAccessCategoryId && currentChecklistId && (
            <div className="mb-6">
              <div className="border rounded-lg p-4 mb-4" style={{ background: "#283a16" }}>
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
                  <button onClick={hideUserSelection} className="text-green-200 hover:text-green-100 text-xl">
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
            <table className="min-w-full rounded" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
              <thead className={palette.tableHead}>
                <tr>
                  <th className="font-semibold p-2 text-left">ID</th>
                  <th className="font-semibold p-2 text-left">Name</th>
                  <th className="font-semibold p-2 text-left">No. of Ques</th>
                  <th className="font-semibold p-2 text-left">View</th>
                  <th className="font-semibold p-2 text-left">Edit</th>
                  <th className="font-semibold p-2 text-left">Access</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((item) => (
                    <tr key={item.id} className={palette.trHover}>
                      <td className={`p-2 ${palette.text}`}>{item.id}</td>
                      <td className={`p-2 ${palette.text}`}>{item.name || item.random_num}</td>
                      <td className={`p-2 ${palette.text}`}>{item.questions?.length || 0}</td>
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
                              showToast("Project or Category ID not found for this checklist", "error");
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
                    <td colSpan={6} className={`text-center py-4 ${palette.text}`}>
                      No checklists found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="mt-4 flex justify-start gap-2">{renderPagination()}</div>
        </div>
      </div>
    </div>
  );
};

export default Checklist;
