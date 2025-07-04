import React, { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { createUnit, updateUnit, allinfobuildingtoflat } from "../../api";

function Unit({ nextStep, previousStep }) {
  const selectedProjectId = useSelector(
    (state) => state.user.selectedProject.id
  );
  const flatTypes =
    useSelector((state) => state.user.flatTypes[selectedProjectId]) || [];

  // State structure for tower-based data
  const [buildings, setBuildings] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [selectedFlatType, setSelectedFlatType] = useState("");
  const [unitCount, setUnitCount] = useState("");
  const [floorUnits, setFloorUnits] = useState({});
  const [editMode, setEditMode] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Fetch building details using the existing API function
  const fetchBuildingDetails = async () => {
    if (!selectedProjectId) return;

    setIsLoading(true);
    try {
      const response = await allinfobuildingtoflat(selectedProjectId);

      if (response.status === 200) {
        setBuildings(response.data);
        console.log("Building details fetched:", response.data);

        // Auto-select first building if available
        if (response.data.length > 0) {
          setSelectedBuilding(response.data[0].id.toString());
          loadExistingUnits(response.data[0]);
        }
      } else {
        toast.error("Failed to fetch building details");
        console.error("Error response:", response);
      }
    } catch (error) {
      console.error("Error fetching building details:", error);
      toast.error("Error loading building data");
    } finally {
      setIsLoading(false);
    }
  };

  // Load existing units from API data
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
              "#E5E7EB",
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
    if (hasExistingUnits) {
      setEditMode({ [building.id]: true });
    }
  };

  useEffect(() => {
    fetchBuildingDetails();
  }, [selectedProjectId]);

  // Get current building data
  const getCurrentBuilding = () => {
    return buildings.find((b) => b.id.toString() === selectedBuilding);
  };

  // Handle building change
  const handleBuildingChange = (buildingId) => {
    setSelectedBuilding(buildingId);
    const building = buildings.find((b) => b.id.toString() === buildingId);
    if (building) {
      loadExistingUnits(building);
    }
    setFloorUnits({});
  };

  // Generate unit number based on floor with special handling for unique floors
  const generateUnitNumber = (levels, levelId, unitIndex) => {
    // Sort levels to get consistent floor numbering
    const sortedLevels = [...levels].sort((a, b) => {
      // Handle special cases for basement and parking
      if (a.name.toLowerCase().includes("basement")) return -2;
      if (b.name.toLowerCase().includes("basement")) return 2;
      if (a.name.toLowerCase().includes("parking")) return -1;
      if (b.name.toLowerCase().includes("parking")) return 1;

      // Extract numbers from level names for proper sorting
      const aNum = parseInt(a.name.match(/\d+/)?.[0] || 0);
      const bNum = parseInt(b.name.match(/\d+/)?.[0] || 0);
      return aNum - bNum;
    });

    // Find the current level
    const currentLevel = sortedLevels.find((level) => level.id === levelId);
    const levelName = currentLevel.name.toLowerCase();

    // Handle special unique floors
    if (levelName.includes("parking")) {
      // Parking: P1, P2, P3...
      return `P${unitIndex + 1}`;
    } else if (levelName.includes("basement")) {
      // Basement: B1, B2, B3...
      return `B${unitIndex + 1}`;
    } else {
      // Regular floors: Floor 1 = 1001+, Floor 2 = 2001+, etc.
      const floorMatch = currentLevel.name.match(/(\d+)/);
      const floorNumber = floorMatch ? parseInt(floorMatch[1]) : 1;

      // Generate unit number: Floor 1 = 1001, 1002, etc., Floor 2 = 2001, 2002, etc.
      const unitNumber = floorNumber * 1000 + (unitIndex + 1);
      return String(unitNumber);
    }
  };

  // Add units to all floors
  const handleAddUnitsToAllFloors = () => {
    if (!selectedBuilding) {
      toast.error("Please select a building first.");
      return;
    }

    if (!unitCount || unitCount <= 0) {
      toast.error("Please enter a valid number of units.");
      return;
    }

    if (!selectedFlatType) {
      toast.error("Please select a flat type.");
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
            color: flatType.color || "#E5E7EB",
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
    toast.success(`Added ${unitCount} units to each floor`);
  };

  // Add single unit to specific floor
  const handleAddSingleUnit = (level) => {
    if (!selectedFlatType) {
      toast.error("Please select a flat type first.");
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
            color: flatType.color || "#E5E7EB",
            isExisting: false,
          },
        ],
      },
    }));
  };

  // Update unit
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

  // Delete unit
  const handleDeleteUnit = (levelId, unitIndex) => {
    setFloorUnits((prev) => ({
      ...prev,
      [levelId]: {
        ...prev[levelId],
        units: prev[levelId].units.filter((_, index) => index !== unitIndex),
      },
    }));
  };

  // Apply flat type on hover
  const handleUnitHover = (levelId, unitIndex) => {
    if (selectedFlatType) {
      const flatType = flatTypes.find(
        (ft) => ft.id.toString() === selectedFlatType
      );
      if (flatType) {
        handleUpdateUnit(levelId, unitIndex, "flat_type_id", flatType.id);
        handleUpdateUnit(
          levelId,
          unitIndex,
          "color",
          flatType.color || "#E5E7EB"
        );
      }
    }
  };

  // Save units
  const handleSave = async () => {
    const hasUnits = Object.values(floorUnits).some(
      (floor) => floor.units && floor.units.length > 0
    );

    if (!hasUnits) {
      toast.error("No units to save");
      return;
    }

    // Check all units have flat types assigned
    const hasUnmappedUnits = Object.values(floorUnits).some(
      (floor) => floor.units && floor.units.some((unit) => !unit.flat_type_id)
    );
    if (hasUnmappedUnits) {
      toast.error("Please assign flat types to all units before saving.");
      return;
    }

    setIsLoading(true);

    // Build array of all flat objects to create
    const flatsToCreate = [];
    Object.entries(floorUnits).forEach(([levelId, { units }]) => {
      units.forEach((unit) => {
        console.log('vgbjkmbhm',selectedProjectId);
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
      toast.error(`${errorCount} units failed to save`);
    }
  };
  

  // Update existing units
  const handleUpdate = async () => {
    const hasUnits = Object.values(floorUnits).some(
      (floor) => floor.units && floor.units.length > 0
    );

    if (!hasUnits) {
      toast.error("No units to update");
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
        toast.success("Units updated successfully");
        await fetchBuildingDetails(); // Refresh data
      } else {
        toast.error(response.data?.message || "Failed to update units");
      }
    } catch (error) {
      console.error("Error updating units:", error);
      toast.error("Error updating units");
    } finally {
      setIsLoading(false);
    }
  };

  const currentBuilding = getCurrentBuilding();

  return (
    <div className="max-w-7xl my-1 mx-auto px-6 pt-3 pb-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Configure Units/Area
      </h2>

      {/* Loading indicator */}
      {isLoading && (
        <div className="mb-4 text-center">
          <span className="text-blue-500">Loading...</span>
        </div>
      )}

      {/* Selection Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Building Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Tower:
          </label>
          <select
            value={selectedBuilding}
            onChange={(e) => handleBuildingChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Tower</option>
            {buildings.map((building) => (
              <option key={building.id} value={building.id}>
                {building.name}
              </option>
            ))}
          </select>
        </div>

        {/* Flat Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Flat Type for All Units:
          </label>
          <select
            value={selectedFlatType}
            onChange={(e) => setSelectedFlatType(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

        {/* Unit Count Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Units:
          </label>
          <input
            type="number"
            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter count"
            value={unitCount}
            onChange={(e) => setUnitCount(e.target.value)}
            disabled={!selectedBuilding}
          />
        </div>

        {/* Add Units Button */}
        <div className="flex items-end">
          <button
            onClick={handleAddUnitsToAllFloors}
            className="w-full bg-blue-500 text-white px-4 py-2.5 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            disabled={
              !selectedBuilding || !selectedFlatType || !unitCount || isLoading
            }
          >
            Add Units for All Floors
          </button>
        </div>
      </div>

      {/* Flat Type Legend */}
      {selectedBuilding && flatTypes.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Select Flat Type:
          </h3>
          <div className="flex gap-3 flex-wrap">
            {flatTypes.map((flatType) => (
              <button
                key={flatType.id}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedFlatType === flatType.id.toString()
                    ? "ring-2 ring-blue-500 ring-offset-2"
                    : "hover:ring-1 hover:ring-gray-300"
                }`}
                style={{
                  backgroundColor: flatType.color || "#E5E7EB",
                  color: flatType.color ? "#000" : "#374151",
                }}
                onClick={() => setSelectedFlatType(flatType.id.toString())}
              >
                {flatType.type_name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Floors Table */}
      {selectedBuilding && currentBuilding && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Floors in {currentBuilding.name}:
          </h3>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                      Floor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Units
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentBuilding.levels?.map((level) => (
                    <tr key={level.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {level.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2 items-center">
                          {floorUnits[level.id]?.units?.map(
                            (unit, unitIndex) => {
                              const unitFlatType = flatTypes.find(
                                (ft) => ft.id === unit.flat_type_id
                              );
                              return (
                                <div
                                  key={unitIndex}
                                  className="flex items-center space-x-2 border border-gray-300 rounded-lg p-2 bg-white min-w-[200px]"
                                  onMouseEnter={() =>
                                    handleUnitHover(level.id, unitIndex)
                                  }
                                >
                                  <input
                                    type="text"
                                    className="w-16 p-1 text-sm border border-gray-200 outline-none rounded text-center font-medium focus:ring-1 focus:ring-blue-500"
                                    value={unit.unit_name}
                                    onChange={(e) =>
                                      handleUpdateUnit(
                                        level.id,
                                        unitIndex,
                                        "unit_name",
                                        e.target.value
                                      )
                                    }
                                  />

                                  {/* Flat Type Badge */}
                                  {unitFlatType && (
                                    <span
                                      className="px-3 py-1 rounded-md text-xs font-semibold text-black"
                                      style={{
                                        backgroundColor:
                                          unitFlatType.color || "#FEF3C7",
                                      }}
                                    >
                                      {unitFlatType.type_name}
                                    </span>
                                  )}

                                  <button
                                    onClick={() =>
                                      handleDeleteUnit(level.id, unitIndex)
                                    }
                                    className="text-red-500 hover:text-red-700 p-1"
                                  >
                                    <MdDelete size={14} />
                                  </button>
                                </div>
                              );
                            }
                          )}

                          <button
                            onClick={() => handleAddSingleUnit(level)}
                            className="flex items-center justify-center w-10 h-10 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-green-500 hover:text-green-500 transition-colors"
                            disabled={!selectedFlatType}
                          >
                            <FaPlus size={12} />
                          </button>
                        </div>

                        {(!floorUnits[level.id]?.units ||
                          floorUnits[level.id].units.length === 0) && (
                          <div className="text-sm text-gray-500 italic">
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
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <button
          className="bg-gray-500 text-white px-6 py-2.5 rounded-lg hover:bg-gray-600 transition-colors"
          onClick={previousStep}
        >
          Previous
        </button>

        <div className="flex gap-3">
          {editMode[selectedBuilding] ? (
            <button
              className="bg-orange-500 text-white px-6 py-2.5 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
              onClick={handleUpdate}
              disabled={isLoading || !selectedBuilding}
            >
              Update Units
            </button>
          ) : (
            <button
              className="bg-green-500 text-white px-6 py-2.5 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
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
