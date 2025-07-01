import React, { useState, useCallback } from "react";
import Projects from "../containers/setup/Projects";
import Stages from "../containers/setup/Stages";
import Zone from "../containers/setup/Zone";
import FlatType from "../containers/setup/FlatType";
import Unit from "../containers/setup/Unit";
import TransferRules from "../containers/setup/TransferRules";
import User from "../containers/setup/User";
import Tower from "../containers/setup/Tower";
import Level from "../containers/setup/Level";
import UserSetup from "../containers/setup/UserSetup";
import Checklist from "../containers/setup/Checklist";

import { useSelector, useDispatch } from "react-redux";
import {
  setUser,
  setOrganization,
  setCompany,
  setSelectedProject,
} from "../store/userSlice";
import SideBarSetup from "./SideBarSetup";

function Setup() {
  const dispatch = useDispatch();

  const userId = useSelector((state) => state.user.user.id);
  const selectedProjectId = useSelector(
    (state) => state.user.selectedProject.id
  );
  const purposes = useSelector((state) => state.user.purposes);
  const phases = useSelector((state) => state.user.phases);
  const stages = useSelector((state) => state.user.stages);
  console.log(userId, selectedProjectId);

  const [setup, setSetup] = useState("project");
  const next = [
    "user-setup",
    "project",
    "stages",
    "tower",
    "level",
    // "zone",
    "flatType",
    "unit",
    "transferRules",
    // "schedule",
    "user",
    "checklists",
  ];

  const nextStep = () => {
    const currentIndex = next.indexOf(setup); // Get the current index
    if (currentIndex < next.length - 1) {
      setSetup(next[currentIndex + 1]); // Move to the next step
    }
  };

  const previousStep = () => {
    const currentIndex = next.indexOf(setup); // Get the current index of the current step
    if (currentIndex > 0) {
      setSetup(next[currentIndex - 1]); // Set the previous step
    }
  };

  const onUserSetup = (id) => {
    console.log(id, "called");
    dispatch(setUser(id));
  };

  const onCompanySetup = (id) => {
    dispatch(setCompany(id));
    setSetup("project");
  };

  const onOrganizationSetup = (id) => {
    dispatch(setOrganization(id));
  };

  const onProjectSetupComplete = (id) => {
    dispatch(setSelectedProject(id));
    setSetup("stages");
  };

  const onStageNextClick = (company) => {
    setSetup("project");
    console.log(company, "Company");
    dispatch(setCompany(company));
  };

  const isStageData = useCallback(() => {
    return (
      purposes?.[selectedProjectId]?.length > 0 &&
      phases?.[selectedProjectId]?.length > 0 &&
      stages?.[selectedProjectId]?.length > 0
    );
  }, [selectedProjectId, purposes, phases, stages]);

  // useEffect(() => {
  //   if (!isStageData()) {
  //     setSetup("project");
  //   }
  // }, [selectedProjectId, isStageData]);

  // const handleTowerClick = () => {
  //   setSetup("level");
  // };

  return (
    <div className="flex">
      <SideBarSetup />
      <div
        className="flex flex-col flex-1 h-full w-[80%] mt-5 ml-[16%] mr-[1%]"
        // style={{ rowGap: "24px" }}
      >
        <div className="flex items-center overflow-x-auto justify-between py-2 bg-gray-200 rounded-md">
          {/* <button
            className={`p-2 text-slate-800 cursor-pointer w-fit ${
              setup === "user-setup"
                ? "bg-white text-blue-500 font-semibold rounded-full"
                : ""
            }`}
            onClick={() => setSetup("user-setup")}
          >
            User Setup
          </button> */}
          <button
            className={`p-2 text-slate-800 flex items-center justify-center gap-2 border border-red-200  cursor-pointer rounded-full w-40 btn whitespace-nowrap bg-white ${
              setup === "project"
                ? "border border-red-500 text-blue-500 font-semibold rounded-full"
                : ""
            }`}
            disabled={!userId}
            onClick={() => setSetup("project")}
          >
            <span className="bg-red-100 text-red-400 rounded-full w-6 h-6 flex items-center justify-center text-sm">
              1
            </span>
            Project
          </button>
          <div className="border-t-2 border-dashed border-red-500 w-10"></div>
          <button
            className={`p-2 text-slate-800 flex items-center justify-center gap-2  border border-red-200 cursor-pointer rounded-full w-40 btn whitespace-nowrap bg-white ${
              setup === "stages"
                ? "border border-red-500 text-blue-500 font-semibold rounded-full"
                : ""
            }`}
            disabled={!selectedProjectId}
            onClick={() => setSetup("stages")}
          >
            <span className="bg-red-100 text-red-400 rounded-full w-6 h-6 flex items-center justify-center text-sm">
              2
            </span>
            Stages
          </button>
          <div className="border-t-2 border-dashed border-red-500 w-10"></div>
          <button
            className={`p-2 text-slate-800 flex items-center justify-center gap-2 cursor-pointer border border-red-200 rounded-full w-40 btn whitespace-nowrap bg-white ${
              setup === "tower"
                ? "border border-red-500 text-blue-500 font-semibold rounded-full"
                : ""
            }`}
            disabled={!selectedProjectId || !isStageData()}
            onClick={() => setSetup("tower")}
          >
            <span className="bg-red-100 text-red-400 rounded-full w-6 h-6 flex items-center justify-center text-sm">
              3
            </span>
            Tower
          </button>
          <div className="border-t-2 border-dashed border-red-500 w-10"></div>
          <button
            className={`p-2 text-slate-800 flex items-center justify-center gap-2 cursor-pointer border border-red-200 rounded-full w-40 btn whitespace-nowrap bg-white ${
              setup === "level"
                ? "border border-red-500 text-blue-500 font-semibold rounded-full"
                : ""
            }`}
            disabled={!selectedProjectId || !isStageData()}
            onClick={() => setSetup("level")}
          >
            <span className="bg-red-100 text-red-400 rounded-full w-6 h-6 flex items-center justify-center text-sm">
              4
            </span>
            Level
          </button>
          <div className="border-t-2 border-dashed border-red-500 w-10"></div>
          {/* <button
          className={`p-2 text-slate-800 cursor-pointer btn ${
            setup === "zone"
              ? "bg-white text-blue-500 font-semibold rounded-md"
              : ""
          }`}
          disabled={!selectedProjectId || !isStageData()}
          onClick={() => setSetup("zone")}
        >
          Zone
        </button> */}
          <button
            className={`p-2 text-slate-800 flex items-center justify-center gap-2 cursor-pointer border border-red-200 w-40 rounded-full btn whitespace-nowrap bg-white ${
              setup === "flatType"
                ? "border border-red-500 text-blue-500 font-semibold rounded-full"
                : ""
            }`}
            disabled={!selectedProjectId || !isStageData()}
            onClick={() => setSetup("flatType")}
          >
            <span className="bg-red-100 text-red-400 rounded-full w-6 h-6 flex items-center justify-center text-sm">
              5
            </span>
            Flat Type
          </button>
          <div className="border-t-2 border-dashed border-red-500 w-10"></div>
          <button
            className={`p-2 text-slate-800 cursor-pointer flex items-center justify-center gap-2 border border-red-200 w-40 rounded-full btn whitespace-nowrap bg-white ${
              setup === "unit"
                ? "border border-red-500 text-blue-500 font-semibold rounded-full"
                : ""
            }`}
            disabled={!selectedProjectId || !isStageData()}
            onClick={() => setSetup("unit")}
          >
            <span className="bg-red-100 text-red-400 rounded-full w-6 h-6 flex items-center justify-center text-sm">
              6
            </span>
            Units
          </button>
          <div className="border-t-2 border-dashed border-red-500 w-10"></div>
          <button
            className={`p-2 text-slate-800 flex items-center justify-center gap-2 cursor-pointer border border-red-200 w-40 rounded-full btn whitespace-nowrap bg-white ${
              setup === "transferRules"
                ? "border border-red-500 text-blue-500 font-semibold rounded-full"
                : ""
            }`}
            disabled={!selectedProjectId || !isStageData()}
            onClick={() => setSetup("transferRules")}
          >
            <span className="bg-red-100 text-red-400 rounded-full w-6 h-6 flex items-center justify-center text-sm">
              7
            </span>
            Transfer Rules
          </button>
          {/* <button
          className={`p-2 text-slate-800 cursor-pointer btn ${
            setup === "schedule"
              ? "bg-white text-blue-500 font-semibold rounded-md"
              : ""
          }`}
          disabled={!selectedProjectId || !isStageData()}
          onClick={() => setSetup("schedule")}
        >
          Schedule
        </button> */}
          {/* <button
            className={`p-2 text-slate-800 cursor-pointer btn ${
              setup === "user"
                ? "border border-red-500 text-blue-500 font-semibold rounded-full"
                : ""
            }`}
            // disabled={!selectedProjectId || !isStageData()}
            onClick={() => setSetup("user")}
          >
            User
          </button> */}
          {/* <button
            className={`p-2 text-slate-800 cursor-pointer btn ${
              setup === "checklists"
                ? "border border-red-500 text-blue-500 font-semibold rounded-full"
                : ""
            }`}
            disabled={!selectedProjectId || !isStageData()}
            onClick={() => setSetup("checklists")}
          >
            Checklists
          </button> */}
        </div>
        <div className="setup-container w-full h-screen">
          {/* {setup === "user-setup" && (
            <UserSetup
            // onUserSetup={onUserSetup}
            // onCompanySetup={onCompanySetup}
            // onOrganizationSetup={onOrganizationSetup}
            // onNextClick={onStageNextClick}
            />
          )} */}
          {setup === "project" && (
            <Projects
              nextStep={nextStep}
              onProjectSetupComplete={onProjectSetupComplete}
            />
          )}
          {setup === "stages" && (
            <Stages nextStep={nextStep} previousStep={previousStep} />
          )}
          {setup === "tower" && (
            <Tower nextStep={nextStep} previousStep={previousStep} />
          )}
          {setup === "level" && (
            <Level nextStep={nextStep} previousStep={previousStep} />
          )}
          {setup === "zone" && (
            <Zone nextStep={nextStep} previousStep={previousStep} />
          )}
          {setup === "flatType" && (
            <FlatType nextStep={nextStep} previousStep={previousStep} />
          )}
          {setup === "unit" && (
            <Unit nextStep={nextStep} previousStep={previousStep} />
          )}
          {setup === "transferRules" && (
            <TransferRules nextStep={nextStep} previousStep={previousStep} />
          )}
          {/* {setup === "schedule" && (
          <Schedule nextStep={nextStep} previousStep={previousStep} />
        )} */}
          {/* {setup === "user" && (
            <User nextStep={nextStep} previousStep={previousStep} />
          )} */}
          {/* {setup === "checklists" && (
            <Checklist nextStep={nextStep} previousStep={previousStep} />
          )} */}
        </div>
      </div>
    </div>
  );
}

export default Setup;
