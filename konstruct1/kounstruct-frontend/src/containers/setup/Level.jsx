import React, { useEffect, useState } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";
import { MdDelete, MdModeEdit } from "react-icons/md";
import { useSelector, useDispatch } from "react-redux";
import {
  getBuildingnlevel,
  createLevel,
  updateLevel,
  deleteLevel,
} from "../../api";
import { toast } from "react-hot-toast";
import { setLevels } from "../../store/userSlice";

function Level({ nextStep, previousStep }) {
  const dispatch = useDispatch();
  const projectId = useSelector((state) => state.user.selectedProject.id);

  const [towerDetails, setTowerDetails] = useState({});
  const [currentTower, setCurrentTower] = useState(null);
  const [floorInput, setFloorInput] = useState("");
  const [selectedCommonFloors, setSelectedCommonFloors] = useState([]);
  const [editing, setEditing] = useState({
    tower_id: null,
    level_name: "",
    index: -1,
    level_id: -1,
  });

  // Re-fetch flag to auto-refresh after add/edit/delete
  const [refreshFlag, setRefreshFlag] = useState(0);

  const additionalFloorTypes = [
    "Basement",
    "Parking",
    "Podium",
    "Terrace",
    "Ground",
  ];

  // Fetch all towers + their levels in one API call
  const loadTowersAndLevels = async () => {
    try {
      const response = await getBuildingnlevel(projectId);
      const towers = response.data;
      const obj = {};
      towers.forEach((tower) => {
        obj[tower.id] = {
          details: tower,
          floors: (tower.levels || []).sort((a, b) => {
            // Numeric floors first
            const matchA = a.name.match(/\d+/);
            const matchB = b.name.match(/\d+/);
            if (!matchA && !matchB) return a.name.localeCompare(b.name);
            if (!matchA) return 1;
            if (!matchB) return -1;
            return parseInt(matchA[0]) - parseInt(matchB[0]);
          }),
        };
      });
      setTowerDetails(obj);
      dispatch(setLevels({ project_id: projectId, data: obj }));
    } catch (err) {
      toast.error("Failed to load towers and floors");
    }
  };

  // Re-fetch when project changes OR refreshFlag updates
  useEffect(() => {
    if (projectId) loadTowersAndLevels();
    // eslint-disable-next-line
  }, [projectId, refreshFlag]);

  // Add floors (numeric and/or static types)
  const handleAddFloors = async () => {
    const numFloors = Number(floorInput);
    if ((!numFloors || numFloors < 1) && selectedCommonFloors.length === 0) {
      toast.error("Please enter a number or select floor types");
      return;
    }
    let requests = [];
    // Numeric
    for (let i = 1; i <= numFloors; i++) {
      requests.push(
        createLevel({
          building: currentTower,
          name: `Floor ${i}`,
        })
      );
    }
    // Static types
    selectedCommonFloors.forEach((type) => {
      requests.push(
        createLevel({
          building: currentTower,
          name: type,
        })
      );
    });

    try {
      await Promise.all(requests);
      toast.success("Floors added successfully");
      setCurrentTower(null);
      setFloorInput("");
      setSelectedCommonFloors([]);
      setRefreshFlag((f) => f + 1); // Trigger re-fetch
    } catch {
      toast.error("Failed to add one or more floors");
    }
  };

  // Edit/Update Floor Name
  const handleEditFloor = async () => {
    const { tower_id, level_name, level_id } = editing;
    if (!level_name.trim()) {
      toast.error("Floor name cannot be empty");
      return;
    }
    try {
      const response = await updateLevel({
        id: level_id,
        name: level_name,
        building: Number(tower_id),
      });
      if (response.status === 200) {
        toast.success(response.data.message || "Floor updated!");
        setEditing({
          tower_id: null,
          level_name: "",
          index: -1,
          level_id: -1,
        });
        setRefreshFlag((f) => f + 1); // Trigger re-fetch
      } else {
        toast.error("Failed to update floor");
      }
    } catch (error) {
      toast.error("Update failed");
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditing({
      tower_id: null,
      level_name: "",
      index: -1,
      level_id: -1,
    });
  };

  // Delete Floor
  const handleDeleteFloor = async (id) => {
    try {
      const response = await deleteLevel(id);
      if (response.status === 200) {
        toast.success(response.data.message || "Floor deleted!");
        setRefreshFlag((f) => f + 1); // Trigger re-fetch
      } else {
        toast.error("Failed to delete floor");
      }
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  // Toggle static types
  const handleToggleFloorType = (type) => {
    setSelectedCommonFloors((prev) =>
      prev.includes(type)
        ? prev.filter((item) => item !== type)
        : [...prev, type]
    );
  };

  return (
    <div className="max-w-7xl my-1 mx-auto p-4 bg-white rounded shadow-lg">
      <h2 className="text-xl px-5 font-medium text-center mb-3">
        Add Floors to Towers
      </h2>
      <div className="w-full overflow-x-auto pb-5">
        <div className="flex gap-6 w-max">
          {Object.keys(towerDetails).map((towerId) => (
            <div
              key={towerId}
              className="border bg-gray-200 py-2 px-2 rounded-md shadow hover:shadow-lg transition-shadow duration-300 min-w-[225px]"
            >
              <h3 className="text-base font-semibold text-blue-600 text-center mb-1">
                {towerDetails[towerId].details.name}
              </h3>
              <span className="font-bold text-black text-sm">Floors:</span>
              <div>
                <ul className="mt-2 space-y-2 max-h-[350px] overflow-y-auto pr-2 py-2 px-2">
                  {(towerDetails[towerId]?.floors || []).map((floor, i) => (
                    <li
                      key={floor.id}
                      className="flex justify-between items-center bg-white p-1 rounded"
                    >
                      {editing.level_id === floor.id ? (
                        <div className="flex w-full items-center gap-2">
                          <input
                            type="text"
                            value={editing.level_name}
                            onChange={(e) =>
                              setEditing((prev) => ({
                                ...prev,
                                level_name: e.target.value,
                              }))
                            }
                            className="flex-1 border rounded px-2 py-1"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleEditFloor();
                              if (e.key === "Escape") handleCancelEdit();
                            }}
                          />
                          <button
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                            onClick={handleEditFloor}
                          >
                            Save
                          </button>
                          <button
                            className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <span className="px-1 text-sm text-gray-500">
                          {floor.name}
                        </span>
                      )}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDeleteFloor(floor.id)}
                          className="text-red-600 hover:text-red-800 font-semibold"
                        >
                          <MdDelete />
                        </button>
                        <button
                          onClick={() =>
                            setEditing({
                              tower_id: towerId,
                              level_name: floor.name,
                              level_id: floor.id,
                              index: i,
                            })
                          }
                          className="text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          <MdModeEdit />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-center items-end mt-1">
                <button
                  className="flex items-center text-green-700 hover:text-green-900 font-semibold"
                  onClick={() => setCurrentTower(towerId)}
                >
                  <FaPlus className="mr-2" />
                  Add Floor
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for adding floors */}
      {currentTower && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full relative">
            <h2 className="text-lg font-bold mb-4">
              Add Floors to {towerDetails[currentTower]?.details?.name || ""}
            </h2>
            <input
              type="number"
              value={floorInput}
              onChange={(e) => setFloorInput(e.target.value)}
              className="border rounded p-2 mb-4 w-full focus:outline-none focus:ring focus:border-green-300"
              placeholder="Number of Floors"
              min="1"
            />

            <h2 className="text-md font-bold mb-2">
              Select Common Floor Types
            </h2>

            <div className="flex flex-wrap gap-2 mb-4">
              {additionalFloorTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => handleToggleFloorType(type)}
                  className={`px-3 py-2 rounded font-semibold ${
                    selectedCommonFloors.includes(type)
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            <button
              className="bg-[#3CB0E1] text-white font-bold py-2 px-4 rounded hover:bg-[#3CB0E1] transition-colors duration-200 w-full"
              onClick={handleAddFloors}
            >
              Add Floors
            </button>

            <button
              onClick={() => setCurrentTower(null)}
              className="absolute top-2 right-2 text-gray-600 hover:text-red-600"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between mt-6">
        <button
          className="bg-[#3CB0E1] text-white px-4 py-2 rounded-md hover:bg-gray-500"
          onClick={previousStep}
        >
          Previous
        </button>
        <button
          className="bg-[#3CB0E1] text-white px-4 py-2 rounded-md hover:bg-[#3CB0E1]"
          onClick={nextStep}
        >
          Save & Proceed to Next Step
        </button>
      </div>
    </div>
  );
}

export default Level;
