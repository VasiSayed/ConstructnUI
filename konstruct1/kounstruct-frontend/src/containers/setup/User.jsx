
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { FaPlus } from "react-icons/fa";
import { MdOutlineCancel } from "react-icons/md";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import SideBarSetup from "../../components/SideBarSetup";
import { createUserDetails, allorgantioninfototalbyUser_id, getCategoryTreeByProject, getProjectsByOrganization, createUserAccessRole } from "../../api";

function User() {
  // const userId = useSelector((state) => state.user.user.id);
  // const isClient = useSelector((state) => state.user.user.is_client) || false;
  // const [userData, setUserData] = useState(null);

  // useEffect(() => {
  //   const userString = localStorage.getItem("USER_DATA");
  //   if (userString && userString !== "undefined") {
  //     setUserData(JSON.parse(userString));
  //   }
  // }, []);

  // const userIDD = userData?.user_id;
  // console.log('this isbnewww',userIDD);

  // const isClient = userData?.is_client;
  // console.log("htidhddhdhd", isClient);

  // Debug render count
  const renderCount = useRef(0);
  renderCount.current += 1;

  // Memoize localStorage data to prevent repeated parsing
  // Memoize localStorage data to prevent repeated parsing
  // Memoize localStorage data to prevent repeated parsing
  const userData = useMemo(() => {
    try {
      const userString = localStorage.getItem("USER_DATA");
      if (userString && userString !== "undefined") {
        const parsed = JSON.parse(userString);
        return parsed || {};
      }
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
    }
    return {};
  }, []);

  const userId = userData?.user_id;
  const isClient = userData?.is_client;
  const is_manager = useMemo(
    () => !!userData.is_manager,
    [userData.is_manager]
  );
  const org = useMemo(() => userData.org || "", [userData.org]);

  // Debug logging moved to useEffect to prevent render cycle pollution
  useEffect(() => {
    console.log(
      `Render #${renderCount.current} - Manager status:`,
      is_manager,
      "Org:",
      org
    );
  }, [is_manager, org]);

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
    project_id: "",
    building_id: "",
    zone_id: "",
  });

  const [selectedOrganization, setSelectedOrganization] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [availableCompanies, setAvailableCompanies] = useState([]);
  const [availableEntities, setAvailableEntities] = useState([]);
  const [availableProjects, setAvailableProjects] = useState([]);
  const [availableBuildings, setAvailableBuildings] = useState([]);
  const [availableZones, setAvailableZones] = useState([]);

  const [orgManagerTypes, setOrgManagerTypes] = useState([]);
  const [showManagerDropdown, setShowManagerDropdown] = useState(false);
  const [selectedManagerType, setSelectedManagerType] = useState("");

  // Add loading state for projects
  const [projectsLoading, setProjectsLoading] = useState(false);

  // Category tree states
  const [categoryTree, setCategoryTree] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLevel1, setSelectedLevel1] = useState("");
  const [selectedLevel2, setSelectedLevel2] = useState("");
  const [selectedLevel3, setSelectedLevel3] = useState("");
  const [selectedLevel4, setSelectedLevel4] = useState("");
  const [selectedLevel5, setSelectedLevel5] = useState("");
  const [selectedLevel6, setSelectedLevel6] = useState("");

  // Available options for each level
  const [availableLevel1, setAvailableLevel1] = useState([]);
  const [availableLevel2, setAvailableLevel2] = useState([]);
  const [availableLevel3, setAvailableLevel3] = useState([]);
  const [availableLevel4, setAvailableLevel4] = useState([]);
  const [availableLevel5, setAvailableLevel5] = useState([]);
  const [availableLevel6, setAvailableLevel6] = useState([]);

  // Memoize resetCategorySelections to prevent recreation
  const resetCategorySelections = useCallback(() => {
    setSelectedCategory("");
    setSelectedLevel1("");
    setSelectedLevel2("");
    setSelectedLevel3("");
    setSelectedLevel4("");
    setSelectedLevel5("");
    setSelectedLevel6("");
    setAvailableLevel1([]);
    setAvailableLevel2([]);
    setAvailableLevel3([]);
    setAvailableLevel4([]);
    setAvailableLevel5([]);
    setAvailableLevel6([]);
  }, []);

  // Memoize fetchCategoryTree function to prevent recreation
  const fetchCategoryTree = useCallback(
    async (projectId) => {
      if (!projectId) return;

      setCategoryLoading(true);
      try {
        console.log("Fetching category tree for project:", projectId);
        const response = await getCategoryTreeByProject(projectId);
        console.log("Category tree response:", response.data);
        console.log("Category tree length:", response.data?.length);
        console.log("First category:", response.data?.[0]);

        setCategoryTree(response.data || []);

        // Reset all category selections when new tree is loaded
        resetCategorySelections();
      } catch (error) {
        console.error("Error fetching category tree:", error);
        setCategoryTree([]);
        resetCategorySelections();

        if (error.response?.status === 404) {
          toast.error(
            "Category endpoint not found. Please check API configuration."
          );
        } else if (error.response?.status === 401) {
          toast.error("Authentication required. Please login again.");
        } else if (error.response?.status === 400) {
          toast.error("Invalid project selected");
        } else if (error.code === "ERR_NETWORK") {
          toast.error("Network error. Please check your connection.");
        } else {
          toast.error("Failed to load categories for this project");
        }
      } finally {
        setCategoryLoading(false);
      }
    },
    [resetCategorySelections]
  );

  // Memoize fetchProjectsForManager function to prevent recreation
  const fetchProjectsForManager = useCallback(async () => {
    if (is_manager && org) {
      setProjectsLoading(true);
      try {
        console.log("Fetching projects for organization:", org);
        const res = await getProjectsByOrganization(org);
        console.log("Projects API response:", res.data);

        // The projects are directly in res.data, not res.data.projects
        let projects = [];
        if (Array.isArray(res.data)) {
          projects = res.data; // Projects are directly in the response
        } else if (res.data && res.data.projects) {
          projects = res.data.projects; // Projects are in a nested object
        }

        console.log("Available projects set:", projects);
        setAvailableProjects(projects);

        // Always show manager dropdown if user is manager and has projects
        if (is_manager && projects.length > 0) {
          setShowManagerDropdown(true);
          setOrgManagerTypes(
            res.data.manager_types || ["Project Manager", "Site Manager"]
          ); // Fallback manager types
          console.log(
            "Manager dropdown enabled with types:",
            res.data.manager_types || ["Project Manager", "Site Manager"]
          );
        }
      } catch (err) {
        console.error("Error fetching projects:", err);
        setShowManagerDropdown(false);
        setOrgManagerTypes([]);
        setAvailableProjects([]);

        // Better error handling for network issues
        if (err.code === "ERR_NETWORK") {
          toast.error(
            "Network connection failed. Please check your connection and try again."
          );
        } else {
          toast.error("Failed to fetch projects. Please try again later.");
        }
      } finally {
        setProjectsLoading(false);
      }
    } else {
      console.log(
        "Not fetching projects - is_manager:",
        is_manager,
        "org:",
        org
      );
    }
  }, [is_manager, org]);

  // Effect to fetch projects when modal opens and user is manager
  useEffect(() => {
    if (isAdd && is_manager && org) {
      console.log("useEffect triggered - fetching projects");
      fetchProjectsForManager();
    }
  }, [isAdd, is_manager, org, fetchProjectsForManager]);

  // Memoize getRoleOptions to prevent recreation
  const getRoleOptions = useCallback(() => {
    const baseRoles = [
      { value: "SUPERVISOR", label: "SUPERVISOR" },
      { value: "CHECKER", label: "CHECKER" },
      { value: "MAKER", label: "MAKER" },
    ];
    if (isClient) {
      return [
        ...baseRoles,
        { value: "ADMIN", label: "ADMIN" },
        { value: "Manager", label: "Manager" },
      ];
    }
    return baseRoles;
  }, [isClient]);

  // Memoize fetchOrgInfo to prevent recreation
  const fetchOrgInfo = useCallback(async () => {
    if (!userId) {
      toast.error("User ID not found");
      return;
    }
    setOrgInfoLoading(true);
    try {
      console.log("THissi my id", userId);
      const response = await allorgantioninfototalbyUser_id(userId);
      setOrgInfo(response.data);
    } catch (error) {
      console.error("Error fetching organization info:", error);
      toast.error("Failed to fetch organization info");
    } finally {
      setOrgInfoLoading(false);
    }
  }, [userId]);

  const handleAdd = useCallback(() => {
    setAdd(true);
    fetchOrgInfo();
  }, [fetchOrgInfo]);

  const handleOrganizationChange = useCallback(
    async (e) => {
      const orgId = e.target.value;
      setSelectedOrganization(orgId);
      setSelectedCompany("");
      setSelectedProject("");
      setSelectedBuilding("");
      setUserDataForm((prev) => ({
        ...prev,
        organization_id: orgId,
        company_id: "",
        entity_id: "",
        project_id: "",
        building_id: "",
        zone_id: "",
      }));

      // Reset dependent dropdowns
      setAvailableCompanies([]);
      setAvailableEntities([]);
      setAvailableBuildings([]);
      setAvailableZones([]);

      if (orgId && orgInfo.companies) {
        const filteredCompanies = orgInfo.companies.filter(
          (company) => company.organization === parseInt(orgId)
        );
        setAvailableCompanies(filteredCompanies);
      }

      // If user selects a different organization than their own, fetch projects for that org
      if (orgId && is_manager && parseInt(orgId) !== parseInt(org)) {
        setProjectsLoading(true);
        try {
          console.log("Fetching projects for selected organization:", orgId);
          const res = await getProjectsByOrganization(orgId);
          console.log("Projects API response for selected org:", res.data);

          // Handle different response structures
          let projects = [];
          if (Array.isArray(res.data)) {
            projects = res.data;
          } else if (res.data && res.data.projects) {
            projects = res.data.projects;
          }

          setAvailableProjects(projects);
        } catch (err) {
          console.error("Error fetching projects for selected org:", err);
          setAvailableProjects([]);
          toast.error("Failed to fetch projects for selected organization");
        } finally {
          setProjectsLoading(false);
        }
      }
    },
    [orgInfo.companies, is_manager, org]
  );

  const handleCompanyChange = useCallback(
    (e) => {
      const companyId = e.target.value;
      setSelectedCompany(companyId);
      setUserDataForm((prev) => ({
        ...prev,
        company_id: companyId,
        entity_id: "",
      }));

      if (companyId && orgInfo.entities) {
        const filteredEntities = orgInfo.entities.filter(
          (entity) => entity.company === parseInt(companyId)
        );
        setAvailableEntities(filteredEntities);
      } else {
        setAvailableEntities([]);
      }
    },
    [orgInfo.entities]
  );

  const handleEntityChange = useCallback((e) => {
    const entityId = e.target.value;
    setUserDataForm((prev) => ({
      ...prev,
      entity_id: entityId,
    }));
  }, []);

  const handleProjectChange = useCallback(
    (e) => {
      const projectId = e.target.value;
      setSelectedProject(projectId);
      setSelectedBuilding("");
      setUserDataForm((prev) => ({
        ...prev,
        project_id: projectId,
        building_id: "",
        zone_id: "",
      }));

      // Reset dependent dropdowns
      setAvailableBuildings([]);
      setAvailableZones([]);

      // Reset and fetch category tree for new project
      resetCategorySelections();
      if (projectId) {
        fetchCategoryTree(projectId);
      } else {
        setCategoryTree([]);
      }

      if (projectId) {
        const selectedProjectObj = availableProjects.find(
          (project) => project.id === parseInt(projectId)
        );
        if (selectedProjectObj && selectedProjectObj.buildings) {
          setAvailableBuildings(selectedProjectObj.buildings);
        }
      }
    },
    [availableProjects, resetCategorySelections, fetchCategoryTree]
  );

  const handleBuildingChange = useCallback(
    (e) => {
      const buildingId = e.target.value;
      setSelectedBuilding(buildingId);
      setUserDataForm((prev) => ({
        ...prev,
        building_id: buildingId,
        zone_id: "",
      }));

      // Reset zones
      setAvailableZones([]);

      if (buildingId) {
        const selectedBuildingObj = availableBuildings.find(
          (building) => building.id === parseInt(buildingId)
        );
        if (selectedBuildingObj && selectedBuildingObj.zones) {
          setAvailableZones(selectedBuildingObj.zones);
        }
      }
    },
    [availableBuildings]
  );

  const handleZoneChange = useCallback((e) => {
    const zoneId = e.target.value;
    setUserDataForm((prev) => ({
      ...prev,
      zone_id: zoneId,
    }));
  }, []);

  // Category selection handlers
  const handleCategoryChange = useCallback(
    (e) => {
      const categoryId = e.target.value;
      setSelectedCategory(categoryId);

      // Reset subsequent levels
      setSelectedLevel1("");
      setSelectedLevel2("");
      setSelectedLevel3("");
      setSelectedLevel4("");
      setSelectedLevel5("");
      setSelectedLevel6("");
      setAvailableLevel2([]);
      setAvailableLevel3([]);
      setAvailableLevel4([]);
      setAvailableLevel5([]);
      setAvailableLevel6([]);

      if (categoryId) {
        const selectedCategoryObj = categoryTree.find(
          (cat) => cat.id === parseInt(categoryId)
        );
        if (selectedCategoryObj && selectedCategoryObj.level1) {
          setAvailableLevel1(selectedCategoryObj.level1);
        } else {
          setAvailableLevel1([]);
        }
      } else {
        setAvailableLevel1([]);
      }
    },
    [categoryTree]
  );

  const handleLevel1Change = useCallback(
    (e) => {
      const level1Id = e.target.value;
      setSelectedLevel1(level1Id);

      // Reset subsequent levels
      setSelectedLevel2("");
      setSelectedLevel3("");
      setSelectedLevel4("");
      setSelectedLevel5("");
      setSelectedLevel6("");
      setAvailableLevel3([]);
      setAvailableLevel4([]);
      setAvailableLevel5([]);
      setAvailableLevel6([]);

      if (level1Id) {
        const selectedLevel1Obj = availableLevel1.find(
          (item) => item.id === parseInt(level1Id)
        );
        if (selectedLevel1Obj && selectedLevel1Obj.level2) {
          setAvailableLevel2(selectedLevel1Obj.level2);
        } else {
          setAvailableLevel2([]);
        }
      } else {
        setAvailableLevel2([]);
      }
    },
    [availableLevel1]
  );

  const handleLevel2Change = useCallback(
    (e) => {
      const level2Id = e.target.value;
      setSelectedLevel2(level2Id);

      // Reset subsequent levels
      setSelectedLevel3("");
      setSelectedLevel4("");
      setSelectedLevel5("");
      setSelectedLevel6("");
      setAvailableLevel4([]);
      setAvailableLevel5([]);
      setAvailableLevel6([]);

      if (level2Id) {
        const selectedLevel2Obj = availableLevel2.find(
          (item) => item.id === parseInt(level2Id)
        );
        if (selectedLevel2Obj && selectedLevel2Obj.level3) {
          setAvailableLevel3(selectedLevel2Obj.level3);
        } else {
          setAvailableLevel3([]);
        }
      } else {
        setAvailableLevel3([]);
      }
    },
    [availableLevel2]
  );

  const handleLevel3Change = useCallback(
    (e) => {
      const level3Id = e.target.value;
      setSelectedLevel3(level3Id);

      // Reset subsequent levels
      setSelectedLevel4("");
      setSelectedLevel5("");
      setSelectedLevel6("");
      setAvailableLevel5([]);
      setAvailableLevel6([]);

      if (level3Id) {
        const selectedLevel3Obj = availableLevel3.find(
          (item) => item.id === parseInt(level3Id)
        );
        if (selectedLevel3Obj && selectedLevel3Obj.level4) {
          setAvailableLevel4(selectedLevel3Obj.level4);
        } else {
          setAvailableLevel4([]);
        }
      } else {
        setAvailableLevel4([]);
      }
    },
    [availableLevel3]
  );

  const handleLevel4Change = useCallback(
    (e) => {
      const level4Id = e.target.value;
      setSelectedLevel4(level4Id);

      // Reset subsequent levels
      setSelectedLevel5("");
      setSelectedLevel6("");
      setAvailableLevel6([]);

      if (level4Id) {
        const selectedLevel4Obj = availableLevel4.find(
          (item) => item.id === parseInt(level4Id)
        );
        if (selectedLevel4Obj && selectedLevel4Obj.level5) {
          setAvailableLevel5(selectedLevel4Obj.level5);
        } else {
          setAvailableLevel5([]);
        }
      } else {
        setAvailableLevel5([]);
      }
    },
    [availableLevel4]
  );

  const handleLevel5Change = useCallback(
    (e) => {
      const level5Id = e.target.value;
      setSelectedLevel5(level5Id);

      // Reset subsequent levels
      setSelectedLevel6("");

      if (level5Id) {
        const selectedLevel5Obj = availableLevel5.find(
          (item) => item.id === parseInt(level5Id)
        );
        if (selectedLevel5Obj && selectedLevel5Obj.level6) {
          setAvailableLevel6(selectedLevel5Obj.level6);
        } else {
          setAvailableLevel6([]);
        }
      } else {
        setAvailableLevel6([]);
      }
    },
    [availableLevel5]
  );

  const handleLevel6Change = useCallback((e) => {
    const level6Id = e.target.value;
    setSelectedLevel6(level6Id);
  }, []);

  // Memoize form validation
  const isFormValid = useCallback(() => {
    if (isClient) {
      return (
        userDataForm.username &&
        userDataForm.first_name &&
        userDataForm.last_name &&
        userDataForm.email &&
        userDataForm.password &&
        userDataForm.organization_id &&
        selectedCategory // Category selection is mandatory
      );
    } else {
      return (
        userDataForm.username &&
        userDataForm.first_name &&
        userDataForm.last_name &&
        userDataForm.email &&
        userDataForm.password &&
        userDataForm.role &&
        selectedCategory // Category selection is mandatory
      );
    }
  }, [userDataForm, selectedCategory, isClient]);

  const handleCreate = useCallback(
    async (e) => {
      e.preventDefault();
      if (!isFormValid()) {
        toast.error("Please fill in all required fields");
        return;
      }

      // Build the complete payload for user-access-role endpoint
      const completePayload = {
        user: {
          username: userDataForm.username,
          first_name: userDataForm.first_name,
          last_name: userDataForm.last_name,
          email: userDataForm.email,
          mobile: userDataForm.mobile || null,
          password: userDataForm.password,
          org: userDataForm.organization_id
            ? parseInt(userDataForm.organization_id)
            : isClient
            ? null
            : org
            ? parseInt(org)
            : null,
          company: userDataForm.company_id
            ? parseInt(userDataForm.company_id)
            : null,
          entity: userDataForm.entity_id
            ? parseInt(userDataForm.entity_id)
            : null,
          is_manager: isClient ? true : is_manager,
        },
        access: {
          project_id: userDataForm.project_id
            ? parseInt(userDataForm.project_id)
            : null,
          building_id: userDataForm.building_id
            ? parseInt(userDataForm.building_id)
            : null,
          zone_id: userDataForm.zone_id ? parseInt(userDataForm.zone_id) : null,
          active: true,
          category: selectedCategory ? parseInt(selectedCategory) : null,
          CategoryLevel1: selectedLevel1 ? parseInt(selectedLevel1) : null,
          CategoryLevel2: selectedLevel2 ? parseInt(selectedLevel2) : null,
          CategoryLevel3: selectedLevel3 ? parseInt(selectedLevel3) : null,
          CategoryLevel4: selectedLevel4 ? parseInt(selectedLevel4) : null,
          CategoryLevel5: selectedLevel5 ? parseInt(selectedLevel5) : null,
          CategoryLevel6: selectedLevel6 ? parseInt(selectedLevel6) : null,
        },
        roles: [],
      };

      // Build roles array based on user type and selections
      if (isClient) {
        // For client users, always add Manager role
        completePayload.roles.push({ role: "MANAGER" });

        // Add manager type if selected
        if (selectedManagerType) {
          completePayload.roles.push({
            role: selectedManagerType.toUpperCase().replace(" ", "_"),
          });
        }
      } else {
        // For non-client users, add their selected role
        if (userDataForm.role) {
          completePayload.roles.push({ role: userDataForm.role.toUpperCase() });
        }
      }

      console.log("Complete payload to send:", completePayload);

      try {
        // Use the new API endpoint
        const response = await createUserAccessRole(completePayload);

        if (response.status === 201) {
          toast.success(
            response.data.message ||
              "User created successfully with access and roles assigned"
          );
          resetForm();
        } else {
          toast.error(response.data.message || "Failed to create user");
        }
      } catch (error) {
        console.error("Error creating user with access and roles:", error);
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
          toast.error("Error creating user with access and roles");
        }
      }
    },
    [
      userDataForm,
      selectedCategory,
      selectedLevel1,
      selectedLevel2,
      selectedLevel3,
      selectedLevel4,
      selectedLevel5,
      selectedLevel6,
      selectedManagerType,
      isClient,
      is_manager,
      org,
      isFormValid,
    ]
  );
  const resetForm = useCallback(() => {
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
      project_id: "",
      building_id: "",
      zone_id: "",
    });
    setSelectedOrganization("");
    setSelectedCompany("");
    setSelectedProject("");
    setSelectedBuilding("");
    setAvailableCompanies([]);
    setAvailableEntities([]);
    setAvailableProjects([]);
    setAvailableBuildings([]);
    setAvailableZones([]);
    setOrgManagerTypes([]);
    setShowManagerDropdown(false);
    setSelectedManagerType("");
    setAdd(false);
    setOrgInfo({});
    setProjectsLoading(false);

    // Reset category tree data
    setCategoryTree([]);
    setCategoryLoading(false);
    resetCategorySelections();
  }, [resetCategorySelections]);

  // Memoize submit button class name to ensure it's always a string
  const submitButtonClassName = useMemo(() => {
    const baseClasses = "flex-1 py-2 px-4 rounded transition duration-200";
    const validClasses = "bg-purple-700 text-white hover:bg-purple-800";
    const invalidClasses = "bg-gray-300 text-gray-500 cursor-not-allowed";

    const isValid = isFormValid();
    return `${baseClasses} ${isValid ? validClasses : invalidClasses}`;
  }, [isFormValid]);

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
                  Manager Access (Render #{renderCount.current})
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

                {(orgInfoLoading || projectsLoading) && (
                  <div className="text-center py-4">
                    <span className="text-purple-600">
                      {orgInfoLoading
                        ? "Loading organizations..."
                        : "Loading projects..."}
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
                          setUserDataForm((prev) => ({
                            ...prev,
                            username: e.target.value,
                          }))
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

                        {/* Debug info - Only show for managers */}
                        {is_manager && (
                          <div className="grid grid-cols-3 gap-3 items-center bg-yellow-50 p-2 rounded">
                            <label className="text-sm font-medium text-end">
                              Debug:
                            </label>
                            <div className="col-span-2 text-xs text-gray-700">
                              <div>Manager: {is_manager ? "Yes" : "No"}</div>
                              <div>Projects: {availableProjects.length}</div>
                              <div>
                                ShowDropdown:{" "}
                                {showManagerDropdown ? "Yes" : "No"}
                              </div>
                              <div>Manager Types: {orgManagerTypes.length}</div>
                              <div>
                                Loading: {projectsLoading ? "Yes" : "No"}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Category Selection Section - Show only if project is selected */}
                        {is_manager && selectedProject && (
                          <>
                            <div className="grid grid-cols-3 gap-3 items-center bg-blue-50 p-2 rounded">
                              <label className="text-sm font-medium text-end">
                                Categories:
                              </label>
                              <div className="col-span-2 text-xs text-blue-700">
                                <div>Project: {selectedProject}</div>
                                <div>
                                  Categories Available: {categoryTree.length}
                                </div>
                                <div>
                                  Loading: {categoryLoading ? "Yes" : "No"}
                                </div>
                                <div>Manager: {is_manager ? "Yes" : "No"}</div>
                              </div>
                            </div>

                            {/* Category Dropdown */}
                            <div className="grid grid-cols-3 gap-3 items-center">
                              <label className="text-sm font-medium text-end">
                                Category<span className="text-red-500">*</span>
                              </label>
                              <select
                                className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                                value={selectedCategory}
                                onChange={handleCategoryChange}
                                disabled={
                                  categoryLoading || categoryTree.length === 0
                                }
                                required
                              >
                                <option value="">
                                  {categoryLoading
                                    ? "Loading categories..."
                                    : categoryTree.length === 0
                                    ? "No categories available"
                                    : `Select Category (${categoryTree.length} available)`}
                                </option>
                                {categoryTree.map((category, index) => (
                                  <option
                                    key={category.id || index}
                                    value={category.id}
                                  >
                                    {category.name || `Category ${index + 1}`}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Level 1 Dropdown */}
                            {selectedCategory && availableLevel1.length > 0 && (
                              <div className="grid grid-cols-3 gap-3 items-center">
                                <label className="text-sm font-medium text-end">
                                  Level 1
                                </label>
                                <select
                                  className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                                  value={selectedLevel1}
                                  onChange={handleLevel1Change}
                                >
                                  <option value="">
                                    Select Level 1 (Optional)
                                  </option>
                                  {availableLevel1.map((item) => (
                                    <option key={item.id} value={item.id}>
                                      {item.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}

                            {/* Level 2 Dropdown */}
                            {selectedLevel1 && availableLevel2.length > 0 && (
                              <div className="grid grid-cols-3 gap-3 items-center">
                                <label className="text-sm font-medium text-end">
                                  Level 2
                                </label>
                                <select
                                  className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                                  value={selectedLevel2}
                                  onChange={handleLevel2Change}
                                >
                                  <option value="">
                                    Select Level 2 (Optional)
                                  </option>
                                  {availableLevel2.map((item) => (
                                    <option key={item.id} value={item.id}>
                                      {item.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}

                            {/* Level 3 Dropdown */}
                            {selectedLevel2 && availableLevel3.length > 0 && (
                              <div className="grid grid-cols-3 gap-3 items-center">
                                <label className="text-sm font-medium text-end">
                                  Level 3
                                </label>
                                <select
                                  className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                                  value={selectedLevel3}
                                  onChange={handleLevel3Change}
                                >
                                  <option value="">
                                    Select Level 3 (Optional)
                                  </option>
                                  {availableLevel3.map((item) => (
                                    <option key={item.id} value={item.id}>
                                      {item.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}

                            {/* Level 4 Dropdown */}
                            {selectedLevel3 && availableLevel4.length > 0 && (
                              <div className="grid grid-cols-3 gap-3 items-center">
                                <label className="text-sm font-medium text-end">
                                  Level 4
                                </label>
                                <select
                                  className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                                  value={selectedLevel4}
                                  onChange={handleLevel4Change}
                                >
                                  <option value="">
                                    Select Level 4 (Optional)
                                  </option>
                                  {availableLevel4.map((item) => (
                                    <option key={item.id} value={item.id}>
                                      {item.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}

                            {/* Level 5 Dropdown */}
                            {selectedLevel4 && availableLevel5.length > 0 && (
                              <div className="grid grid-cols-3 gap-3 items-center">
                                <label className="text-sm font-medium text-end">
                                  Level 5
                                </label>
                                <select
                                  className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                                  value={selectedLevel5}
                                  onChange={handleLevel5Change}
                                >
                                  <option value="">
                                    Select Level 5 (Optional)
                                  </option>
                                  {availableLevel5.map((item) => (
                                    <option key={item.id} value={item.id}>
                                      {item.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}

                            {/* Level 6 Dropdown */}
                            {selectedLevel5 && availableLevel6.length > 0 && (
                              <div className="grid grid-cols-3 gap-3 items-center">
                                <label className="text-sm font-medium text-end">
                                  Level 6
                                </label>
                                <select
                                  className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                                  value={selectedLevel6}
                                  onChange={handleLevel6Change}
                                >
                                  <option value="">
                                    Select Level 6 (Optional)
                                  </option>
                                  {availableLevel6.map((item) => (
                                    <option key={item.id} value={item.id}>
                                      {item.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </>
                        )}

                        {/* Manager Type Dropdown - Force show if manager */}
                        {is_manager && orgManagerTypes.length > 0 && (
                          <div className="grid grid-cols-3 gap-3 items-center">
                            <label className="text-sm font-medium text-end">
                              Manager Type
                              <span className="text-red-500">*</span>
                            </label>
                            <select
                              className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                              value={selectedManagerType}
                              onChange={(e) =>
                                setSelectedManagerType(e.target.value)
                              }
                              required
                            >
                              <option value="">Select Manager Type</option>
                              {orgManagerTypes.map((type, index) => (
                                <option key={index} value={type}>
                                  {type}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Project Dropdown - Force show if manager and has projects */}
                        {is_manager && availableProjects.length > 0 && (
                          <div className="grid grid-cols-3 gap-3 items-center">
                            <label className="text-sm font-medium text-end">
                              Project
                            </label>
                            <select
                              className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                              value={selectedProject}
                              onChange={handleProjectChange}
                              disabled={projectsLoading}
                            >
                              <option value="">
                                {projectsLoading
                                  ? "Loading projects..."
                                  : "Select Project (Optional)"}
                              </option>
                              {availableProjects.map((project, index) => (
                                <option
                                  key={project.id || index}
                                  value={project.id}
                                >
                                  {project.name || `Project ${index + 1}`}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Building Dropdown (only if project selected) */}
                        {is_manager &&
                          selectedProject &&
                          availableBuildings.length > 0 && (
                            <div className="grid grid-cols-3 gap-3 items-center">
                              <label className="text-sm font-medium text-end">
                                Building
                              </label>
                              <select
                                className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                                value={selectedBuilding}
                                onChange={handleBuildingChange}
                              >
                                <option value="">
                                  Select Building (Optional)
                                </option>
                                {availableBuildings.map((building) => (
                                  <option key={building.id} value={building.id}>
                                    {building.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                        {/* Zone Dropdown (only if building selected) */}
                        {is_manager &&
                          selectedBuilding &&
                          availableZones.length > 0 && (
                            <div className="grid grid-cols-3 gap-3 items-center">
                              <label className="text-sm font-medium text-end">
                                Zone
                              </label>
                              <select
                                className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                                value={userDataForm.zone_id}
                                onChange={handleZoneChange}
                              >
                                <option value="">Select Zone (Optional)</option>
                                {availableZones.map((zone) => (
                                  <option key={zone.id} value={zone.id}>
                                    {zone.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

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
                            setUserDataForm((prev) => ({
                              ...prev,
                              role: e.target.value,
                            }))
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

                    {/* Project Dropdown for NON-CLIENT managers */}
                    {!isClient &&
                      is_manager &&
                      availableProjects.length > 0 && (
                        <div className="grid grid-cols-3 gap-3 items-center">
                          <label className="text-sm font-medium text-end">
                            Project
                          </label>
                          <select
                            className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={selectedProject}
                            onChange={handleProjectChange}
                            disabled={projectsLoading}
                          >
                            <option value="">
                              {projectsLoading
                                ? "Loading projects..."
                                : "Select Project (Optional)"}
                            </option>
                            {availableProjects.map((project, index) => (
                              <option
                                key={project.id || index}
                                value={project.id}
                              >
                                {project.name || `Project ${index + 1}`}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                    {/* Category Selection Section for NON-CLIENT managers */}
                    {!isClient && is_manager && selectedProject && (
                      <>
                        <div className="grid grid-cols-3 gap-3 items-center bg-blue-50 p-2 rounded">
                          <label className="text-sm font-medium text-end">
                            Categories:
                          </label>
                          <div className="col-span-2 text-xs text-blue-700">
                            <div>Project: {selectedProject}</div>
                            <div>
                              Categories Available: {categoryTree.length}
                            </div>
                            <div>Loading: {categoryLoading ? "Yes" : "No"}</div>
                          </div>
                        </div>

                        {/* Category Dropdown */}
                        <div className="grid grid-cols-3 gap-3 items-center">
                          <label className="text-sm font-medium text-end">
                            Category<span className="text-red-500">*</span>
                          </label>
                          <select
                            className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={selectedCategory}
                            onChange={handleCategoryChange}
                            disabled={
                              categoryLoading || categoryTree.length === 0
                            }
                            required
                          >
                            <option value="">
                              {categoryLoading
                                ? "Loading categories..."
                                : categoryTree.length === 0
                                ? "No categories available"
                                : "Select Category"}
                            </option>
                            {categoryTree.map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Level 1 Dropdown */}
                        {selectedCategory && availableLevel1.length > 0 && (
                          <div className="grid grid-cols-3 gap-3 items-center">
                            <label className="text-sm font-medium text-end">
                              Level 1
                            </label>
                            <select
                              className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                              value={selectedLevel1}
                              onChange={handleLevel1Change}
                            >
                              <option value="">
                                Select Level 1 (Optional)
                              </option>
                              {availableLevel1.map((item) => (
                                <option key={item.id} value={item.id}>
                                  {item.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Level 2 Dropdown */}
                        {selectedLevel1 && availableLevel2.length > 0 && (
                          <div className="grid grid-cols-3 gap-3 items-center">
                            <label className="text-sm font-medium text-end">
                              Level 2
                            </label>
                            <select
                              className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                              value={selectedLevel2}
                              onChange={handleLevel2Change}
                            >
                              <option value="">
                                Select Level 2 (Optional)
                              </option>
                              {availableLevel2.map((item) => (
                                <option key={item.id} value={item.id}>
                                  {item.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Level 3 Dropdown */}
                        {selectedLevel2 && availableLevel3.length > 0 && (
                          <div className="grid grid-cols-3 gap-3 items-center">
                            <label className="text-sm font-medium text-end">
                              Level 3
                            </label>
                            <select
                              className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                              value={selectedLevel3}
                              onChange={handleLevel3Change}
                            >
                              <option value="">
                                Select Level 3 (Optional)
                              </option>
                              {availableLevel3.map((item) => (
                                <option key={item.id} value={item.id}>
                                  {item.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Level 4 Dropdown */}
                        {selectedLevel3 && availableLevel4.length > 0 && (
                          <div className="grid grid-cols-3 gap-3 items-center">
                            <label className="text-sm font-medium text-end">
                              Level 4
                            </label>
                            <select
                              className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                              value={selectedLevel4}
                              onChange={handleLevel4Change}
                            >
                              <option value="">
                                Select Level 4 (Optional)
                              </option>
                              {availableLevel4.map((item) => (
                                <option key={item.id} value={item.id}>
                                  {item.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Level 5 Dropdown */}
                        {selectedLevel4 && availableLevel5.length > 0 && (
                          <div className="grid grid-cols-3 gap-3 items-center">
                            <label className="text-sm font-medium text-end">
                              Level 5
                            </label>
                            <select
                              className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                              value={selectedLevel5}
                              onChange={handleLevel5Change}
                            >
                              <option value="">
                                Select Level 5 (Optional)
                              </option>
                              {availableLevel5.map((item) => (
                                <option key={item.id} value={item.id}>
                                  {item.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Level 6 Dropdown */}
                        {selectedLevel5 && availableLevel6.length > 0 && (
                          <div className="grid grid-cols-3 gap-3 items-center">
                            <label className="text-sm font-medium text-end">
                              Level 6
                            </label>
                            <select
                              className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                              value={selectedLevel6}
                              onChange={handleLevel6Change}
                            >
                              <option value="">
                                Select Level 6 (Optional)
                              </option>
                              {availableLevel6.map((item) => (
                                <option key={item.id} value={item.id}>
                                  {item.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </>
                    )}

                    {/* Building Dropdown for NON-CLIENT managers */}
                    {!isClient &&
                      is_manager &&
                      selectedProject &&
                      availableBuildings.length > 0 && (
                        <div className="grid grid-cols-3 gap-3 items-center">
                          <label className="text-sm font-medium text-end">
                            Building
                          </label>
                          <select
                            className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={selectedBuilding}
                            onChange={handleBuildingChange}
                          >
                            <option value="">Select Building (Optional)</option>
                            {availableBuildings.map((building) => (
                              <option key={building.id} value={building.id}>
                                {building.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                    {/* Zone Dropdown for NON-CLIENT managers */}
                    {!isClient &&
                      is_manager &&
                      selectedBuilding &&
                      availableZones.length > 0 && (
                        <div className="grid grid-cols-3 gap-3 items-center">
                          <label className="text-sm font-medium text-end">
                            Zone
                          </label>
                          <select
                            className="col-span-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={userDataForm.zone_id}
                            onChange={handleZoneChange}
                          >
                            <option value="">Select Zone (Optional)</option>
                            {availableZones.map((zone) => (
                              <option key={zone.id} value={zone.id}>
                                {zone.name}
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
                          setUserDataForm((prev) => ({
                            ...prev,
                            first_name: e.target.value,
                          }))
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
                          setUserDataForm((prev) => ({
                            ...prev,
                            last_name: e.target.value,
                          }))
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
                          setUserDataForm((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
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
                          setUserDataForm((prev) => ({
                            ...prev,
                            mobile: e.target.value,
                          }))
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
                          setUserDataForm((prev) => ({
                            ...prev,
                            password: e.target.value,
                          }))
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
                        className={submitButtonClassName}
                        disabled={
                          !isFormValid() || orgInfoLoading || projectsLoading
                        }
                      >
                        {orgInfoLoading || projectsLoading
                          ? "Loading..."
                          : "Create User"}
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