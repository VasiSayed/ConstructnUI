import React, { useEffect, useState } from "react";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import Image from "../Images/image.png";
import { toast } from "react-toastify";
import { login } from "../api";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [password, showPassword] = useState(false);
  const [page, setPage] = useState("login");
  const onChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  useEffect(() => {
    const token = localStorage.getItem("TOKEN");
    const user = localStorage.getItem("Name");
    // console.log(user)
    if (token) {
      navigate("/dashboard");
      toast.success("You are already logged in!");
    }
  }, []);
  const togglePassword = () => {
    showPassword(!password);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await login({
        username: formData.username,
        password: formData.password,
      });

      if (response.status === 200) {
        toast.success("Logged in successfully!");
        // Save JWT tokens as needed
        localStorage.setItem("ACCESS_TOKEN", response.data.access);
        localStorage.setItem("REFRESH_TOKEN", response.data.refresh);
        navigate("/dashboard"); // or wherever
      } else {
        toast.error("Invalid credentials.");
      }
    } catch (error) {
      toast.error("Invalid credentials");
      console.error("Login Error:", error);
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
        <div className=" rounded-md  ">
          <h1 className="text-3xl text-white  p-2 px-10 font-semibold jersey-15-regular ">
            Construction.ai
          </h1>
        </div>
        <div className=" flex justify-center  h-[90vh] items-center">
          <div className="bg-white border-2 border-white w-[30rem] rounded-xl max-h-full p-5 shadow-2xl">
            <h1 className="text-2xl font-semibold text-center">Login</h1>
            <form
              onSubmit={handleLogin}
              className="m-2 flex flex-col gap-4 w-full "
            >
              <div className="flex flex-col gap-2 mx-5">
                <label htmlFor="username" className="font-medium">
                  username:
                </label>
                <input
                  type="text"
                  name="username"
                  id="username"
                  className=" rounded-sm p-1 px-2 border border-black"
                  placeholder="Enter username"
                  onChange={onChange}
                  value={formData.username}
                />
              </div>
              {page === "login" && (
                <div className="flex flex-col gap-2 relative mx-5">
                  <label htmlFor="password" className="font-medium">
                    Password:
                  </label>
                  <input
                    name="password"
                    id="password"
                    className="rounded-sm p-1 px-2 border border-black"
                    placeholder="**********"
                    type={password ? "text" : "password"}
                    onChange={onChange}
                    value={formData.password}
                  />
                  <div className="p-1 rounded-full  absolute top-12 right-2 transform -translate-y-1/2 cursor-pointer font">
                    {password ? (
                      <AiFillEye onClick={togglePassword} />
                    ) : (
                      <AiFillEyeInvisible onClick={togglePassword} />
                    )}
                  </div>
                </div>
              )}
              <div className="mx-5 flex gap-2">
                <input type="checkbox" name="" id="" />
                <label htmlFor="" className="">
                  Remember Me
                </label>
              </div>
              <div className="flex justify-center gap-4 w-full">
                {page === "login" && (
                  <button
                    type="submit"
                    className="w-20 my-2 bg-black text-white p-1 rounded-md text-xl font-bold hover:bg-gray-300 "
                  >
                    Login
                  </button>
                )}
                <p
                  onClick={() => setPage("sso")}
                  className="w-20 my-2 border-black border-2 p-1 cursor-pointer text-center rounded-md text-xl font-medium hover:bg-gray-300 "
                >
                  {page === "sso" ? "Submit" : "SSO"}
                </p>
              </div>
              {page === "sso" && (
                <p
                  className="text-center cursor-pointer hover:text-blue-400"
                  onClick={() => setPage("login")}
                >
                  Login
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
