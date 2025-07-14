import React, { useEffect, useState } from "react";
import { getLevelsWithFlatsByBuilding } from "../api";
import { useParams } from "react-router-dom";
import { useTheme } from "../ThemeContext";

const palette = {
  light: {
    bg: "bg-white",
    header: "bg-gray-50 text-gray-700",
    border: "border-gray-200",
    cell: "bg-white text-gray-800",
    cellAlt: "bg-gray-100 text-gray-700",
    level: "bg-gray-50 text-purple-700",
    shadow: "shadow-lg",
    highlight: "bg-blue-50 text-blue-700",
    flatType: "text-blue-600",
  },
  dark: {
    bg: "bg-[#23232e]",
    header: "bg-[#1a1a24] text-yellow-200",
    border: "border-yellow-900",
    cell: "bg-[#29293e] text-yellow-100",
    cellAlt: "bg-[#23232e] text-yellow-300",
    level: "bg-[#1a1a24] text-yellow-400",
    shadow: "shadow-2xl",
    highlight: "bg-yellow-800 text-yellow-200",
    flatType: "text-yellow-200",
  },
};

function FlatMatrixTable({ towerName = "B" }) {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const { id } = useParams();
  const { theme } = useTheme();

  const p = palette[theme === "dark" ? "dark" : "light"];

  useEffect(() => {
    setLoading(true);
    setApiError(null);
    (async () => {
      try {
        const res = await getLevelsWithFlatsByBuilding(id);
        setLevels(res.data || []);
      } catch {
        setApiError("Failed to fetch levels/flats.");
        setLevels([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const maxFlats = Math.max(...levels.map((l) => (l.flats || []).length), 0);

  if (loading)
    return (
      <div className={`py-12 text-center text-xl font-semibold ${p.header}`}>
        Loading...
      </div>
    );
  if (apiError)
    return (
      <div className={`py-12 text-center text-xl font-semibold text-red-600`}>
        {apiError}
      </div>
    );
  if (!levels.length)
    return (
      <div className={`py-12 text-center text-lg font-semibold ${p.header}`}>
        No data
      </div>
    );

  return (
    <div className={`w-full py-8 px-8 ${p.bg} min-h-screen transition-colors`}>
      <div className="flex items-center mb-6">
        <span className={`text-2xl font-bold ${p.level}`}>
          Tower : {towerName}
        </span>
      </div>

      <div
        className={`${p.bg} ${p.shadow} rounded-xl overflow-hidden border ${p.border} mx-4 transition-all`}
      >
        <table className="w-full">
          <thead>
            <tr className={p.header}>
              <th
                className={`text-left py-5 px-8 font-medium border-r ${p.border} min-w-[140px]`}
              >
                Level
              </th>
              {maxFlats > 0 &&
                Array(maxFlats)
                  .fill(0)
                  .map((_, colIndex) => (
                    <th
                      key={colIndex}
                      className={`text-center py-5 px-8 font-medium border-r ${p.border} last:border-r-0 min-w-[140px]`}
                    >
                      Unit {colIndex + 1}
                    </th>
                  ))}
            </tr>
          </thead>
          <tbody>
            {levels.map((level) => (
              <tr key={level.id} className={`border-t ${p.border}`}>
                <td
                  className={`py-5 px-8 font-semibold ${p.level} border-r ${p.border}`}
                >
                  {level.name}
                </td>
                {Array(maxFlats)
                  .fill(0)
                  .map((_, colIndex) => {
                    const flat = (level.flats || [])[colIndex];
                    return (
                      <td
                        key={colIndex}
                        className={`py-5 px-8 text-center border-r ${p.border} last:border-r-0`}
                      >
                        {flat ? (
                          <div
                            className={`rounded-lg py-3 px-4 text-center border ${p.border} ${p.cell} hover:${p.highlight} transition-shadow duration-150`}
                          >
                            <div
                              className={`font-semibold text-lg ${
                                theme === "dark"
                                  ? "text-yellow-100"
                                  : "text-gray-800"
                              }`}
                            >
                              {flat.number}
                            </div>
                            {flat.flattype?.type_name && (
                              <div
                                className={`text-xs mt-1 font-medium ${p.flatType}`}
                              >
                                {flat.flattype.type_name}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div
                            className={`${p.cellAlt} border ${p.border} rounded-lg py-3 px-4 h-16`}
                          ></div>
                        )}
                      </td>
                    );
                  })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default FlatMatrixTable;
