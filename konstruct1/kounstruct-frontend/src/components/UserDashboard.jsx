import React, { useState, useEffect } from "react";
import { getUserDashboard } from "../api/index";
import { showToast } from "../utils/toast";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  CheckCircle,
  Clock,
  BarChart3,
  Activity,
  Target,
  Zap,
  Download,
  Filter,
  RefreshCw,
  Building,
  Building2,
  Factory,
} from "lucide-react";

const UserDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d");

  // Enhanced theme system
  const theme = {
    light: {
      bg: "#f7f8fa",
      card: "bg-white",
      text: "text-gray-900",
      textSecondary: "text-gray-600",
      border: "border-gray-200",
      hover: "hover:bg-gray-50",
      gradient: "bg-gradient-to-br from-purple-100 to-blue-100",
    },
    dark: {
      bg: "#0f172a",
      card: "bg-slate-800",
      text: "text-white",
      textSecondary: "text-slate-300",
      border: "border-slate-700",
      hover: "hover:bg-slate-700",
      gradient: "bg-gradient-to-br from-slate-800 to-slate-900",
    },
  };

  const currentTheme = isDarkMode ? theme.dark : theme.light;

  // Enhanced palette with role gradients
  const palette = {
    bg: currentTheme.bg,
    card: currentTheme.card,
    text: currentTheme.text,
    border: currentTheme.border,
    shadow: "shadow-xl",
    gradient: currentTheme.gradient,
    managerGradient: "bg-gradient-to-r from-purple-500 to-indigo-500",
    clientGradient: "bg-gradient-to-r from-blue-500 to-cyan-500",
    adminGradient: "bg-gradient-to-r from-red-500 to-pink-500",
    supervisorGradient: "bg-gradient-to-r from-green-500 to-emerald-500",
    makerGradient: "bg-gradient-to-r from-blue-500 to-cyan-500",
    checkerGradient: "bg-gradient-to-r from-purple-500 to-pink-500",
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedTimeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await getUserDashboard();

      console.log("Full API Response:", response);
      console.log("Response Data:", response.data);

      if (response.status === 200) {
        setDashboardData(response.data.dashboard);
        setUserId(response.data.user_id);
        showToast("Dashboard loaded successfully", "success");
      } else {
        showToast("Failed to fetch dashboard data", "error");
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      console.error("Error response:", error.response?.data);
      showToast(`Error loading dashboard: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  // Enhanced KPI Card Component
  const KPICard = ({
    title,
    value,
    trend,
    icon: Icon,
    color,
    suffix = "",
    description,
  }) => (
    <div
      className={`${palette.card} rounded-xl p-6 border ${palette.border} ${palette.shadow} hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`p-3 rounded-lg bg-gradient-to-br ${color} shadow-lg`}
            >
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className={`font-semibold ${currentTheme.text}`}>{title}</h3>
              {description && (
                <p className={`text-xs ${currentTheme.textSecondary}`}>
                  {description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-end gap-3">
            <span className={`text-3xl font-bold ${currentTheme.text}`}>
              {typeof value === "number" ? value.toLocaleString() : value}
              {suffix}
            </span>
            {trend && (
              <div
                className={`flex items-center gap-1 text-sm px-2 py-1 rounded-full ${
                  trend > 0
                    ? "text-green-600 bg-green-100"
                    : "text-red-600 bg-red-100"
                }`}
              >
                {trend > 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="font-medium">{Math.abs(trend)}%</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Custom Tooltip for Charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          className={`${palette.card} p-4 rounded-lg shadow-lg border ${palette.border} backdrop-blur-sm`}
        >
          <p className={`font-medium ${currentTheme.text} mb-2`}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              <span className="font-medium">{entry.name}:</span> {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Generate time series data from role analytics
  const generateTimeSeriesData = (data, role) => {
    const days =
      selectedTimeRange === "1d"
        ? 1
        : selectedTimeRange === "7d"
        ? 7
        : selectedTimeRange === "30d"
        ? 30
        : 90;

    return Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));

      let tasks = 0,
        completed = 0,
        pending = 0;

      if (role === "SUPER_ADMIN") {
        const baseChecklists = data.total_checklists || 0;
        tasks = Math.floor(
          (baseChecklists * (0.7 + Math.random() * 0.4)) / days
        );
        completed = Math.floor(tasks * (0.75 + Math.random() * 0.2));
        pending = Math.max(0, tasks - completed);
      } else if (role === "USER" && data.projects_roles_analytics) {
        data.projects_roles_analytics.forEach((item) => {
          if (item.analytics && !item.analytics.error) {
            Object.values(item.analytics).forEach((val) => {
              if (typeof val === "number") {
                tasks += Math.floor(val * (0.1 + Math.random() * 0.2));
              }
            });
          }
        });
        completed = Math.floor(tasks * (0.8 + Math.random() * 0.15));
        pending = Math.max(0, tasks - completed);
      } else if (role === "CLIENT") {
        const baseProjects = data.created_project_count || 0;
        tasks = Math.floor(baseProjects * 5 * (0.8 + Math.random() * 0.4));
        completed = Math.floor(tasks * (0.85 + Math.random() * 0.1));
        pending = Math.max(0, tasks - completed);
      } else {
        tasks = Math.floor(
          (data.organizations_created || 1) * 3 * (0.8 + Math.random() * 0.4)
        );
        completed = Math.floor(tasks * (0.7 + Math.random() * 0.2));
        pending = Math.max(0, tasks - completed);
      }

      return {
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        tasks: Math.max(0, tasks),
        completed: Math.max(0, completed),
        pending: Math.max(0, pending),
      };
    });
  };

  // Generate role distribution pie chart data
  const generateRoleDistribution = (data, role) => {
    if (role === "SUPER_ADMIN") {
      const totalMakers = data.total_makers || 0;
      const totalCheckers = data.total_checkers || 0;
      const totalUsers = data.total_users || 1;
      const supervisors = Math.floor(totalUsers * 0.1);
      const initializers = Math.floor(totalUsers * 0.05);

      return [
        { name: "Makers", value: totalMakers, color: "#8B5CF6" },
        { name: "Checkers", value: totalCheckers, color: "#06B6D4" },
        { name: "Supervisors", value: supervisors, color: "#10B981" },
        { name: "Initializers", value: initializers, color: "#F59E0B" },
      ].filter((item) => item.value > 0);
    } else if (role === "USER" && data.projects_roles_analytics) {
      const roleCounts = {};
      data.projects_roles_analytics.forEach((item) => {
        roleCounts[item.role] = (roleCounts[item.role] || 0) + 1;
      });

      const colors = ["#8B5CF6", "#06B6D4", "#10B981", "#F59E0B", "#EF4444"];
      return Object.entries(roleCounts).map(([role, count], index) => ({
        name: role,
        value: count,
        color: colors[index % colors.length],
      }));
    }

    return [];
  };

  // Get role icon
  const getRoleIcon = (role) => {
    switch (role.toUpperCase()) {
      case "SUPER_ADMIN":
        return "👑";
      case "CLIENT":
        return "👤";
      case "MANAGER":
        return "👥";
      case "SUPERVISOR":
        return "👥";
      case "MAKER":
        return "🔧";
      case "CHECKER":
        return "✅";
      default:
        return "📋";
    }
  };

  // Get role gradient
  const getRoleGradient = (role) => {
    switch (role.toUpperCase()) {
      case "SUPER_ADMIN":
        return palette.adminGradient;
      case "CLIENT":
        return palette.clientGradient;
      case "MANAGER":
        return palette.managerGradient;
      case "SUPERVISOR":
        return palette.supervisorGradient;
      case "MAKER":
        return palette.makerGradient;
      case "CHECKER":
        return palette.checkerGradient;
      default:
        return "bg-gray-500";
    }
  };

  // Enhanced Manager Dashboard with Charts
  const renderManagerDashboard = (data) => {
    const timeSeriesData = generateTimeSeriesData(data, "MANAGER");

    const kpis = [
      {
        title: "Organizations",
        value: data.organizations_created || 0,
        trend: 12.5,
        icon: Building,
        color: "from-purple-500 to-purple-600",
        description: "Created by you",
      },
      {
        title: "Companies",
        value: data.companies_created || 0,
        trend: 8.3,
        icon: Building2,
        color: "from-blue-500 to-blue-600",
        description: "Under management",
      },
      {
        title: "Entities",
        value: data.entities_created || 0,
        trend: 15.7,
        icon: Factory,
        color: "from-green-500 to-green-600",
        description: "Total entities",
      },
    ];

    return (
      <div className="space-y-8">
        {/* Enhanced Header */}
        <div
          className={`${palette.card} rounded-xl p-6 border ${palette.border} ${palette.shadow}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 ${getRoleGradient(
                  data.role
                )} rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg`}
              >
                {getRoleIcon(data.role)}
              </div>
              <div>
                <h2 className={`text-3xl font-bold ${currentTheme.text}`}>
                  Manager Dashboard
                </h2>
                <p className={`${currentTheme.textSecondary} text-lg`}>
                  Organization management and analytics
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">
                {(data.organizations_created || 0) +
                  (data.companies_created || 0) +
                  (data.entities_created || 0)}
              </div>
              <div className={`text-sm ${currentTheme.textSecondary}`}>
                Total Managed
              </div>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {kpis.map((kpi, index) => (
            <KPICard key={index} {...kpi} />
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Activity Trends */}
          <div
            className={`${palette.card} rounded-xl p-6 border ${palette.border} ${palette.shadow}`}
          >
            <h3 className={`text-xl font-bold ${currentTheme.text} mb-6`}>
              Activity Trends
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={timeSeriesData}>
                <defs>
                  <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDarkMode ? "#374151" : "#E5E7EB"}
                />
                <XAxis
                  dataKey="date"
                  stroke={isDarkMode ? "#9CA3AF" : "#6B7280"}
                />
                <YAxis stroke={isDarkMode ? "#9CA3AF" : "#6B7280"} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="tasks"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTasks)"
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stroke="#10B981"
                  strokeWidth={2}
                  fillOpacity={0.6}
                  fill="#10B981"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Performance Metrics */}
          <div
            className={`${palette.card} rounded-xl p-6 border ${palette.border} ${palette.shadow}`}
          >
            <h3 className={`text-xl font-bold ${currentTheme.text} mb-6`}>
              Performance Overview
            </h3>
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  92.5%
                </div>
                <div className={`text-sm ${currentTheme.textSecondary} mb-3`}>
                  Management Efficiency
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-purple-600 h-3 rounded-full"
                    style={{ width: "92.5%" }}
                  ></div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  87.3%
                </div>
                <div className={`text-sm ${currentTheme.textSecondary} mb-3`}>
                  Success Rate
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-600 h-3 rounded-full"
                    style={{ width: "87.3%" }}
                  ></div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  3.2h
                </div>
                <div className={`text-sm ${currentTheme.textSecondary}`}>
                  Avg Response Time
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Super Admin Dashboard with Advanced Analytics
  const renderSuperAdminDashboard = (data) => {
    const timeSeriesData = generateTimeSeriesData(data, "SUPER_ADMIN");
    const roleDistribution = generateRoleDistribution(data, "SUPER_ADMIN");

    const kpis = [
      {
        title: "Total Users",
        value: data.total_users || 0,
        trend: 8.5,
        icon: Users,
        color: "from-blue-500 to-blue-600",
        description: "System wide",
      },
      {
        title: "Active Projects",
        value: data.total_projects || 0,
        trend: 12.3,
        icon: Target,
        color: "from-green-500 to-green-600",
        description: "In progress",
      },
      {
        title: "Total Checklists",
        value: data.total_checklists || 0,
        trend: 15.7,
        icon: CheckCircle,
        color: "from-purple-500 to-purple-600",
        description: "All projects",
      },
      {
        title: "Makers",
        value: data.total_makers || 0,
        trend: 5.2,
        icon: Activity,
        color: "from-orange-500 to-orange-600",
        description: "Active makers",
      },
      {
        title: "Checkers",
        value: data.total_checkers || 0,
        trend: 7.8,
        icon: Zap,
        color: "from-red-500 to-red-600",
        description: "Quality control",
      },
      {
        title: "Efficiency",
        value: "94.2",
        trend: 3.1,
        icon: BarChart3,
        color: "from-indigo-500 to-indigo-600",
        suffix: "%",
        description: "Overall system",
      },
    ];

    return (
      <div className="space-y-8">
        {/* Enhanced Header */}
        <div
          className={`${palette.card} rounded-xl p-6 border ${palette.border} ${palette.shadow}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 ${getRoleGradient(
                  data.role
                )} rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg`}
              >
                {getRoleIcon(data.role)}
              </div>
              <div>
                <h2 className={`text-3xl font-bold ${currentTheme.text}`}>
                  Super Admin Dashboard
                </h2>
                <p className={`${currentTheme.textSecondary} text-lg`}>
                  System-wide analytics and management
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">98.5%</div>
                <div className={`text-xs ${currentTheme.textSecondary}`}>
                  Uptime
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {data.total_users || 0}
                </div>
                <div className={`text-xs ${currentTheme.textSecondary}`}>
                  Online
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {kpis.map((kpi, index) => (
            <KPICard key={index} {...kpi} />
          ))}
        </div>

        {/* Advanced Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* System Activity */}
          <div
            className={`xl:col-span-2 ${palette.card} rounded-xl p-6 border ${palette.border} ${palette.shadow}`}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold ${currentTheme.text}`}>
                System Activity
              </h3>
              <div className="flex gap-2 text-sm">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  Tasks
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  Completed
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={timeSeriesData}>
                <defs>
                  <linearGradient
                    id="colorTasksAdmin"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="colorCompletedAdmin"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDarkMode ? "#374151" : "#E5E7EB"}
                />
                <XAxis
                  dataKey="date"
                  stroke={isDarkMode ? "#9CA3AF" : "#6B7280"}
                />
                <YAxis stroke={isDarkMode ? "#9CA3AF" : "#6B7280"} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="tasks"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTasksAdmin)"
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stroke="#10B981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCompletedAdmin)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Team Distribution */}
          <div
            className={`${palette.card} rounded-xl p-6 border ${palette.border} ${palette.shadow}`}
          >
            <h3 className={`text-xl font-bold ${currentTheme.text} mb-6`}>
              Team Distribution
            </h3>
            {roleDistribution.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={roleDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {roleDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {roleDistribution.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span
                          className={`text-sm ${currentTheme.textSecondary}`}
                        >
                          {item.name}
                        </span>
                      </div>
                      <span
                        className={`text-sm font-medium ${currentTheme.text}`}
                      >
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className={`text-gray-400 text-sm`}>
                  No team data available
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Organization Summary */}
        {data.org_project_user_summary &&
          data.org_project_user_summary.length > 0 && (
            <div
              className={`${palette.card} rounded-xl p-6 border ${palette.border} ${palette.shadow}`}
            >
              <h3 className={`text-xl font-bold ${currentTheme.text} mb-6`}>
                Organization Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.org_project_user_summary.slice(0, 6).map((org, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${palette.border} ${currentTheme.hover} transition-colors`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                        🏢
                      </div>
                      <div>
                        <h4 className={`font-semibold ${currentTheme.text}`}>
                          Org {org.org_id}
                        </h4>
                        <p className={`text-sm ${currentTheme.textSecondary}`}>
                          {org.project_count} projects
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${currentTheme.textSecondary}`}>
                        Users: {org.user_ids?.length || 0}
                      </span>
                      <span className="text-lg font-bold text-blue-600">
                        {org.project_count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>
    );
  };

  // Enhanced Client Dashboard
  const renderClientDashboard = (data) => {
    const timeSeriesData = generateTimeSeriesData(data, "CLIENT");

    return (
      <div className="space-y-8">
        {/* Enhanced Header */}
        <div
          className={`${palette.card} rounded-xl p-6 border ${palette.border} ${palette.shadow}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 ${getRoleGradient(
                  data.role
                )} rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg`}
              >
                {getRoleIcon(data.role)}
              </div>
              <div>
                <h2 className={`text-3xl font-bold ${currentTheme.text}`}>
                  Client Dashboard
                </h2>
                <p className={`${currentTheme.textSecondary} text-lg`}>
                  Your projects and performance overview
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">
                {data.created_project_count || 0}
              </div>
              <div className={`text-sm ${currentTheme.textSecondary}`}>
                Active Projects
              </div>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KPICard
            title="Projects Created"
            value={data.created_project_count || 0}
            trend={15.2}
            icon={Target}
            color="from-blue-500 to-blue-600"
            description="Total projects"
          />
          <KPICard
            title="Success Rate"
            value="94.2"
            trend={5.8}
            icon={CheckCircle}
            color="from-green-500 to-green-600"
            suffix="%"
            description="Project completion"
          />
          <KPICard
            title="Avg Duration"
            value="2.4"
            trend={-8.3}
            icon={Clock}
            color="from-purple-500 to-purple-600"
            suffix="mo"
            description="Per project"
          />
        </div>

        {/* Charts and Projects */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Project Activity */}
          <div
            className={`${palette.card} rounded-xl p-6 border ${palette.border} ${palette.shadow}`}
          >
            <h3 className={`text-xl font-bold ${currentTheme.text} mb-6`}>
              Project Activity
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={timeSeriesData}>
                <defs>
                  <linearGradient
                    id="colorTasksClient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDarkMode ? "#374151" : "#E5E7EB"}
                />
                <XAxis
                  dataKey="date"
                  stroke={isDarkMode ? "#9CA3AF" : "#6B7280"}
                />
                <YAxis stroke={isDarkMode ? "#9CA3AF" : "#6B7280"} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="tasks"
                  stroke="#06B6D4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTasksClient)"
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stroke="#10B981"
                  strokeWidth={2}
                  fillOpacity={0.6}
                  fill="#10B981"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Projects */}
          <div
            className={`${palette.card} rounded-xl p-6 border ${palette.border} ${palette.shadow}`}
          >
            <h3 className={`text-xl font-bold ${currentTheme.text} mb-6`}>
              Recent Projects
            </h3>
            <div className="space-y-4">
              {data.created_projects && data.created_projects.length > 0 ? (
                data.created_projects.slice(0, 5).map((project, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-4 p-3 rounded-lg ${currentTheme.hover} transition-colors border ${palette.border}`}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center text-white font-bold">
                      🏗️
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`font-medium ${currentTheme.text}`}>
                            {project.name || `Project ${project.id}`}
                          </p>
                          <p
                            className={`text-sm ${currentTheme.textSecondary}`}
                          >
                            Created by you • Active
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full font-medium">
                            Active
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className={`text-gray-400 text-sm`}>
                    No projects created yet
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced User Dashboard with Role Analytics
  const renderUserDashboard = (data) => {
    const rolesData = data.projects_roles_analytics || [];
    const timeSeriesData = generateTimeSeriesData(data, "USER");
    const roleDistribution = generateRoleDistribution(data, "USER");

    // Group by project
    const groupedData = rolesData.reduce((acc, item) => {
      const projectId = item.project_id;
      if (!acc[projectId]) {
        acc[projectId] = {};
      }
      acc[projectId][item.role] = item.analytics;
      return acc;
    }, {});

    // Calculate total metrics
    let totalTasks = 0;
    let totalAssigned = 0;
    rolesData.forEach((item) => {
      if (item.analytics && !item.analytics.error) {
        Object.entries(item.analytics).forEach(([key, value]) => {
          if (typeof value === "number") {
            totalTasks += value;
            if (key.includes("assigned") || key.includes("pending_for_me")) {
              totalAssigned += value;
            }
          }
        });
      }
    });

    return (
      <div className="space-y-8">
        {/* Enhanced Header */}
        <div
          className={`${palette.card} rounded-xl p-6 border ${palette.border} ${palette.shadow}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 ${palette.gradient} rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg`}
              >
                📊
              </div>
              <div>
                <h2 className={`text-3xl font-bold ${currentTheme.text}`}>
                  User Analytics Dashboard
                </h2>
                <p className={`${currentTheme.textSecondary} text-lg`}>
                  Your work analytics across all projects and roles
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">
                {Object.keys(groupedData).length}
              </div>
              <div className={`text-sm ${currentTheme.textSecondary}`}>
                Active Projects
              </div>
            </div>
          </div>
        </div>

        {/* User KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Total Tasks"
            value={totalTasks}
            trend={8.5}
            icon={Target}
            color="from-blue-500 to-blue-600"
            description="All assigned"
          />
          <KPICard
            title="Assigned to Me"
            value={totalAssigned}
            trend={12.3}
            icon={Users}
            color="from-green-500 to-green-600"
            description="Current workload"
          />
          <KPICard
            title="Projects"
            value={Object.keys(groupedData).length}
            trend={5.7}
            icon={BarChart3}
            color="from-purple-500 to-purple-600"
            description="Active projects"
          />
          <KPICard
            title="Efficiency"
            value={
              totalTasks > 0
                ? Math.round((totalAssigned / totalTasks) * 100)
                : 0
            }
            trend={3.2}
            icon={Zap}
            color="from-orange-500 to-orange-600"
            suffix="%"
            description="Task completion"
          />
        </div>

        {/* Charts Section */}
        {rolesData.length > 0 && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Activity Timeline */}
            <div
              className={`xl:col-span-2 ${palette.card} rounded-xl p-6 border ${palette.border} ${palette.shadow}`}
            >
              <h3 className={`text-xl font-bold ${currentTheme.text} mb-6`}>
                Activity Timeline
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={timeSeriesData}>
                  <defs>
                    <linearGradient
                      id="colorTasksUser"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDarkMode ? "#374151" : "#E5E7EB"}
                  />
                  <XAxis
                    dataKey="date"
                    stroke={isDarkMode ? "#9CA3AF" : "#6B7280"}
                  />
                  <YAxis stroke={isDarkMode ? "#9CA3AF" : "#6B7280"} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="tasks"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorTasksUser)"
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    stroke="#10B981"
                    strokeWidth={2}
                    fillOpacity={0.6}
                    fill="#10B981"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Role Distribution */}
            {roleDistribution.length > 0 && (
              <div
                className={`${palette.card} rounded-xl p-6 border ${palette.border} ${palette.shadow}`}
              >
                <h3 className={`text-xl font-bold ${currentTheme.text} mb-6`}>
                  My Roles
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={roleDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {roleDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {roleDistribution.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span
                          className={`text-sm ${currentTheme.textSecondary}`}
                        >
                          {item.name}
                        </span>
                      </div>
                      <span
                        className={`text-sm font-medium ${currentTheme.text}`}
                      >
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Projects and Roles */}
        {Object.keys(groupedData).length === 0 ? (
          <div
            className={`text-center py-12 ${palette.card} rounded-lg ${palette.shadow}`}
          >
            <div
              className={`w-16 h-16 ${palette.gradient} rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg mx-auto mb-4`}
            >
              📈
            </div>
            <h3 className={`text-lg font-semibold ${currentTheme.text} mb-2`}>
              No Analytics Data Available
            </h3>
            <p className={`${currentTheme.textSecondary}`}>
              You don't have any active role assignments yet.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedData).map(([projectId, roles]) => (
              <div key={projectId} className="space-y-4">
                {/* Project Header */}
                <div
                  className={`p-4 rounded-lg ${palette.gradient} border ${palette.border}`}
                >
                  <h2
                    className={`text-xl font-bold ${currentTheme.text} flex items-center gap-2`}
                  >
                    🏗️ Project {projectId}
                    <span
                      className={`text-sm font-normal px-3 py-1 rounded-full bg-white bg-opacity-20 text-white`}
                    >
                      {Object.keys(roles).length} role
                      {Object.keys(roles).length !== 1 ? "s" : ""}
                    </span>
                  </h2>
                </div>

                {/* Role Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(roles).map(([role, analytics]) => {
                    const metrics = Object.entries(analytics || {}).map(
                      ([key, value]) => ({
                        label: key
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase()),
                        value: value || 0,
                        key,
                      })
                    );

                    return (
                      <div
                        key={role}
                        className={`${palette.card} rounded-xl p-6 border ${palette.border} ${palette.shadow} transform hover:scale-105 transition-all duration-300`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-12 h-12 ${getRoleGradient(
                                role
                              )} rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg`}
                            >
                              {getRoleIcon(role)}
                            </div>
                            <div>
                              <h3
                                className={`text-lg font-bold ${currentTheme.text}`}
                              >
                                {role.toUpperCase()}
                              </h3>
                              <p
                                className={`text-sm ${currentTheme.textSecondary}`}
                              >
                                Role Analytics
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                          {analytics && !analytics.error ? (
                            metrics.map((metric) => (
                              <div
                                key={metric.key}
                                className={`p-3 rounded-lg ${currentTheme.gradient} border ${palette.border}`}
                              >
                                <div className="flex items-center justify-between">
                                  <span
                                    className={`text-sm ${currentTheme.textSecondary}`}
                                  >
                                    {metric.label}
                                  </span>
                                  <span
                                    className={`text-xl font-bold text-purple-600`}
                                  >
                                    {metric.value}
                                  </span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-4">
                              <span className="text-red-500 text-sm">
                                {analytics?.error || "No data available"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center transition-colors duration-300"
        style={{ background: palette.bg }}
      >
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className={`mt-4 text-lg font-medium ${currentTheme.text}`}>
            Loading Analytics...
          </p>
          <p className={`${currentTheme.textSecondary} text-sm`}>
            Preparing your insights
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ background: palette.bg }}
    >
      {/* Enhanced Header */}
      <div
        className={`${palette.card} border-b ${palette.border} px-6 py-4 sticky top-0 z-40 backdrop-blur-sm bg-opacity-95`}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${currentTheme.text}`}>
                  Analytics Dashboard
                </h1>
                <p className={`${currentTheme.textSecondary} text-sm`}>
                  Real-time insights and performance metrics
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Time Range Selector */}
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${palette.border} ${palette.card} ${currentTheme.text} focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors`}
            >
              <option value="1d">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 3 months</option>
            </select>

            {/* Action Buttons */}
            <button
              className={`p-2 rounded-lg ${currentTheme.hover} ${currentTheme.text} transition-colors`}
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              className={`p-2 rounded-lg ${currentTheme.hover} ${currentTheme.text} transition-colors`}
            >
              <Filter className="w-5 h-5" />
            </button>
            <button
              onClick={fetchDashboardData}
              className={`p-2 rounded-lg ${currentTheme.hover} ${currentTheme.text} transition-colors`}
            >
              <RefreshCw
                className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
              />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-lg ${currentTheme.hover} ${currentTheme.text} transition-colors`}
            >
              {isDarkMode ? "☀️" : "🌙"}
            </button>

            {/* User ID Badge */}
            {userId && (
              <div className="px-3 py-1 rounded-full bg-purple-100 border border-purple-200">
                <span className="text-sm font-medium text-purple-800">
                  ID: {userId}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Dashboard Content Based on Role */}
        {!dashboardData ? (
          <div
            className={`text-center py-12 ${palette.card} rounded-xl ${palette.shadow}`}
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className={`text-lg font-semibold ${currentTheme.text} mb-2`}>
              No Dashboard Data Available
            </h3>
            <p className={`${currentTheme.textSecondary}`}>
              Unable to load dashboard information.
            </p>
          </div>
        ) : (
          <>
            {dashboardData.role === "MANAGER" &&
              renderManagerDashboard(dashboardData)}
            {dashboardData.role === "SUPER_ADMIN" &&
              renderSuperAdminDashboard(dashboardData)}
            {dashboardData.role === "CLIENT" &&
              renderClientDashboard(dashboardData)}
            {dashboardData.role === "USER" &&
              renderUserDashboard(dashboardData)}
          </>
        )}

        {/* Enhanced Refresh Section */}
        <div className="mt-8 text-center">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Refresh Dashboard
              </>
            )}
          </button>

          {/* Debug Info for Development */}
          {dashboardData && (
            <div className="mt-6">
              <details
                className={`${palette.card} rounded-lg p-4 border ${palette.border} inline-block text-left max-w-2xl`}
              >
                <summary
                  className={`${currentTheme.text} cursor-pointer font-medium hover:text-purple-600 transition-colors`}
                >
                  🔍 Debug Info (Development Only)
                </summary>
                <pre
                  className={`mt-3 text-xs ${
                    currentTheme.textSecondary
                  } overflow-auto max-h-60 p-3 bg-gray-50 ${
                    isDarkMode ? "bg-slate-900" : ""
                  } rounded border-2 border-dashed border-gray-200`}
                >
                  {JSON.stringify(dashboardData, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
