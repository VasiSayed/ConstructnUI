import React, { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Save,
  CheckSquare,
  Square,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useSelector } from "react-redux";
import {
  zonewithbluidlingwithlevel,
  NestedZonenSubzone,
} from "../../api";
import { useTheme } from "../../ThemeContext"; // Make sure this exists!

// --- THEME COLORS ---
const THEME = {
  light: {
    YELLOW: "#FFD600",
    YELLOW_GRAD: "linear-gradient(90deg, #FFD600 65%, #FFB300 100%)",
    YELLOW_DARK: "#FFB300",
    CARD_BG: "#fff",
    BACKGROUND: "#F6F4ED",
    BORDER: "#FFD600",
    TEXT: "#23232b",
    ACCENT: "#b54b13",
    INPUT_BG: "#f9f6f3",
    ERROR: "#ea4343",
    DISABLED: "#e2d6cf",
  },
  dark: {
    YELLOW: "#FFD600",
    YELLOW_GRAD: "linear-gradient(90deg, #FFD600 65%, #FFB300 100%)",
    YELLOW_DARK: "#FFB300",
    CARD_BG: "#181821",
    BACKGROUND: "#14141a",
    BORDER: "#FFD600",
    TEXT: "#FFD600",
    ACCENT: "#FFD600",
    INPUT_BG: "#23232b",
    ERROR: "#ff6f6f",
    DISABLED: "#555555",
  },
};

// Card with theme
const Card = ({ children, className = "", variant = "default", theme }) => (
  <div
    className={`rounded-2xl shadow-xl border p-6 mb-6 transition-all duration-300 hover:shadow-2xl ${className}`}
    style={{
      background: theme.CARD_BG,
      borderColor: theme.BORDER,
    }}
  >
    {children}
  </div>
);

