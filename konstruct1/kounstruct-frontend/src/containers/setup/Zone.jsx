import React, { useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { useSelector } from "react-redux";

function Zone() {
  const projectId = useSelector((state) => state.user.selectedProject.id);
  const zoneDetails = useSelector((state) => state.user.levels[projectId]);

  const [subZoneCounts, setSubZoneCounts] = useState({});
  const [zoneNames, setZoneNames] = useState({});

  console.log(zoneDetails, "ZONE DETAILS");

  const [zoneData, setZoneData] = useState(zoneDetails);

  // useEffect(() => {
  //   if (zoneData && Object.keys(zoneData).length > 0) {
  //     const initializeZoneNames = () => {
  //       const newZoneNames = {};
  //       Object.keys(zoneData).forEach((towerName) => {
  //         if (Array.isArray(zoneData[towerName])) {
  //           zoneData[towerName].forEach((floor) => {
  //             if (Array.isArray(floor.zones)) {
  //               floor.zones.forEach((zone) => {
  //                 newZoneNames[`${towerName}-${floor.floor}-${zone.name}`] =
  //                   zone.name;
  //                 if (Array.isArray(zone.subZones)) {
  //                   zone.subZones.forEach((subZone) => {
  //                     newZoneNames[
  //                       `${towerName}-${floor.floor}-${zone.name}-${subZone.name}`
  //                     ] = subZone.name;
  //                   });
  //                 }
  //               });
  //             }
  //           });
  //         }
  //       });
  //       console.log(newZoneNames, "NEW ZONE NAMES");
  //       setZoneNames(newZoneNames);
  //     };
  //     initializeZoneNames();
  //   }
  // }, [zoneData]);

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

  const getTowerId = (towerName) => {
    return Object.keys(zoneData).find(
      (key) => zoneData[key].details.naming_convention === towerName
    );
  };

  const handleAddSubZones = (
    towerName,
    floorName,
    zonePath,
    numberOfSubZones
  ) => {
    console.log(numberOfSubZones, zonePath, towerName, floorName, "CALLED");

    if (numberOfSubZones <= 0) return; // Exit early if no subzones need to be added

    const towerId = getTowerId(towerName);
    const newSubZones = Array.from({ length: numberOfSubZones }, (_, i) => ({
      name: `Sub-Zone ${i + 1}`,
      subZones: [],
    }));

    console.log(newSubZones, "NEW SUBZONES");

    // Recursive function to update zones at the correct nesting level
    const updateZones = (zones, pathIndex = 0) => {
      return zones.map((zone) => {
        if (zone.name === zonePath[pathIndex]) {
          if (pathIndex === zonePath.length - 1) {
            return { ...zone, subZones: [...zone.subZones, ...newSubZones] };
          }
          return {
            ...zone,
            subZones: updateZones(zone.subZones, pathIndex + 1),
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
              zones: floor.zones ? updateZones(floor.zones) : newSubZones,
            };
          }
          return floor;
        }),
      },
    };

    console.log(updatedZoneData, "UPDATED ZONE DATA");
    setZoneData(updatedZoneData);
  };

  const handleDeleteZone = (towerName, floorName, zonePath) => {
    console.log("Delete Zone Called:", zonePath, towerName, floorName);

    const towerId = getTowerId(towerName);

    // Recursive function to find and delete the target subZone
    const deleteZones = (zones, pathIndex = 0) => {
      if (!zones) return zones;

      return zones
        .map((zone) => {
          if (zone.name === zonePath[pathIndex]) {
            // If we are at the last zone in the path, remove it
            if (pathIndex === zonePath.length - 1) return null;

            // Otherwise, go deeper in the subZones
            return {
              ...zone,
              subZones: deleteZones(zone.subZones, pathIndex + 1),
            };
          }
          return zone;
        })
        .filter(Boolean); // Remove only the matched subZone (null values)
    };

    const updatedZoneData = {
      ...zoneData,
      [towerId]: {
        ...zoneData[towerId],
        floors: zoneData[towerId].floors.map((floor) => {
          if (floor.level_name === floorName) {
            return {
              ...floor,
              zones: deleteZones(floor.zones),
            };
          }
          return floor;
        }),
      },
    };

    console.log("Updated Zone Data After Delete:", updatedZoneData);
    setZoneData(updatedZoneData);
  };

  const handleRenameZones = (towerName, floorName, zonePath, newName) => {
    console.log("Rename Zone Called:", zonePath, "New Name:", newName);

    const towerId = getTowerId(towerName);

    // Recursive function to find and rename the target subZone
    const renameZones = (zones, pathIndex = 0) => {
      if (!zones) return zones;

      return zones.map((zone) => {
        if (zone.name === zonePath[pathIndex]) {
          // If we reached the target, rename it
          if (pathIndex === zonePath.length - 1) {
            return { ...zone, name: newName };
          }

          // Otherwise, go deeper in subZones
          return {
            ...zone,
            subZones: renameZones(zone.subZones, pathIndex + 1),
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
              zones: renameZones(floor.zones),
            };
          }
          return floor;
        }),
      },
    };

    console.log("Updated Zone Data After Rename:", updatedZoneData);
    setZoneData(updatedZoneData);
  };

  const renderZones = (
    zones,
    towerName,
    floorName,
    parentPath = [],
    isMainZone = true
  ) => (
    <ul className="space-y-4 ml-4">
      {zones?.map((zone) => {
        const zoneName = zone.name;
        const currentPath = [...parentPath, zoneName];

        if (!zoneName) return null;

        return (
          <li key={zoneName} className="mb-4">
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
              <div className="flex space-x-2">
                <button
                  onClick={() =>
                    handleDeleteZone(
                      towerName,
                      floorName,
                      currentPath,
                      zoneName
                    )
                  }
                  className="text-red-500 hover:text-red-700 focus:outline-none transition duration-300"
                >
                  <FaTrash />
                </button>
              </div>
            </div>

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

            {zone.subZones &&
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
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Zone Configuration
      </h2>
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
                        handleAddSubZones(
                          zoneData[towerId].details.naming_convention,
                          floor.level_name,
                          null,
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
