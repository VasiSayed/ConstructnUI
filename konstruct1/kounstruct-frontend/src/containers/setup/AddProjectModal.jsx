import React, {  useEffect ,useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { createProject, allorgantioninfototalbyUser_id } from "../../api";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";


function AddProjectModal({ onClose, onSave }) {
  const [userData, setUserData] = useState(null);
  useEffect(() => {
    const userString = localStorage.getItem("USER_DATA");
    if (userString && userString !== "undefined") {
      setUserData(JSON.parse(userString));
    }
  }, []);
  
  const userId = userData?.user_id; 
  console.log("got the id here", userId);

  // Dropdown state
  const [orgOptions, setOrgOptions] = useState([]);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [entityOptions, setEntityOptions] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedEntity, setSelectedEntity] = useState("");

  // Other form state
  const [projectName, setProjectName] = useState("");
  const [useDefaultImage, setUseDefaultImage] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [image, setImage] = useState("");

  // Fetch all orgs/companies/entities on open
  useEffect(() => {
    const fetchUserOrgs = async () => {
      try {
        if (userId) {
          const resp = await allorgantioninfototalbyUser_id(userId);
          console.log("API Response:", resp.data); // Debug log
          setOrgOptions(resp.data.organizations || []);
          setCompanyOptions(resp.data.companies || []);
          setEntityOptions(resp.data.entities || []);
        }
      } catch (e) {
        toast.error("Failed to load organizations info.");
      }
    };
    fetchUserOrgs();
  }, [userId]);

  const handleChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      setIsSaved(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!projectName) {
      toast.error("Project name is required");
      return;
    }
    if (!selectedOrg) {
      toast.error("Please select an organization");
      return;
    }
    if (!selectedCompany) {
      toast.error("Please select a company");
      return;
    }

    console.log('while ofrmmm ia ',userId);
    const formData = new FormData();
    formData.append("name", projectName);
    formData.append("created_by", userId);
    formData.append("organization_id", selectedOrg);
    formData.append("company_id", selectedCompany);
    if (selectedEntity) formData.append("entity_id", selectedEntity);

    if (!useDefaultImage && image) {
      formData.append("image", image);
    }

    try {
      const res = await createProject(formData);
      toast.success("Project created!");
      onSave(res.data.id || res.data.data?.id);
      setIsSaved(true);
    } catch (error) {
      console.error("Full error:", error);
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.detail ||
          JSON.stringify(error.response?.data) ||
          error.message ||
          "Error creating project"
      );
    }
  };

  // Fixed filtering logic
  const filteredCompanies = selectedOrg
    ? companyOptions.filter((comp) => {
        // Check multiple possible field names for organization reference
        return (
          String(comp.organization_id) === String(selectedOrg) ||
          String(comp.organization) === String(selectedOrg) ||
          String(comp.org_id) === String(selectedOrg)
        );
      })
    : [];

  const filteredEntities = selectedCompany
    ? entityOptions.filter((ent) => {
        // Check multiple possible field names for company reference
        return (
          String(ent.company_id) === String(selectedCompany) ||
          String(ent.company) === String(selectedCompany) ||
          String(ent.comp_id) === String(selectedCompany)
        );
      })
    : [];

  // Debug logs to help identify the correct field names
  useEffect(() => {
    if (companyOptions.length > 0) {
      console.log("Sample company object:", companyOptions[0]);
    }
    if (entityOptions.length > 0) {
      console.log("Sample entity object:", entityOptions[0]);
    }
  }, [companyOptions, entityOptions]);

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-11/12 max-w-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <AiOutlineClose className="text-xl text-gray-600 hover:text-gray-900" />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Add New Project
        </h2>

        {/* Dropdowns stepwise */}
        <div className="space-y-4 mb-6">
          {/* Organization Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organization <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full rounded-lg px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
              value={selectedOrg}
              onChange={(e) => {
                setSelectedOrg(e.target.value);
                setSelectedCompany("");
                setSelectedEntity("");
              }}
            >
              <option value="">Select Organization</option>
              {orgOptions.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.organization_name || org.name}
                </option>
              ))}
            </select>
          </div>

          {/* Company Dropdown - only if org selected */}
          {selectedOrg && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full rounded-lg px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                value={selectedCompany}
                onChange={(e) => {
                  setSelectedCompany(e.target.value);
                  setSelectedEntity("");
                }}
              >
                <option value="">Select Company</option>
                {filteredCompanies.length > 0 ? (
                  filteredCompanies.map((comp) => (
                    <option key={comp.id} value={comp.id}>
                      {comp.name}
                    </option>
                  ))
                ) : (
                  <option disabled>
                    No companies found for this organization
                  </option>
                )}
              </select>
            </div>
          )}

          {/* Entity Dropdown - only if company selected */}
          {selectedCompany && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Entity <span className="text-gray-400">(Optional)</span>
              </label>
              <select
                className="w-full rounded-lg px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                value={selectedEntity}
                onChange={(e) => setSelectedEntity(e.target.value)}
              >
                <option value="">Select Entity (Optional)</option>
                {filteredEntities.length > 0 ? (
                  filteredEntities.map((ent) => (
                    <option key={ent.id} value={ent.id}>
                      {ent.name}
                    </option>
                  ))
                ) : (
                  <option disabled>No entities found for this company</option>
                )}
              </select>
            </div>
          )}
        </div>

        {/* Project name and image section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="w-full rounded-lg px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
            placeholder="Enter project name"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Project Image
          </label>
          <div className="space-y-3">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                checked={useDefaultImage}
                onChange={() => setUseDefaultImage(true)}
                className="mr-2 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">Use Default Image</span>
            </label>

            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                checked={!useDefaultImage}
                onChange={() => setUseDefaultImage(false)}
                className="mr-2 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">Upload Custom Image</span>
            </label>
          </div>

          {!useDefaultImage && (
            <input
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="mt-3 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          )}
          {image && !useDefaultImage && (
            <img
              src={URL.createObjectURL(image)}
              alt="Custom Project"
              className="mt-4 w-full max-h-48 object-cover rounded-lg border border-gray-200"
            />
          )}
        </div>

        <div className="flex gap-4 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            disabled={!projectName || !selectedOrg || !selectedCompany}
          >
            Save Project
          </button>
        </div>

        {/* Show selected hierarchy for clarity */}
        {(selectedOrg || selectedCompany || selectedEntity) && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
            <span className="font-medium">Selected: </span>
            {selectedOrg &&
              orgOptions.find((o) => o.id === selectedOrg)?.organization_name}
            {selectedCompany &&
              ` → ${
                filteredCompanies.find((c) => c.id === selectedCompany)?.name
              }`}
            {selectedEntity &&
              ` → ${
                filteredEntities.find((e) => e.id === selectedEntity)?.name
              }`}
          </div>
        )}
      </div>
    </div>
  );
}

export default AddProjectModal;
