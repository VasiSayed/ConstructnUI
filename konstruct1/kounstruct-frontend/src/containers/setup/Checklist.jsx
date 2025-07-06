import { useState, useEffect } from "react";
import ChecklistForm from "./ChecklistForm";
import Checklistdetails from "./ChecklistDetails";
import SideBarSetup from "../../components/SideBarSetup";
import { toast } from "react-hot-toast";
import { getProjectsByOrganization, getchecklistbyProject } from "../../api";

const Checklist = () => {
  const [userData, setUserData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [checklistData, setChecklistData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [detailForm, setDetailForm] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState(null);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = checklistData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(checklistData.length / itemsPerPage);

  // Get userData from localStorage on mount
  useEffect(() => {
    const userString = localStorage.getItem("USER_DATA");
    if (userString && userString !== "undefined") {
      setUserData(JSON.parse(userString));
    }
  }, []);

  // Fetch projects ONCE when userData is ready
  useEffect(() => {
    if (!userData?.org) return;
    const fetchProjects = async () => {
      try {
        const response = await getProjectsByOrganization(userData.org);
        if (response.status === 200) {
          setProjects(response.data || []);
        } else {
          toast.error("Failed to fetch projects.");
        }
      } catch (err) {
        toast.error("Failed to fetch projects.");
      }
    };
    fetchProjects();
  }, [userData]);

  // Fetch checklists when project changes
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
          toast.error("Failed to fetch checklists.");
        }
      } catch (err) {
        setChecklistData([]);
        toast.error("Failed to fetch checklists.");
      }
    };
    fetchChecklists();
  }, [selectedProjectId, showForm, detailForm]);

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
        projectOptions={projects} // All projects array (no preselected project)
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
              }}
            >
              + Add Checklist
            </button>
          </div>

          {/* Checklist Table */}
          <table className="min-w-full bg-white shadow rounded">
            <thead className="bg-gray-200">
              <tr>
                <th className="font-semibold p-2 text-left">ID</th>
                <th className="font-semibold p-2 text-left">Name</th>
                <th className="font-semibold p-2 text-left">No. of Ques</th>
                <th className="font-semibold p-2 text-left">View</th>
                <th className="font-semibold p-2 text-left">Edit</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="p-2">{item.id}</td>
                    <td className="p-2">{item.name || item.random_num}</td>
                    <td className="p-2">{item.questions?.length || 0}</td>
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500">
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
