import React, { useEffect, useState } from "react";
import { Eye, EyeOff, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import { login } from "../api";
import { setUserData } from "../store/userSlice";
import "react-toastify/dist/ReactToastify.css";
import Bg1 from "../Images/image.jpg";
import Bg2 from "../Images/image1.jpg";
import Bg3 from "../Images/image2.jpg";

// Carousel Config
const BG_IMAGES = [Bg1, Bg2, Bg3];
const BG_INTERVAL = 7000;

// --- Extract Primary Role from User Data ---
function extractPrimaryRole(userData) {
  if (!userData) return "User";
  if (userData.role) return userData.role;
  if (Array.isArray(userData.roles) && userData.roles.length > 0) {
    const r = userData.roles[0];
    return typeof r === "string" ? r : r.role;
  }
  if (Array.isArray(userData.accesses) && userData.accesses.length > 0) {
    for (const access of userData.accesses) {
      if (Array.isArray(access.roles) && access.roles.length > 0) {
        const r = access.roles[0];
        return typeof r === "string" ? r : r.role;
      }
    }
  }
  if (userData.superadmin) return "Super Admin";
  if (userData.is_manager) return "Manager";
  if (userData.is_client === false) return "Admin";
  return "User";
}

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [page, setPage] = useState("login");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);

  // Carousel logic
  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % BG_IMAGES.length);
    }, BG_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  // Handle field changes
  const onChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // JWT decode helper
  const decodeJWT = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error decoding JWT:", error);
      return null;
    }
  };

  // Check for existing session on mount
  useEffect(() => {
    const token =
      localStorage.getItem("TOKEN") || localStorage.getItem("ACCESS_TOKEN");
    if (token) {
      const tokenData = decodeJWT(token);
      if (tokenData) {
        dispatch(
          setUserData({
            id: tokenData.user_id,
            user_id: tokenData.user_id,
            username: tokenData.username,
            email: tokenData.email,
            phone_number: tokenData.phone_number,
            has_access: tokenData.has_access,
            is_client: tokenData.is_client,
            superadmin: tokenData.superadmin,
            is_manager: tokenData.is_manager,
          })
        );
        // Also set role from tokenData if possible
        const role = extractPrimaryRole(tokenData);
        localStorage.setItem("ROLE", role);
      }
      navigate("/dashboard");
      toast.success("You are already logged in!");
    }
  }, [navigate, dispatch]);

  const togglePassword = () => setShowPassword((prev) => !prev);

  // --- LOGIN HANDLER ---
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }
    setIsLoading(true);

    try {
      const response = await login({
        username: formData.username,
        password: formData.password,
      });

      if (response.status === 200) {
        localStorage.setItem("ACCESS_TOKEN", response.data.access);
        localStorage.setItem("REFRESH_TOKEN", response.data.refresh);
        localStorage.setItem("token", response.data.access);

        // Set ACCESSES (for sidebars)
        const tokenData = decodeJWT(response.data.access);
        const accesses = tokenData && tokenData.accesses ? tokenData.accesses : [];
        localStorage.setItem("ACCESSES", JSON.stringify(accesses));

        // Prepare userData for redux & storage
        let userData = null;
        if (response.data.user) {
          userData = response.data.user;
        } else if (tokenData) {
          userData = {
            id: tokenData.user_id,
            user_id: tokenData.user_id,
            username: tokenData.username,
            email: tokenData.email,
            phone_number: tokenData.phone_number,
            has_access: tokenData.has_access,
            is_client: tokenData.is_client,
            superadmin: tokenData.superadmin,
            is_manager: tokenData.is_manager,
            org: tokenData.org,
            company: tokenData.company,
            entity: tokenData.entity,
            role: tokenData.role,
            roles: tokenData.roles,
            accesses: tokenData.accesses,
          };
        }

        if (userData) {
          dispatch(setUserData(userData));
          localStorage.setItem("USER_DATA", JSON.stringify(userData));
          // --- SET THE PRIMARY ROLE ---
          const role = extractPrimaryRole(userData);
          localStorage.setItem("ROLE", role);
        }

        toast.success("Logged in successfully!");
        navigate("/dashboard");
      } else {
        toast.error("Invalid credentials.");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Invalid username or password");
      } else if (error.response?.status === 400) {
        toast.error("Please check your credentials");
      } else if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error("Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="h-screen relative flex items-center justify-center transition-all duration-1000"
      style={{
        backgroundImage: `url(${BG_IMAGES[bgIndex]})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        transition: "background-image 1s ease-in-out",
      }}
    >
      <div className="absolute inset-0 bg-black/50 z-0"></div>
      {/* Login Card */}
      <div
        className="relative z-10 w-full max-w-md mx-4 md:w-[420px] rounded-2xl p-8 md:p-10 shadow-2xl border border-white/20"
        style={{
          background: "rgba(255,255,255,0.18)",
          boxShadow:
            "0 8px 32px 0 rgba(31, 38, 135, 0.23), 0 1.5px 2.5px 0 rgba(234,104,34,0.04)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
        }}
      >
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg">
              <Building2 className="w-8 h-8 text-slate-800" />
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#ea6822] mb-1 tracking-wider">
            KONSTRUCT.WORLD
          </h1>
        </div>

        {page === "login" && (
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <input
                type="text"
                name="username"
                id="username"
                className="w-full px-4 py-3 bg-white/70 rounded-lg text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                placeholder="Username"
                onChange={onChange}
                value={formData.username}
                disabled={isLoading}
                required
                style={{ backdropFilter: "blur(5px)", WebkitBackdropFilter: "blur(5px)" }}
              />
            </div>
            <div className="relative">
              <input
                name="password"
                id="password"
                className="w-full px-4 py-3 bg-white/70 rounded-lg text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all pr-12"
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                onChange={onChange}
                value={formData.password}
                disabled={isLoading}
                required
                style={{ backdropFilter: "blur(5px)", WebkitBackdropFilter: "blur(5px)" }}
              />
              <button
                type="button"
                onClick={togglePassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-800 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>
            {/* Remember Me & Terms */}
            <div className="space-y-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-sm text-black-700">Remember me</span>
              </label>
              <p className="text-xs text-black-600 text-center leading-relaxed">
                By clicking Log in you are accepting our{" "}
                <span className="text-sky-500 hover:text-sky-700 underline cursor-pointer">
                  Privacy Policy
                </span>{" "}
                & agree to the{" "}
                <span className="text-sky-500 hover:text-sky-700 underline cursor-pointer">
                  Terms & Conditions
                </span>
                .
              </p>
            </div>
            <button
              type="submit"
              className={`w-full py-3 bg-amber-500 text-slate-800 rounded-lg font-semibold text-lg transition-all duration-300 ${
                isLoading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-amber-400 hover:shadow-lg transform hover:-translate-y-0.5"
              }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-slate-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                "LOGIN"
              )}
            </button>
            <div className="text-center">
              <span className="text-sm text-black-500 hover:text-slate-700 cursor-pointer">
                Forgot Password?
              </span>
            </div>
          </form>
        )}

        {page === "sso" && (
          <div className="space-y-6">
            <div className="text-center text-[#ea6822] mb-6">
              <h2 className="text-xl font-semibold">SSO Login</h2>
              <p className="text-sm text-gray-500 mt-2">Single Sign-On authentication</p>
            </div>
            <button
              onClick={() => setPage("login")}
              className="w-full py-3 bg-amber-500 text-slate-800 rounded-lg font-semibold text-lg hover:bg-amber-400 transition-all"
            >
              Back to Login
            </button>
          </div>
        )}

        {page === "login" && (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setPage("sso")}
              className="text-sm text-black-500 hover:text-[#ea6822] transition-colors"
              disabled={isLoading}
            >
              Login with SSO
            </button>
          </div>
        )}
      </div>
      <ToastContainer position="top-center" />
    </div>
  );
};

export default Login;
