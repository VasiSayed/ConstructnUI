import React from "react";
import {
  Building2,
  Building,
  MapPin,
  Search,
  Plus,
  Edit3,
  Trash2,
  Check,
  ChevronRight,
} from "lucide-react";
import {
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getOrganizationDetailsById,
  createCompany,
  getCompanyDetailsById,
  createEntity,
  allorgantioninfototalbyUser_id,
} from "../../api";
import { toast } from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import { setOrganization as setOrganizationAction } from "../../store/userSlice";
import { useTheme } from "../../ThemeContext"; // Use your ThemeContext here

const ORANGE = "#ea6822";
const ORANGE_DARK = "#e44a22";
const GOLD_GRADIENT_CSS = "linear-gradient(90deg, #fde047 60%, #facc15 100%)";
const YELLOW_BORDER = "#facc15";
const YELLOW_TEXT = "#783f04";

const STEPS = [
  { key: "organization", label: "Setup Organization", icon: Building2 },
  { key: "company", label: "Setup Company", icon: Building },
  { key: "entity", label: "Setup Entity", icon: MapPin },
];

const UserSetup = () => {
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.user.user.id);

  // GLOBAL THEME FROM CONTEXT
  const { theme, toggleTheme } = useTheme();

  // State
  const [setup, setSetup] = React.useState("organization");
  const [organizationDetails, setOrganizationDetails] = React.useState([]);
  const [orgForm, setOrgForm] = React.useState({ organization_name: "" });
  const [editingOrg, setEditingOrg] = React.useState(null);
  const [editingName, setEditingName] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [selectedOrgId, setSelectedOrgId] = React.useState(null);
  const [orgSearch, setOrgSearch] = React.useState("");
  const [companyDetails, setCompanyDetails] = React.useState([]);
  const [companyForm, setCompanyForm] = React.useState({
    name: "",
    entity_name: "",
    country: "",
    state_name: "",
    region: "",
    zone_name: "",
    sub_domain: "",
  });
  const [entityStepOrgs, setEntityStepOrgs] = React.useState([]);
  const [entityStepCompanies, setEntityStepCompanies] = React.useState([]);
  const [selectedEntityOrgId, setSelectedEntityOrgId] = React.useState(null);
  const [selectedEntityCompanyId, setSelectedEntityCompanyId] = React.useState(null);
  const [entityForm, setEntityForm] = React.useState({
    name: "",
    state: "",
    region: "",
    zone: "",
  });

  // API handlers
  const fetchOrganizations = async () => {
    try {
      const response = await getOrganizationDetailsById(userId);
      setOrganizationDetails(Array.isArray(response.data) ? response.data : []);
    } catch {
      setOrganizationDetails([]);
    }
  };
  const fetchCompanies = async (orgId) => {
    if (!orgId) return setCompanyDetails([]);
    try {
      const response = await getCompanyDetailsById(orgId);
      if (response.data && response.data.data && response.data.data.company) {
        setCompanyDetails(response.data.data.company);
      } else setCompanyDetails([]);
    } catch {
      setCompanyDetails([]);
    }
  };
  const fetchEntityStepInfo = async () => {
    try {
      const response = await allorgantioninfototalbyUser_id(userId);
      setEntityStepOrgs(Array.isArray(response.data.organizations) ? response.data.organizations : []);
      setEntityStepCompanies(Array.isArray(response.data.companies) ? response.data.companies : []);
    } catch {
      setEntityStepOrgs([]);
      setEntityStepCompanies([]);
    }
  };

  React.useEffect(() => {
    if (setup === "organization" || setup === "company") fetchOrganizations();
  }, [setup, userId]);
  React.useEffect(() => {
    if (setup === "company" && selectedOrgId) fetchCompanies(selectedOrgId);
  }, [setup, selectedOrgId]);
  React.useEffect(() => {
    if (setup === "entity") fetchEntityStepInfo();
  }, [setup, userId]);

  // Organization handlers
  const handleOrgSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await createOrganization({
        ...orgForm,
        created_by: userId,
        active: true,
      });
      toast.success("Organization added!");
      setOrganizationDetails(prev =>
        [{ id: response.data.id, organization_name: orgForm.organization_name }, ...prev]
      );
      setOrgForm({ organization_name: "" });
      setEditingOrg(null);
    } catch (error) {
      if (
        error?.response?.data?.non_field_errors &&
        error.response.data.non_field_errors[0]?.includes("must make a unique set")
      ) {
        toast.error("This organization already exists for this user. Please select it.");
      } else {
        toast.error(error.response?.data?.message || "Failed to create organization.");
      }
    } finally {
      setLoading(false);
    }
  };
  const handleSelectOrg = (org) => {
    setSelectedOrgId(org.id);
    dispatch(setOrganizationAction(org.id));
  };
  const handleEditOrg = (org) => {
    setEditingOrg(org.id);
    setEditingName(org.organization_name);
  };
  const handleUpdateOrg = async (org) => {
    if (!editingName.trim()) {
      toast.error("Organization name cannot be empty.");
      return;
    }
    try {
      await updateOrganization(org.id, { organization_name: editingName });
      toast.success("Organization updated!");
      setEditingOrg(null);
      setEditingName("");
      setOrganizationDetails((prev) =>
        prev.map((item) =>
          item.id === org.id ? { ...item, organization_name: editingName } : item
        )
      );
      fetchOrganizations();
    } catch (error) {
      toast.error("Error updating organization");
    }
  };
  const handleDeleteOrg = async (org) => {
    if (!window.confirm(`Delete organization "${org.organization_name}"? This cannot be undone!`)) return;
    try {
      await deleteOrganization(org.id);
      toast.success("Organization deleted!");
      setOrganizationDetails((prev) =>
        prev.filter((item) => item.id !== org.id)
      );
      fetchOrganizations();
    } catch (error) {
      toast.error("Error deleting organization");
    }
  };

  // Company handlers
  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrgId) {
      toast.error("Select organization first.");
      return;
    }
    try {
      const response = await createCompany({
        ...companyForm,
        organization: selectedOrgId,
        created_by: userId,
      });
      if (response.status === 200 && response.data.data) {
        toast.success(response.data.message || "Company created!");
        setCompanyForm({
          name: "",
          entity_name: "",
          country: "",
          state_name: "",
          region: "",
          zone_name: "",
          sub_domain: "",
        });
        setSetup("entity");
        setSelectedEntityOrgId(selectedOrgId);
        setSelectedEntityCompanyId(response.data.data.id);
        fetchEntityStepInfo();
      }
    } catch (error) {
      if (
        error?.response?.data?.non_field_errors &&
        error.response.data.non_field_errors[0]?.includes("must make a unique set")
      ) {
        toast.error("A company with this name already exists for the selected organization. Please use a different name or select the existing company.");
      } else {
        toast.error(error.response?.data?.message || "Error creating company.");
      }
    }
  };

  // Entity handlers
  const handleEntitySubmit = async (e) => {
    e.preventDefault();
    if (!selectedEntityCompanyId) {
      toast.error("Please select a company first.");
      return;
    }
    const payload = {
      ...entityForm,
      company: selectedEntityCompanyId,
      created_by: userId,
    };
    const selectedOrg = entityStepOrgs.find((o) => o.id === selectedEntityOrgId);
    try {
      const response = await createEntity(payload);
      if (response.status === 200 && response.data.success) {
        toast.success(
          `Setup successful! Organization: ${selectedOrg?.organization_name || ""}`
        );
        setEntityForm({
          name: "",
          state: "",
          region: "",
          zone: "",
        });
      } else {
        toast.error(response.data.message || "Error creating entity.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Unexpected error creating entity.");
    }
  };

  // Filtering
  const filteredCompaniesForEntity = selectedEntityOrgId
    ? entityStepCompanies.filter((c) => c.organization === selectedEntityOrgId)
    : [];
  const filteredOrgs = organizationDetails.filter(org =>
    org.organization_name.toLowerCase().includes(orgSearch.toLowerCase())
  );

  // Theme palette
  const palette = theme === "dark"
    ? {
        bg: "bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800",
        card: "bg-slate-900/70 backdrop-blur-2xl border-amber-400/40",
        border: "#ffa95d44",
        input: "bg-slate-800 text-amber-100 border-amber-300",
        inputFocus: "focus:bg-slate-900 focus:ring-2 focus:ring-amber-400 focus:border-transparent",
        accent: "from-yellow-300 to-yellow-500",
        text: "text-white",
        subtext: "text-amber-300",
        btn: "bg-gradient-to-r from-yellow-300 to-yellow-500 text-yellow-900",
        btnHover: "hover:from-yellow-200 hover:to-yellow-400",
        icon: "text-yellow-500",
      }
    : {
        bg: "",
        card: "",
        border: "#ea682230",
        input: "bg-[#f8f7fa] text-[#27272f] border-[#ea6822]",
        inputFocus: "",
        accent: "from-[#ea6822] to-[#e44a22]",
        text: "text-[#27272f]",
        subtext: "text-[#ea6822]",
        btn: "bg-gradient-to-r from-[#ea6822] to-[#e44a22] text-white",
        btnHover: "hover:from-[#ea6822] hover:to-[#e44a22]",
        icon: "text-[#ea6822]",
      };

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center py-10 px-4 ${palette.bg}`}>
      {/* Theme Toggle */}
      {/* <div className="flex justify-end w-full max-w-5xl mb-4">
        <button
          onClick={toggleTheme}
          style={{
            background: "#fff",
            border: `1.5px solid ${theme === "dark" ? YELLOW_BORDER : ORANGE}`,
            color: theme === "dark" ? YELLOW_BORDER : ORANGE_DARK,
            borderRadius: 10,
            padding: "7px 18px",
            fontWeight: 500,
            cursor: "pointer",
            fontSize: 15,
            marginRight: 0,
            boxShadow: theme === "dark" ? "0 2px 12px #0001" : "0 1px 4px #ea682220"
          }}
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>
      </div> */}

      {/* Stepper */}
      <div className="flex items-center gap-2 justify-center w-full max-w-4xl mb-10">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isActive = setup === step.key;
          const isPast = STEPS.findIndex(s => s.key === setup) > idx;
          return (
            <React.Fragment key={step.key}>
              <button
                onClick={() => setSetup(step.key)}
                className={`group flex flex-col items-center px-4 py-2 focus:outline-none`}
                style={{
                  transform: isActive ? "scale(1.07)" : "scale(1)",
                  transition: "transform 0.2s"
                }}
              >
                <div
                  className={`relative rounded-2xl flex items-center justify-center mb-2 transition-all duration-300`}
                  style={{
                    width: 52,
                    height: 52,
                    background: isActive || isPast
                      ? (theme === "dark"
                        ? GOLD_GRADIENT_CSS
                        : `linear-gradient(90deg, ${ORANGE} 60%, ${ORANGE_DARK} 100%)`)
                      : "#fff",
                    color: isActive || isPast
                      ? (theme === "dark" ? YELLOW_TEXT : "#fff")
                      : ORANGE,
                    boxShadow: isActive
                      ? (theme === "dark" ? "0 4px 24px #fffbe01c" : "0 4px 24px #ffd7b01c")
                      : isPast
                        ? (theme === "dark" ? "0 2px 12px #fffbe01c" : "0 2px 12px #ffd7b01c")
                        : "none",
                    border: `2px solid ${isActive || isPast ? (theme === "dark" ? YELLOW_BORDER : ORANGE) : palette.border}`
                  }}
                >
                  {isPast && !isActive ? (
                    <Check className="w-7 h-7" />
                  ) : (
                    <Icon className="w-7 h-7" />
                  )}
                  {isActive && (
                    <div className="absolute inset-0 rounded-2xl bg-white/10 animate-pulse"></div>
                  )}
                </div>
                <span className="text-xs font-semibold tracking-wide"
                  style={{
                    color: isActive ? (theme === "dark" ? YELLOW_TEXT : ORANGE_DARK) : (isPast ? (theme === "dark" ? YELLOW_TEXT : ORANGE) : ORANGE),
                    fontWeight: isActive ? "bold" : "normal"
                  }}>
                  {step.label}
                </span>
              </button>
              {idx < STEPS.length - 1 && (
                <div
                  className="flex-1 h-1 max-w-[60px] rounded-full"
                  style={{
                    background: isPast
                      ? (theme === "dark"
                        ? `linear-gradient(90deg, #fde047 50%, #facc15 100%)`
                        : `linear-gradient(90deg, ${ORANGE} 50%, ${ORANGE_DARK} 100%)`)
                      : palette.border
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* --- ORGANIZATION STEP --- */}
      {setup === "organization" && (
        <div className="flex flex-col items-center justify-center w-full">
          <div
            className={`shadow-2xl border rounded-3xl px-8 py-10 flex flex-col items-center w-full max-w-3xl relative overflow-hidden ${palette.card}`}
            style={{
              background: theme === "dark" ? "rgba(30,41,59,0.80)" : "#fff",
              border: `1.5px solid ${palette.border}`
            }}
          >
            {/* Search bar */}
            <div className="relative w-full max-w-xl mb-8">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${palette.icon} w-5 h-5`} />
              <input
                type="text"
                value={orgSearch}
                onChange={e => setOrgSearch(e.target.value)}
                className={`w-full rounded-2xl pl-10 pr-4 py-3 border ${palette.input} ${palette.inputFocus}`}
                placeholder="Search organizations..."
              />
            </div>
            {/* Organization Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full mb-8 min-h-[180px]">
              {filteredOrgs.length === 0 && orgSearch && (
                <div className={`col-span-full text-center ${palette.subtext} text-lg py-12`}>
                  No organizations found
                </div>
              )}
              {filteredOrgs.map((org) => (
                <div
                  key={org.id}
                  onClick={() => handleSelectOrg(org)}
                  className={
                    "relative p-4 rounded-2xl cursor-pointer transition-all duration-300 group " +
                    (selectedOrgId === org.id
                      ? (theme === "dark"
                        ? "bg-gradient-to-r from-yellow-300 to-yellow-500 text-yellow-900 shadow-xl scale-105"
                        : "bg-gradient-to-r from-[#ea6822] to-[#e44a22] text-white shadow-xl scale-105")
                      : `${palette.card} ${palette.text} border border-amber-400 hover:bg-amber-400/10`)
                  }
                  style={
                    selectedOrgId === org.id
                      ? { border: `2px solid ${theme === "dark" ? YELLOW_BORDER : ORANGE}` }
                      : { borderColor: palette.border }
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building2 className={`w-5 h-5 ${palette.icon}`} />
                      <span className={`font-semibold ${selectedOrgId === org.id && theme === "dark" ? "text-yellow-900" : palette.text}`}>
                        {org.organization_name}
                      </span>
                    </div>
                    {selectedOrgId === org.id && <Check className="w-5 h-5" />}
                  </div>
                  {selectedOrgId === org.id && (
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditOrg(org);
                        }}
                        className="p-1.5 rounded-lg bg-white/30 hover:bg-white/40 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteOrg(org);
                        }}
                        className="p-1.5 rounded-lg bg-white/30 hover:bg-white/40 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {/* Add New Organization Card */}
              <div
                onClick={() => setEditingOrg("NEW")}
                className={`p-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300
                  ${editingOrg === "NEW"
                    ? (theme === "dark"
                      ? "border-yellow-400 bg-yellow-100/10 text-yellow-400"
                      : "border-orange-400 bg-orange-50 text-[#ea6822]")
                    : (theme === "dark"
                      ? "border-yellow-300 hover:border-yellow-400 hover:bg-yellow-100/10 text-yellow-400"
                      : "border-orange-300 hover:border-orange-400 hover:bg-orange-50 text-[#ea6822]")}`}
              >
                <div className="flex items-center justify-center gap-3">
                  <Plus className="w-5 h-5" />
                  <span className="font-semibold">Add Organization</span>
                </div>
              </div>
            </div>
            {/* Add/Edit Organization form */}
            {editingOrg === "NEW" && (
              <form
                className={`w-full max-w-md flex flex-col items-center gap-4 p-6 border rounded-2xl
                ${theme === "dark" ? "bg-slate-800 border-yellow-300" : "bg-[#fff8f2] border-orange-300"}`}
                onSubmit={handleOrgSubmit}
              >
                <input
                  name="organization_name"
                  value={orgForm.organization_name}
                  onChange={e => setOrgForm({ ...orgForm, organization_name: e.target.value })}
                  placeholder="Enter organization name"
                  className={`w-full rounded-xl px-4 py-3 border ${palette.input}`}
                  required
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className={`rounded-xl px-8 py-3 font-semibold ${palette.btn} ${palette.btnHover}`}
                    disabled={loading}
                  >
                    {loading ? "Adding..." : "Add Organization"}
                  </button>
                  <button
                    type="button"
                    className="rounded-xl px-8 py-3 border font-medium"
                    style={{
                      borderColor: theme === "dark" ? YELLOW_BORDER : ORANGE,
                      color: theme === "dark" ? YELLOW_BORDER : ORANGE,
                      background: "#fff"
                    }}
                    onClick={() => setEditingOrg(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
            {editingOrg && editingOrg !== "NEW" && (
              <form
                className={`w-full max-w-md flex flex-col items-center gap-4 p-6 border rounded-2xl
                ${theme === "dark" ? "bg-slate-800 border-yellow-300" : "bg-[#fff8f2] border-orange-300"}`}
                onSubmit={e => {
                  e.preventDefault();
                  handleUpdateOrg(filteredOrgs.find(o => o.id === editingOrg));
                }}
              >
                <input
                  value={editingName}
                  onChange={e => setEditingName(e.target.value)}
                  className={`w-full rounded-xl px-4 py-3 border ${palette.input}`}
                  required
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className={`rounded-xl px-8 py-3 font-semibold ${palette.btn} ${palette.btnHover}`}
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    className="rounded-xl px-8 py-3 border font-medium"
                    style={{
                      borderColor: theme === "dark" ? YELLOW_BORDER : ORANGE,
                      color: theme === "dark" ? YELLOW_BORDER : ORANGE,
                      background: "#fff"
                    }}
                    onClick={() => setEditingOrg(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
            {selectedOrgId && !editingOrg && (
              <button
                className={`mt-6 rounded-xl px-12 py-3 font-semibold flex items-center gap-2 ${palette.btn} ${palette.btnHover}`}
                onClick={() => setSetup("company")}
              >
                Continue to Company Setup
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* --- COMPANY STEP --- */}
      {setup === "company" && (
        <div className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl">
          {/* Left Panel */}
          <div
            className={`flex-1 rounded-3xl shadow-2xl p-8 border ${palette.card}`}
            style={{
              background: theme === "dark" ? "rgba(30,41,59,0.80)" : "#fff",
              border: `1.5px solid ${palette.border}`
            }}
          >
            <h3 className={`mb-6 font-bold text-2xl flex items-center gap-3 ${palette.text}`}>
              <Building2 className={`w-7 h-7 ${palette.icon}`} />
              Organizations & Companies
            </h3>
            {/* Organizations List */}
            <div className="mb-8">
              <h4 className={`text-sm font-semibold ${palette.subtext}`} style={{ textTransform: "uppercase", letterSpacing: "1.5px" }}>
                Organizations
              </h4>
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2">
                {organizationDetails.length === 0 ? (
                  <div className={`text-center py-6 ${palette.subtext}`}>
                    No organizations available
                  </div>
                ) : (
                  organizationDetails.map((org, idx) => (
                    <div
                      key={org.id}
                      onClick={() => handleSelectOrg(org)}
                      className={`p-4 rounded-xl cursor-pointer transition-all duration-200
                        ${selectedOrgId === org.id
                          ? (theme === "dark"
                            ? "bg-gradient-to-r from-yellow-300 to-yellow-500 text-yellow-900 shadow-lg"
                            : "bg-gradient-to-r from-[#ea6822] to-[#e44a22] text-white shadow-lg")
                          : `${theme === "dark"
                            ? "bg-white/10 border border-yellow-400 text-white hover:border-yellow-300 hover:bg-yellow-400/10"
                            : "bg-white border border-[#ea6822] text-[#27272f] hover:border-[#e44a22] hover:bg-[#fff8f2]"}`}`}
                      style={{
                        border: `1.5px solid ${selectedOrgId === org.id ? (theme === "dark" ? YELLOW_BORDER : ORANGE) : palette.border}`,
                        boxShadow: selectedOrgId === org.id ? (theme === "dark" ? "0 2px 10px #fde04744" : "0 2px 10px #ea682232") : "none"
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-sm">{idx + 1}</span>
                          <Building2 className={`w-4 h-4 ${palette.icon}`} />
                          <span className="font-medium">{org.organization_name}</span>
                        </div>
                        {selectedOrgId === org.id && <Check className="w-5 h-5" />}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            {/* Companies List */}
            <div>
              <h4 className={`text-sm font-semibold ${palette.subtext}`} style={{ textTransform: "uppercase", letterSpacing: "1.5px" }}>
                Companies
              </h4>
              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-2">
                {companyDetails.length === 0 ? (
                  <div className={`text-center py-6 ${palette.subtext}`}>
                    {selectedOrgId ? "No companies yet" : "Select an organization first"}
                  </div>
                ) : (
                  companyDetails.map((comp, idx) => (
                    <div
                      key={comp.id}
                      className={`p-4 rounded-xl
                        ${theme === "dark"
                          ? "bg-white/10 border border-yellow-400 text-white"
                          : "bg-[#fff8f2] border border-[#ea6822] text-[#27272f]"}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-sm" style={{ color: theme === "dark" ? YELLOW_BORDER : ORANGE }}>{idx + 1}</span>
                        <Building className={`w-4 h-4 ${palette.icon}`} />
                        <span className="font-medium">{comp.name}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          {/* Company Form */}
          <form
            className={`flex-1 rounded-3xl shadow-2xl p-8 border ${palette.card}`}
            style={{
              background: theme === "dark" ? "rgba(30,41,59,0.80)" : "#fff",
              border: `1.5px solid ${palette.border}`
            }}
            onSubmit={handleCompanySubmit}
          >
            <h3 className={`font-bold text-2xl mb-6 flex items-center gap-3 ${palette.text}`}>
              <Building className={`w-7 h-7 ${palette.icon}`} />
              Create New Company
            </h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${palette.subtext}`}>Company Name *</label>
                <input
                  name="name"
                  value={companyForm.name}
                  onChange={e => setCompanyForm({ ...companyForm, name: e.target.value })}
                  placeholder="Enter company name"
                  className={`w-full rounded-xl px-4 py-3 border ${palette.input}`}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${palette.subtext}`}>Entity Name</label>
                  <input
                    name="entity_name"
                    value={companyForm.entity_name}
                    onChange={e => setCompanyForm({ ...companyForm, entity_name: e.target.value })}
                    placeholder="Entity name"
                    className={`w-full rounded-xl px-4 py-3 border ${palette.input}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${palette.subtext}`}>Country</label>
                  <input
                    name="country"
                    value={companyForm.country}
                    onChange={e => setCompanyForm({ ...companyForm, country: e.target.value })}
                    placeholder="Country"
                    className={`w-full rounded-xl px-4 py-3 border ${palette.input}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${palette.subtext}`}>State</label>
                  <input
                    name="state_name"
                    value={companyForm.state_name}
                    onChange={e => setCompanyForm({ ...companyForm, state_name: e.target.value })}
                    placeholder="State"
                    className={`w-full rounded-xl px-4 py-3 border ${palette.input}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${palette.subtext}`}>Region</label>
                  <input
                    name="region"
                    value={companyForm.region}
                    onChange={e => setCompanyForm({ ...companyForm, region: e.target.value })}
                    placeholder="Region"
                    className={`w-full rounded-xl px-4 py-3 border ${palette.input}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${palette.subtext}`}>Zone</label>
                  <input
                    name="zone_name"
                    value={companyForm.zone_name}
                    onChange={e => setCompanyForm({ ...companyForm, zone_name: e.target.value })}
                    placeholder="Zone"
                    className={`w-full rounded-xl px-4 py-3 border ${palette.input}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${palette.subtext}`}>Sub Domain</label>
                  <input
                    name="sub_domain"
                    value={companyForm.sub_domain}
                    onChange={e => setCompanyForm({ ...companyForm, sub_domain: e.target.value })}
                    placeholder="Sub domain"
                    className={`w-full rounded-xl px-4 py-3 border ${palette.input}`}
                  />
                </div>
              </div>
            </div>
            <button
              type="submit"
              className={`w-full mt-8 rounded-xl px-6 py-4 font-semibold flex items-center justify-center gap-2 ${palette.btn} ${palette.btnHover}`}
            >
              Create Company & Continue
              <ChevronRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}

      {/* --- ENTITY STEP --- */}
      {setup === "entity" && (
        <div className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl">
          {/* Left Panel */}
          <div
            className={`flex-1 rounded-3xl shadow-2xl p-8 border ${palette.card}`}
            style={{
              background: theme === "dark" ? "rgba(30,41,59,0.80)" : "#fff",
              border: `1.5px solid ${palette.border}`
            }}
          >
            <h3 className={`mb-6 font-bold text-2xl flex items-center gap-3 ${palette.text}`}>
              <MapPin className={`w-7 h-7 ${palette.icon}`} />
              Select Organization & Company
            </h3>
            {/* Organizations */}
            <div className="mb-8">
              <h4 className={`text-sm font-semibold mb-4 ${palette.subtext}`} style={{ textTransform: "uppercase", letterSpacing: "1.5px" }}>
                Select Organization
              </h4>
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2">
                {entityStepOrgs.length === 0 ? (
                  <div className={`text-center py-6 ${palette.subtext}`}>
                    No organizations available
                  </div>
                ) : (
                  entityStepOrgs.map((org, idx) => (
                    <div
                      key={org.id}
                      onClick={() => {
                        setSelectedEntityOrgId(org.id);
                        setSelectedEntityCompanyId(null);
                      }}
                      className={`p-4 rounded-xl cursor-pointer transition-all duration-200
                        ${selectedEntityOrgId === org.id
                          ? (theme === "dark"
                            ? "bg-gradient-to-r from-yellow-300 to-yellow-500 text-yellow-900 shadow-lg"
                            : "bg-gradient-to-r from-[#ea6822] to-[#e44a22] text-white shadow-lg")
                          : `${theme === "dark"
                            ? "bg-white/10 border border-yellow-400 text-white hover:border-yellow-300 hover:bg-yellow-400/10"
                            : "bg-white border border-[#ea6822] text-[#27272f] hover:border-[#e44a22] hover:bg-[#fff8f2]"}`}`}
                      style={{
                        border: `1.5px solid ${selectedEntityOrgId === org.id ? (theme === "dark" ? YELLOW_BORDER : ORANGE) : palette.border}`,
                        boxShadow: selectedEntityOrgId === org.id ? (theme === "dark" ? "0 2px 10px #fde04744" : "0 2px 10px #ea682232") : "none"
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-sm">{idx + 1}</span>
                          <Building2 className={`w-4 h-4 ${palette.icon}`} />
                          <span className="font-medium">{org.organization_name}</span>
                        </div>
                        {selectedEntityOrgId === org.id && <Check className="w-5 h-5" />}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            {/* Companies */}
            {selectedEntityOrgId && (
              <div>
                <h4 className={`text-sm font-semibold mb-4 ${palette.subtext}`} style={{ textTransform: "uppercase", letterSpacing: "1.5px" }}>
                  Select Company
                </h4>
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2">
                  {filteredCompaniesForEntity.length === 0 ? (
                    <div className={`text-center py-6 ${palette.subtext}`}>
                      No companies available
                    </div>
                  ) : (
                    filteredCompaniesForEntity.map((comp, idx) => (
                      <div
                        key={comp.id}
                        onClick={() => setSelectedEntityCompanyId(comp.id)}
                        className={`p-4 rounded-xl cursor-pointer transition-all duration-200
                          ${selectedEntityCompanyId === comp.id
                            ? (theme === "dark"
                              ? "bg-gradient-to-r from-yellow-300 to-yellow-500 text-yellow-900 shadow-lg"
                              : "bg-gradient-to-r from-[#ea6822] to-[#e44a22] text-white shadow-lg")
                            : `${theme === "dark"
                              ? "bg-white/10 border border-yellow-400 text-white hover:border-yellow-300 hover:bg-yellow-400/10"
                              : "bg-white border border-[#ea6822] text-[#27272f] hover:border-[#e44a22] hover:bg-[#fff8f2]"}`}`}
                        style={{
                          border: `1.5px solid ${selectedEntityCompanyId === comp.id ? (theme === "dark" ? YELLOW_BORDER : ORANGE) : palette.border}`,
                          boxShadow: selectedEntityCompanyId === comp.id ? (theme === "dark" ? "0 2px 10px #fde04744" : "0 2px 10px #ea682232") : "none"
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-sm">{idx + 1}</span>
                            <Building className={`w-4 h-4 ${palette.icon}`} />
                            <span className="font-medium">{comp.name}</span>
                          </div>
                          {selectedEntityCompanyId === comp.id && <Check className="w-5 h-5" />}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          {/* Entity Form */}
          <form
            className={`flex-1 rounded-3xl shadow-2xl p-8 border ${palette.card}`}
            style={{
              background: theme === "dark" ? "rgba(30,41,59,0.80)" : "#fff",
              border: `1.5px solid ${palette.border}`
            }}
            onSubmit={handleEntitySubmit}
          >
            <h3 className={`font-bold text-2xl mb-6 flex items-center gap-3 ${palette.text}`}>
              <MapPin className={`w-7 h-7 ${palette.icon}`} />
              Create New Entity
            </h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${palette.subtext}`}>Entity Name *</label>
                <input
                  name="name"
                  value={entityForm.name}
                  onChange={e => setEntityForm({ ...entityForm, name: e.target.value })}
                  placeholder="Enter entity name"
                  className={`w-full rounded-xl px-4 py-3 border ${palette.input}`}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${palette.subtext}`}>State</label>
                  <input
                    name="state"
                    value={entityForm.state}
                    onChange={e => setEntityForm({ ...entityForm, state: e.target.value })}
                    placeholder="State"
                    className={`w-full rounded-xl px-4 py-3 border ${palette.input}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${palette.subtext}`}>Region</label>
                  <input
                    name="region"
                    value={entityForm.region}
                    onChange={e => setEntityForm({ ...entityForm, region: e.target.value })}
                    placeholder="Region"
                    className={`w-full rounded-xl px-4 py-3 border ${palette.input}`}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-2 ${palette.subtext}`}>Zone</label>
                  <input
                    name="zone"
                    value={entityForm.zone}
                    onChange={e => setEntityForm({ ...entityForm, zone: e.target.value })}
                    placeholder="Zone"
                    className={`w-full rounded-xl px-4 py-3 border ${palette.input}`}
                  />
                </div>
              </div>
              {selectedEntityCompanyId && (
                <div className="mt-6 p-4 rounded-xl"
                  style={{
                    background: theme === "dark" ? "#fffbe014" : "#fff8f2",
                    border: `1.5px solid ${theme === "dark" ? YELLOW_BORDER : ORANGE}`
                  }}
                >
                  <p className={`text-sm ${palette.subtext}`}>
                    <span className="font-semibold">Selected: </span>
                    {entityStepOrgs.find(o => o.id === selectedEntityOrgId)?.organization_name} →
                    {" "}
                    {filteredCompaniesForEntity.find(c => c.id === selectedEntityCompanyId)?.name}
                  </p>
                </div>
              )}
            </div>
            <button
              type="submit"
              className={`w-full mt-8 rounded-xl px-6 py-4 font-semibold flex items-center justify-center gap-2 ${palette.btn} ${palette.btnHover}`}
              disabled={!selectedEntityCompanyId}
            >
              <Check className="w-5 h-5" />
              Complete Setup
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserSetup;
