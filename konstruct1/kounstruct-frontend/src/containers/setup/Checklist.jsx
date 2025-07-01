import { useState, useEffect } from "react";
import ChecklistForm from "./ChecklistForm";
import Checklistdetails from "./ChecklistDetails";
import Modal from "../../Modal";
import ChecklistMapping from "./ChecklistMapping";
// import { FaFileDownload, FaHome, FaTimes } from "react-icons/fa";
import {
  createChecklistCategory,
  getChecklistCategories,
  createChecklistSubCategory,
  getChecklistSubCategories,
  getChecklistDetails,
} from "../../api";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import SideBarSetup from "../../components/SideBarSetup";
import { Link } from "react-router-dom";

const Checklist = ({ setCurrentStep }) => {
  const organizationId = useSelector((state) => state.user.organization.id);

  const [categoryModal, setCategoryModal] = useState(false);
  const [subCategoryModal, setSubCategoryModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [detailForm, setDetailForm] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [subCategoryName, setSubCategoryName] = useState("");
  const [subCategoryOptions, setSubCategoryOptions] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [checklistData, setChecklistData] = useState([]);
  const [mappingSelectedId, setMappingSelectedId] = useState(null);

  //pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = checklistData.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Calculate the total pages
  const totalPages = Math.ceil(checklistData.length / itemsPerPage);

  // Render Pagination Controls
  const renderPagination = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => paginate(i)}
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

  const getCategoriesOptions = async () => {
    const response = await getChecklistCategories(organizationId);
    console.log(response, "RESPONSE");
    if (response.status === 200) {
      setCategoryOptions(response.data.data["Checklist Category"]);
    } else {
      toast.error(response.data.message);
    }
  };

  const getSubCategoriesOptions = async () => {
    const response = await getChecklistSubCategories(organizationId);
    console.log(response, "RESPONSE");
    if (response.status === 200) {
      setSubCategoryOptions(response.data.data["sub category"]);
    } else {
      toast.error(response.data.message);
    }
  };

  const getChecklistList = async () => {
    const response = await getChecklistDetails(organizationId);
    console.log(response.data.data.checklist_frames);
    // setChecklistData(response.data.data.checklist_frames);
    if (response.status === 200) {
      setChecklistData(response.data.data.checklist_frames);
    } else {
      toast.error(response.data.message);
    }
  };

  useEffect(() => {
    getCategoriesOptions();
    getSubCategoriesOptions();
    getChecklistList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId, showForm, detailForm]);

  if (showForm) {
    // Show the ChecklistForm component when "Add" is clicked
    return (
      <ChecklistForm
        setShowForm={setShowForm}
        subCategoryOptions={subCategoryOptions}
        categoryOptions={categoryOptions}
        checklist={selectedChecklist}
      />
    );
  } else if (detailForm && selectedChecklist) {
    return (
      <Checklistdetails
        setShowForm={setShowForm}
        setDetailForm={setDetailForm}
        checklist={selectedChecklist}
        subCategoryOptions={subCategoryOptions}
        categoryOptions={categoryOptions}
      />
    );
  }

  if (mappingSelectedId) {
    return (
      <ChecklistMapping
        setMappingSelectedId={setMappingSelectedId}
        categoryOptions={categoryOptions}
        subCategoryOptions={subCategoryOptions}
      />
    );
  }

  const closeModalCategory = () => setCategoryModal(false);
  const closeModalSubCategory = () => setSubCategoryModal(false);

  const createCategory = async () => {
    const data = {
      category: categoryName,
      organization_id: organizationId,
    };
    const response = await createChecklistCategory(data);
    console.log(response, "RESPONSE");
    if (response.status === 200) {
      toast.success(response.data.message);
      setCategoryName("");
      setCategoryModal(false);
    } else {
      toast.error(response.data.message);
    }
  };

  const handleSubCategoryModal = async () => {
    await getCategoriesOptions();
    setSubCategoryModal(true);
  };

  const createSubCategory = async () => {
    const data = {
      sub_category: subCategoryName,
      category_id: selectedCategoryId,
      organization_id: organizationId,
    };
    const response = await createChecklistSubCategory(data);
    console.log(response, "RESPONSE");
    if (response.status === 200) {
      toast.success(response.data.message);
      setSubCategoryName("");
      setSubCategoryModal(false);
      await getSubCategoriesOptions();
    } else {
      toast.error(response.data.message);
    }
  };

  const getCategoryNameById = (id) => {
    console.log(id, "ID", categoryOptions);
    return categoryOptions.find((option) => option.id === id)?.category;
  };

  const getSubCategoryNameById = (id) => {
    return subCategoryOptions.find((option) => option.id === id)?.sub_category;
  };

  return (
    <>
      <div className="flex">
        <SideBarSetup />
        <div className="my-5 w-[85%] mt-5 ml-[16%] mr-[1%]">
          <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4">Checklist</h1>
            <div className="flex items-center gap-4 mb-4">
              <button
                className="bg-purple-700 text-white px-4 py-2 rounded"
                onClick={() => setShowForm(true)}
              >
                + Add Checklist
              </button>
              {/* <button className="bg-gray-800 text-white px-4 py-2 rounded">
            Import
          </button>
          <button className="bg-gray-800 text-white px-4 py-2 rounded">
            Export
          </button> */}

              <button
                className="bg-purple-700 text-white px-4 py-2 rounded"
                onClick={() => setMappingSelectedId(1)}
              >
                Mapping
              </button>
              <button
                className="bg-purple-700 text-white px-4 py-2 rounded"
                onClick={() => setCategoryModal(true)}
              >
                Add Categories
              </button>
              <button
                className="bg-purple-700 text-white px-4 py-2 rounded"
                onClick={handleSubCategoryModal}
              >
                Add Sub-Categories
              </button>
            </div>

            <table className="min-w-full bg-white shadow rounded">
              <thead className="bg-gray-200">
                <tr>
                  <th className="font-semibold p-2 text-left"></th>
                  <th className="font-semibold p-2 text-left">ID</th>
                  {/* <th className="font-semibold p-2 text-left">Name</th> */}
                  <th className="font-semibold p-2 text-left">Category</th>
                  <th className="font-semibold p-2 text-left">Subcategory</th>
                  <th className="font-semibold p-2 text-left">No. of Ques</th>

                  <th className="font-semibold p-2 text-left">View</th>
                  <th className="font-semibold p-2 text-left">Edit</th>
                </tr>
              </thead>

              <tbody>
                {currentItems?.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="p-2">{item.id}</td>
                    <td className="p-2">{item.random_num}</td>
                    <td className="p-2">
                      {getCategoryNameById(item.checklist_category_id)}
                    </td>
                    <td className="p-2">
                      {getSubCategoryNameById(item.checklist_sub_category_id)}
                    </td>
                    <td className="p-2">{item.questions.length}</td>
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
                      {/* <Link
                        to={`/edit-checklist/${item.random_num}`}
                        className="bg-gray-200 px-2 py-1 rounded"
                      >
                        ✎
                      </Link> */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 flex justify-start gap-2">
              {renderPagination()}
            </div>
          </div>
          {categoryModal && (
            <Modal onClose={closeModalCategory}>
              <h2 className="text-2xl font-bold text-blue-700 mb-4">
                Create Category
              </h2>
              <div className="flex items-center gap-4 mb-4">
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded col-span-1"
                  placeholder="Enter Category Name"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                />
                <button
                  className="bg-purple-600 text-white p-2 rounded col-span-2"
                  onClick={createCategory}
                >
                  Create
                </button>
              </div>
            </Modal>
          )}
          {subCategoryModal && (
            <Modal onClose={closeModalSubCategory}>
              <h2 className="text-2xl font-bold text-blue-700 mb-4">
                Create Sub-Category
              </h2>
              <div className="flex flex-col items-center gap-4 mb-4">
                <div>
                  <label className="block text-gray-700">Sub Category</label>
                  <select
                    className="w-full p-2 mt-1 border border-gray-300 rounded"
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                  >
                    <option>Select Category</option>
                    {categoryOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.category}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded col-span-1"
                  placeholder="Enter Sub Category Name"
                  value={subCategoryName}
                  onChange={(e) => setSubCategoryName(e.target.value)}
                />
                <button
                  className="bg-purple-600 text-white p-2 rounded col-span-2"
                  onClick={createSubCategory}
                >
                  Create
                </button>
              </div>
            </Modal>
          )}
        </div>
      </div>
    </>
  );
};

export default Checklist;
