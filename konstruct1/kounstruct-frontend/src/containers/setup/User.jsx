import React, {useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { MdOutlineCancel } from "react-icons/md";
import { useSelector } from "react-redux";
import { createUserDetails, allorgantioninfototalbyUser_id } from "../../api";
import { toast } from "react-hot-toast";
import SideBarSetup from "../../components/SideBarSetup";

function User() {
  // const userId = useSelector((state) => state.user.user.id);
  // const isClient = useSelector((state) => state.user.user.is_client) || false;
  const [userData, setUserData] = useState(null);
  
  useEffect(() => {
    const userString = localStorage.getItem("USER_DATA");
    if (userString && userString !== "undefined") {
      setUserData(JSON.parse(userString));
    }
  }, []);

  const userIDD = userData?.user_id;
  console.log('this isbnewww',userIDD);

  const isClient = userData?.is_client;
  console.log("htidhddhdhd", isClient);
  

  const [orgInfo, setOrgInfo] = useState({});
  const [orgInfoLoading, setOrgInfoLoading] = useState(false);
  const [isAdd, setAdd] = useState(false);

  const [userDataForm, setUserDataForm] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    mobile: "",
    password: "",
    role: "",
    organization_id: "",
    company_id: "",
    entity_id: "",
  });

  const [selectedOrganization, setSelectedOrganization] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [availableCompanies, setAvailableCompanies] = useState([]);
  const [availableEntities, setAvailableEntities] = useState([]);



  const getRoleOptions = () => {
    const baseRoles = [
      { value: "Inspector", label: "Inspector" },
      { value: "Repairer", label: "Repairer" },
      { value: "Reviewer", label: "Reviewer" },
    ];
    if (isClient) {
      return [
        ...baseRoles,
        { value: "Admin", label: "Admin" },
        { value: "Manager", label: "Manager" },
      ];
    }
    return baseRoles;
  };

  const fetchOrgInfo = async () => {
    if (!userIDD) {
      toast.error("User ID not found");
      return;
    }
    setOrgInfoLoading(true);
    try {
      console.log('THissi my id',userIDD);
      const response = await allorgantioninfototalbyUser_id(userIDD);
      setOrgInfo(response.data);
      console.log(response.data);
      
    } catch {
      toast.error("Failed to fetch organization info");
    } finally {
      setOrgInfoLoading(false);
    }
  };

  const handleAdd = () => {
    setAdd(true);
    fetchOrgInfo();
  };

  const handleOrganizationChange = (e) => {
    const orgId = e.target.value;
    setSelectedOrganization(orgId);
    setSelectedCompany("");
    setUserDataForm({
      ...userDataForm,
      organization_id: orgId,
      company_id: "",
      entity_id: "",
    });
    if (orgId && orgInfo.companies) {
      const filteredCompanies = orgInfo.companies.filter(
        (company) => company.organization === parseInt(orgId)
      );
      setAvailableCompanies(filteredCompanies);
    } else {
      setAvailableCompanies([]);
    }
    setAvailableEntities([]);
  };

  const handleCompanyChange = (e) => {
    const companyId = e.target.value;
    setSelectedCompany(companyId);
    setUserDataForm({
      ...userDataForm,
      company_id: companyId,
      entity_id: "",
    });
    if (companyId && orgInfo.entities) {
      const filteredEntities = orgInfo.entities.filter(
        (entity) => entity.company === parseInt(companyId)
      );
      setAvailableEntities(filteredEntities);
    } else {
      setAvailableEntities([]);
    }
  };

  const handleEntityChange = (e) => {
    const entityId = e.target.value;
    setUserDataForm({
      ...userDataForm,
      entity_id: entityId,
    });
  };

  const isFormValid = () => {
    if (isClient) {
      return (
        userDataForm.username &&
        userDataForm.first_name &&
        userDataForm.last_name &&
        userDataForm.email &&
        userDataForm.password &&
        userDataForm.organization_id
      );
    } else {
      return (
        userDataForm.username &&
        userDataForm.first_name &&
        userDataForm.last_name &&
        userDataForm.email &&
        userDataForm.password &&
        userDataForm.role
      );
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      toast.error("Please fill in all required fields");
      return;
    }
    // Compose payload
    const userApiData = {
      username: userDataForm.username,
      first_name: userDataForm.first_name,
      last_name: userDataForm.last_name,
      email: userDataForm.email,
      mobile: userDataForm.mobile,
      password: userDataForm.password,
    };
    console.log('this is password form',userApiData);
    
    if (isClient) {
      userApiData.org = parseInt(userDataForm.organization_id);
      if (userDataForm.company_id)
        userApiData.company = parseInt(userDataForm.company_id);
      if (userDataForm.entity_id)
        userApiData.entity = parseInt(userDataForm.entity_id);
      // userApiData.is_manager = true; 
    } else {
      userApiData.role = userDataForm.role;
    }


    try {
      const response = await createUserDetails(userApiData);
      if (response.status === 201) {
        toast.success(response.data.message || "User created successfully");
        resetForm();
      } else {
        toast.error(response.data.message || "Failed to create user");
      }
    } catch (error) {
      // <=== Catch the error and show validation messages
      // error.response.data might be { username: ["A user with that username already exists."] }
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        const messages = [];
        for (const key in errorData) {
          if (Array.isArray(errorData[key])) {
            messages.push(`${key}: ${errorData[key].join(", ")}`);
          } else {
            messages.push(`${key}: ${errorData[key]}`);
          }
        }
        toast.error(messages.join(" | "));
      } else {
        toast.error("Error creating user");
      }
    }
  };

  const userString = localStorage.getItem("USER_DATA");
  let is_manager = false;
  let org=null
  if (userString && userString !== "undefined") {
    const userData = JSON.parse(userString);
    is_manager = !!userData.is_manager; 
    org = userString?.org;
  }


  if (userString && userString !== "undefined") {
    const userData = JSON.parse(userString);
    org = userData.org || ""; 
  }
  console.log("got it", org);

  


  const resetForm = () => {
    setUserDataForm({
      username: "",
      first_name: "",
      last_name: "",
      email: "",
      mobile: "",
      password: "",
      role: "",
      organization_id: "",
      company_id: "",
      entity_id: "",
    });
    setSelectedOrganization("");
    setSelectedCompany("");
    setAvailableCompanies([]);
    setAvailableEntities([]);
    setAdd(false);
    setOrgInfo({});
  };

  return (
    <div className="flex">
      <SideBarSetup />
      <div className="my-5 w-[85%] mt-5 ml-[16%] mr-[1%]">
        <div className="px-6 py-5 max-w-7xl mx-auto bg-white rounded shadow-lg">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold">USER MANAGEMENT</h1>
            <p className="text-gray-600 mt-2">
              Create and manage users for your organization
            </p>
            {is_manager && (
              <div className="mb-3">
                <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                  Manager Access
                </span>
              </div>
            )}

            {isClient && (
              <div className="mt-3">
                <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  Client User - Only Manager creation available
                </span>
              </div>
            )}
          </div>

          <div className="border border-gray-200 rounded-lg p-8 bg-gray-50">
            <div className="text-center">
              <div className="mb-6">
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <FaPlus className="text-purple-600 text-2xl" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Add New User
                </h2>
                <p className="text-gray-600">
                  Click the button below to create a new user for your
                  organization
                </p>
              </div>
              <button
                onClick={handleAdd}
                className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition duration-200 flex items-center gap-2 mx-auto"
              >
                <FaPlus />
                Create New User
              </button>
            </div>
          </div>

          {/* Add User Modal */}
          {isAdd && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
              <div className="bg-white max-h-[90vh] w-1/2 rounded-lg shadow-lg p-6 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-xl font-semibold">Add New User</h1>
                  <button
                    className="text-gray-600 hover:text-gray-800"
                    onClick={resetForm}
                  >
                    <MdOutlineCancel size={24} />
                  </button>
                </div>
                {orgInfoLoading && (
                  <div className="text-center py-4">
                    <span className="text-purple-600">
                      Loading organizations...
                    </span>
                  </div>
                )}
                <div className="overflow-y-auto max-h-[70vh]">
                  <form className="space-y-4" onSubmit={handleCreate}>
                    {/* Username */}
                    <div className="grid grid-cols-3 gap-3 items-center">
                      <label className="text-sm font-medium text-end">
                        Username<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={userDataForm.username}
                        placeholder="Enter Username"
                        onChange={(e) =>
                          setUserDataForm({
                            ...userDataForm,
                            username: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    {/* For client user (show org/company/entity only) */}
                    {isClient && (
                      <>
                        {/* Organization Dropdown */}
                        <div className="grid grid-cols-3 gap-3 items-center">
                          <label className="text-sm font-medium text-end">
                            Organization<span className="text-red-500">*</span>
                          </label>
                          <select
                            className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={selectedOrganization}
                            onChange={handleOrganizationChange}
                            required
                          >
                            <option value="">Select Organization</option>
                            {orgInfo.organizations?.map((org) => (
                              <option key={org.id} value={org.id}>
                                {org.organization_name}
                              </option>
                            ))}
                          </select>
                        </div>
                        {/* Company */}
                        {selectedOrganization &&
                          availableCompanies.length > 0 && (
                            <div className="grid grid-cols-3 gap-3 items-center">
                              <label className="text-sm font-medium text-end">
                                Company
                              </label>
                              <select
                                className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                                value={selectedCompany}
                                onChange={handleCompanyChange}
                              >
                                <option value="">
                                  Select Company (Optional)
                                </option>
                                {availableCompanies.map((company) => (
                                  <option key={company.id} value={company.id}>
                                    {company.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        {/* Entity */}
                        {selectedCompany && availableEntities.length > 0 && (
                          <div className="grid grid-cols-3 gap-3 items-center">
                            <label className="text-sm font-medium text-end">
                              Entity
                            </label>
                            <select
                              className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                              value={userDataForm.entity_id}
                              onChange={handleEntityChange}
                            >
                              <option value="">Select Entity (Optional)</option>
                              {availableEntities.map((entity) => (
                                <option key={entity.id} value={entity.id}>
                                  {entity.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                        {/* DO NOT SHOW is_manager, handled in backend payload */}
                      </>
                    )}

                    {/* For non-client user, show role */}
                    {!isClient && (
                      <div className="grid grid-cols-3 gap-3 items-center">
                        <label className="text-sm font-medium text-end">
                          Role<span className="text-red-500">*</span>
                        </label>
                        <select
                          className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                          value={userDataForm.role}
                          onChange={(e) =>
                            setUserDataForm({
                              ...userDataForm,
                              role: e.target.value,
                            })
                          }
                          required
                        >
                          <option value="">Select Role</option>
                          {getRoleOptions().map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* First Name */}
                    <div className="grid grid-cols-3 gap-3 items-center">
                      <label className="text-sm font-medium text-end">
                        First Name<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={userDataForm.first_name}
                        placeholder="Enter First Name"
                        onChange={(e) =>
                          setUserDataForm({
                            ...userDataForm,
                            first_name: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    {/* Last Name */}
                    <div className="grid grid-cols-3 gap-3 items-center">
                      <label className="text-sm font-medium text-end">
                        Last Name<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={userDataForm.last_name}
                        placeholder="Enter Last Name"
                        onChange={(e) =>
                          setUserDataForm({
                            ...userDataForm,
                            last_name: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    {/* Email */}
                    <div className="grid grid-cols-3 gap-3 items-center">
                      <label className="text-sm font-medium text-end">
                        Email<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={userDataForm.email}
                        placeholder="Enter Email Address"
                        onChange={(e) =>
                          setUserDataForm({
                            ...userDataForm,
                            email: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    {/* Mobile */}
                    <div className="grid grid-cols-3 gap-3 items-center">
                      <label className="text-sm font-medium text-end">
                        Mobile
                      </label>
                      <input
                        type="tel"
                        className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={userDataForm.mobile}
                        placeholder="Enter Mobile Number"
                        onChange={(e) =>
                          setUserDataForm({
                            ...userDataForm,
                            mobile: e.target.value,
                          })
                        }
                      />
                    </div>
                    {/* Password */}
                    <div className="grid grid-cols-3 gap-3 items-center">
                      <label className="text-sm font-medium text-end">
                        Password<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={userDataForm.password}
                        placeholder="Enter Password"
                        onChange={(e) =>
                          setUserDataForm({
                            ...userDataForm,
                            password: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition duration-200"
                        onClick={resetForm}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className={`flex-1 py-2 px-4 rounded transition duration-200 ${
                          isFormValid()
                            ? "bg-purple-700 text-white hover:bg-purple-800"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                        disabled={!isFormValid() || orgInfoLoading}
                      >
                        Create User
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default User;