import React, { useEffect, useState } from "react";
import { getLevelsWithFlatsByBuilding } from "../api";
import { useParams } from "react-router-dom";

function FlatMatrixTable({ towerName }) {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const { id } = useParams(); // <-- Get the building id from URL
  const buildingId = id;        

  useEffect(() => {
    console.log("FlatMatrixTable useEffect, buildingId:", buildingId);
    if (!buildingId) return;
    setLoading(true);
    setApiError(null);

    (async () => {
      try {
        const res = await getLevelsWithFlatsByBuilding(buildingId);
        console.log("Levels API response:", res.data);
        setLevels(res.data || []);
      } catch (err) {
        setApiError("Failed to fetch levels/flats.");
        setLevels([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [buildingId]);

  const maxFlats = Math.max(
    ...levels.map((level) => (level.flats || []).length),
    0
  );

  if (loading) {
    return (
      <div className="p-8 text-lg text-gray-500">Loading flat matrix…</div>
    );
  }
  if (apiError) {
    return <div className="p-8 text-red-500">{apiError}</div>;
  }
  if (!levels.length) {
    return (
      <div className="p-8 text-gray-400">
        No levels/flats found for this building.
      </div>
    );
  }

  return (
    <div className="w-full py-8">
      <div className="flex items-center mb-4">
        <span className="text-2xl font-bold text-purple-700">
          Tower : {towerName}
        </span>
      </div>
      <div className="bg-white shadow rounded-xl overflow-x-auto">
        <div className="flex">
          {/* Level names on left */}
          <div className="flex flex-col bg-gray-50 rounded-l-xl py-4 px-6 min-w-[120px]">
            {levels.map((level) => (
              <div
                key={level.id}
                className="h-14 flex items-center justify-center text-lg font-medium text-gray-700 mb-2"
                style={{ minHeight: "3rem" }}
              >
                {level.name}
              </div>
            ))}
          </div>
          {/* Flats grid */}
          <div className="flex-1 w-full">
            {levels.map((level) => (
              <div
                key={level.id}
                className="flex gap-6 items-center h-14 mb-2"
                style={{ minHeight: "3rem" }}
              >
                {(level.flats || []).map((flat) => (
                  <div
                    key={flat.id}
                    className="bg-white border rounded text-center min-w-[100px] py-2 text-base font-medium flex flex-col items-center"
                  >
                    <span>
                      {flat.number}
                      {flat.flattype?.type_name && (
                        <span className="text-xs text-gray-500 ml-1 align-bottom">
                          {flat.flattype.type_name}
                        </span>
                      )}
                    </span>
                  </div>
                ))}
                {/* If fewer flats, fill empty */}
                {Array(maxFlats - (level.flats || []).length)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="bg-gray-100 border rounded min-w-[100px] py-2"
                    />
                  ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Debug: show JSON if needed */}
      {/* <pre>{JSON.stringify(levels, null, 2)}</pre> */}
    </div>
  );
}

export default FlatMatrixTable;