function Zone({ nextStep }) {
  const { theme: appTheme } = useTheme();
  const theme = THEME[appTheme === "dark" ? "dark" : "light"];
  const projectId = useSelector((state) => state.user.selectedProject.id);
  const [zoneData, setZoneData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [zoneCounts, setZoneCounts] = useState({});
  const [subZoneCounts, setSubZoneCounts] = useState({});
  const [zoneNames, setZoneNames] = useState({});
  const [selectedZones, setSelectedZones] = useState({});
  const [batchZoneCount, setBatchZoneCount] = useState("");
  const [batchSubZoneCount, setBatchSubZoneCount] = useState({});

  // Fetch all towers/levels/zones/subzones
  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    zonewithbluidlingwithlevel(projectId)
      .then((response) => {
        const result =
          (response.data || []).reduce((obj, tower) => {
            obj[tower.id] = {
              details: { naming_convention: tower.name },
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

  const getTowerId = (towerName) =>
    Object.keys(zoneData).find(
      (key) => zoneData[key].details.naming_convention === towerName
    );

  const sortedFloors = (floors) => {
    return [...floors].sort((a, b) => {
      const numA = parseInt(a.level_name.match(/\d+/)?.[0]);
      const numB = parseInt(b.level_name.match(/\d+/)?.[0]);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      if (!isNaN(numA)) return -1;
      if (!isNaN(numB)) return 1;
      return a.level_name.localeCompare(b.level_name);
    });
  };

  const handleAddZonesToAll = () => {
    const num = Number(batchZoneCount);
    if (!num || num < 1) return;
    let newData = { ...zoneData };
    Object.keys(newData).forEach((towerId) => {
      newData[towerId].floors = newData[towerId].floors.map((floor) => {
        const existingZones = floor.zones || [];
        const toAdd = [];
        for (let i = 1; i <= num; i++) {
          toAdd.push({
            name: `Zone ${existingZones.length + i}`,
            subZones: [],
          });
        }
        return { ...floor, zones: existingZones.concat(toAdd) };
      });
    });
    setZoneData(newData);
    setBatchZoneCount("");
  };

  const handleAddZones = (towerName, floorName, numberOfZones) => {
    if (!numberOfZones || numberOfZones <= 0) return;
    const towerId = getTowerId(towerName);
    const floorObj = zoneData[towerId].floors.find(
      (f) => f.level_name === floorName
    );
    const newZones = Array.from(
      { length: Number(numberOfZones) },
      (_, i) => ({
        name: `Zone ${(floorObj.zones?.length || 0) + i + 1}`,
        subZones: [],
      })
    );
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
    setZoneCounts((prev) => ({
      ...prev,
      [`${towerName}-${floorName}`]: "",
    }));
  };

  const handleSelectAllZones = (
    towerName,
    floorName,
    isAllSelected,
    zoneNamesArr
  ) => {
    const key = `${towerName}__${floorName}`;
    setSelectedZones((prev) => ({
      ...prev,
      [key]: isAllSelected ? [] : zoneNamesArr,
    }));
  };

  const handleDeleteSelectedZones = (towerName, floorName) => {
    const key = `${towerName}__${floorName}`;
    const towerId = getTowerId(towerName);
    if (!selectedZones[key] || selectedZones[key].length === 0) return;

    const updatedZoneData = {
      ...zoneData,
      [towerId]: {
        ...zoneData[towerId],
        floors: zoneData[towerId].floors.map((floor) => {
          if (floor.level_name === floorName) {
            return {
              ...floor,
              zones: (floor.zones || []).filter(
                (zone) => !selectedZones[key].includes(zone.name)
              ),
            };
          }
          return floor;
        }),
      },
    };
    setZoneData(updatedZoneData);
    setSelectedZones((prev) => ({ ...prev, [key]: [] }));
  };

  const handleAddSubZonesToAll = (
    towerName,
    floorName,
    numberOfSubZones,
    onlySelected = false
  ) => {
    if (!numberOfSubZones || numberOfSubZones <= 0) return;
    const towerId = getTowerId(towerName);
    const key = `${towerName}__${floorName}`;
    const floorObj = zoneData[towerId].floors.find(
      (f) => f.level_name === floorName
    );
    let zoneNamesArr = (floorObj.zones || []).map((z) => z.name);
    let zonesToUpdate = onlySelected ? selectedZones[key] || [] : zoneNamesArr;
    const updatedZoneData = {
      ...zoneData,
      [towerId]: {
        ...zoneData[towerId],
        floors: zoneData[towerId].floors.map((floor) => {
          if (floor.level_name === floorName) {
            return {
              ...floor,
              zones: (floor.zones || []).map((zone) => {
                if (zonesToUpdate.includes(zone.name)) {
                  const nextSubIndex = (zone.subZones?.length || 0) + 1;
                  const newSubs = Array.from(
                    { length: Number(numberOfSubZones) },
                    (_, i) => ({
                      name: `Sub-Zone ${nextSubIndex + i}`,
                      subZones: [],
                    })
                  );
                  return {
                    ...zone,
                    subZones: (zone.subZones || []).concat(newSubs),
                  };
                }
                return zone;
              }),
            };
          }
          return floor;
        }),
      },
    };
    setZoneData(updatedZoneData);
    setBatchSubZoneCount((prev) => ({ ...prev, [key]: "" }));
  };

  const handleAddSubZones = (towerName, floorName, zonePath, numberOfSubZones) => {
    if (!numberOfSubZones || numberOfSubZones <= 0) return;
    const towerId = getTowerId(towerName);
    const newSubZones = Array.from({ length: Number(numberOfSubZones) }, (_, i) => ({
      name: `Sub-Zone ${i + 1}`,
      subZones: [],
    }));
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
    setSubZoneCounts((prev) => ({
      ...prev,
      [`${towerName}-${floorName}-${zonePath.join("-")}`]: "",
    }));
  };

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

  // Recursive rendering of zones and sub-zones
  const renderZones = (
    zones,
    towerName,
    floorName,
    parentPath = [],
    isMainZone = true
  ) => {
    const key = `${towerName}__${floorName}`;
    return (
      <ul className="space-y-3 ml-4">
        {zones?.map((zone, idx) => {
          const zoneName = zone.name;
          const currentPath = [...parentPath, zoneName];
          if (!zoneName) return null;
          const isSelected = (selectedZones[key] || []).includes(zoneName);
          return (
            <li key={zoneName + idx} className="mb-3">
              <div
                className={`flex justify-between items-center p-3 rounded-xl border transition-all duration-200`}
                style={{
                  background: isMainZone
                    ? theme.YELLOW_GRAD
                    : theme.INPUT_BG,
                  borderColor: theme.BORDER,
                  color: theme.TEXT,
                }}
              >
                {isMainZone && (
                  <button
                    onClick={() => {
                      setSelectedZones((prev) => {
                        const cur = prev[key] || [];
                        return {
                          ...prev,
                          [key]: cur.includes(zoneName)
                            ? cur.filter((z) => z !== zoneName)
                            : [...cur, zoneName],
                        };
                      });
                    }}
                    className="mr-3"
                    style={{ color: theme.ACCENT }}
                    title={isSelected ? "Unselect Zone" : "Select Zone"}
                  >
                    {isSelected ? (
                      <CheckSquare size={20} color={theme.ACCENT} />
                    ) : (
                      <Square size={20} color={theme.ACCENT} />
                    )}
                  </button>
                )}
                <input
                  type="text"
                  value={
                    zoneNames[`${towerName}-${floorName}-${zoneName}`] ||
                    zoneName
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
                      zoneNames[
                        `${towerName}-${floorName}-${zoneName}`
                      ] || zoneName
                    )
                  }
                  className="border rounded-lg px-3 py-1.5 bg-white focus:ring-2 text-base"
                  style={{
                    borderColor: theme.BORDER,
                    color: theme.TEXT,
                    background: theme.INPUT_BG,
                    width: "55%",
                  }}
                />
                <button
                  onClick={() =>
                    handleDeleteZone(towerName, floorName, currentPath)
                  }
                  className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-2 rounded-lg transition-all duration-200 ml-2"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              {isMainZone && (
                <div className="flex items-center mt-3 ml-6 gap-2">
                  <label
                    className="text-sm font-medium"
                    style={{ color: theme.ACCENT }}
                  >
                    Sub-Zones:
                  </label>
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
                    className="border rounded-lg px-3 py-1.5 text-sm w-20"
                    style={{
                      borderColor: theme.BORDER,
                      background: theme.INPUT_BG,
                      color: theme.TEXT,
                    }}
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
                    className="px-3 py-1.5 rounded-lg text-sm font-medium flex items-center transition-all duration-200"
                    style={{
                      background: theme.ACCENT,
                      color: "#fff",
                    }}
                  >
                    <Plus size={16} className="mr-1" /> Add
                  </button>
                </div>
              )}
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
  };

  const handleSaveZones = async () => {
    if (!zoneData || !projectId) return;
    setSaving(true);
    setSaveMessage("");
    try {
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
        if (nextStep) nextStep();
      }, 1500);
    } catch (error) {
      setSaveMessage("Error saving zones. Please try again.");
      setTimeout(() => setSaveMessage(""), 3000);
    } finally {
      setSaving(false);
    }
  };

  // --- Main UI ---
  if (loading) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen"
        style={{
          background: theme.BACKGROUND,
        }}
      >
        <Loader2
          className="h-12 w-12 animate-spin mb-4"
          color={theme.ACCENT}
        />
        <div
          className="text-lg font-medium"
          style={{ color: theme.ACCENT }}
        >
          Loading zones...
        </div>
      </div>
    );
  }

  if (
    !zoneData ||
    typeof zoneData !== "object" ||
    Object.keys(zoneData).length === 0
  ) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen"
        style={{
          background: theme.BACKGROUND,
        }}
      >
        <div
          className="p-12 rounded-3xl shadow-2xl border"
          style={{
            background: theme.CARD_BG,
            borderColor: theme.BORDER,
          }}
        >
          <AlertCircle
            className="w-16 h-16 mx-auto mb-4"
            color={theme.BORDER}
          />
          <div
            className="text-xl font-medium"
            style={{ color: theme.ACCENT }}
          >
            No zones configured yet.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: theme.BACKGROUND,
      }}
    >
      <div className="p-4 sm:p-8">
        <Card
          variant="primary"
          className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4"
          theme={theme}
        >
          <div>
            <h2
              className="text-3xl md:text-4xl font-bold"
              style={{
                color: theme.ACCENT,
              }}
            >
              Zone Configuration
            </h2>
            <p
              className="mt-1"
              style={{ color: theme.TEXT }}
            >
              Manage zones and sub-zones for your project
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {saveMessage && (
              <span
                className={`text-base font-semibold px-4 py-2 rounded-lg animate-fade-in-up`}
                style={{
                  color: saveMessage.includes("Error")
                    ? theme.ERROR
                    : theme.ACCENT,
                  background: saveMessage.includes("Error")
                    ? "#ffecec"
                    : "#f5eee9",
                }}
              >
                {saveMessage}
              </span>
            )}
            <button
              onClick={handleSaveZones}
              disabled={saving}
              className="flex items-center px-6 py-3 rounded-xl font-semibold text-white shadow-lg transition-all duration-300"
              style={{
                background: saving ? theme.DISABLED : theme.ACCENT,
                color: "#fff",
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Save className="mr-2 h-5 w-5" />
              )}
              {saving ? "Saving..." : "Save Zones"}
            </button>
          </div>
        </Card>

        {/* Batch Add Zones */}
        <Card
          variant="accent"
          className="flex flex-col md:flex-row gap-4 items-center justify-between"
          theme={theme}
        >
          <div className="flex items-center gap-3 w-full">
            <input
              type="number"
              min="1"
              value={batchZoneCount}
              onChange={(e) => setBatchZoneCount(e.target.value)}
              className="border rounded-xl px-4 py-2.5 w-48 text-base font-semibold placeholder:font-semibold shadow-sm"
              style={{
                borderColor: theme.BORDER,
                background: theme.INPUT_BG,
                color: theme.TEXT,
              }}
              placeholder="Zones for ALL floors"
            />
            <button
              onClick={handleAddZonesToAll}
              className="px-5 py-2.5 rounded-xl shadow-lg flex items-center font-semibold"
              style={{
                background: theme.ACCENT,
                color: "#fff",
              }}
            >
              <Plus className="mr-2 h-5 w-5" /> Add to All Floors
            </button>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto">
          {Object.keys(zoneData).map((towerId) => (
            <Card key={towerId} theme={theme}>
              <h3
                className="text-2xl font-bold mb-6"
                style={{
                  color: theme.ACCENT,
                }}
              >
                {zoneData[towerId].details.naming_convention}
              </h3>
              {sortedFloors(zoneData[towerId]?.floors).map((floor) => {
                const key = `${zoneData[towerId].details.naming_convention}__${floor.level_name}`;
                const allZoneNames = (floor.zones || []).map((z) => z.name);
                const allSelected =
                  allZoneNames.length &&
                  selectedZones[key]?.length === allZoneNames.length;
                return (
                  <div
                    key={floor.level_name}
                    className="mb-6 p-5 rounded-2xl transition-all duration-300 hover:shadow-xl"
                    style={{
                      background: theme.CARD_BG,
                      border: `1px solid ${theme.BORDER}`,
                      color: theme.TEXT,
                    }}
                  >
                    <h4
                      className="text-lg font-bold mb-4"
                      style={{
                        color: theme.ACCENT,
                      }}
                    >
                      {floor.level_name}
                    </h4>
                    <div className="flex flex-wrap gap-2 mb-3 items-center">
                      <input
                        type="number"
                        min="1"
                        value={
                          zoneCounts[
                            `${zoneData[towerId].details.naming_convention}-${floor.level_name}`
                          ] || ""
                        }
                        onChange={(e) =>
                          setZoneCounts((prev) => ({
                            ...prev,
                            [
                              `${zoneData[towerId].details.naming_convention}-${floor.level_name}`
                            ]: e.target.value,
                          }))
                        }
                        className="border rounded-lg px-3 py-1.5 w-24 text-sm font-semibold"
                        style={{
                          borderColor: theme.BORDER,
                          background: theme.INPUT_BG,
                          color: theme.TEXT,
                        }}
                        placeholder="Add Zones"
                      />
                      <button
                        onClick={() =>
                          handleAddZones(
                            zoneData[towerId].details.naming_convention,
                            floor.level_name,
                            zoneCounts[
                              `${zoneData[towerId].details.naming_convention}-${floor.level_name}`
                            ]
                          )
                        }
                        className="font-semibold px-3 py-1.5 rounded-lg flex items-center"
                        style={{
                          background: theme.ACCENT,
                          color: "#fff",
                        }}
                        title="Add Zones"
                      >
                        <Plus size={18} className="mr-1" /> Add
                      </button>
                      <button
                        className={`ml-auto px-3 py-1.5 border rounded-lg text-sm font-medium transition-all duration-200 shadow`}
                        style={{
                          background: allSelected ? theme.ACCENT : theme.CARD_BG,
                          color: allSelected ? "#fff" : theme.ACCENT,
                          borderColor: theme.ACCENT,
                        }}
                        onClick={() =>
                          handleSelectAllZones(
                            zoneData[towerId].details.naming_convention,
                            floor.level_name,
                            allSelected,
                            allZoneNames
                          )
                        }
                      >
                        {allSelected ? "Unselect All" : "Select All"}
                      </button>
                      <button
                        disabled={!selectedZones[key] || selectedZones[key].length === 0}
                        onClick={() =>
                          handleDeleteSelectedZones(
                            zoneData[towerId].details.naming_convention,
                            floor.level_name
                          )
                        }
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 shadow`}
                        style={{
                          background:
                            !selectedZones[key] || selectedZones[key].length === 0
                              ? theme.DISABLED
                              : theme.ERROR,
                          color:
                            !selectedZones[key] || selectedZones[key].length === 0
                              ? "#aaa"
                              : "#fff",
                          cursor:
                            !selectedZones[key] || selectedZones[key].length === 0
                              ? "not-allowed"
                              : "pointer",
                        }}
                      >
                        Delete Selected
                      </button>
                    </div>
                    {/* Add subzones to all/selected zones */}
                    {floor.zones && floor.zones.length > 0 && (
                      <div className="flex items-center gap-2 mb-3 p-3 rounded-lg"
                        style={{ background: theme.INPUT_BG }}
                      >
                        <input
                          type="number"
                          min="1"
                          value={batchSubZoneCount[key] || ""}
                          onChange={(e) =>
                            setBatchSubZoneCount((prev) => ({
                              ...prev,
                              [key]: e.target.value,
                            }))
                          }
                          className="border rounded-lg px-3 py-1.5 w-24 text-sm font-semibold"
                          style={{
                            borderColor: theme.BORDER,
                            background: theme.INPUT_BG,
                            color: theme.TEXT,
                          }}
                          placeholder="Sub-zones"
                        />
                        <button
                          onClick={() =>
                            handleAddSubZonesToAll(
                              zoneData[towerId].details.naming_convention,
                              floor.level_name,
                              batchSubZoneCount[key]
                            )
                          }
                          className="px-3 py-1.5 rounded-lg text-sm font-medium"
                          style={{
                            background: theme.ACCENT,
                            color: "#fff",
                          }}
                        >
                          Add to All
                        </button>
                        <button
                          onClick={() =>
                            handleAddSubZonesToAll(
                              zoneData[towerId].details.naming_convention,
                              floor.level_name,
                              batchSubZoneCount[key],
                              true
                            )
                          }
                          className="px-3 py-1.5 rounded-lg text-sm font-medium"
                          style={{
                            background: theme.YELLOW_DARK,
                            color: "#fff",
                          }}
                        >
                          Add to Selected
                        </button>
                      </div>
                    )}
                    {(!floor?.zones || floor?.zones?.length === 0) && (
                      <div
                        className="text-sm mb-3 flex items-center gap-2 p-3 rounded-lg"
                        style={{
                          background: "#fae7e3",
                          color: theme.ERROR,
                        }}
                      >
                        <AlertCircle size={16} />
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
                );
              })}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Zone;
