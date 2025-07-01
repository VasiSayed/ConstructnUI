import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  createPhase,
  createPurpose,
  getPurposeByProjectId,
  createStage,
  getPhaseDetailsByProjectId,
  getStageDetailsByProjectId,
  editStage,
} from "../../api";
import { useSelector, useDispatch } from "react-redux";
import { setPurposes, setPhases, setStages } from "../../store/userSlice";
import { toast } from "react-toastify";
import { IoMdAdd } from "react-icons/io";

function Stages(nextStep) {
  const hasRun = useRef(false);

  const dispatch = useDispatch();
  const projectId = useSelector((state) => state.user.selectedProject.id);
  const purposesDetails = useSelector((state) => state.user.purposes);
  const phasesDetails = useSelector((state) => state.user.phases);
  const stagesDetails = useSelector((state) => state.user.stages);
  const [isCreateStage, setIsCreateStage] = useState(false);


  const [purposeData, setPurposeData] = useState(
    purposesDetails?.[projectId] || []
  );

  console.log(purposeData,'hey gotit');
  
  
  const getPurposes = async () => {
    if (projectId) {
      const response = await getPurposeByProjectId(projectId);
      console.log(response, "purposedeatilssssss");
      if (response.status === 200) {
        // response.data is an array of purposes
        setPurposeData(response.data);
        dispatch(
          setPurposes({
            project_id: projectId,
            data: response.data,
          })
        );
      }
    }
  };
  
  useEffect(() => {
    if (projectId) {
      getPurposes();
      getPhases();
      getStages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);
  

 
  const [phasesData, setPhasesData] = useState(
    phasesDetails?.[projectId] || []
  );

  const [selectedPurpose, setSelectedPurpose] = useState("");
  const [phaseName, setPhaseName] = useState("");
  const [newPurpose, setNewPurpose] = useState("");


  const [stagesData, setStagesData] = useState(
    stagesDetails?.[projectId] || []
  );

  const [selectedPhase, setSelectedPhase] = useState("");
  const [stageName, setStageName] = useState("");
  const [color, setColor] = useState("");

  const handleColorChange = (e) => {
    setColor(e.target.value);
  };

  // State for Navigation
  const [activeSection, setActiveSection] = useState("Purpose"); // Default to "Purpose"

  const getPurposeId = async (name) => {
    console.log(purposesDetails, "purposesDetails ID GET", name);
    return purposesDetails?.[projectId].find(
      (purpose) => purpose.name === name
    ).id;
  };

  const handleTogglePurpose = (index) => {
    // setPurposes((prev) =>
    //   prev.map((purpose, i) =>
    //     i === index ? { ...purpose, enabled: !purpose.enabled } : purpose
    //   )
    // );
  };

  // Handlers for Phase Management
  const handleCreatePhase = async () => {
    if (selectedPurpose && phaseName) {
      const purposeId = await getPurposeId(selectedPurpose);
      const response = await createPhase({
        project: projectId,
        purpose: purposeId,
        name: phaseName,
      });

      if (response.status === 200) {
        const newPhase = {
          purpose: selectedPurpose,
          phase: phaseName,
          id: response.data.id, // Assuming your API returns new phase id here
        };

        setPhasesData((prev) => {
          const updated = [...prev, newPhase];
          dispatch(setPhases({ project_id: projectId, data: updated }));
          return updated;
        });
        

        setSelectedPurpose("");
        setPhaseName("");
        toast.success(response.data.message);
      }
    }
  };
  
  

  useEffect(() => {
    setPhasesData(phasesDetails?.[projectId] || []);
  }, [phasesDetails, projectId]);
  
  const getPhaseId = async (name) => {
    console.log(phasesDetails?.[projectId], "phasesDetails ID GET", name);
    return phasesDetails?.[projectId].find((phase) => phase.phase === name).id;
  };

  // Handlers for Stage Management
  const handleCreateStage = async () => {
    if (selectedPhase && stageName) {
      const [purpose, phase] = selectedPhase.split(":"); // Split the combined string
      console.log(purpose, phase, "purpose, phase");
      const purposeId = await getPurposeId(purpose);
      console.log(purposeId, "purposeId");
      const phaseId = await getPhaseId(phase);
      console.log(phaseId, "phaseId");
      const response = await createStage({
        project_id: projectId,
        purpose_id: purposeId,
        phases_id: phaseId,
        stages_name: stageName,
        color: color,
      });

      if (response.status === 200) {
        // setStagesData((prevStages) => [
        //   ...prevStages,
        //   { purpose, phase, stage: stageName }, // Save all details
        // ]);
        setSelectedPhase("");
        setStageName("");
        setColor("");
        toast.success(response.data.message);
        await getStages();
      }
    }
  };
  
  const getPhases = async () => {
    if (!projectId) return;

    const response = await getPhaseDetailsByProjectId(projectId);
    if (response.status === 200) {
      const phases = response.data;

      const phasesData = phases.map((phase) => ({
        purpose: purposesDetails?.[projectId]?.find(
          (purpose) => purpose.id === phase.purpose
        )?.name,
        phase: phase.name,
        id: phase.id,
      }));

      setPhasesData(phasesData);
      dispatch(setPhases({ project_id: projectId, data: phasesData }));
    }
  };
  
  
  const getStages = async () => {
    try {
      const response = await getStageDetailsByProjectId(projectId);
      if (response.status === 200) {
        const stages = response.data; // Array of stages directly

        const stagesData = stages.map((stage) => ({
          purpose: purposesDetails?.[projectId]?.find(
            (p) => p.id === stage.purpose
          )?.purpose_name,
          phase: phasesDetails?.[projectId]?.find((p) => p.id === stage.phase)
            ?.phase,
          stage: stage.name || stage.stages_name, // match your model field name here
          id: stage.id,
          color: stage.color,
        }));

        setStagesData(stagesData);
        dispatch(setStages({ project_id: projectId, data: stagesData }));
      }
    } catch (error) {
      console.error("Error fetching stages:", error);
    }
  };
  
  const handleTab = async (tab) => {
    setActiveSection(tab);

    if (tab === "Purpose") {
      await getPurposes();
    }
    if (tab === "Phases") {
      await getPhases();
    }
    if (tab === "Stages") {
      await getStages();
    }
  };
  console.log(stagesData);
  const [editIndex, setEditIndex] = useState(null);
  const [editedStageName, setEditedStageName] = useState("");
  const [editedColor, setEditedColor] = useState("");
  const handleEditClick = (index) => {
    setEditIndex(index);
    setEditedStageName(stagesData[index].stage);
    setEditedColor(stagesData[index].color);
  };

  const handleCreatePurpose = async () => {
    if (!newPurpose.trim()) {
      toast.error("Purpose name cannot be empty");
      return;
    }

    try {
      const response = await createPurpose({
        name: newPurpose.trim(),
        project: projectId,
      });

      if (response.status === 201 || response.status === 200) {
        toast.success("Purpose created!");
        setNewPurpose(""); // Clear input
        await getPurposes(); // Refresh purpose list
      }
    } catch (error) {
      console.error("Error creating purpose:", error);
      toast.error("Failed to create purpose.");
    }
  };
  


  const handleSaveClick = async () => {
    if (editIndex !== null) {
      const stageToUpdate = stagesData[editIndex];

      try {
        const response = await editStage({
          stage_id: stageToUpdate.id, // Assuming your stage data has an `id`
          stages_name: editedStageName,
          color: editedColor,
        });

        if (response.status === 200) {
          toast.success("Stage updated successfully!");

          setEditIndex(null);
          setEditedStageName("");
          setEditedColor("");
          await getStages();
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to update stage.");
      }
    }
  };

  return (
    <div className="w-full h-min max-w-7xl mx-auto px-3 py-5 my-1 bg-white rounded-lg shadow-md flex flex-col gap-4">
      {/* Navigation */}
      <div className="flex lg:flex-row flex-col gap-2 relative items-center justify-center w-full">
        <div className="sm:flex grid grid-cols-3 flex-wrap text-sm md:text-base sm:flex-row gap-5 font-medium p-2 xl:rounded-full rounded-md opacity-90 bg-gray-200">
          <button
            onClick={() => handleTab("Purpose")}
            className={`md:rounded-full px-4 cursor-pointer text-center transition-all duration-300 ease-linear ${
              activeSection === "Purpose" &&
              "bg-white text-blue-500 shadow-custom-all-sides"
            }`}
          >
            Purpose
          </button>
          <button
            onClick={() => handleTab("Phases")}
            className={`md:rounded-full px-4 cursor-pointer text-center transition-all duration-300 ease-linear ${
              activeSection === "Phases" &&
              "bg-white text-blue-500 shadow-custom-all-sides"
            }`}
          >
            Phases
          </button>
          <button
            onClick={() => handleTab("Stages")}
            className={`md:rounded-full px-4 cursor-pointer text-center transition-all duration-300 ease-linear ${
              activeSection === "Stages" &&
              "bg-white text-blue-500 shadow-custom-all-sides"
            }`}
          >
            Stages
          </button>
        </div>
      </div>
      {/* Purpose Section */}
      {activeSection === "Purpose" && (
        <div className="w-full bg-green-50 p-4 rounded-lg shadow-lg">
          <h3 className="text-lg font-bold text-green-900">
            Purpose Management
          </h3>
          {/* <input
            value={newPurpose}
            onChange={(e) => setNewPurpose(e.target.value)}
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 mb-2"
            placeholder="Enter new purpose"
          />
          <button
            onClick={handleCreatePurpose}
            className="w-full bg-green-700 text-white py-2 rounded hover:bg-green-600 transition"
          >
            Add Purpose
          </button> */}
          {/* <h4 className="text-md font-semibold text-green-800 mt-4">
            Manage Purposes
          </h4> */}
          <input
            value={newPurpose}
            onChange={(e) => setNewPurpose(e.target.value)}
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 mb-2 bg-cyan-100"
            placeholder="Enter new purpose"
          />

          <button
            onClick={handleCreatePurpose}
            className="w-full bg-teal-600 text-white py-2 rounded hover:bg-teal-500 transition"
          >
            Add Purpose
          </button>

          <ul>

            {purposeData.length > 0 &&
              purposeData.map((purpose, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center py-2"
                >
                  <span
                    style={{
                      textTransform: "capitalize",
                    }}
                  >
                    {purpose.name}
                  </span>
                  <button
                    onClick={() => handleTogglePurpose(index)}
                    className={`text-sm ${
                      purpose.enabled
                        ? "text-red-600 hover:text-red-800"
                        : "text-green-600 hover:text-green-800"
                    }`}
                  >
                    {purpose?.enabled ? "Disable" : "Enable"}
                  </button>
                </li>
              ))}

          </ul>
        </div>
      )}
      {/* Phases Section */}
      {activeSection === "Phases" && (
        <div className="w-full">
          <h3 className="text-lg font-bold text-green-700">Create Phase</h3>
          <div className="flex mb-4">
            <div className="w-1/3">
              <label className="block text-green-600 font-semibold mb-2">
                Purpose
              </label>
              <select
                value={selectedPurpose}
                onChange={(e) => setSelectedPurpose(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select Purpose</option>
                {purposeData.map((purpose, index) => (
                  <option
                    key={index}
                    value={purpose.name}
                    style={{ textTransform: "capitalize" }}
                  >
                    {purpose.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-1/3 ml-4">
              <label className="block text-green-600 font-semibold mb-2">
                Phase Name
              </label>
              <input
                value={phaseName}
                onChange={(e) => setPhaseName(e.target.value)}
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter Phase Name"
              />
            </div>
            <div className="w-1/3 ml-4 flex items-end">
              <button
                className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                onClick={handleCreatePhase}
              >
                Create
              </button>
            </div>
          </div>

          <h3 className="text-lg font-bold text-green-600 mt-4">
            Manage Phases
          </h3>
          <ul className="bg-green-50 p-4 rounded-lg shadow mt-2">
            {phasesData.map((phase, index) => (
              <li
                key={index}
                className="py-2"
                style={{ textTransform: "capitalize" }}
              >
                {`Purpose: ${phase.purpose}, Phase: ${phase.phase}`}
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Stages Section */}
      {activeSection === "Stages" && (
        <div className="w-full">
          {/* <h3 className="text-lg font-bold text-green-600">Create Stage</h3> */}
          <button
            className="bg-[#3CB0E1] py-1 px-5 rounded-md mb-5 flex items-center gap-2"
            onClick={() => setIsCreateStage(!isCreateStage)}
          >
            <IoMdAdd /> Create Stage
          </button>
          <div className="grid grid-cols-4 gap-2">
            {isCreateStage && (
              <div className="flex flex-col border rounded-md space-y-3 p-5  h-[250px]">
                {/* Form Fields */}
                <div className="w-full">
                  <label className="block text-green-600 font-semibold mb-2">
                    Phase
                  </label>
                  <select
                    value={selectedPhase}
                    onChange={(e) => setSelectedPhase(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Phase</option>
                    {phasesData.map((phase, index) => (
                      <option
                        key={index}
                        value={`${phase.purpose}:${phase.phase}`}
                      >
                        {`${phase.purpose} - ${phase.phase}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-full">
                  <label className="block text-green-600 font-semibold mb-2">
                    Stage Name
                  </label>
                  <input
                    value={stageName}
                    onChange={(e) => setStageName(e.target.value)}
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter Stage Name"
                  />
                </div>
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <input
                      type="color"
                      value={color}
                      onChange={handleColorChange}
                      className="w-8 h-8"
                    />
                  </div>
                  <div className="w-1/3 flex items-end">
                    <button
                      className="bg-[#3CB0E1] text-white px-4 py-2 rounded hover:bg-[#3CB0E1] transition"
                      onClick={handleCreateStage}
                    >
                      Create
                    </button>
                  </div>
                </div>
              </div>
            )}
            {stagesData.map((stage, index) => (
              <div
                key={index}
                className="flex flex-col border p-2 rounded-md h-[220px] shadow-md"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="w-full">
                    <label className="block text-green-600 text-center font-semibold mb-2">
                      Purpose
                    </label>
                    <span className="border shadow-sm py-1 px-4 rounded-md w-full flex items-center justify-center">
                      {stage.purpose}
                    </span>
                  </div>
                  <div className="w-full">
                    <label className="block text-green-600 text-center font-semibold mb-2">
                      Phase
                    </label>
                    <span className="border shadow-sm py-1 px-4 rounded-md w-full flex items-center justify-center">
                      {stage.phase}
                    </span>
                  </div>
                </div>

                <div className="flex justify-center my-1">
                  <div className="w-fit min-w-[200px]">
                    <label className="block text-green-600 text-center font-semibold mb-1">
                      Stage
                    </label>
                    {editIndex === index ? (
                      <input
                        type="text"
                        value={editedStageName}
                        onChange={(e) => setEditedStageName(e.target.value)}
                        className="border shadow-sm py-1 px-4 rounded-md w-full text-center"
                      />
                    ) : (
                      <span className="border shadow-sm py-1 px-4 rounded-md w-full flex items-center justify-center">
                        {stage.stage}
                      </span>
                    )}
                  </div>
                </div>
                {editIndex === index ? (
                  <input
                    type="color"
                    value={editedColor}
                    onChange={(e) => setEditedColor(e.target.value)}
                    className="w-8 h-8"
                  />
                ) : (
                  <div
                    className="p-1 rounded-md my-2 w-[40%] mx-auto"
                    style={{ backgroundColor: stage.color }}
                  ></div>
                )}
                <div className="flex justify-center">
                  {editIndex === index ? (
                    <button
                      onClick={handleSaveClick}
                      className="bg-green-500 text-white text-sm py-1 px-5 rounded-md"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEditClick(index)}
                      className="bg-[#3CB0E1] text-sm py-1 px-5 rounded-md"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* <div className="flex justify-end">
        <button
          className="bg-[#3CB0E1] text-white px-4 py-2 rounded-md w-fit"
          nextStep={nextStep}
        >
          Next Step
        </button>
      </div> */}
    </div>
  );
}

export default Stages;
