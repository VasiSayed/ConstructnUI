import React, { useState, useEffect, useRef } from "react";
import {
  createUser,
  createOrganization,
  createCompany,
  createEntity, // Add this API function
  getUserDetailsById,
  getOrganizationDetailsById,
  getCompanyDetailsById,
  allorgantioninfototalbyUser_id, // Add this API function
} from "../../api";
import { toast } from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import {
  setCompany as setCompanyAction,
  setOrganization as setOrganizationAction,
} from "../../store/userSlice";

// Debounce helper
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

const UserSetup = ({
  onUserSetup,
  onCompanySetup,
  onOrganizationSetup,
  onEntitySetup, // Add this prop
  onNextClick,
}) => {
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.user.user.id);
  const organizationId = useSelector((state) => state.user.organization.id);

  const [organizationDetails, setOrganizationDetails] = useState([]);
  const [companyDetails, setCompanyDetails] = useState([]);
  const [entityDetails, setEntityDetails] = useState([]);
  const [allUserInfo, setAllUserInfo] = useState({
    organizations: [],
    companies: [],
    entities: [],
  });
  const [selectedOrgForEntity, setSelectedOrgForEntity] = useState(null);
  const [selectedCompanyForEntity, setSelectedCompanyForEntity] =
    useState(null);
  const [setup, setSetup] = useState("user");
  const [user, setUser] = useState({
    first_name: "",
    last_name: "",
    user_type: "super_admin",
    is_super_admin: true,
  });
  const [organization, setOrganization] = useState({
    organization_name: "",
  });
  const [company, setCompany] = useState({
    name: "",
    region: "",
    country: "",
    sub_domain: "",
    contact_email: "",
  });
  const [entity, setEntity] = useState({
    name: "",
    state: "",
    region: "",
    zone: "",
  });
  const [companyId, setCompanyId] = useState(null);
  const [entityId, setEntityId] = useState(null);

  // Fetch all user info for entity setup
  const fetchAllUserInfo = async () => {
    try {
      const response = await allorgantioninfototalbyUser_id(userId);
      setAllUserInfo(response.data);
      console.log("All User Info:", response.data);
    } catch (err) {
      toast.error("Failed to fetch user information");
    }
  };

  // Org fetch function, used everywhere
  const fetchOrganizationsByUser = async () => {
    try {
      const response = await getOrganizationDetailsById(userId);
      setOrganizationDetails(response.data || []);
      console.log("API Response:", response);
      console.log("Organizations:", response.data);
    } catch (err) {
      toast.error("Failed to fetch organizations");
    }
  };

  const debouncedFetchOrganizationsByUser = useRef(
    debounce(fetchOrganizationsByUser, 300)
  ).current;

  // Fetch orgs when setup is organization
  useEffect(() => {
    if (setup === "organization" && userId) {
      debouncedFetchOrganizationsByUser();
    }
  }, [setup, userId]);

  // Fetch orgs when setup is company (for dropdown)
  useEffect(() => {
    if (setup === "company" && userId) {
      fetchOrganizationsByUser(); // Fetch immediately for dropdown
    }
  }, [setup, userId]);

  // Fetch all info when setup is entity
  useEffect(() => {
    if (setup === "entity" && userId) {
      fetchAllUserInfo();
    }
  }, [setup, userId]);

  // Filter companies based on selected organization for entity
  const filteredCompaniesForEntity = selectedOrgForEntity
    ? allUserInfo.companies.filter(
        (company) => company.organization === selectedOrgForEntity
      )
    : [];

  // Other useEffect for loading user/org/company details
  useEffect(() => {
    const fetchUserDetails = async () => {
      const response = await getUserDetailsById(userId);
      if (!response.data.success) return;
      if (response.status === 200) {
        setUser({
          first_name: response.data.data.user.first_name,
          last_name: response.data.data.user.last_name,
          user_type: response.data.data.user.user_type,
          is_super_admin: response.data.data.user.is_super_admin,
        });
      }
    };

    const fetchOrganizationDetails = async () => {
      const response = await getOrganizationDetailsById(userId);
      if (!response.data.success) return;
      if (
        response.status === 200 &&
        response.data.data.organization.length > 0
      ) {
        setOrganizationDetails(response.data.data.organization);

        setOrganization({
          organization_name:
            response.data.data.organization[0].organization_name,
        });
      }
    };

    const fetchCompanyDetails = async () => {
      const response = await getCompanyDetailsById(organizationId);
      if (!response.data.success) return;
      if (response.status === 200 && response.data.data.company.length > 0) {
        setCompanyDetails(response.data.data.company);
        dispatch(setCompanyAction(response.data.data.company[0].id));
        setCompanyId(response.data.data.company[0].id);
        setCompany({
          name: response.data.data.company[0].name,
          region: response.data.data.company[0].region,
          country: response.data.data.company[0].country,
          sub_domain: response.data.data.company[0].sub_domain,
        });
      }
    };

    if (userId) fetchUserDetails();
    if (userId) fetchOrganizationDetails();
    if (organizationId) fetchCompanyDetails();
  }, [organizationId, userId, companyId, dispatch]);

  // Step change with fetch
  const handleSetup = (val) => {
    setSetup(val);
  };

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUser({
      ...user,
      [name]: value,
      is_super_admin: name === "user_type" && value === "super_admin",
    });
  };

  const handleCompanyChange = (e) => {
    const { name, value } = e.target;
    setCompany({
      ...company,
      [name]: value,
    });
  };

  const handleEntityChange = (e) => {
    const { name, value } = e.target;
    setEntity({
      ...entity,
      [name]: value,
    });
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    const response = await createUser(user);
    if (response.status === 200) {
      onUserSetup(response.data.data.id);
      toast.success(response.data.message);
      setSetup("organization");
    }
  };

  const handleOrganizationSubmit = async (e) => {
    e.preventDefault();
    const response = await createOrganization({
      ...organization,
      created_by: userId,
      active: true,
    });
    if (response.status === 200) {
      onOrganizationSetup && onOrganizationSetup(response.data.data.id);
      toast.success(response.data.message);
      setSetup("company");
      fetchOrganizationsByUser();
    }
  };

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    const response = await createCompany({
      ...company,
      organization: organizationId,
    });
    if (response.status === 200) {
      onCompanySetup(response.data.data.id);
      toast.success(response.data.message);
    }
  };

  return (
    <>
      <div className="user-setup-container ">
        <div className="user-setup w-full">
          <button
            onClick={() => handleSetup("organization")}
            className={`rounded-full px-4 py-2 ${
              setup === "organization" ? "bg-gray-300" : "bg-white"
            }`}
          >
            Setup Organization
          </button>
          <button
            onClick={() => handleSetup("company")}
            className={`rounded-full px-4 py-2 ${
              setup === "company" ? "bg-gray-300" : "bg-white"
            }`}
          >
            Setup Company
          </button>
          <button
            onClick={() => handleSetup("entity")}
            className={`rounded-full px-4 py-2 ${
              setup === "entity" ? "bg-gray-300" : "bg-white"
            }`}
          >
            Setup Entity
          </button>
        </div>
        <div>
          {setup === "user" && (
            <form className="user-setup-form" onSubmit={handleUserSubmit}>
              <input
                label="First Name"
                name="first_name"
                value={user.first_name}
                onChange={handleUserChange}
                placeholder="Enter First Name"
                className="rounded-md px-4 py-2"
              />
              <input
                label="Last Name"
                name="last_name"
                value={user.last_name}
                onChange={handleUserChange}
                placeholder="Enter Last Name"
                className="rounded-md px-4 py-2"
              />
              <select
                label="user_type"
                name="user_type"
                value={user.user_type}
                onChange={handleUserChange}
                className="rounded-md px-4 py-2"
              >
                <option value="super_admin">Super Admin</option>
                <option value="user">User</option>
              </select>
              <button
                type="submit"
                className="rounded-md px-4 py-2 bg-blue-600 text-white"
              >
                Submit
              </button>
            </form>
          )}

          {setup === "organization" && (
            <div>
              <form
                className="user-setup-form"
                onSubmit={handleOrganizationSubmit}
              >
                <input
                  label="Organization Name"
                  placeholder="Enter Organization Name"
                  name="organization_name"
                  value={organization.organization_name}
                  className="rounded-md px-4 py-2"
                  onChange={(e) =>
                    setOrganization({
                      ...organization,
                      organization_name: e.target.value,
                    })
                  }
                />
                <button
                  type="submit"
                  className="rounded-md px-4 py-2 bg-blue-600 text-white"
                >
                  Submit
                </button>
              </form>

              {/* Button list for organization selection */}
              <ul className="organization-list mt-6">
                {organizationDetails.map((org) => (
                  <button
                    key={org.id}
                    className={`bg-white rounded-xl p-4 m-2 ${
                      org.organization_name === organization.organization_name
                        ? "bg-gray-300 border"
                        : ""
                    }`}
                    onClick={() =>
                      setOrganization({
                        organization_name: org.organization_name,
                      })
                    }
                  >
                    {org.organization_name}
                  </button>
                ))}
              </ul>
            </div>
          )}

          {setup === "company" && (
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Select Organization
                </label>
                <div className="flex flex-wrap gap-2">
                  {organizationDetails.map((org) => (
                    <button
                      key={org.id}
                      type="button"
                      className={`rounded-md px-4 py-2 border ${
                        organizationId === org.id
                          ? "bg-gray-300 border-blue-500"
                          : "bg-white border-gray-300"
                      }`}
                      onClick={() => dispatch(setOrganizationAction(org.id))}
                    >
                      {org.organization_name}
                    </button>
                  ))}
                </div>
              </div>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!organizationId) {
                    toast.error("Please select an organization first.");
                    return;
                  }

                  const payload = {
                    organization: organizationId,
                    name: company.name,
                    region: company.region,
                    country: company.country,
                    sub_domain: company.sub_domain,
                    contact_email: "",
                    created_by: userId,
                  };

                  try {
                    const response = await createCompany(payload);

                    if (response.status === 200 && response.data.success) {
                      onCompanySetup(response.data.data.id);
                      toast.success(
                        response.data.message || "Company created successfully!"
                      );
                      setCompanyId(response.data.data.id);
                      setCompanyDetails((prev) => [
                        ...prev,
                        response.data.data,
                      ]);
                    } else {
                      toast.error(
                        response.data.message || "Error creating company."
                      );
                    }
                  } catch (error) {
                    console.error("Company creation error:", error);
                    toast.error(
                      error.response?.data?.message ||
                        error.message ||
                        "Unexpected error creating company."
                    );
                  }
                }}
                className="user-setup-form"
              >
                <div className="flex flex-col gap-4">
                  <input
                    name="name"
                    placeholder="Enter Company Name"
                    value={company.name}
                    className="rounded-md px-4 py-2"
                    onChange={handleCompanyChange}
                  />
                  <input
                    name="entity_name"
                    placeholder="Enter Entity Name"
                    value={company.entity_name}
                    className="rounded-md px-4 py-2"
                    onChange={handleCompanyChange}
                  />
                </div>

                <div className="flex flex-col gap-4">
                  <input
                    name="country"
                    placeholder="Enter Country"
                    value={company.country}
                    className="rounded-md px-4 py-2"
                    onChange={handleCompanyChange}
                  />
                  <input
                    name="state_name"
                    placeholder="Enter State"
                    value={company.state_name}
                    className="rounded-md px-4 py-2"
                    onChange={handleCompanyChange}
                  />
                </div>

                <div className="flex flex-col gap-4">
                  <input
                    name="region"
                    placeholder="Enter Region"
                    value={company.region}
                    className="rounded-md px-4 py-2"
                    onChange={handleCompanyChange}
                  />
                  <input
                    name="zone_name"
                    placeholder="Enter Zone"
                    value={company.zone_name}
                    className="rounded-md px-4 py-2"
                    onChange={handleCompanyChange}
                  />
                </div>

                <div className="flex flex-col gap-4">
                  <input
                    name="sub_domain"
                    placeholder="Enter Sub Domain"
                    value={company.sub_domain}
                    className="rounded-md px-4 py-2"
                    onChange={handleCompanyChange}
                  />
                  <button
                    type="submit"
                    className="rounded-md px-4 py-2 bg-blue-600 text-white"
                  >
                    Submit
                  </button>
                  <button
                    type="button"
                    className="rounded-md px-4 py-2 bg-blue-600 text-white"
                    onClick={() => onNextClick(companyId)}
                  >
                    Next
                  </button>
                </div>
              </form>

              <ul className="organization-list mt-6">
                {companyDetails.map((comp) => (
                  <button
                    key={comp.id}
                    className={`bg-white rounded-xl p-6 flex justify-center items-center ${
                      comp.name === company.name
                        ? "bg-gray-300 border border-gray-300"
                        : ""
                    }`}
                    onClick={() => {
                      setCompany({
                        name: comp.name,
                        entity_name: comp.entity_name || "Entity Name",
                        country: comp.country || "India",
                        state_name: comp.state_name || "Maharashtra",
                        region: comp.region || "Mumbai",
                        zone_name: comp.zone_name || "Zone 1",
                        sub_domain: comp.sub_domain || "company.com",
                      });
                      setCompanyId(comp.id);
                    }}
                  >
                    {comp.name}
                  </button>
                ))}
              </ul>
            </div>
          )}

          {setup === "entity" && (
            <div>
              {/* Organization Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Select Organization
                </label>
                <div className="flex flex-wrap gap-2">
                  {allUserInfo.organizations.map((org) => (
                    <button
                      key={org.id}
                      type="button"
                      className={`rounded-md px-4 py-2 border ${
                        selectedOrgForEntity === org.id
                          ? "bg-gray-300 border-blue-500"
                          : "bg-white border-gray-300"
                      }`}
                      onClick={() => {
                        setSelectedOrgForEntity(org.id);
                        setSelectedCompanyForEntity(null); // Reset company selection
                      }}
                    >
                      {org.organization_name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Company Selection */}
              {selectedOrgForEntity && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Select Company
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {filteredCompaniesForEntity.map((comp) => (
                      <button
                        key={comp.id}
                        type="button"
                        className={`rounded-md px-4 py-2 border ${
                          selectedCompanyForEntity === comp.id
                            ? "bg-gray-300 border-blue-500"
                            : "bg-white border-gray-300"
                        }`}
                        onClick={() => setSelectedCompanyForEntity(comp.id)}
                      >
                        {comp.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Entity Form */}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!selectedCompanyForEntity) {
                    toast.error("Please select a company first.");
                    return;
                  }

                  const payload = {
                    company: selectedCompanyForEntity,
                    name: entity.name,
                    state: entity.state,
                    region: entity.region,
                    zone: entity.zone,
                    created_by: userId,
                  };

                  try {
                    const response = await createEntity(payload);

                    if (response.status === 200 && response.data.success) {
                      onEntitySetup && onEntitySetup(response.data.data.id);
                      toast.success(
                        response.data.message || "Entity created successfully!"
                      );
                      setEntityId(response.data.data.id);
                      setEntityDetails((prev) => [...prev, response.data.data]);
                      fetchAllUserInfo(); // Refresh data
                    } else {
                      toast.error(
                        response.data.message || "Error creating entity."
                      );
                    }
                  } catch (error) {
                    console.error("Entity creation error:", error);
                    toast.error(
                      error.response?.data?.message ||
                        error.message ||
                        "Unexpected error creating entity."
                    );
                  }
                }}
                className="user-setup-form"
              >
                <div className="flex flex-col gap-4">
                  <input
                    name="name"
                    placeholder="Enter Entity Name"
                    value={entity.name}
                    className="rounded-md px-4 py-2"
                    onChange={handleEntityChange}
                    required
                  />
                  <input
                    name="state"
                    placeholder="Enter State"
                    value={entity.state}
                    className="rounded-md px-4 py-2"
                    onChange={handleEntityChange}
                  />
                </div>

                <div className="flex flex-col gap-4">
                  <input
                    name="region"
                    placeholder="Enter Region"
                    value={entity.region}
                    className="rounded-md px-4 py-2"
                    onChange={handleEntityChange}
                  />
                  <input
                    name="zone"
                    placeholder="Enter Zone"
                    value={entity.zone}
                    className="rounded-md px-4 py-2"
                    onChange={handleEntityChange}
                  />
                </div>

                <div className="flex flex-col gap-4">
                  <button
                    type="submit"
                    className="rounded-md px-4 py-2 bg-blue-600 text-white"
                  >
                    Submit
                  </button>
                  <button
                    type="button"
                    className="rounded-md px-4 py-2 bg-blue-600 text-white"
                    onClick={() => onNextClick(entityId)}
                  >
                    Next
                  </button>
                </div>
              </form>

              {/* Entity List */}
              <ul className="organization-list mt-6">
                {allUserInfo.entities.map((ent) => (
                  <button
                    key={ent.id}
                    className={`bg-white rounded-xl p-6 flex justify-center items-center ${
                      ent.name === entity.name
                        ? "bg-gray-300 border border-gray-300"
                        : ""
                    }`}
                    onClick={() => {
                      setEntity({
                        name: ent.name,
                        state: ent.state || "",
                        region: ent.region || "",
                        zone: ent.zone || "",
                      });
                      setEntityId(ent.id);
                    }}
                  >
                    {ent.name}
                  </button>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UserSetup;
