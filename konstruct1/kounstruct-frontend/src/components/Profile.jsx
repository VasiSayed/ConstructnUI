import React, { useEffect, useRef, useState } from "react";
import Drawer from "./Drawer";
import profile from "../../src/Images/profile.jpg";
import { CiCircleQuestion } from "react-icons/ci";
import { IoLogoApple, IoMdArrowDropdown } from "react-icons/io";
import { Link } from "react-router-dom";
import { MdOutlineMailOutline } from "react-icons/md";
import { LuUsers } from "react-icons/lu";
import { TbDeviceDesktopCog, TbUsersPlus } from "react-icons/tb";
import { GoRocket } from "react-icons/go";
import { AiTwotoneGift } from "react-icons/ai";
import { IoLogoGooglePlaystore } from "react-icons/io5";
function Profile({ onClose }) {
  const [manage, setManage] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setManage(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <Drawer onClose={onClose}>
      {/* <h2 className="text-xl font-semibold">Profile</h2> */}
      <div>
        <div className="bg-gray-700 text-white">
          <div className="flex justify-center items-center">
            <div className="h-20 w-20 rounded-full flex items-center justify-center border border-green-200">
              <div className="rounded-full p-1">
                <img
                  src={profile}
                  alt="profile"
                  className="h-[75px] w-[75px] rounded-full"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-center flex-col items-center mt-6">
            <h2 className="text-lg font-medium">SAGAR SINGH</h2>
            <div className="flex gap-1 items-center">
              <span className="flex gap-1">
                <h2>User Id:</h2>
                <p>60013932876</p>
              </span>
              <span>
                <CiCircleQuestion size={20} />
              </span>
            </div>
          </div>
          <div className="relative flex justify-center" ref={dropdownRef}>
            <button
              onClick={() => setManage(!manage)}
              className="flex items-center gap-2 px-4 py-2 rounded-md"
            >
              <span className="font-medium">KONSTRUCT</span>
              <IoMdArrowDropdown
                size={20}
                className={`transform transition-transform duration-200 ${
                  manage ? "rotate-90" : ""
                }`}
              />
            </button>
            {manage && (
              <div className="absolute mt-2 w-64 bg-white rounded-xl shadow-lg border p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-red-400 text-white text-lg font-semibold rounded-full">
                    S
                  </div>
                  <div>
                    <p className="font-semibold">SCHOOTECH</p>
                    <p className="text-sm text-gray-500">Org ID: 60013930376</p>
                  </div>
                </div>
                <button className="w-full mt-3 text-blue-600 font-medium text-sm py-2 hover:bg-gray-100 rounded-md">
                  Manage Organization
                </button>
              </div>
            )}
          </div>
          <div className="border border-gray-500 rounded-sm w-full">
            <div className="grid grid-cols-2">
              <span className="flex justify-center items-center border-r border-gray-500 px-5 py-2">
                <h2>My Account</h2>
              </span>
              <span className="flex justify-center items-center py-2">
                <h2>Sign Out</h2>
              </span>
            </div>
          </div>
        </div>
        <div className="bg-gray-300 h-full">
          <div className="mx-5 border-b space-y-2 py-5">
            <h2 className="text-sm font-medium text-gray-600">SUBSCRIPTION</h2>
            <div className="flex gap-2 items-center">
              <h2 className="text-md  font-normal">Free Edition</h2>
              <Link
                to={`upgrade`}
                className="text-sky-600 text-xs font-medium underline"
              >
                UPGRADE
              </Link>
            </div>
            <h2 className="text-md font-normal">TryOtherEditions</h2>
          </div>
          <div className="mx-5 border-b space-y-2 py-5">
            <h2 className="text-sm font-medium text-gray-600">NEED HELP ?</h2>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex gap-2 items-center">
                <span className="text-sky-500">
                  <MdOutlineMailOutline size={20} />
                </span>
                <h2 className="text-gray-800">Write to us</h2>
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-yellow-500">
                  <LuUsers size={20} />
                </span>
                <h2 className="text-gray-800">Community</h2>
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-green-500">
                  <TbDeviceDesktopCog size={20} />
                </span>
                <h2 className="text-gray-800">Resources</h2>
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-gray-500">
                  <GoRocket size={20} />
                </span>
                <h2 className="text-gray-800">Take A tour</h2>
              </div>
            </div>
          </div>
          <div className="mx-5 border-b space-y-2 pt-5 pb-14">
            <h2 className="text-sm font-medium text-gray-600">NEW ROOM</h2>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex gap-2 items-center">
                <span className="text-yellow-500">
                  <AiTwotoneGift size={20} />
                </span>
                <h2 className="text-gray-800">What's New ?</h2>
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-gray-500">
                  <TbUsersPlus size={20} />
                </span>
                <h2 className="text-gray-800">Refer and Earn</h2>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t flex gap-2 items-center px-5 py-3 pb-5">
          <h2 className="font-normal text-white">Mobile</h2>
          <span className="font-normal text-white">
            <IoLogoApple size={25} />
          </span>
          <span className="font-normal text-white">
            <IoLogoGooglePlaystore size={20} />
          </span>
        </div>
      </div>
    </Drawer>
  );
}

export default Profile;
