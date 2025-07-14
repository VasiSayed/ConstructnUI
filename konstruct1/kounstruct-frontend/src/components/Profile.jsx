// import React, { useEffect, useRef, useState } from "react";
// import Drawer from "./Drawer";
// import profile from "../../src/Images/profile.jpg";
// import { CiCircleQuestion } from "react-icons/ci";
// import { IoMdArrowDropdown } from "react-icons/io";
// import { useNavigate } from "react-router-dom";

// function Profile({ onClose }) {
//   const [manage, setManage] = useState(false);
//   const dropdownRef = useRef(null);
//   const navigate = useNavigate();

//   const [userData, setUserData] = useState(null);
//   const [accesses, setAccesses] = useState([]);

//   useEffect(() => {
//     // Get user data
//     const userString = localStorage.getItem("USER_DATA");
//     if (userString && userString !== "undefined") {
//       setUserData(JSON.parse(userString));
//     }
//     // Get accesses data
//     const accessString = localStorage.getItem("ACCESSES");
//     if (accessString && accessString !== "undefined") {
//       try {
//         setAccesses(JSON.parse(accessString));
//       } catch (e) {
//         setAccesses([]);
//       }
//     }
//   }, []);

//   // Extract unique roles from accesses, support array of strings or objects
//   let allRoles = [];
//   if (Array.isArray(accesses)) {
//     accesses.forEach((access) => {
//       if (access.roles && Array.isArray(access.roles)) {
//         access.roles.forEach((role) => {
//           // Role may be a string or object
//           const roleStr = typeof role === "string" ? role : role?.role;
//           if (roleStr && !allRoles.includes(roleStr)) {
//             allRoles.push(roleStr);
//           }
//         });
//       }
//     });
//   }

//   // Role logic
//   let role = "User";
//   if (userData?.superadmin || userData?.is_staff) {
//     role = "Super Admin";
//   } else if (allRoles.length > 0) {
//     role = allRoles.join(", ");
//   } else if (userData?.is_manager) {
//     role = "Manager";
//   } else if (userData?.is_client) {
//     role = "Client";
//   }



//   useEffect(()=>{
//     localStorage.setItem('ROLE',role);
//   },[role])


