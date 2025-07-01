import React, { useState, useEffect } from "react";
import {
  createUser,
  createOrganization,
  createCompany,
  getUserDetailsById,
  getOrganizationDetailsById,
  getCompanyDetailsById,
} from "../../api";
import { toast } from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import { setCompany as setCompanyAction } from "../../store/userSlice";

const UserSetup = ({
  onUserSetup,
  onCompanySetup,
  onOrganizationSetup,
  onNextClick,
}) => {
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.user.user.id);
  const organizationId = useSelector((state) => state.user.organization.id);

  const [organizationDetails, setOrganizationDetails] = useState([]);
  const [companyDetails, setCompanyDetails] = useState([]);

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
    company_name: "",
    entity_name: "Entity Name",
    country_name: "India",
    state_name: "Maharashtra",
    region_name: "Mumbai",
    zone_name: "Zone 1",
    sub_domain: "company.com",
  });
  const [companyId, setCompanyId] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const response = await getUserDetailsById(userId);
      console.log(response);
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
      console.log(response);
      if (!response.data.success) return;
      if (
        response.status === 200 &&
        response.data.data.organization.length > 0
      ) {
        setOrganizationDetails(response.data.organization);

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
        console.log(response.data.data.company, "company");
        setCompanyDetails(response.data.data.company);
        dispatch(setCompanyAction(response.data.data.company[0].id));
        setCompanyId(response.data.data.company[0].id);
        setCompany({
          company_name: response.data.data.company[0].company_name,
          entity_name: response.data.data.company[0].entity_name,
          country_name: response.data.data.company[0].country_name,
          state_name: response.data.data.company[0].state_name,
          region_name: response.data.data.company[0].region_name,
          zone_name: response.data.data.company[0].zone_name,
          sub_domain: response.data.data.company[0].sub_domain,
        });
      }
    };

    if (userId) fetchUserDetails();
    if (userId) fetchOrganizationDetails();
    if (organizationId) fetchCompanyDetails();
  }, [organizationId, userId, companyId, dispatch]);

  const handleSetup = (setup) => {
    setSetup(setup);
  };

  useEffect(() => {
    fetchOrganizationsByUser();
  }, []);
  
  const handleUserChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    setUser({
      ...user,
      [name]: value,
      is_super_admin: name === "user_type" && value === "super_admin",
    });
  };

  const handleCompanyChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    setCompany({
      ...company,
      [name]: value,
    });
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    console.log(user);
    const response = await createUser(user);
    if (response.status === 200) {
      console.log(response);
      onUserSetup(response.data.data.id);
      toast.success(response.data.message);
      setSetup("organization");
    }
  };

  const fetchOrganizationsByUser = async () => {
    try {
      const response = await getOrganizationDetailsById(userId);
      if (response.data.success) {
        setOrganizationDetails(response.data.organizations); // <-- must match your API!
      }
    } catch (err) {
      toast.error("Failed to fetch organizations");
    }
  };
  

  useEffect(() => {
    fetchOrganizationsByUser();
    
  }, []); 

  const handleOrganizationSubmit = async (e) => {
    e.preventDefault();
    const response = await createOrganization({
      ...organization,
      created_by_id: userId,
      active: 1,
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
    console.log(company);
    const response = await createCompany({
      ...company,
      organization_id: organizationId,
    });
    if (response.status === 200) {
      console.log(response);
      onCompanySetup(response.data.data.id);
      toast.success(response.data.message);
    }
  };

  return (
    <>
      <div className="user-setup-container ">
        <div className="user-setup w-full">
          {/* <button
            onClick={() => handleSetup("user")}
            className={` rounded-full px-4 py-2 ${
              setup === "user" ? "bg-gray-300" : "bg-white"
            }`}
          >
            Setup User
          </button> */}
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
        </div>
        <div>
          {setup === "user" && (
            <form className="user-setup-form" onSubmit={handleUserSubmit}>
              <input
                label="First Name"
                name="first_name"
                value={user.first_name}
                onInput={handleUserChange}
                placeholder="Enter First Name"
                className="rounded-md px-4 py-2"
              />
              <input
                label="Last Name"
                name="last_name"
                value={user.last_name}
                onInput={handleUserChange}
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
              <form onSubmit={handleCompanySubmit} className="user-setup-form">
                <div className="flex flex-col gap-4">
                  <input
                    name="company_name"
                    placeholder="Enter Company Name"
                    label="Company Name"
                    value={company.company_name}
                    className="rounded-md px-4 py-2"
                    onChange={handleCompanyChange}
                  />
                  <input
                    label="Entity Name"
                    name="entity_name"
                    placeholder="Enter Entity Name"
                    value={company.entity_name}
                    className="rounded-md px-4 py-2"
                    onChange={handleCompanyChange}
                  />
                </div>
                <div className="flex flex-col gap-4">
                  <input
                    label="Country"
                    name="country_name"
                    placeholder="Enter Country"
                    value={company.country_name}
                    className="rounded-md px-4 py-2"
                    onChange={handleCompanyChange}
                  />
                  <input
                    label="State"
                    name="state_name"
                    placeholder="Enter State"
                    value={company.state_name}
                    className="rounded-md px-4 py-2"
                    onChange={handleCompanyChange}
                  />
                </div>
                <div className="flex flex-col gap-4">
                  <input
                    label="Region"
                    name="region_name"
                    placeholder="Enter Region"
                    value={company.region_name}
                    className="rounded-md px-4 py-2"
                    onChange={handleCompanyChange}
                  />
                  <input
                    label="Zone"
                    name="zone_name"
                    placeholder="Enter Zone"
                    value={company.zone_name}
                    className="rounded-md px-4 py-2"
                    onChange={handleCompanyChange}
                  />
                </div>
                <div className="flex flex-col gap-4">
                  <input
                    label="Sub Domain"
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
                </div>
                <button
                  type="submit"
                  className="rounded-md px-4 py-2 bg-blue-600 text-white"
                  onClick={() => onNextClick(companyId)}
                >
                  Next
                </button>
              </form>
              <ul className="organization-list mt-6">
                {companyDetails.map((comp) => (
                  <button
                    key={comp.id}
                    className={`  bg-white rounded-xl p-6 flex justify-center items-center ${
                      comp.company_name === company.company_name
                        ? "bg-gray-300 border border-gray-300"
                        : ""
                    }`}
                    onClick={() => {
                      setCompany({
                        company_name: comp.company_name,
                        entity_name: comp.entity_name,
                        country_name: comp.country_name,
                        state_name: comp.state_name,
                        region_name: comp.region_name,
                        zone_name: comp.zone_name,
                        sub_domain: comp.sub_domain,
                      });
                      setCompanyId(comp.id);
                    }}
                  >
                    {company.company_name}
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