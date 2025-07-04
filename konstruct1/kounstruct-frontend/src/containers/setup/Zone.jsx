import React, { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaSave } from "react-icons/fa";
import { useSelector } from "react-redux";
import { zonewithbluidlingwithlevel, NestedZonenSubzone } from "../../api"; // update import if needed

function Zone(nextStep) {
  const projectId = useSelector((state) => state.user.selectedProject.id);

  // UI state
  const [subZoneCounts, setSubZoneCounts] = useState({});
  const [zoneNames, setZoneNames] = useState({});
  const [zoneData, setZoneData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Fetch towers/levels/zones/subzones from backend
  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    zonewithbluidlingwithlevel(projectId)
      .then((response) => {
        const result =
          (response.data || []).reduce((obj, tower) => {
            obj[tower.id] = {
              details: {
                naming_convention: tower.name,
              },
              floors: (tower.levels || []).map((lvl) => ({
                ...lvl,
                level_name: lvl.name,
                zones: (lvl.zones || []).map((zone) => ({
                  ...zone,
                  subZones: zone.subzones || [],
                })),
              })),
            };
            return obj;
          }, {}) || {};
        setZoneData(result);
        setLoading(false);
      })
      .catch(() => {
        setZoneData(null);
        setLoading(false);
      });
  }, [projectId]);

  const handleSaveZones = async () => {
    if (!zoneData || !projectId) return;
    setSaving(true);
    setSaveMessage("");
    try {
      // Your payload and API call
      let savePayload = [];
      Object.keys(zoneData).forEach((towerId) => {
        (zoneData[towerId].floors || []).forEach((floor) => {
          savePayload.push({
            level: floor.id,
            zones: (floor.zones || []).map((zone) => ({
              name: zone.name,
              subzones: (zone.subZones || []).map((subzone) => ({
                name: subzone.name,
              })),
            })),
          });
        });
      });
      await NestedZonenSubzone(savePayload);

      setSaveMessage("Zones saved successfully!");
      setTimeout(() => {
        setSaveMessage("");
        if (nextStep) nextStep(); // <-- move to next step
      }, 1500);
    } catch (error) {
      setSaveMessage("Error saving zones. Please try again.");
      setTimeout(() => setSaveMessage(""), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center text-lg text-gray-600">Loading zones...</div>
    );
  }
  if (
    !zoneData ||
    typeof zoneData !== "object" ||
    Object.keys(zoneData).length === 0
  ) {
    return (
      <div className="text-center text-lg text-gray-600">
        No zones configured yet.
      </div>
    );
  }

  // Helper to get the towerId by tower name
  const getTowerId = (towerName) => {
    return Object.keys(zoneData).find(
      (key) => zoneData[key].details.naming_convention === towerName
    );
  };

  // Add zones at the FLOOR level
  const handleAddZones = (towerName, floorName, numberOfZones) => {
    if (!numberOfZones || numberOfZones <= 0) return;
    const towerId = getTowerId(towerName);
    const newZones = Array.from({ length: Number(numberOfZones) }, (_, i) => ({
      name: `Zone ${i + 1}`,
      subZones: [],
    }));
    const updatedZoneData = {
      ...zoneData,
      [towerId]: {
        ...zoneData[towerId],
        floors: zoneData[towerId].floors.map((floor) => {
          if (floor.level_name === floorName) {
            return {
              ...floor,
              zones: (floor.zones || []).concat(newZones),
            };
          }
          return floor;
        }),
      },
    };
    setZoneData(updatedZoneData);
  };

  // Add subzones (only under zone, not under subzone)
  const handleAddSubZones = (
    towerName,
    floorName,
    zonePath,
    numberOfSubZones
  ) => {
    if (!numberOfSubZones || numberOfSubZones <= 0) return;
    const towerId = getTowerId(towerName);
    const newSubZones = Array.from(
      { length: Number(numberOfSubZones) },
      (_, i) => ({
        name: `Sub-Zone ${i + 1}`,
        subZones: [],
      })
    );
    // Only allow one-level nesting (zone -> subzone)
    if (!zonePath || zonePath.length !== 1) return;
    const updateZones = (zones) =>
      zones.map((zone) => {
        if (zone.name === zonePath[0]) {
          return {
            ...zone,
            subZones: [...(zone.subZones || []), ...newSubZones],
          };
        }
        return zone;
      });
    const updatedZoneData = {
      ...zoneData,
      [towerId]: {
        ...zoneData[towerId],
        floors: zoneData[towerId].floors.map((floor) => {
          if (floor.level_name === floorName) {
            return {
              ...floor,
              zones: updateZones(floor.zones || []),
            };
          }
          return floor;
        }),
      },
    };
    setZoneData(updatedZoneData);
  };

  // Delete a zone or subzone by path
  const handleDeleteZone = (towerName, floorName, zonePath) => {
    const towerId = getTowerId(towerName);
    const deleteZones = (zones, pathIndex = 0) => {
      if (!zones) return zones;
      return zones
        .map((zone) => {
          if (zone.name === zonePath[pathIndex]) {
            if (pathIndex === zonePath.length - 1) return null;
            return {
              ...zone,
              subZones: deleteZones(zone.subZones || [], pathIndex + 1),
            };
          }
          return zone;
        })
        .filter(Boolean);
    };
    const updatedZoneData = {
      ...zoneData,
      [towerId]: {
        ...zoneData[towerId],
        floors: zoneData[towerId].floors.map((floor) => {
          if (floor.level_name === floorName) {
            return {
              ...floor,
              zones: deleteZones(floor.zones || []),
            };
          }
          return floor;
        }),
      },
    };
    setZoneData(updatedZoneData);
  };

  // Rename any zone/subzone
  const handleRenameZones = (towerName, floorName, zonePath, newName) => {
    const towerId = getTowerId(towerName);
    const renameZones = (zones, pathIndex = 0) => {
      if (!zones) return zones;
      return zones.map((zone) => {
        if (zone.name === zonePath[pathIndex]) {
          if (pathIndex === zonePath.length - 1) {
            return { ...zone, name: newName };
          }
          return {
            ...zone,
            subZones: renameZones(zone.subZones || [], pathIndex + 1),
          };
        }
        return zone;
      });
    };
    const updatedZoneData = {
      ...zoneData,
      [towerId]: {
        ...zoneData[towerId],
        floors: zoneData[towerId].floors.map((floor) => {
          if (floor.level_name === floorName) {
            return {
              ...floor,
              zones: renameZones(floor.zones || []),
            };
          }
          return floor;
        }),
      },
    };
    setZoneData(updatedZoneData);
  };

  // Recursive renderer
  const renderZones = (
    zones,
    towerName,
    floorName,
    parentPath = [],
    isMainZone = true
  ) => (
    <ul className="space-y-4 ml-4">
      {zones?.map((zone, idx) => {
        const zoneName = zone.name;
        const currentPath = [...parentPath, zoneName];
        if (!zoneName) return null;
        return (
          <li key={zoneName + idx} className="mb-4">
            <div
              className={`flex justify-between items-center p-2 rounded-lg shadow-sm ${
                isMainZone ? "bg-green-200" : "bg-blue-200"
              }`}
            >
              <input
                type="text"
                value={
                  zoneNames[`${towerName}-${floorName}-${zoneName}`] || zoneName
                }
                onChange={(e) =>
                  setZoneNames({
                    ...zoneNames,
                    [`${towerName}-${floorName}-${zoneName}`]: e.target.value,
                  })
                }
                onBlur={() =>
                  handleRenameZones(
                    towerName,
                    floorName,
                    currentPath,
                    zoneNames[`${towerName}-${floorName}-${zoneName}`] ||
                      zoneName
                  )
                }
                className="border border-gray-300 rounded-lg p-1 w-1/2 focus:ring focus:ring-indigo-200"
              />
              <button
                onClick={() =>
                  handleDeleteZone(towerName, floorName, currentPath)
                }
                className="text-red-500 hover:text-red-700 focus:outline-none transition duration-300"
              >
                <FaTrash />
              </button>
            </div>
            {/* Only allow subzone add for main zones */}
            {isMainZone && (
              <div className="flex items-center mb-2 ml-6">
                <label className="text-gray-600 mr-2">Sub-Zones:</label>
                <input
                  type="number"
                  min="1"
                  value={
                    subZoneCounts[
                      `${towerName}-${floorName}-${currentPath.join("-")}`
                    ] || ""
                  }
                  onChange={(e) =>
                    setSubZoneCounts((prev) => ({
                      ...prev,
                      [`${towerName}-${floorName}-${currentPath.join("-")}`]:
                        e.target.value,
                    }))
                  }
                  className="border border-gray-300 rounded-lg p-1 w-1/3 focus:ring focus:ring-indigo-200"
                />
                <button
                  onClick={() =>
                    handleAddSubZones(
                      towerName,
                      floorName,
                      currentPath,
                      subZoneCounts[
                        `${towerName}-${floorName}-${currentPath.join("-")}`
                      ]
                    )
                  }
                  className="ml-2 text-green-600 hover:text-green-800 focus:outline-none transition duration-300"
                >
                  <FaPlus className="mr-2" /> Add
                </button>
              </div>
            )}
            {/* No subzone UI for subzones */}
            {zone.subZones &&
              zone.subZones.length > 0 &&
              renderZones(
                zone.subZones,
                towerName,
                floorName,
                currentPath,
                false
              )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="p-6 bg-white shadow-xl rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Zone Configuration</h2>
        <div className="flex items-center space-x-4">
          {saveMessage && (
            <span
              className={`text-sm font-medium ${
                saveMessage.includes("Error")
                  ? "text-red-600"
                  : "text-green-600"
              }`}
            >
              {saveMessage}
            </span>
          )}
          <button
            onClick={handleSaveZones}
            disabled={saving}
            className={`flex items-center px-6 py-2 rounded-lg font-medium transition duration-300 ${
              saving
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            <FaSave className="mr-2" />
            {saving ? "Saving..." : "Save Zones"}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap -mx-2">
        {Object.keys(zoneData).map((towerId) => (
          <div key={towerId} className="w-full md:w-1/2 lg:w-1/3 p-2">
            <div className="mb-4 p-6 bg-gray-50 border border-gray-200 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-gray-900">
                {zoneData[towerId].details.naming_convention}
              </h3>
              {zoneData[towerId]?.floors.map((floor) => (
                <div
                  key={floor.level_name}
                  className="mb-4 p-4 bg-white shadow rounded-lg"
                >
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">
                    {floor.level_name}
                  </h4>
                  <div className="flex items-center mb-2">
                    <label className="text-gray-600 mr-2">Zones:</label>
                    <input
                      type="number"
                      min="1"
                      value={
                        subZoneCounts[
                          `${zoneData[towerId].details.naming_convention}-${floor.level_name}`
                        ] || ""
                      }
                      onChange={(e) =>
                        setSubZoneCounts((prev) => ({
                          ...prev,
                          [`${zoneData[towerId].details.naming_convention}-${floor.level_name}`]:
                            e.target.value,
                        }))
                      }
                      className="border border-gray-300 rounded-lg p-1 w-1/3 focus:ring focus:ring-indigo-200"
                    />
                    <button
                      onClick={() =>
                        handleAddZones(
                          zoneData[towerId].details.naming_convention,
                          floor.level_name,
                          subZoneCounts[
                            `${zoneData[towerId].details.naming_convention}-${floor.level_name}`
                          ]
                        )
                      }
                      className="ml-2 text-green-600 hover:text-green-800 focus:outline-none transition duration-300"
                    >
                      <FaPlus className="mr-2" /> Add
                    </button>
                  </div>
                  {(!floor?.zones || floor?.zones?.length === 0) && (
                    <div className="text-sm text-red-600 mb-2">
                      At least 1 zone is required for this level.
                    </div>
                  )}
                  {floor?.zones?.length > 0 &&
                    renderZones(
                      floor?.zones || [],
                      zoneData[towerId].details.naming_convention,
                      floor.level_name
                    )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Zone;
