import React, { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { createUnit, getUnits, updateUnit } from "../../api";

function Unit({ nextStep, previousStep }) {
  const selectedProjectId = useSelector(
    (state) => state.user.selectedProject.id
  );
  const towerDetails = useSelector(
    (state) => state.user.tower?.[selectedProjectId]
  );
  const flatTypes = useSelector(
    (state) => state.user.flatTypes[selectedProjectId]
  );
  const levels = useSelector((state) => state.user.levels[selectedProjectId]);

  const [tower, setTower] = useState(towerDetails[0].id);
  const [unitsPerFloor, setUnitsPerFloor] = useState({});
  const [selectedFlatType, setSelectedFlatType] = useState(flatTypes[0]);
  const [unitCount, setUnitCount] = useState(""); // Store number of units to add

  const [towerData, setTowerData] = useState(levels?.[tower]?.floors || []);
  const [editMode, setEditMode] = useState({});

  const getUnitsDetails = async () => {
    const response = await getUnits(selectedProjectId);
    console.log(response.data, "RESPONSE", tower);
    const units = response.data.data.find(
      (unit) => unit.towerId.toString() === tower.toString()
    );
    console.log(units, "UNITS 0");
    if (units) {
      console.log(units?.levels, "UNITS");
      const unitObj = {};
      units?.levels.forEach((level) => {
        unitObj[getLevelNameByLevelId(level.level_id)] = { units: level.units };
      });
      console.log(unitObj, "UNIT OBJ");
      const obj = {};
      obj[tower] = unitObj;
      console.log(obj, "OBJ");
      setUnitsPerFloor(obj);
      setEditMode({ ...obj, [tower]: true });
    }
  };

  const getLevelNameByLevelId = (levelId) => {
    const level = towerData.find((level) => level.id === levelId);
    return level?.level_name;
  };

  useEffect(() => {
    getUnitsDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjectId, tower]);

  const handleTowerChange = (selectedTower) => {
    setTower(selectedTower);
    setTowerData(levels?.[selectedTower]?.floors || []);
  };

  const handleAddUnitsToAllFloors = () => {
    if (!unitCount || unitCount <= 0) {
      toast.error("Please enter a valid number of units.");
      return;
    }

    setUnitsPerFloor((prev) => {
      const updatedUnits = { ...prev };
      updatedUnits[tower] = { ...prev[tower] };

      towerData.forEach((floor) => {
        const newUnits = Array.from({ length: unitCount }, (_, i) => ({
          unit_name: `${
            floor.level_name.split(" ")?.[1] || floor.level_name[0]
          }0${i + 1}`,
          color: null,
          flat_type_id: null,
        }));

        updatedUnits[tower][floor.level_name] = {
          units: newUnits,
        };
      });

      console.log(updatedUnits, "UPDATED UNITS");
      return updatedUnits;
    });

    setUnitCount("");
  };

  const handleSingleUnits = (floor) => {
    console.log(floor, "FLOOR");
    setUnitsPerFloor((prev) => ({
      ...prev,
      [tower]: {
        ...prev[tower],
        [floor.level_name]: {
          units: [
            ...(prev[tower]?.[floor.level_name]?.units || []),
            {
              unit_name: `${
                floor.level_name.split(" ")?.[1] || floor.level_name[0]
              }0${prev[tower]?.[floor.level_name]?.units?.length + 1 || 1}`,
              color: null,
              flat_type_id: null,
            },
          ],
        },
      },
    }));
  };

  const date = new Date();
  const formattedDate = date.toISOString().split("T")[0];

  const getLevelId = (levelName) => {
    const level = towerData.find((level) => level.level_name === levelName);
    return level?.id;
  };

  const handleSave = async () => {
    // Check if there are any units for the selected tower
    if (!unitsPerFloor[tower]) {
      toast.error("No units found for the selected tower");
      return;
    }

    console.log(unitsPerFloor, "UNITS PER FLOOR");

    // Check all units in the selected tower for null colors
    const hasUnmappedUnits = Object.values(unitsPerFloor?.[tower])?.some(
      (floor) => floor.units.some((unit) => unit.color === null)
    );

    if (hasUnmappedUnits) {
      toast.error(
        "Some units are not mapped with flat type. Please map all units before saving."
      );
      return;
    }

    console.log(unitsPerFloor, "UNITS PER FLOOR");

    const levels = Object.keys(unitsPerFloor[tower]).map((level) => {
      console.log(level, "LEVEL");
      return {
        level_id: getLevelId(level),
        units: unitsPerFloor[tower][level].units,
      };
    });

    const apiData = {
      project_id: selectedProjectId,
      tower_id: tower,
      levels,
    };

    console.log(apiData, "API DATA");

    const response = await createUnit(apiData);
    console.log(response, "RESPONSE");
    if (response.status === 200) {
      await getUnitsDetails();
      toast.success(response.data.message);
    } else {
      toast.error(response.data.message);
    }
  };

  const handleEdit = async () => {
    console.log(unitsPerFloor, "UNITS PER FLOOR");

    const levels = Object.keys(unitsPerFloor[tower]).map((level) => {
      console.log(level, "LEVEL");
      return {
        level_id: getLevelId(level),
        units: unitsPerFloor[tower][level].units,
      };
    });

    const apiData = {
      project_id: selectedProjectId,
      tower_id: tower,
      levels,
    };

    console.log(apiData, "API DATA");

    const response = await updateUnit(apiData);
    console.log(response, "RESPONSE");
    if (response.status === 200) {
      toast.success(response.data.message);
      await getUnitsDetails();
    } else {
      toast.error(response.data.message);
    }
  };

  return (
    <div className="max-w-7xl my-1 mx-auto px-6 pt-3 pb-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Configure Units</h2>
      <div className="flex gap-2 justify-center my-5">
        <div>
          <select
            value={tower}
            onChange={(e) => handleTowerChange(e.target.value)}
            className="border p-2 rounded w-60 border-gray-700"
          >
            <option value="">Select Tower</option>
            {towerDetails.map((tower) => (
              <option key={tower.naming_convention} value={tower.id}>
                {tower.naming_convention}
              </option>
            ))}
          </select>
        </div>

        <div>
          <input
            type="number"
            className="border p-2 rounded w-fit border-gray-700"
            placeholder="Number of Units"
            value={unitCount}
            onChange={(e) => setUnitCount(e.target.value)}
          />
        </div>

        <div>
          <button
            onClick={handleAddUnitsToAllFloors}
            className="bg-[#3CB0E1] text-white px-4 py-2 rounded w-fit hover:bg-[#3CB0E1]"
          >
            Add Units for All Floors
          </button>
        </div>
      </div>
      {tower && (
        <div>
          <div className="flex gap-2">
            <h2 className="text-gray-700 font-medium text-lg">
              Select Flat Type
            </h2>
            <div className="flex gap-2 mb-4">
              {flatTypes.map((flat, index) => (
                <button
                  key={index}
                  className={`px-3 py-1 rounded text-black ${
                    selectedFlatType === flat ? "border-2 border-black" : ""
                  }`}
                  style={{ backgroundColor: flat.color || "#E0E0E0" }}
                  onClick={() => setSelectedFlatType(flat)}
                >
                  {flat.flat_type}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto relative">
            <div className="max-h-[600px] overflow-auto">
              <table className="min-w-full table-auto border-collapse border border-gray-300 relative">
                <thead className="sticky top-0 bg-white z-10">
                  <tr>
                    <th className="border px-4 py-2 w-24 left-0 sticky bg-white z-20">
                      Floor
                    </th>
                    <th className="border px-4 py-2">Units</th>
                  </tr>
                </thead>
                <tbody>
                  {towerData.map((floor, rowIndex) => (
                    <tr key={floor.id} className="border">
                      <td className="border px-5 py-2 font-semibold whitespace-nowrap w-24 left-0 sticky bg-white z-10">
                        {floor.level_name}
                      </td>
                      <td className="border px-5 py-2">
                        <div className="flex items-center space-x-4 min-w-[600px]">
                          {unitsPerFloor[tower]?.[floor.level_name]?.units?.map(
                            (unit, colIndex) => (
                              <div
                                key={formattedDate + colIndex}
                                id={colIndex + formattedDate}
                                className="flex items-center space-x-2 border p-1"
                                onMouseEnter={() => {
                                  setUnitsPerFloor((prev) => ({
                                    ...prev,
                                    [tower]: {
                                      ...prev[tower],
                                      [floor.level_name]: {
                                        ...prev[tower]?.[floor.level_name],
                                        units: prev[tower]?.[
                                          floor.level_name
                                        ]?.units?.map((unit, index) =>
                                          index === colIndex
                                            ? {
                                                ...unit,
                                                color:
                                                  selectedFlatType?.color ||
                                                  "transparent",
                                                flat_type_id:
                                                  selectedFlatType?.flat_type_id ||
                                                  null,
                                              }
                                            : unit
                                        ),
                                      },
                                    },
                                  }));
                                }}
                                style={{
                                  backgroundColor:
                                    unitsPerFloor[tower]?.[floor.level_name]
                                      ?.units[colIndex]?.color || "transparent",
                                  transition: "background-color 0.3s ease",
                                  borderRadius: "16px",
                                }}
                              >
                                {/* Unit Name Input */}
                                <input
                                  id={colIndex + formattedDate}
                                  type="text"
                                  className="p-1 appearance-none border-none outline-none bg-transparent rounded-xl"
                                  style={{
                                    fontSize: "14px",
                                    width: "80px",
                                    borderRadius: "24px",
                                  }}
                                  value={unit.unit_name}
                                  onChange={(e) =>
                                    setUnitsPerFloor((prev) => {
                                      const updatedUnits = [
                                        ...prev[tower][floor.level_name].units,
                                      ];
                                      updatedUnits[colIndex].unit_name =
                                        e.target.value;
                                      return {
                                        ...prev,
                                        [tower]: {
                                          ...prev[tower],
                                          [floor.level_name]: {
                                            ...prev[tower][floor.level_name],
                                            units: updatedUnits,
                                          },
                                        },
                                      };
                                    })
                                  }
                                />

                                {/* Delete Button */}
                                <button
                                  onClick={() =>
                                    setUnitsPerFloor((prev) => {
                                      const updatedUnits = [
                                        ...prev[tower][floor.level_name].units,
                                      ];
                                      updatedUnits.splice(colIndex, 1);
                                      return {
                                        ...prev,
                                        [tower]: {
                                          ...prev[tower],
                                          [floor.level_name]: {
                                            ...prev[tower][floor.level_name],
                                            units: updatedUnits,
                                          },
                                        },
                                      };
                                    })
                                  }
                                  className="text-gray-500 px-2"
                                >
                                  <MdDelete />
                                </button>
                              </div>
                            )
                          )}

                          {/* Add Unit Button */}
                          <button
                            onClick={() => handleSingleUnits(floor)}
                            className="text-green-500"
                          >
                            <FaPlus />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between mt-6">
        <button
          className="bg-[#3CB0E1] text-white px-4 py-2 mt-2 rounded-md"
          onClick={previousStep}
        >
          Previous
        </button>
        {!editMode?.[tower] ? (
          <button
            className="bg-[#3CB0E1] text-white px-4 py-2 rounded-md"
            onClick={handleSave}
          >
            Save
          </button>
        ) : (
          <button
            className="bg-[#3CB0E1] text-white px-4 py-2 rounded-md"
            onClick={handleEdit}
          >
            Edit
          </button>
        )}
        <button
          className="bg-[#3CB0E1] text-white px-4 py-2 rounded-md"
          onClick={nextStep}
        >
          Proceed to Next Step
        </button>
      </div>
    </div>
  );
}

export default Unit;
