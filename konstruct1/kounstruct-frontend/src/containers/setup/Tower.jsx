import React, { useState, useEffect } from "react";
import projectImage from "../../Images/Project.png";
import {
  createTower,
  getTowerDetailsByProjectId,
  updateTower,
} from "../../api";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { setTower, setSelectedTowerId } from "../../store/userSlice";
import { MdModeEdit, MdSave } from "react-icons/md";

function Tower({ nextStep, previousStep }) {
  const dispatch = useDispatch();
  const projectId = useSelector((state) => state.user.selectedProject.id);

  const [towerData, setTowerData] = useState({
    prefix: "Tower",
    numTowers: "1",
    namingConvention: "numeric",
  });

  const [towerDetails, setTowerDetails] = useState([]);
  const [showImages, setShowImages] = useState(false);

  const [editingIndex, setEditingIndex] = useState(-1);
  const [tempName, setTempName] = useState("");

  const handleInputChange = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setTempName(e.target.value);
  };

  const handleEditTower = async (e, towerId, projectId, noOfTower) => {
    e.stopPropagation();
    e.preventDefault();
    const response = await updateTower({
      tower_id: towerId,
      project_id: projectId,
      naming_convention: tempName,
      no_of_tower: noOfTower,
    });
    if (response.status === 200) {
      await getTowerDetails();
      toast.success(response.data.message);
      setEditingIndex(-1);
    } else {
      toast.error(response.data.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!towerData.prefix || !towerData.numTowers) {
      toast.error("Prefix and Number of Towers are required");
      return;
    }

    const formData = new FormData();
    formData.append("project_id", projectId);
    formData.append("prefix", towerData.prefix);
    formData.append("no_of_tower", towerData.numTowers);
    formData.append("naming_convention", towerData.namingConvention);

    try {
      const res = await createTower(formData);
      toast.success(res.data.message);
      await getTowerDetails();
    } catch (error) {
      console.error(
        "Error creating project:",
        error.response?.data || error.message
      );
    }
  };

  const getTowerDetails = async () => {
    try {
      const response = await getTowerDetailsByProjectId(projectId);
      console.log("Project Data:", response);
      setTowerDetails(response.data.data.tower);
      setShowImages(true);
      dispatch(
        setTower({ project_id: projectId, data: response.data.data.tower })
      );
    } catch (err) {
      console.error("Failed to fetch project details:", err);
    }
  };

  const handleTowerClick = (towerId) => {
    dispatch(setSelectedTowerId(towerId));
  };

  useEffect(() => {
    getTowerDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  return (
    <div className="max-w-7xl my-1 mx-auto bg-white rounded shadow-lg py-1">
      {/* <h2 className="text-xl px-5 font-bold">Add Towers</h2> */}
      <h2 className="text-xl px-5 font-medium text-center mt-3">
        How many Towers would you like to add in your project ?
      </h2>
      <div className="flex justify-center gap-5 space-y-4">
        <div className="flex flex-col w-60 mt-4">
          <label className="mr-2 font-medium mb-2">Prefix:</label>
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
          <label className="mr-2 font-medium mb-2">Naming Convention:</label>
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
          <label className="mr-2 font-medium mb-2">No. of Towers:</label>
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
            onClick={handleSubmit}
            className="bg-[#3CB0E1] text-white font-bold py-2 px-4 rounded hover:bg-[#3CB0E1] transition-colors duration-200 mt-8"
          >
            Add
          </button>
        </div>
      </div>

      {showImages && towerDetails.length > 0 && (
        <div className="flex flex-wrap justify-center gap-6 mt-6">
          {towerDetails.map((tower, index) => (
            <button
              key={index}
              className="relative rounded-lg overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300 w-48"
              onClick={() => handleTowerClick(tower.id)}
            >
              <img
                src={projectImage}
                alt="Tower img"
                className="w-full h-72 object-cover"
                style={{
                  opacity: 0.5,
                  backgroundColor: "black",
                }}
              />

              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                {editingIndex === index ? (
                  <div className="flex flex-col items-center justify-center px-4 w-full">
                    <input
                      type="text"
                      value={tempName}
                      onChange={handleInputChange}
                      className="text-center bg-black bg-opacity-50 text-white text-lg font-bold px-2 py-1"
                    />
                    <button
                      onClick={(e) => {
                        handleEditTower(
                          e,
                          tower.id,
                          projectId,
                          tower.no_of_tower
                        );
                      }}
                      className="text-white font-semibold ml-2 flex items-center gap-2"
                    >
                      Save <MdSave />
                    </button>
                  </div>
                ) : (
                  <p className="text-white text-lg font-bold">
                    {tower.naming_convention}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingIndex(index);
                      }}
                      className="text-white font-semibold ml-2"
                    >
                      <MdModeEdit />
                    </button>
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
      <div className="flex justify-between mt-4 pb-5 px-5">
        <button
          className="bg-[#3CB0E1] text-white px-4 py-2 rounded-md"
          onClick={() => previousStep()}
        >
          Previous
        </button>
        <button
          className="bg-[#3CB0E1] text-white px-4 py-2 rounded-md"
          onClick={() => nextStep()}
        >
          Next
        </button>
      </div>
    </div>
  );
}
export default Tower;
