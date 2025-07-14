import React, { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { showToast } from "../../utils/toast";
import { createUnit, updateUnit, allinfobuildingtoflat } from "../../api";
import { useTheme } from "../../ThemeContext";

// THEME COLORS
const COLORS = {
  light: {
    ORANGE: "#b54b13",
    ORANGE_DARK: "#882c10",
    ORANGE_LIGHT: "#ede1d3",
    BORDER_GRAY: "#a29991",
    TEXT_GRAY: "#29252c",
    INPUT_BG: "#fff8f4",
    HOVER_BG: "#fbe9e0",
    CARD_BG: "#fff",
    SHADOW: "0 4px 20px #d67c3c22",
    WHITE: "#fff",
  },
  dark: {
    ORANGE: "#ffbe63",
    ORANGE_DARK: "#f4b95e",
    ORANGE_LIGHT: "#2b2321",
    BORDER_GRAY: "#6f6561",
    TEXT_GRAY: "#ece2d7",
    INPUT_BG: "#28221e",
    HOVER_BG: "#473528",
    CARD_BG: "#171214",
    SHADOW: "0 4px 20px #0004",
    WHITE: "#191112",
  },
};

function Unit({ nextStep, previousStep }) {
  const { theme } = useTheme(); // 'light' or 'dark'
  const c = COLORS[theme === "dark" ? "dark" : "light"];

  const selectedProjectId = useSelector(
    (state) => state.user.selectedProject.id
  );
  const flatTypes =
    useSelector((state) => state.user.flatTypes[selectedProjectId]) || [];

  const [buildings, setBuildings] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [selectedFlatType, setSelectedFlatType] = useState("");
  const [unitCount, setUnitCount] = useState("");
  const [floorUnits, setFloorUnits] = useState({});
  const [editMode, setEditMode] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Multi-select state
  const [selectedUnits, setSelectedUnits] = useState({});
  const [bulkFlatType, setBulkFlatType] = useState({});

  // Helper to pad numbers
  const padNum = (num, len = 3) => String(num).padStart(len, "0");

  const generateUnitNumber = (levels, levelId, unitIndex) => {
    const currentLevel = levels.find((level) => level.id === levelId);
    const levelName = currentLevel?.name?.toLowerCase() || "";
    if (levelName.includes("podium")) return `P${padNum(unitIndex + 1)}`;
    if (levelName.includes("ground")) return `G${padNum(unitIndex + 1)}`;
    if (levelName.includes("terrace")) return `T${unitIndex + 1}`;
    if (levelName.includes("basement")) return `B${padNum(unitIndex + 1)}`;
    if (levelName.includes("parking")) return `PK${padNum(unitIndex + 1)}`;
    const floorMatch = currentLevel?.name?.match(/(\d+)/);
    const floorNumber = floorMatch ? parseInt(floorMatch[1]) : 1;
    return String(floorNumber * 1000 + (unitIndex + 1));
  };

  // Fetch building details
  const fetchBuildingDetails = async () => {
    if (!selectedProjectId) return;
    setIsLoading(true);
    try {
      const response = await allinfobuildingtoflat(selectedProjectId);
      if (response.status === 200) {
        setBuildings(response.data);
        if (response.data.length > 0) {
          setSelectedBuilding(response.data[0].id.toString());
          loadExistingUnits(response.data[0]);
        }
      } else {
        showToast("Failed to fetch building details",'error');
      }
    } catch (error) {
      showToast("Error loading building data",'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadExistingUnits = (building) => {
    const unitsData = {};
    let hasExistingUnits = false;
    building.levels?.forEach((level) => {
      const levelUnits = [];
      level.zones?.forEach((zone) => {
        zone.flats?.forEach((flat) => {
          levelUnits.push({
            id: flat.id,
            unit_name: flat.number,
            flat_type_id: flat.flattype,
            color:
              flatTypes.find((ft) => ft.id === flat.flattype)?.color ||
              c.ORANGE_LIGHT,
            isExisting: true,
          });
          hasExistingUnits = true;
        });
      });
      if (levelUnits.length > 0) {
        unitsData[level.id] = { units: levelUnits };
      }
    });
    setFloorUnits(unitsData);
    setSelectedUnits({});
    setBulkFlatType({});
    if (hasExistingUnits) {
      setEditMode({ [building.id]: true });
    }
  };

  useEffect(() => {
    fetchBuildingDetails();
    // eslint-disable-next-line
  }, [selectedProjectId]);

  const getCurrentBuilding = () => {
    return buildings.find((b) => b.id.toString() === selectedBuilding);
  };

  const handleBuildingChange = (buildingId) => {
    setSelectedBuilding(buildingId);
    const building = buildings.find((b) => b.id.toString() === buildingId);
    if (building) {
      loadExistingUnits(building);
    }
    setFloorUnits({});
    setSelectedUnits({});
    setBulkFlatType({});
  };

  // Add units to all floors
  const handleAddUnitsToAllFloors = () => {
    if (!selectedBuilding) {
      showToast("Please select a building first.", "error");
      return;
    }
    if (!unitCount || unitCount <= 0) {
      showToast("Please enter a valid number of units.",'error');
      return;
    }
    if (!selectedFlatType) {
      showToast("Please select a flat type.",'error');
      return;
    }
    const currentBuilding = getCurrentBuilding();
    const flatType = flatTypes.find(
      (ft) => ft.id.toString() === selectedFlatType
    );
    setFloorUnits((prev) => {
      const updatedUnits = { ...prev };
      currentBuilding.levels?.forEach((level) => {
        const existingUnits = prev[level.id]?.units || [];
        const newUnits = Array.from(
          { length: parseInt(unitCount) },
          (_, i) => ({
            unit_name: generateUnitNumber(
              currentBuilding.levels,
              level.id,
              existingUnits.length + i
            ),
            flat_type_id: flatType.id,
            color: flatType.color || c.ORANGE_LIGHT,
            isExisting: false,
          })
        );
        updatedUnits[level.id] = {
          units: [...existingUnits, ...newUnits],
        };
      });
      return updatedUnits;
    });
    setUnitCount("");
    setSelectedUnits({});
    setBulkFlatType({});
    showToast(`Added ${unitCount} units to each floor`,'success');
  };

  const handleAddSingleUnit = (level) => {
    if (!selectedFlatType) {
      showToast("Please select a flat type first.",'error');
      return;
    }
    const flatType = flatTypes.find(
      (ft) => ft.id.toString() === selectedFlatType
    );
    const existingUnits = floorUnits[level.id]?.units || [];
    setFloorUnits((prev) => ({
      ...prev,
      [level.id]: {
        units: [
          ...existingUnits,
          {
            unit_name: generateUnitNumber(
              getCurrentBuilding().levels,
              level.id,
              existingUnits.length
            ),
            flat_type_id: flatType.id,
            color: flatType.color || c.ORANGE_LIGHT,
            isExisting: false,
          },
        ],
      },
    }));
  };

  const handleUpdateUnit = (levelId, unitIndex, field, value) => {
    setFloorUnits((prev) => ({
      ...prev,
      [levelId]: {
        ...prev[levelId],
        units: prev[levelId].units.map((unit, index) =>
          index === unitIndex ? { ...unit, [field]: value } : unit
        ),
      },
    }));
  };

  const handleSelectUnit = (levelId, unitIndex) => {
    setSelectedUnits((prev) => {
      const set = new Set(prev[levelId] || []);
      if (set.has(unitIndex)) {
        set.delete(unitIndex);
      } else {
        set.add(unitIndex);
      }
      return { ...prev, [levelId]: set };
    });
  };

  const handleBulkFlatTypeChange = (levelId, flatTypeId) => {
    setBulkFlatType((prev) => ({ ...prev, [levelId]: flatTypeId }));
    setFloorUnits((prev) => ({
      ...prev,
      [levelId]: {
        ...prev[levelId],
        units: prev[levelId].units.map((unit, idx) =>
          selectedUnits[levelId]?.has(idx)
            ? {
                ...unit,
                flat_type_id: parseInt(flatTypeId),
                color:
                  flatTypes.find((ft) => ft.id.toString() === flatTypeId)
                    ?.color || c.ORANGE_LIGHT,
              }
            : unit
        ),
      },
    }));
  };

  const handleDeleteUnit = (levelId, unitIndex) => {
    setFloorUnits((prev) => ({
      ...prev,
      [levelId]: {
        ...prev[levelId],
        units: prev[levelId].units.filter((_, index) => index !== unitIndex),
      },
    }));
    setSelectedUnits((prev) => {
      if (!prev[levelId]) return prev;
      const updatedSet = new Set(prev[levelId]);
      updatedSet.delete(unitIndex);
      return { ...prev, [levelId]: updatedSet };
    });
  };

  // Save units
  const handleSave = async () => {
    const hasUnits = Object.values(floorUnits).some(
      (floor) => floor.units && floor.units.length > 0
    );
    if (!hasUnits) {
      showToast("No units to save",'info');
      return;
    }
    const hasUnmappedUnits = Object.values(floorUnits).some(
      (floor) => floor.units && floor.units.some((unit) => !unit.flat_type_id)
    );
    if (hasUnmappedUnits) {
      showToast("Please assign flat types to all units before saving.",'error');
      return;
    }
    setIsLoading(true);
    const flatsToCreate = [];
    Object.entries(floorUnits).forEach(([levelId, { units }]) => {
      units.forEach((unit) => {
        flatsToCreate.push({
          project: selectedProjectId,
          building: parseInt(selectedBuilding),
          level: parseInt(levelId),
          flattype: unit.flat_type_id,
          number: unit.unit_name,
        });
      });
    });
    let successCount = 0;
    let errorCount = 0;
    for (const flat of flatsToCreate) {
      try {
        const response = await createUnit(flat);
        if (response.status === 201 || response.status === 200) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        errorCount++;
      }
    }
    setIsLoading(false);
    if (successCount) {
      toast.success(`${successCount} units saved successfully`);
      await fetchBuildingDetails();
    }
    if (errorCount) {
      showToast(`${errorCount} units failed to save`);
    }
  };

  const handleUpdate = async () => {
    const hasUnits = Object.values(floorUnits).some(
      (floor) => floor.units && floor.units.length > 0
    );
    if (!hasUnits) {
      showToast("No units to update",'error');
      return;
    }
    setIsLoading(true);
    try {
      const levels = Object.keys(floorUnits).map((levelId) => ({
        level_id: parseInt(levelId),
        units: floorUnits[levelId].units.map((unit) => ({
          id: unit.id,
          number: unit.unit_name,
          flattype: unit.flat_type_id,
          level: parseInt(levelId),
          building: parseInt(selectedBuilding),
        })),
      }));
      const apiData = {
        project_id: selectedProjectId,
        building_id: parseInt(selectedBuilding),
        levels,
      };
      const response = await updateUnit(apiData);
      if (response.status === 200) {
        showToast("Units updated successfully",'success');
        await fetchBuildingDetails();
      } else {
        showToast(response.data?.message || "Failed to update units",'error');
      }
    } catch (error) {
      showToast("Error updating units",'error');
    } finally {
      setIsLoading(false);
    }
  };

  const currentBuilding = getCurrentBuilding();

  return (
    <div
      className="max-w-7xl my-1 mx-auto px-6 pt-3 pb-6 rounded-lg shadow-md"
      style={{
        background: c.ORANGE_LIGHT,
        border: `1.5px solid ${c.BORDER_GRAY}`,
        boxShadow: c.SHADOW,
        color: c.TEXT_GRAY,
      }}
    >
      <h2
        className="text-2xl font-bold mb-6 text-center"
        style={{ color: c.ORANGE_DARK }}
      >
        Configure Units/Area
      </h2>

      {isLoading && (
        <div className="mb-4 text-center">
          <span style={{ color: c.ORANGE }}>Loading...</span>
        </div>
      )}

      {/* Building, Flat type, Units inputs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: c.TEXT_GRAY }}>
            Select Tower:
          </label>
          <select
            value={selectedBuilding}
            onChange={(e) => handleBuildingChange(e.target.value)}
            className="w-full border rounded-lg p-2.5"
            style={{
              borderColor: c.ORANGE,
              background: c.CARD_BG,
              color: c.ORANGE_DARK,
            }}
          >
            <option value="">Select Tower</option>
            {buildings.map((building) => (
              <option key={building.id} value={building.id}>
                {building.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: c.TEXT_GRAY }}>
            Select Flat Type for All Units:
          </label>
          <select
            value={selectedFlatType}
            onChange={(e) => setSelectedFlatType(e.target.value)}
            className="w-full border rounded-lg p-2.5"
            style={{
              borderColor: c.ORANGE,
              background: c.CARD_BG,
              color: c.ORANGE_DARK,
            }}
            disabled={!selectedBuilding}
          >
            <option value="">Select Flat Type</option>
            {flatTypes.map((flatType) => (
              <option key={flatType.id} value={flatType.id}>
                {flatType.type_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: c.TEXT_GRAY }}>
            Number of Units:
          </label>
          <input
            type="number"
            className="w-full border rounded-lg p-2.5"
            style={{
              borderColor: c.ORANGE,
              background: c.CARD_BG,
              color: c.ORANGE_DARK,
            }}
            placeholder="Enter count"
            value={unitCount}
            onChange={(e) => setUnitCount(e.target.value)}
            disabled={!selectedBuilding}
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={handleAddUnitsToAllFloors}
            className="w-full rounded-lg font-semibold"
            style={{
              background: c.ORANGE,
              color: c.WHITE,
              boxShadow: c.SHADOW,
              opacity:
                !selectedBuilding || !selectedFlatType || !unitCount || isLoading
                  ? 0.6
                  : 1,
            }}
            disabled={
              !selectedBuilding || !selectedFlatType || !unitCount || isLoading
            }
          >
            Add Units for All Floors
          </button>
        </div>
      </div>

      {selectedBuilding && flatTypes.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3" style={{ color: c.TEXT_GRAY }}>
            Select Flat Type:
          </h3>
          <div className="flex gap-3 flex-wrap">
            {flatTypes.map((flatType) => (
              <button
                key={flatType.id}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedFlatType === flatType.id.toString()
                    ? "ring-2 ring-orange-500 ring-offset-2"
                    : "hover:ring-1"
                }`}
                style={{
                  background: flatType.color || c.ORANGE_LIGHT,
                  color: flatType.color ? "#000" : c.ORANGE_DARK,
                  border:
                    selectedFlatType === flatType.id.toString()
                      ? `2px solid ${c.ORANGE_DARK}`
                      : `1px solid ${c.BORDER_GRAY}`,
                  boxShadow: c.SHADOW,
                }}
                onClick={() => setSelectedFlatType(flatType.id.toString())}
              >
                {flatType.type_name}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedBuilding && currentBuilding && (
        <div className="mb-6">
          <h3
            className="text-lg font-semibold mb-4"
            style={{ color: c.ORANGE_DARK }}
          >
            Floors in {currentBuilding.name}:
          </h3>
          <div
            className="border rounded-lg shadow-sm overflow-hidden"
            style={{ background: c.CARD_BG, borderColor: c.ORANGE }}
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y" style={{ borderColor: c.ORANGE }}>
                <thead style={{ background: c.ORANGE_LIGHT }}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-1/4" style={{ color: c.ORANGE_DARK }}>
                      Floor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: c.ORANGE_DARK }}>
                      Units
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentBuilding.levels?.map((level) => (
                    <tr key={level.id} className="hover:bg-orange-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium" style={{ color: c.ORANGE_DARK }}>
                          {level.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {/* Bulk flat type selector for this floor */}
                        <div className="mb-2 flex items-center gap-3">
                          <span className="text-xs" style={{ color: c.BORDER_GRAY }}>
                            Bulk Edit:
                          </span>
                          <select
                            value={bulkFlatType[level.id] || ""}
                            onChange={(e) => handleBulkFlatTypeChange(level.id, e.target.value)}
                            className="border rounded-lg p-1 text-sm"
                            style={{
                              borderColor: c.ORANGE,
                              background: c.ORANGE_LIGHT,
                              color: c.ORANGE_DARK,
                            }}
                          >
                            <option value="">Select Flat Type</option>
                            {flatTypes.map((ft) => (
                              <option key={ft.id} value={ft.id}>
                                {ft.type_name}
                              </option>
                            ))}
                          </select>
                          <span className="text-xs" style={{ color: c.BORDER_GRAY }}>
                            (Select multiple units below and then pick a flat type)
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 items-center">
                          {floorUnits[level.id]?.units?.map((unit, unitIndex) => {
                            const unitFlatType = flatTypes.find(
                              (ft) => ft.id === unit.flat_type_id
                            );
                            const isSelected = selectedUnits[level.id]?.has(unitIndex);
                            return (
                              <div
                                key={unitIndex}
                                className={`flex items-center space-x-2 border rounded-lg p-2 min-w-[200px] cursor-pointer transition-all ${
                                  isSelected
                                    ? "ring-2 ring-orange-500 border-orange-500"
                                    : ""
                                }`}
                                style={{
                                  background: isSelected ? c.ORANGE_LIGHT : c.CARD_BG,
                                  borderColor: isSelected ? c.ORANGE : c.BORDER_GRAY,
                                  userSelect: "none",
                                  boxShadow: c.SHADOW,
                                }}
                                onClick={() => handleSelectUnit(level.id, unitIndex)}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected || false}
                                  readOnly
                                  className="mr-2"
                                  onClick={e => e.stopPropagation()}
                                  style={{
                                    accentColor: c.ORANGE,
                                  }}
                                />
                                <input
                                  type="text"
                                  className="w-16 p-1 text-sm border rounded text-center font-medium"
                                  style={{
                                    borderColor: c.ORANGE,
                                    background: c.ORANGE_LIGHT,
                                    color: c.ORANGE_DARK,
                                  }}
                                  value={unit.unit_name}
                                  onChange={(e) =>
                                    handleUpdateUnit(
                                      level.id,
                                      unitIndex,
                                      "unit_name",
                                      e.target.value
                                    )
                                  }
                                  onClick={e => e.stopPropagation()}
                                />
                                <select
                                  value={unit.flat_type_id}
                                  onChange={e =>
                                    handleUpdateUnit(
                                      level.id,
                                      unitIndex,
                                      "flat_type_id",
                                      parseInt(e.target.value)
                                    )
                                  }
                                  className="rounded px-1 py-1 border text-xs"
                                  style={{
                                    borderColor: c.ORANGE,
                                    background: c.ORANGE_LIGHT,
                                    color: c.ORANGE_DARK,
                                  }}
                                  onClick={e => e.stopPropagation()}
                                >
                                  <option value="">Type</option>
                                  {flatTypes.map((ft) => (
                                    <option key={ft.id} value={ft.id}>
                                      {ft.type_name}
                                    </option>
                                  ))}
                                </select>
                                {unitFlatType && (
                                  <span
                                    className="px-2 py-1 rounded-md text-xs font-semibold"
                                    style={{
                                      background: unitFlatType.color || c.ORANGE_LIGHT,
                                      color: c.ORANGE_DARK,
                                    }}
                                  >
                                    {unitFlatType.type_name}
                                  </span>
                                )}
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleDeleteUnit(level.id, unitIndex);
                                  }}
                                  className="p-1"
                                  style={{
                                    color: c.ORANGE_DARK,
                                    background: c.HOVER_BG,
                                    borderRadius: 6,
                                  }}
                                >
                                  <MdDelete size={14} />
                                </button>
                              </div>
                            );
                          })}
                          <button
                            onClick={() => handleAddSingleUnit(level)}
                            className="flex items-center justify-center w-10 h-10 border-2 border-dashed rounded-lg transition-colors"
                            style={{
                              borderColor: c.ORANGE,
                              color: c.ORANGE,
                              background: c.CARD_BG,
                            }}
                            disabled={!selectedFlatType}
                          >
                            <FaPlus size={12} />
                          </button>
                        </div>
                        {(!floorUnits[level.id]?.units ||
                          floorUnits[level.id].units.length === 0) && (
                          <div className="text-sm italic" style={{ color: c.BORDER_GRAY }}>
                            No units added
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6" style={{ borderTop: `1px solid ${c.BORDER_GRAY}` }}>
        <button
          className="px-6 py-2.5 rounded-lg font-medium"
          style={{
            background: c.BORDER_GRAY,
            color: "#fff",
          }}
          onClick={previousStep}
        >
          Previous
        </button>
        <div className="flex gap-3">
          {editMode[selectedBuilding] ? (
            <button
              className="px-6 py-2.5 rounded-lg font-medium"
              style={{
                background: c.ORANGE,
                color: "#fff",
                opacity: isLoading || !selectedBuilding ? 0.6 : 1,
              }}
              onClick={handleUpdate}
              disabled={isLoading || !selectedBuilding}
            >
              Update Units
            </button>
          ) : (
            <button
              className="px-6 py-2.5 rounded-lg font-medium"
              style={{
                background: c.ORANGE,
                color: "#fff",
                opacity: isLoading || !selectedBuilding ? 0.6 : 1,
              }}
              onClick={handleSave}
              disabled={isLoading || !selectedBuilding}
            >
              Save & Proceed to Next Step
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Unit;