//   // Dropdown outside click
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setManage(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   // Sign out logic
//   const handleSignOut = () => {
//     localStorage.removeItem("ACCESS_TOKEN");
//     localStorage.removeItem("REFRESH_TOKEN");
//     localStorage.removeItem("USER_DATA");
//     localStorage.removeItem("ACCESSES");

//     localStorage.removeItem('ROLE');

//     navigate("/login");
//     if (typeof onClose === "function") onClose();
//   };

//   return (
//     <Drawer onClose={onClose}>
//       <div>
//         {/* Profile Picture */}
//         <div className="flex justify-center items-center">
//           <div className="h-20 w-20 rounded-full flex items-center justify-center border border-green-200">
//             <div className="rounded-full p-1">
//               <img
//                 src={profile}
//                 alt="profile"
//                 className="h-[75px] w-[75px] rounded-full"
//               />
//             </div>
//           </div>
//         </div>
//         {/* User Info */}
//         <div className="flex justify-center flex-col items-center mt-6">
//           <h3 className="text-base font-normal text-gray-500">
//             {userData?.username || ""}
//           </h3>
//           <div className="flex gap-1 items-center mt-2">
//             <span className="flex gap-1">
//               <h2>User Id:</h2>
//               <p>{userData?.user_id || "--"}</p>
//             </span>
//             <span>
//               <CiCircleQuestion size={20} />
//             </span>
//           </div>
//           <div className="mt-2">
//             <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
//               Role: {role}
//             </span>
//           </div>
//         </div>
//         {/* Show all project roles */}
//         {accesses?.length > 0 && (
//           <div className="mt-2 text-center">
//             <span className="text-sm font-medium">Roles by Project:</span>
//             {accesses.map((access, idx) => (
//               <div key={idx}>
//                 <span className="font-bold">Project {access.project_id}:</span>
//                 {access.roles &&
//                   access.roles.map((role, j) => {
//                     const roleStr =
//                       typeof role === "string" ? role : role?.role;
//                     return (
//                       <span
//                         key={j}
//                         className="ml-2 inline-block px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs"
//                       >
//                         {roleStr}
//                       </span>
//                     );
//                   })}
//               </div>
//             ))}
//           </div>
//         )}
//         {/* Contact Info */}
//         <div className="flex flex-col items-center text-base text-black mt-4">
//           <div>
//             Email:{" "}
//             <span className="font-semibold">{userData?.email || "--"}</span>
//           </div>
//           <div>
//             Phone:{" "}
//             <span className="font-semibold">
//               {userData?.phone_number || "--"}
//             </span>
//           </div>
//           <div>
//             Joined:{" "}
//             <span className="font-semibold">
//               {userData?.date_joined || "--"}
//             </span>
//           </div>
//           {userData?.last_login && (
//             <div>
//               Last Login:{" "}
//               <span className="font-semibold">{userData.last_login}</span>
//             </div>
//           )}
//         </div>
//         {/* Organization Dropdown */}
//         <div className="relative flex justify-center mt-6" ref={dropdownRef}>
//           <button
//             onClick={() => setManage(!manage)}
//             className="flex items-center gap-2 px-4 py-2 rounded-md"
//           >
//             <span className="font-medium">
//               {userData?.org || "ORGANIZATION"}
//             </span>
//             <IoMdArrowDropdown
//               size={20}
//               className={`transform transition-transform duration-200 ${
//                 manage ? "rotate-90" : ""
//               }`}
//             />
//           </button>
//           {manage && (
//             <div className="absolute mt-2 w-64 bg-white rounded-xl shadow-lg border p-4">
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 flex items-center justify-center bg-red-400 text-white text-lg font-semibold rounded-full">
//                   {userData?.organization_name
//                     ? userData.organization_name[0]
//                     : "O"}
//                 </div>
//                 <div>
//                   <p className="font-semibold">
//                     {userData?.org || "ORGANIZATION"}
//                   </p>
//                   <p className="text-sm text-gray-500">
//                     Org ID: {userData?.org || "--"}
//                   </p>
//                 </div>
//               </div>
//               <button className="w-full mt-3 text-blue-600 font-medium text-sm py-2 hover:bg-gray-100 rounded-md">
//                 Manage Organization
//               </button>
//             </div>
//           )}
//         </div>
//         {/* Account Actions */}
//         <div className="border border-black rounded-sm my-5 pt-5 w-full py-2">
//           <div className="grid grid-cols-2 text-center">
//             <button
//               className="hover:underline text-blue-600 font-medium"
//               onClick={() => {
//                 alert("Account details feature coming soon!");
//               }}
//             >
//               My Account
//             </button>
//             <button
//               className="hover:underline text-red-500 font-medium"
//               onClick={handleSignOut}
//             >
//               Sign Out
//             </button>
//           </div>
//         </div>
//       </div>
//     </Drawer>
//   );
// }

// export default Profile;
import React, { useEffect, useRef, useState } from "react";
import Drawer from "./Drawer";
import profile from "../../src/Images/profile.jpg";
import { CiCircleQuestion } from "react-icons/ci";
import { IoMdArrowDropdown } from "react-icons/io";
import {
  FiMail,
  FiPhone,
  FiCalendar,
  FiClock,
  FiUser,
  FiSettings,
  FiLogOut,
  FiBriefcase,
  FiShield,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

// Pass theme prop as "dark" or "light"
function Profile({ onClose, theme = "light" }) {
  const [manage, setManage] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [accesses, setAccesses] = useState([]);

  // --- MODERN THEME PALETTE ---
  const palette =
    theme === "dark"
      ? {
          bg: "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
          card: "bg-slate-800/80 backdrop-blur-xl border-slate-700/50",
          innerCard: "bg-slate-700/50 backdrop-blur-lg border-slate-600/30",
          border: "border-slate-700/50",
          text: "text-slate-100",
          subtext: "text-slate-300",
          mutedText: "text-slate-400",
          accent: "bg-gradient-to-r from-blue-500 to-purple-600",
          accentHover: "hover:from-blue-400 hover:to-purple-500",
          primaryBtn:
            "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500",
          dangerBtn:
            "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-400 hover:to-pink-500",
          icon: "text-blue-400",
          surface: "bg-slate-800/60",
          glassmorphism: "bg-white/5 backdrop-blur-xl border-white/10",
        }
      : {
          bg: "bg-gradient-to-br from-gray-50 via-white to-gray-50",
          card: "bg-white/90 backdrop-blur-xl border-gray-200/50 shadow-xl",
          innerCard: "bg-gray-50/80 backdrop-blur-lg border-gray-200/30",
          border: "border-gray-200/50",
          text: "text-gray-900",
          subtext: "text-gray-600",
          mutedText: "text-gray-500",
          accent: "bg-gradient-to-r from-blue-600 to-purple-600",
          accentHover: "hover:from-blue-500 hover:to-purple-500",
          primaryBtn:
            "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500",
          dangerBtn:
            "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-400 hover:to-pink-500",
          icon: "text-blue-500",
          surface: "bg-gray-50/80",
          glassmorphism: "bg-white/40 backdrop-blur-xl border-white/20",
        };

  useEffect(() => {
    const userString = localStorage.getItem("USER_DATA");
    if (userString && userString !== "undefined") {
      setUserData(JSON.parse(userString));
    }
    const accessString = localStorage.getItem("ACCESSES");
    if (accessString && accessString !== "undefined") {
      try {
        setAccesses(JSON.parse(accessString));
      } catch (e) {
        setAccesses([]);
      }
    }
  }, []);

  // Extract unique roles
  let allRoles = [];
  if (Array.isArray(accesses)) {
    accesses.forEach((access) => {
      if (access.roles && Array.isArray(access.roles)) {
        access.roles.forEach((role) => {
          const roleStr = typeof role === "string" ? role : role?.role;
          if (roleStr && !allRoles.includes(roleStr)) {
            allRoles.push(roleStr);
          }
        });
      }
    });
  }

  let role = "User";
  if (userData?.superadmin || userData?.is_staff) {
    role = "Super Admin";
  } else if (userData?.is_client) {
    role = "Client";
  } else if (userData?.is_manager) {
    role = "Manager";
  } else if (allRoles.length > 0) {
    role = allRoles.join(", ");
  } 

  useEffect(() => {
    localStorage.setItem("ROLE", role);
  }, [role]);

  // Dropdown outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setManage(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sign out logic
  const handleSignOut = () => {
    localStorage.removeItem("ACCESS_TOKEN");
    localStorage.removeItem("REFRESH_TOKEN");
    localStorage.removeItem("USER_DATA");
    localStorage.removeItem("ACCESSES");
    localStorage.removeItem("ROLE");
    navigate("/login");
    if (typeof onClose === "function") onClose();
  };

  // Helper function to check if contact data exists
  const hasContactData = () => {
    return (
      isValidString(userData?.email) ||
      isValidString(userData?.phone_number) ||
      isValidString(userData?.date_joined) ||
      isValidString(userData?.last_login)
    );
  };

  // Helper function to safely check string values
  const isValidString = (value) => {
    return value && String(value).trim() !== "";
  };

  return (
    <Drawer onClose={onClose}>
      <div
        className={`w-full max-w-md mx-auto ${palette.bg} rounded-3xl overflow-hidden max-h-[85vh] sm:max-h-[90vh] flex flex-col`}
      >
        {/* Header with Profile Picture - Fixed */}
        <div
          className={`relative ${palette.card} ${palette.border} border rounded-t-3xl p-6 pb-4 flex-shrink-0`}
        >
          <div className="flex flex-col items-center">
            {/* Profile Picture with Modern Ring */}
            <div className="relative group">
              <div
                className={`absolute -inset-1 ${palette.accent} rounded-full blur opacity-75 group-hover:opacity-100 transition duration-500`}
              ></div>
              <div className="relative">
                <img
                  src={profile}
                  alt="profile"
                  className="h-20 w-20 rounded-full object-cover border-4 border-white shadow-2xl transform group-hover:scale-105 transition duration-300"
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
            </div>

            {/* User Name & ID */}
            <div className="text-center mt-4 space-y-2">
              {/* Username - Only show if not empty */}
              {isValidString(userData?.username) && (
                <h2
                  className={`text-xl font-bold ${palette.text} tracking-tight`}
                >
                  {userData.username}
                </h2>
              )}

              {/* User ID - Only show if not empty */}
              {isValidString(userData?.user_id) && (
                <div
                  className={`flex items-center justify-center gap-2 ${palette.subtext}`}
                >
                  <FiUser size={14} />
                  <span className="text-sm font-medium">
                    ID: {userData.user_id}
                  </span>
                  <CiCircleQuestion
                    size={14}
                    className={`${palette.icon} hover:scale-110 transition-transform cursor-help`}
                  />
                </div>
              )}
            </div>

            {/* Role Badge */}
            <div className="mt-3">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 ${palette.accent} text-white rounded-full text-sm font-semibold shadow-lg transform hover:scale-105 transition-all duration-300`}
              >
                <FiShield size={14} />
                {role}
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div
          className="flex-1 overflow-y-auto px-4 py-2 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400"
          style={{ scrollbarWidth: "thin" }}
        >
          {/* Project Roles Section - Only show if accesses exist and not empty */}
          {accesses?.length > 0 && (
            <div
              className={`${palette.innerCard} ${palette.border} border rounded-2xl p-4`}
            >
              <div className={`flex items-center gap-2 mb-3 ${palette.text}`}>
                <FiBriefcase size={16} className={palette.icon} />
                <h3 className="font-semibold text-sm">Project Access</h3>
              </div>
              <div className="space-y-2">
                {accesses.slice(0, 3).map(
                  (access, idx) =>
                    // Only show project if project_id exists and is not empty
                    isValidString(access.project_id) && (
                      <div
                        key={idx}
                        className={`${palette.glassmorphism} rounded-xl p-3 ${palette.border} border`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`font-semibold ${palette.text} text-sm`}
                          >
                            Project {access.project_id}
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {access.roles?.slice(0, 2).map((role, j) => {
                              const roleStr =
                                typeof role === "string" ? role : role?.role;
                              // Only show role if it's not empty
                              return isValidString(roleStr) ? (
                                <span
                                  key={j}
                                  className={`px-2 py-1 ${palette.accent} text-white rounded-lg text-xs font-medium shadow-sm`}
                                >
                                  {roleStr}
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>
                      </div>
                    )
                )}
                {accesses.length > 3 && (
                  <div className={`text-center ${palette.mutedText} text-xs`}>
                    +{accesses.length - 3} more projects
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contact Information - Only show section if at least one contact field has data */}
          {hasContactData() && (
            <div
              className={`${palette.innerCard} ${palette.border} border rounded-2xl p-4`}
            >
              <h3
                className={`font-semibold ${palette.text} mb-3 flex items-center gap-2 text-sm`}
              >
                <FiMail size={16} className={palette.icon} />
                Contact Details
              </h3>

              <div className="space-y-2">
                {/* Email - Only show if not empty */}
                {isValidString(userData?.email) && (
                  <div
                    className={`flex items-center gap-3 p-3 ${palette.glassmorphism} rounded-xl ${palette.border} border hover:scale-[1.02] transition-transform`}
                  >
                    <FiMail size={14} className={palette.icon} />
                    <div>
                      <p
                        className={`text-xs ${palette.mutedText} uppercase tracking-wide`}
                      >
                        Email
                      </p>
                      <p className={`${palette.text} font-medium text-sm`}>
                        {userData.email}
                      </p>
                    </div>
                  </div>
                )}

                {/* Phone - Only show if not empty */}
                {isValidString(userData?.phone_number) && (
                  <div
                    className={`flex items-center gap-3 p-3 ${palette.glassmorphism} rounded-xl ${palette.border} border hover:scale-[1.02] transition-transform`}
                  >
                    <FiPhone size={14} className={palette.icon} />
                    <div>
                      <p
                        className={`text-xs ${palette.mutedText} uppercase tracking-wide`}
                      >
                        Phone
                      </p>
                      <p className={`${palette.text} font-medium text-sm`}>
                        {userData.phone_number}
                      </p>
                    </div>
                  </div>
                )}

                {/* Date Joined - Only show if not empty */}
                {isValidString(userData?.date_joined) && (
                  <div
                    className={`flex items-center gap-3 p-3 ${palette.glassmorphism} rounded-xl ${palette.border} border hover:scale-[1.02] transition-transform`}
                  >
                    <FiCalendar size={14} className={palette.icon} />
                    <div>
                      <p
                        className={`text-xs ${palette.mutedText} uppercase tracking-wide`}
                      >
                        Joined
                      </p>
                      <p className={`${palette.text} font-medium text-sm`}>
                        {userData.date_joined}
                      </p>
                    </div>
                  </div>
                )}

                {/* Last Login - Only show if not empty */}
                {isValidString(userData?.last_login) && (
                  <div
                    className={`flex items-center gap-3 p-3 ${palette.glassmorphism} rounded-xl ${palette.border} border hover:scale-[1.02] transition-transform`}
                  >
                    <FiClock size={14} className={palette.icon} />
                    <div>
                      <p
                        className={`text-xs ${palette.mutedText} uppercase tracking-wide`}
                      >
                        Last Login
                      </p>
                      <p className={`${palette.text} font-medium text-sm`}>
                        {userData.last_login}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Organization Section - Only show if org data exists */}
          {isValidString(userData?.org) && (
            <div
              className={`${palette.innerCard} ${palette.border} border rounded-2xl p-4 relative`}
              ref={dropdownRef}
            >
              <h3
                className={`font-semibold ${palette.text} mb-3 flex items-center gap-2 text-sm`}
              >
                <FiBriefcase size={16} className={palette.icon} />
                Organization
              </h3>

              <button
                onClick={() => setManage(!manage)}
                className={`w-full flex items-center justify-between p-3 ${palette.glassmorphism} rounded-xl ${palette.border} border hover:scale-[1.02] transition-all duration-300 group`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 ${palette.accent} text-white rounded-lg flex items-center justify-center font-bold text-sm shadow-lg`}
                  >
                    {isValidString(userData?.organization_name)
                      ? String(userData.organization_name)[0]
                      : String(userData.org)[0]}
                  </div>
                  <div className="text-left">
                    <p className={`font-semibold ${palette.text} text-sm`}>
                      {userData.org}
                    </p>
                    <p className={`text-xs ${palette.mutedText}`}>
                      Org ID: {userData.org}
                    </p>
                  </div>
                </div>
                <IoMdArrowDropdown
                  size={18}
                  className={`${
                    palette.icon
                  } transition-transform duration-300 group-hover:rotate-180 ${
                    manage ? "rotate-180" : ""
                  }`}
                />
              </button>

              {manage && (
                <div
                  className={`absolute top-full left-0 right-0 mt-2 ${palette.card} rounded-2xl ${palette.border} border shadow-2xl p-4 z-50 transform animate-in slide-in-from-top-2 duration-300`}
                >
                  <button
                    className={`w-full ${palette.primaryBtn} text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] shadow-lg`}
                    onClick={() =>
                      alert("Organization management coming soon!")
                    }
                  >
                    <FiSettings size={14} />
                    Manage Organization
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Padding for better scroll experience */}
          <div className="h-4"></div>
        </div>

        {/* Fixed Action Buttons at Bottom */}
        <div
          className={`${palette.card} ${palette.border} border-t rounded-b-3xl p-4 flex-shrink-0`}
        >
          <div className="grid grid-cols-2 gap-3">
            <button
              className={`${palette.primaryBtn} text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] shadow-lg text-sm`}
              onClick={() => alert("Account details feature coming soon!")}
            >
              <FiUser size={14} />
              My Account
            </button>

            <button
              className={`${palette.dangerBtn} text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] shadow-lg text-sm`}
              onClick={handleSignOut}
            >
              <FiLogOut size={14} />
              Sign Out
            </button>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-t-3xl"></div>
      </div>
    </Drawer>
  );
}

export default Profile;