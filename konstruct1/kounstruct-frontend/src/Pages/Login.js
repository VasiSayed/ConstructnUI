import React, { useEffect, useState } from "react";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Image from "../Images/image.png";
import { toast } from "react-toastify";
import { login } from "../api";
import { setUserData } from "../store/userSlice"; // Import the action
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [password, showPassword] = useState(false);
  const [page, setPage] = useState("login");
  const [isLoading, setIsLoading] = useState(false);

  const onChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  useEffect(() => {
    // Check both old and new token keys for backward compatibility
    const token =
      localStorage.getItem("TOKEN") || localStorage.getItem("ACCESS_TOKEN");

    if (token) {
      // If token exists, try to restore user data from token
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
            is_manager:tokenData.is_manager
          })
        );
      }
      navigate("/dashboard");
      toast.success("You are already logged in!");
    }
  }, [navigate, dispatch]);

  const togglePassword = () => {
    showPassword(!password);
  };

  // Decode JWT function
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
        // Save tokens
        localStorage.setItem("ACCESS_TOKEN", response.data.access);
        localStorage.setItem("REFRESH_TOKEN", response.data.refresh);
        localStorage.setItem("token", response.data.access);

        // Decode the JWT to get accesses
        const tokenData = decodeJWT(response.data.access);
        const accesses =
          tokenData && tokenData.accesses ? tokenData.accesses : [];
        localStorage.setItem("ACCESSES", JSON.stringify(accesses));
        console.log("Accesses saved in localStorage:", accesses);

        // ...rest of your userData code as needed...

        // Get user data
        let userData = null;
        if (response.data.user) {
          userData = response.data.user;
          console.log(userData);
        } else {
          // fallback: decode from JWT
          const tokenData = decodeJWT(response.data.access);
          if (tokenData) {
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
            };
          }
        }

        if (userData) {
          dispatch(setUserData(userData));
          localStorage.setItem("USER_DATA", JSON.stringify(userData));
        }
        console.log(userData);

        toast.success("Logged in successfully!");
        navigate("/dashboard");
      } else {
        toast.error("Invalid credentials.");
      }
    } catch (error) {
      console.error("Login Error:", error);

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
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <div
        className="h-screen relative"
        style={{
          backgroundImage: `url(${Image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          background: "blur",
          opacity: 0.9,
        }}
      >
        <div className="rounded-md">
          <h1 className="text-3xl text-white p-2 px-10 font-semibold jersey-15-regular">
            ConstructWorld.ai
          </h1>
        </div>

        <div className="flex justify-center h-[90vh] items-center">
          <div className="bg-white border-2 border-white w-[30rem] rounded-xl max-h-full p-5 shadow-2xl">
            <h1 className="text-2xl font-semibold text-center mb-4">Login</h1>

            <form
              onSubmit={handleLogin}
              className="m-2 flex flex-col gap-4 w-full"
            >
              {/* Username Field */}
              <div className="flex flex-col gap-2 mx-5">
                <label htmlFor="username" className="font-medium">
                  Username:
                </label>
                <input
                  type="text"
                  name="username"
                  id="username"
                  className="rounded-sm p-2 px-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter username"
                  onChange={onChange}
                  value={formData.username}
                  disabled={isLoading}
                  required
                />
              </div>

              {/* Password Field */}
              {page === "login" && (
                <div className="flex flex-col gap-2 relative mx-5">
                  <label htmlFor="password" className="font-medium">
                    Password:
                  </label>
                  <input
                    name="password"
                    id="password"
                    className="rounded-sm p-2 px-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="**********"
                    type={password ? "text" : "password"}
                    onChange={onChange}
                    value={formData.password}
                    disabled={isLoading}
                    required
                  />
                  <div className="p-1 rounded-full absolute top-10 right-2 cursor-pointer">
                    {password ? (
                      <AiFillEye
                        onClick={togglePassword}
                        className="text-gray-600"
                      />
                    ) : (
                      <AiFillEyeInvisible
                        onClick={togglePassword}
                        className="text-gray-600"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Remember Me */}
              <div className="mx-5 flex gap-2 items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="remember" className="text-sm">
                  Remember Me
                </label>
              </div>

              {/* Buttons */}
              <div className="flex justify-center gap-4 w-full">
                {page === "login" && (
                  <button
                    type="submit"
                    className={`px-6 py-2 bg-black text-white rounded-md text-lg font-semibold transition-colors ${
                      isLoading
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-gray-800"
                    }`}
                    disabled={isLoading}
                  >
                    {isLoading ? "Logging in..." : "Login"}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setPage(page === "sso" ? "login" : "sso")}
                  className="px-6 py-2 border-2 border-black text-black rounded-md text-lg font-medium hover:bg-gray-100 transition-colors"
                  disabled={isLoading}
                >
                  {page === "sso" ? "Submit" : "SSO"}
                </button>
              </div>

              {/* Switch to Login from SSO */}
              {page === "sso" && (
                <p
                  className="text-center cursor-pointer hover:text-blue-400 transition-colors"
                  onClick={() => setPage("login")}
                >
                  Back to Login
                </p>
              )}
            </form>

            {/* Loading indicator */}
            {isLoading && (
              <div className="text-center mt-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
