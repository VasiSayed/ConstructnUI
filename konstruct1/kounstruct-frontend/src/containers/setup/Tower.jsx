import React, { useState, useEffect } from "react";
import projectImage from "../../Images/Project.png";
import { createTower, fetchTowersByProject, updateTower ,DeleteTowerByid} from "../../api";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { setTower, setSelectedTowerId } from "../../store/userSlice";

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function Tower({ nextStep, previousStep }) {
  const dispatch = useDispatch();
  const projectId = useSelector((state) => state.user.selectedProject.id);

  // Form state
  const [towerData, setTowerData] = useState({
    prefix: "Tower",
    numTowers: 1,
    namingConvention: "numeric",
  });

  // Preview towers before submission
  const [previewTowers, setPreviewTowers] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  // Tower list from backend
  const [towerDetails, setTowerDetails] = useState([]);
  const [fetchError, setFetchError] = useState("");
  const [editingIndex, setEditingIndex] = useState(-1); // for which tower is being edited
  const [tempName, setTempName] = useState("");



  const loadTowers = async () => {
    try {
      setFetchError("");
      const response = await fetchTowersByProject(projectId);
      setTowerDetails(response.data); 
      dispatch(
        setTower({ project_id: projectId, data: response.data })
      );
    } catch (err) {
      setFetchError("Failed to fetch tower details. Please try again.");
      setTowerDetails([]);
    }
  };

  useEffect(() => {
    loadTowers();
  }, [projectId]);


  const handleDeleteTower = async (towerId) => {
    if (!window.confirm("Delete this tower?")) return;
    try {
      await DeleteTowerByid(towerId);
      toast.success("Tower deleted!");
      loadTowers();
    } catch (err) {
      toast.error("Failed to delete tower");
    }
  };
  

  
const handleEditTower = async (towerId, name) => {
  try {
    // Assume updateTower uses PATCH or PUT
    const res = await updateTower(towerId, { name });
    toast.success("Tower name updated!");
    setEditingIndex(-1);
    setTempName("");
    loadTowers();
  } catch (err) {
    toast.error("Failed to update tower name");
  }
};

  // Preview towers logic
  const handlePreviewTowers = (e) => {
    e.preventDefault();
    let towers = [];
    let { prefix, numTowers, namingConvention } = towerData;
    numTowers = Number(numTowers);

    if (!prefix || !numTowers || numTowers < 1) {
      toast.error("Prefix and Number of Towers are required");
      return;
    }
    for (let i = 0; i < numTowers; i++) {
      let name =
        namingConvention === "numeric"
          ? `${prefix} ${i + 1}`
          : `${prefix} ${alphabet[i] || i + 1}`; // fallback if > 26
      towers.push({ name });
    }
    setPreviewTowers(towers);
    setShowPreview(true);
  };

  // Edit preview names
  const handlePreviewNameChange = (idx, newName) => {
    setPreviewTowers((prev) =>
      prev.map((tw, i) => (i === idx ? { ...tw, name: newName } : tw))
    );
  };

  // Add towers to backend
  const handleSubmit = async () => {
    try {
      for (const tw of previewTowers) {
        const formData = new FormData();
        formData.append("project", projectId);
        formData.append("name", tw.name);
        await createTower(formData);
      }
      toast.success("Towers added!");
      setShowPreview(false);
      setPreviewTowers([]);
      loadTowers(); 
    } catch (error) {
      toast.error("Failed to create towers.");
    }
  };

  return (
    <div className="max-w-7xl my-1 mx-auto bg-white rounded shadow-lg py-1">
      <h2 className="text-xl px-5 font-medium text-center mt-3">
        How many Towers would you like to add in your project?
      </h2>

      <form
        className="flex justify-center gap-5 space-y-4"
        onSubmit={handlePreviewTowers}
      >
        <div className="flex flex-col w-60 mt-4">
          <label className="font-medium mb-2">Prefix:</label>
          <input
            type="text"
            value={towerData.prefix}
            onChange={(e) =>
              setTowerData({ ...towerData, prefix: e.target.value })
            }
            className="border rounded p-2 w-full focus:outline-none focus:ring focus:border-green-300"
          />
        </div>
        <div className="flex flex-col w-60">
          <label className="font-medium mb-2">Naming Convention:</label>
          <select
            value={towerData.namingConvention}
            onChange={(e) =>
              setTowerData({ ...towerData, namingConvention: e.target.value })
            }
            className="border rounded p-2 w-full focus:outline-none focus:ring focus:border-green-300"
          >
            <option value="numeric">Numeric</option>
            <option value="alphabetic">Alphabetic</option>
          </select>
        </div>
        <div className="flex flex-col w-40">
          <label className="font-medium mb-2">No. of Towers:</label>
          <input
            type="number"
            value={towerData.numTowers}
            onChange={(e) =>
              setTowerData({ ...towerData, numTowers: e.target.value })
            }
            className="border rounded p-2 w-full focus:outline-none focus:ring focus:border-green-300"
            min="1"
          />
        </div>
        <div>
          <button
            type="submit"
            className="bg-[#3CB0E1] text-white font-bold py-2 px-4 rounded hover:bg-[#3CB0E1] transition-colors duration-200 mt-8"
          >
            Preview
          </button>
        </div>
      </form>

      {/* Preview section */}
      {showPreview && previewTowers.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-bold mb-2 text-center">
            Preview & Edit Tower Names
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {previewTowers.map((tw, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded shadow"
              >
                <input
                  type="text"
                  value={tw.name}
                  onChange={(e) => handlePreviewNameChange(idx, e.target.value)}
                  className="bg-white rounded px-2 py-1 border border-gray-300"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-3 mt-5">
            <button
              className="bg-green-600 text-white px-6 py-2 rounded"
              onClick={handleSubmit}
              type="button"
            >
              Add Towers
            </button>
            <button
              className="bg-gray-400 text-white px-6 py-2 rounded"
              onClick={() => setShowPreview(false)}
              type="button"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Error if any */}
      {fetchError && (
        <p className="text-red-600 text-center mt-6">{fetchError}</p>
      )}

      {/* Always show existing towers */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2 text-center">
          Existing Towers
        </h3>
        <div className="flex flex-wrap justify-center gap-6">
          {towerDetails.map((tower, index) => (
            <div
              key={tower.id}
              className="relative rounded-lg overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300 w-48 bg-white"
            >
              <img
                src={projectImage}
                alt="Tower img"
                className="w-full h-72 object-cover"
                style={{ opacity: 0.5, backgroundColor: "black" }}
                onClick={() => dispatch(setSelectedTowerId(tower.id))}
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center gap-2">
                {editingIndex === index ? (
                  <>
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="text-center bg-white text-black px-2 py-1 rounded"
                      autoFocus
                    />
                    <button
                      className="bg-green-600 text-white px-3 py-1 rounded mt-1"
                      onClick={() => handleEditTower(tower.id, tempName)}
                    >
                      Save
                    </button>
                    <button
                      className="bg-gray-400 text-white px-3 py-1 rounded mt-1"
                      onClick={() => setEditingIndex(-1)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <p
                      className="text-white text-lg font-bold cursor-pointer"
                      onClick={() => dispatch(setSelectedTowerId(tower.id))}
                    >
                      {tower.name}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <button
                        className="bg-blue-500 text-white px-3 py-1 rounded"
                        onClick={() => {
                          setEditingIndex(index);
                          setTempName(tower.name);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded"
                        onClick={() => handleDeleteTower(tower.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between mt-4 pb-5 px-5">
        <button
          className="bg-[#3CB0E1] text-white px-4 py-2 rounded-md"
          onClick={previousStep}
        >
          Previous
        </button>
        <button
          className="bg-[#3CB0E1] text-white px-4 py-2 rounded-md"
          onClick={nextStep}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Tower;
