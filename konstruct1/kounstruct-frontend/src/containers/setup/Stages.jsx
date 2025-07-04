import React, { useEffect, useState } from "react";
import {
  createPhase,
  createPurpose,
  getPurposeByProjectId,
  createStage,
  getPhaseDetailsByProjectId,
  getStageDetailsByProjectId,
  editStage,
  deleteStage,
} from "../../api";
import { useSelector, useDispatch } from "react-redux";
import { setPurposes, setPhases, setStages } from "../../store/userSlice";
import { toast } from "react-toastify";
import { IoMdAdd, IoMdTrash } from "react-icons/io";

function Stages({ nextStep }) {
  const dispatch = useDispatch();
  const projectId = useSelector((state) => state.user.selectedProject.id);
  const purposesDetails = useSelector((state) => state.user.purposes);
  const phasesDetails = useSelector((state) => state.user.phases);
  const stagesDetails = useSelector((state) => state.user.stages);

  // Main state
  const [isCreateStage, setIsCreateStage] = useState(false);
  const [purposeData, setPurposeData] = useState([]);
  const [phasesData, setPhasesData] = useState([]);
  const [stagesData, setStagesData] = useState([]);

  // Creation form state
  const [selectedPurpose, setSelectedPurpose] = useState("");
  const [phaseName, setPhaseName] = useState("");
  const [newPurpose, setNewPurpose] = useState("");
  const [selectedPhase, setSelectedPhase] = useState("");
  const [stageName, setStageName] = useState("");
  const [activeSection, setActiveSection] = useState("Purpose");

  // Edit state
  const [editIndex, setEditIndex] = useState(null);
  const [editedStageName, setEditedStageName] = useState("");
  const [editedSequence, setEditedSequence] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch and set data helpers
  const getPurposes = async () => {
    if (projectId) {
      try {
        const response = await getPurposeByProjectId(projectId);
        if (response.status === 200) {
          setPurposeData(response.data);
          dispatch(setPurposes({ project_id: projectId, data: response.data }));
          return response.data; // Return the data for immediate use
        }
      } catch (error) {
        console.error("Error fetching purposes:", error);
        toast.error("Failed to fetch purposes");
      }
    }
    return [];
  };

  const getPhases = async (purposesData = null) => {
    if (!projectId) return;
    try {
      const response = await getPhaseDetailsByProjectId(projectId);
      if (response.status === 200) {
        const phases = response.data;

        // Use passed purposesData or current state
        const currentPurposes = purposesData || purposeData;

        const formattedPhases = phases.map((phase) => ({
          purpose:
            currentPurposes.find((p) => p.id === phase.purpose)?.name ||
            "Unknown",
          phase: phase.name,
          id: phase.id,
          purpose_id: phase.purpose, // Keep the purpose ID for reference
        }));

        setPhasesData(formattedPhases);
        dispatch(setPhases({ project_id: projectId, data: formattedPhases }));
        return formattedPhases; // Return for immediate use
      }
    } catch (error) {
      console.error("Error fetching phases:", error);
      toast.error("Failed to fetch phases");
    }
    return [];
  };

  const getStages = async (phasesData = null, purposesData = null) => {
    if (!projectId) return;
    try {
      const response = await getStageDetailsByProjectId(projectId);
      if (response.status === 200) {
        const stages = response.data;

        // Use passed data or current state
        const currentPhases = phasesData || phasesData;
        const currentPurposes = purposesData || purposeData;

        const formattedStages = stages.map((stage) => ({
          purpose:
            currentPurposes.find((p) => p.id === stage.purpose)?.name ||
            "Unknown",
          phase:
            currentPhases.find((ph) => ph.id === stage.phase)?.phase ||
            "Unknown",
          stage: stage.name,
          id: stage.id,
          sequence: stage.sequence || 1,
        }));

        setStagesData(formattedStages);
        dispatch(setStages({ project_id: projectId, data: formattedStages }));
      }
    } catch (error) {
      console.error("Error fetching stages:", error);
      toast.error("Failed to fetch stages");
    }
  };

  // Initial data fetch with proper chaining
  const fetchAllData = async () => {
    if (projectId) {
      const purposes = await getPurposes();
      const phases = await getPhases(purposes);
      await getStages(phases, purposes);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [projectId]);

  // Helpers
  const getPurposeId = (name) => purposeData.find((p) => p.name === name)?.id;

  const getPhaseId = (name) => phasesData.find((ph) => ph.phase === name)?.id;

  // CREATE Purpose
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
        setNewPurpose("");
        await fetchAllData(); // Refresh all data
      }
    } catch (error) {
      toast.error("Failed to create purpose.");
    }
  };

  // CREATE Phase
  const handleCreatePhase = async () => {
    if (!selectedPurpose || !phaseName.trim()) {
      toast.error("Please select purpose and enter phase name");
      return;
    }

    try {
      const purposeId = getPurposeId(selectedPurpose);
      const response = await createPhase({
        project: projectId,
        purpose: purposeId,
        name: phaseName.trim(),
      });

      if (response.status === 200 || response.status === 201) {
        toast.success("Phase created successfully!");
        setSelectedPurpose("");
        setPhaseName("");
        await fetchAllData(); // Refresh all data
      }
    } catch (error) {
      console.error("Error creating phase:", error);
      toast.error("Failed to create phase.");
    }
  };

  // CREATE Stage
  const handleCreateStage = async () => {
    if (!selectedPhase || !stageName.trim()) {
      toast.error("Please select phase and enter stage name");
      return;
    }

    try {
      const [purposeName, phaseName] = selectedPhase.split(":");
      const purposeId = getPurposeId(purposeName);
      const phaseId = getPhaseId(phaseName);

      if (!purposeId || !phaseId) {
        toast.error("Invalid purpose or phase selection");
        return;
      }

      const sequence =
        Math.max(...stagesData.map((s) => s.sequence || 0), 0) + 1;

      const payload = {
        project: projectId,
        purpose: purposeId,
        phase: phaseId,
        name: stageName.trim(),
        sequence: sequence,
      };

      const response = await createStage(payload);
      if (response.status === 200 || response.status === 201) {
        toast.success("Stage created successfully!");
        setSelectedPhase("");
        setStageName("");
        setIsCreateStage(false);
        await fetchAllData(); // Refresh all data
      }
    } catch (error) {
      console.error("Error creating stage:", error);
      toast.error("Failed to create stage.");
    }
  };

  // EDIT Stage
  const handleEditClick = (index) => {
    setEditIndex(index);
    setEditedStageName(stagesData[index].stage);
    setEditedSequence(stagesData[index].sequence || 1);
  };

  const handleSaveClick = async () => {
    if (editIndex === null) return;

    setIsSaving(true);
    try {
      const stageToUpdate = stagesData[editIndex];
      const payload = {
        stage_id: stageToUpdate.id,
        name: editedStageName.trim(),
        sequence: editedSequence,
      };

      const response = await editStage(payload);
      if (response.status === 200) {
        toast.success("Stage updated successfully!");
        setEditIndex(null);
        setEditedStageName("");
        setEditedSequence(1);
        await fetchAllData(); // Refresh all data
      }
    } catch (error) {
      console.error("Error updating stage:", error);
      toast.error("Failed to update stage.");
    } finally {
      setIsSaving(false);
    }
  };

  // DELETE Stage
  const handleDeleteStage = async (id) => {
    if (window.confirm("Are you sure you want to delete this stage?")) {
      try {
        const response = await deleteStage(id);
        if (response.status === 204 || response.status === 200) {
          toast.success("Stage deleted successfully!");
          await fetchAllData(); // Refresh all data
        }
      } catch (error) {
        console.error("Error deleting stage:", error);
        toast.error("Failed to delete stage.");
      }
    }
  };

  // NAV Tabs
  const handleTab = (tab) => {
    setActiveSection(tab);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 bg-white rounded-lg shadow-lg">
      {/* Navigation */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex bg-gray-100 rounded-lg p-1">
          {["Purpose", "Phases", "Stages"].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTab(tab)}
              className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
                activeSection === tab
                  ? "bg-white text-blue-600 shadow-md"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Purpose Section */}
      {activeSection === "Purpose" && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Purpose Management
          </h3>
          <div className="flex gap-2 mb-4">
            <input
              value={newPurpose}
              onChange={(e) => setNewPurpose(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleCreatePurpose()}
              type="text"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter new purpose"
            />
            <button
              onClick={handleCreatePurpose}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Purpose
            </button>
          </div>

          {purposeData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {purposeData.map((purpose, index) => (
                <div
                  key={purpose.id}
                  className="bg-white p-4 rounded-lg border border-gray-200 capitalize"
                >
                  {purpose.name}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No purposes created yet
            </p>
          )}
        </div>
      )}

      {/* Phases Section */}
      {activeSection === "Phases" && (
        <div>
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Create Phase
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Purpose
                </label>
                <select
                  value={selectedPurpose}
                  onChange={(e) => setSelectedPurpose(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Purpose</option>
                  {purposeData.map((purpose) => (
                    <option
                      key={purpose.id}
                      value={purpose.name}
                      className="capitalize"
                    >
                      {purpose.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Phase Name
                </label>
                <input
                  value={phaseName}
                  onChange={(e) => setPhaseName(e.target.value)}
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter phase name"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleCreatePhase}
                  className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Phase
                </button>
              </div>
            </div>
          </div>

          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Existing Phases
          </h3>
          {phasesData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {phasesData.map((phase, index) => (
                <div
                  key={phase.id}
                  className="bg-white p-4 rounded-lg border border-gray-200 capitalize"
                >
                  <span className="font-medium text-gray-600">Purpose:</span>{" "}
                  {phase.purpose}
                  <br />
                  <span className="font-medium text-gray-600">Phase:</span>{" "}
                  {phase.phase}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No phases created yet
            </p>
          )}
        </div>
      )}

      {/* Stages Section */}
      {activeSection === "Stages" && (
        <div>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg mb-6 flex items-center gap-2 hover:bg-blue-700 transition-colors"
            onClick={() => setIsCreateStage(!isCreateStage)}
          >
            <IoMdAdd size={20} /> Create Stage
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Create Stage Card */}
            {isCreateStage && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-5">
                <h4 className="font-bold text-gray-800 mb-4">New Stage</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Phase
                    </label>
                    <select
                      value={selectedPhase}
                      onChange={(e) => setSelectedPhase(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="">Select Phase</option>
                      {phasesData.map((phase) => (
                        <option
                          key={phase.id}
                          value={`${phase.purpose}:${phase.phase}`}
                        >
                          {phase.purpose} - {phase.phase}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Stage Name
                    </label>
                    <input
                      value={stageName}
                      onChange={(e) => setStageName(e.target.value)}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Enter stage name"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateStage}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => {
                        setIsCreateStage(false);
                        setSelectedPhase("");
                        setStageName("");
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Existing Stages */}
            {stagesData.map((stage, index) => (
              <div
                key={stage.id}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Purpose
                    </label>
                    <div className="bg-gray-50 px-3 py-2 rounded text-sm capitalize">
                      {stage.purpose}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Phase
                    </label>
                    <div className="bg-gray-50 px-3 py-2 rounded text-sm capitalize">
                      {stage.phase}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Stage Name
                    </label>
                    {editIndex === index ? (
                      <input
                        type="text"
                        value={editedStageName}
                        onChange={(e) => setEditedStageName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <div className="bg-gray-50 px-3 py-2 rounded text-sm capitalize">
                        {stage.stage}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Sequence
                    </label>
                    {editIndex === index ? (
                      <input
                        type="number"
                        min={1}
                        value={editedSequence}
                        onChange={(e) =>
                          setEditedSequence(Number(e.target.value))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <div className="bg-gray-50 px-3 py-2 rounded text-sm text-center">
                        {stage.sequence}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    {editIndex === index ? (
                      <>
                        <button
                          onClick={handleSaveClick}
                          disabled={isSaving}
                          className="flex-1 bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700 transition-colors disabled:bg-gray-400"
                        >
                          {isSaving ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={() => setEditIndex(null)}
                          className="flex-1 border border-gray-300 px-3 py-1.5 rounded text-sm hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditClick(index)}
                          className="flex-1 bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteStage(stage.id)}
                          className="bg-red-500 text-white px-3 py-1.5 rounded text-sm hover:bg-red-600 transition-colors"
                        >
                          <IoMdTrash size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {stagesData.length === 0 && !isCreateStage && (
            <p className="text-gray-500 text-center py-8">
              No stages created yet
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default Stages;
