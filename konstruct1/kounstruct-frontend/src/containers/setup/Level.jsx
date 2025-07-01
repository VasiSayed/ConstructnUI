import React, { useEffect, useState } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";
import { MdDelete, MdModeEdit } from "react-icons/md";
import { useSelector, useDispatch } from "react-redux";
import {
  getTowerDetailsByProjectId,
  createLevel,
  getLevelsByTowerId,
  updateLevel,
  deleteLevel,
} from "../../api";
import { toast } from "react-hot-toast";
import { setLevels } from "../../store/userSlice";

function Level({ nextStep, previousStep }) {
  const dispatch = useDispatch();
  const projectId = useSelector((state) => state.user.selectedProject.id);

  const [towerDetails, setTowerDetails] = useState({});

  const getSortedLevels = (levels) => {
    return levels?.sort((a, b) => {
      // Extract numeric part of the floor names safely
      const matchA = a.level_name.match(/\d+/);
      const matchB = b.level_name.match(/\d+/);

      // Handle cases where there might not be numbers
      if (!matchA && !matchB) return a.level_name.localeCompare(b.level_name);
      if (!matchA) return 1; // Push non-numeric names to the end
      if (!matchB) return -1; // Push non-numeric names to the end

      const numA = parseInt(matchA[0]);
      const numB = parseInt(matchB[0]);

      return numA - numB;
    });
  };

  const getLevelsById = async (id) => {
    const response = await getLevelsByTowerId(id);
    console.log(response.data.data, "response get levels by id");
    const sortedLevels = getSortedLevels(response.data.data);
    console.log(sortedLevels, "sorted levels");
    return sortedLevels;
  };

  const getTowerDetails = async () => {
    const response = await getTowerDetailsByProjectId(projectId);
    const towers = response.data.data.tower;

    const obj = {};

    // Fetch floors in parallel using Promise.all
    await Promise.all(
      towers.map(async (tower) => {
        obj[tower.id] = {
          details: tower,
          floors: await getLevelsById(tower.id), // Await here to ensure floors are set
        };
      })
    );

    console.log(obj, "obj GET");
    setTowerDetails({ ...obj }); // Ensure state updates after all async calls
    dispatch(setLevels({ project_id: projectId, data: obj }));
  };

  useEffect(() => {
    if (projectId) getTowerDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const [currentTower, setCurrentTower] = useState(null);
  const [floorInput, setFloorInput] = useState("");
  const [selectedCommonFloors, setSelectedCommonFloors] = useState([]);
  const [editing, setEditing] = useState({
    tower_id: null,
    project_id: null,
    level_name: "",
    index: -1,
  });

  const additionalFloorTypes = [
    "Basement",
    "Parking",
    "Podium",
    "Terrace",
    "Ground",
  ];

  const handleAddFloors = async (id) => {
    if (floorInput <= 0) {
      toast.error("Number of floors must be greater than 0");
      return;
    }

    const response = await createLevel({
      no_of_levels: floorInput,
      project_id: projectId,
      tower_id: currentTower,
      level_name: "Floor",
    });
    console.log(response);
    if (response.status === 200) {
      const newFloors = response.data.data.map((floor) => ({
        id: floor.id,
        level_name: floor.name,
      }));

      // Create new object with updated floors
      const updatedTowerDetails = {
        ...towerDetails,
        [currentTower]: {
          ...towerDetails[currentTower],
          floors: [...(towerDetails[currentTower].floors || []), ...newFloors],
        },
      };

      setTowerDetails(updatedTowerDetails);
      dispatch(setLevels({ project_id: projectId, data: updatedTowerDetails }));
      setCurrentTower(null);
      setFloorInput("");
      setSelectedCommonFloors([]);
      toast.success("Floors added successfully");
    } else {
      toast.error("Failed to add floors");
    }
  };

  const handleToggleFloorType = (type) => {
    setSelectedCommonFloors((prevSelected) =>
      prevSelected.includes(type)
        ? prevSelected.filter((item) => item !== type)
        : [...prevSelected, type]
    );
  };

  const handleDeleteFloor = async (id) => {
    const response = await deleteLevel(id);
    console.log(response, "response delete floor");
    if (response.status === 200) {
      toast.success(response.data.message);
      await getTowerDetails();
    } else {
      toast.error(response.data.message);
    }
  };

  const handleEditFloor = async () => {
    const { tower_id, level_name, project_id, level_id } = editing;
    const response = await updateLevel({
      tower_id,
      level_name,
      project_id,
      level_id,
    });
    console.log(response, "response edit floor");
    if (response.status === 200) {
      toast.success(response.data.message);
      await getTowerDetails();
    } else {
      toast.error(response.data.message);
    }
    setEditing({
      tower_id: null,
      project_id: null,
      level_name: level_name,
      index: -1,
      level_id: -1,
    });
  };

  return (
    <div className="max-w-7xl my-1 mx-auto p-4 bg-white rounded shadow-lg">
      <h2 className="text-xl px-5 font-medium text-center mb-3">
        Enter Floors Required Per Tower
      </h2>
      <div className="w-full overflow-x-auto pb-5">
        <div className="flex gap-6 w-max">
          {/* <pre>{JSON.stringify(towerDetails, null, 2)}</pre> */}
          {Object.keys(towerDetails).map((tower, index) => (
            <div
              key={index}
              className="border bg-gray-200 py-2 px-2 rounded-md shadow hover:shadow-lg transition-shadow duration-300 min-w-[225px]"
            >
              <h3 className="text-sm font-semibold text-blue-600 text-center">
                {towerDetails[tower].details.naming_convention}
              </h3>
              <div className="">
                <ul className="mt-2 space-y-2 max-h-[350px] overflow-y-auto pr-2 py-2 px-2">
                  {(towerDetails[tower]?.floors || []).map((floor, i) => (
                    <li
                      key={i}
                      className="flex justify-between items-center bg-white p-1 rounded"
                    >
                      {editing.tower_id === floor.tower_id &&
                      editing.index === i ? (
                        <input
                          type="text"
                          value={editing.level_name}
                          onChange={(e) =>
                            setEditing((prev) => ({
                              ...prev,
                              level_name: e.target.value,
                            }))
                          }
                          onBlur={() => {
                            handleEditFloor();
                          }}
                          className="flex-1 border rounded px-2 py-1"
                          autoFocus
                        />
                      ) : (
                        <span className="px-1 text-sm text-gray-500">
                          {floor.level_name}
                        </span>
                      )}
                      <div className="flex space-x-2 ">
                        <button
                          onClick={() => handleDeleteFloor(floor.id)}
                          className="text-red-600 hover:text-red-800 font-semibold"
                        >
                          <MdDelete />
                        </button>
                        <button
                          onClick={() =>
                            setEditing({
                              project_id: floor.project_id,
                              tower_id: floor.tower_id,
                              level_name: floor.level_name,
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
                  onClick={() => setCurrentTower(tower)}
                >
                  <FaPlus className="mr-2" />
                  Add Floor
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {currentTower && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full relative">
            <h2 className="text-lg font-bold mb-4">
              Add Floors to {currentTower}
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
