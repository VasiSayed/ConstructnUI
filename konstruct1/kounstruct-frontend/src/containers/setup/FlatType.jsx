import React, { useState, useEffect, useRef } from "react";
import { IoMdAdd } from "react-icons/io";
import Select from "react-select";
import { toast } from "react-hot-toast";
import {
  createRoom,
  getRoomsByProject,
  createFlatType,
  getFlatTypes,
  updateFlatType,
} from "../../api";
import { useSelector, useDispatch } from "react-redux";
import { setRoomTypes, setFlatTypes } from "../../store/userSlice";

// Get token (adapt this to your auth method)
const getAuthToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token") || "";

function FlatType({ nextStep, previousStep }) {
  const dispatch = useDispatch();
  const projectId = useSelector((state) => state.user.selectedProject?.id);
  const flatTypesRedux = useSelector(
    (state) => state.user.flatTypes?.[projectId] || []
  );

  // Rooms State
  const [projectRooms, setProjectRooms] = useState([]);
  const [roomOptions, setRoomOptions] = useState([]);
  const [newRoom, setNewRoom] = useState("");
  const [createNewRoom, setCreateNewRoom] = useState(false);

  // Flat Type State
  const [flatTypeDetails, setFlatTypeDetails] = useState({
    flat_type: "",
    is_common: false,
    room_ids: [],
  });
  const [flatTypeList, setFlatTypeList] = useState([]);
  const [isFlatType, setIsFlatType] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Edit Flat Type State
  const [isEditFlatType, setIsEditFlatType] = useState(-1);
  const [editFlatType, setEditFlatType] = useState({
    flat_type: "",
    is_common: false,
    room_ids: [],
    id: "",
  });

  // UI State for room display
  const [showAll, setShowAll] = useState(false);
  const containerRef = useRef(null);
  const [visibleRooms, setVisibleRooms] = useState([]);

  // Safe async wrapper to handle 401s
  const safeApiCall = async (apiFunc, ...args) => {
    try {
      const token = getAuthToken();
      const res = await apiFunc(...args, token);
      return res;
    } catch (err) {
      console.error("API Call Error:", err);
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        // Optionally: redirect to login
      }
      return {
        status: err.response?.status || 500,
        data: err.response?.data || null,
      };
    }
  };

  // Fetch Rooms by Project
  const fetchRooms = async () => {
    if (!projectId) return;

    try {
      console.log("Fetching rooms for project:", projectId);
      const res = await safeApiCall(getRoomsByProject, projectId);
      console.log("Rooms API Response:", res);

      if (res.status === 200) {
        const rooms = res.data || [];
        setProjectRooms(rooms);
        setRoomOptions(rooms);
        dispatch(setRoomTypes(rooms));
        console.log("Rooms fetched successfully:", rooms);
      } else if (res.status === 401) {
        setProjectRooms([]);
        setRoomOptions([]);
      } else {
        console.error("Failed to fetch rooms, status:", res.status);
        toast.error("Failed to fetch rooms");
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
      toast.error("Failed to fetch rooms");
    }
  };

  // Fetch FlatTypes by Project - Fixed version
  const fetchFlatTypes = async () => {
    if (!projectId) {
      console.log("No projectId available for fetching flat types");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Fetching flat types for project:", projectId);
      const res = await safeApiCall(getFlatTypes, projectId);
      console.log("FlatTypes API Response:", res);

      if (res.status === 200) {
        // Handle both direct array response and nested data response
        let flatTypes = [];
        if (Array.isArray(res.data)) {
          // Direct array response from backend
          flatTypes = res.data;
        } else if (res.data && Array.isArray(res.data.data)) {
          // Nested data response
          flatTypes = res.data.data;
        } else if (
          res.data &&
          res.data.results &&
          Array.isArray(res.data.results)
        ) {
          // Paginated response
          flatTypes = res.data.results;
        } else {
          console.warn("Unexpected response format:", res.data);
          flatTypes = [];
        }

        console.log("Processed flat types:", flatTypes);
        setFlatTypeList(flatTypes);
        dispatch(setFlatTypes({ project_id: projectId, data: flatTypes }));

        if (flatTypes.length > 0) {
          console.log(`Successfully loaded ${flatTypes.length} flat types`);
        } else {
          console.log("No flat types found for this project");
        }
      } else if (res.status === 401) {
        setFlatTypeList([]);
        toast.error("Unauthorized to fetch flat types");
      } else {
        console.error("Failed to fetch flat types, status:", res.status);
        toast.error("Failed to fetch flat types");
        setFlatTypeList([]);
      }
    } catch (error) {
      console.error("Error fetching flat types:", error);
      toast.error("Error loading flat types");
      setFlatTypeList([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch on component mount and project change
  useEffect(() => {
    if (projectId) {
      console.log("Component mounted/project changed. Project ID:", projectId);
      fetchRooms();
      fetchFlatTypes();
    } else {
      console.log("No project ID available");
      setFlatTypeList([]);
      setProjectRooms([]);
      setRoomOptions([]);
    }
  }, [projectId]);

  // Update local state when Redux state changes
  useEffect(() => {
    console.log("Redux flat types updated:", flatTypesRedux);
    if (Array.isArray(flatTypesRedux)) {
      setFlatTypeList(flatTypesRedux);
    }
  }, [flatTypesRedux]);

  // Debug useEffect to monitor state changes
  useEffect(() => {
    console.log("Current flatTypeList state:", flatTypeList);
  }, [flatTypeList]);

  // Room create
  const handleAddRoom = async () => {
    if (!newRoom.trim()) {
      toast.error("Room name is required");
      return;
    }

    if (
      (roomOptions || []).some(
        (room) => room?.rooms?.toLowerCase() === newRoom.toLowerCase()
      )
    ) {
      toast.error("Room already exists");
      return;
    }

    try {
      const res = await safeApiCall(createRoom, {
        Project: projectId,
        rooms: newRoom.trim(),
      });

      if (res.status === 201 || res.status === 200) {
        toast.success("Room added successfully");
        setNewRoom("");
        setCreateNewRoom(false);
        // Refresh rooms list
        await fetchRooms();
      } else if (res.status === 401) {
        toast.error("You are not authorized to add a room.");
      } else {
        toast.error(res.data?.message || "Failed to add room");
      }
    } catch (error) {
      console.error("Error adding room:", error);
      toast.error("Error adding room");
    }
  };

  // Room options for select
  const formattedRoomOptions = (projectRooms || []).map((room) => ({
    value: room.id,
    label: room.rooms,
  }));

  // FlatType logic
  const handleFlatTypeChange = (field, value) => {
    setFlatTypeDetails({
      ...flatTypeDetails,
      [field]: value,
    });
  };

  const validateCreateFlatType = () => {
    if (!flatTypeDetails.flat_type.trim()) {
      toast.error("Flat Type name is required");
      return false;
    }
    if ((flatTypeDetails.room_ids || []).length === 0) {
      toast.error("At least one room is required");
      return false;
    }
    const isFlatTypeExists = (flatTypeList || []).find(
      (item) =>
        item.type_name?.toLowerCase() ===
        flatTypeDetails.flat_type.toLowerCase()
    );
    if (isFlatTypeExists) {
      toast.error("Flat Type already exists");
      return false;
    }
    return true;
  };

  const handleCreateFlatType = async () => {
    if (!validateCreateFlatType()) return;

    setIsLoading(true);
    try {
      const res = await safeApiCall(createFlatType, {
        project: projectId,
        type_name: flatTypeDetails.flat_type.trim(),
        rooms: (flatTypeDetails.room_ids || []).map((item) => item.value),
      });

      if (res.status === 201 || res.status === 200) {
        toast.success(res.data?.message || "Flat Type Created Successfully");

        // Reset form
        setFlatTypeDetails({
          flat_type: "",
          is_common: false,
          room_ids: [],
        });
        setIsFlatType(false);

        // Refresh flat types list to show the newly created one
        await fetchFlatTypes();
      } else if (res.status === 401) {
        toast.error("You are not authorized to create a flat type.");
      } else {
        toast.error(res.data?.message || "Error creating flat type");
      }
    } catch (error) {
      console.error("Error creating flat type:", error);
      toast.error("Error creating flat type");
    } finally {
      setIsLoading(false);
    }
  };

  // Edit logic
  const handleEditFlatType = (index) => {
    setIsEditFlatType(index);
    const flat = flatTypeList[index];
    setEditFlatType({
      id: flat.id || flat.flat_type_id,
      flat_type: flat.type_name,
      is_common: flat.is_common || false,
      room_ids: formattedRoomOptions.filter((item) =>
        (flat.rooms || []).includes(item.value)
      ),
    });
  };

  const handleUpdateFlatType = (field, value) => {
    setEditFlatType({
      ...editFlatType,
      [field]: value,
    });
  };

  const handleSaveFlatType = async () => {
    if (!editFlatType.flat_type.trim()) {
      toast.error("Flat Type name is required");
      return;
    }

    if ((editFlatType.room_ids || []).length === 0) {
      toast.error("At least one room is required");
      return;
    }

    setIsLoading(true);
    try {
      const res = await safeApiCall(updateFlatType, {
        project: projectId,
        flat_type_id: editFlatType.id,
        type_name: editFlatType.flat_type.trim(),
        rooms: (editFlatType.room_ids || []).map((item) => item.value),
      });

      if (res.status === 200) {
        toast.success(res.data?.message || "Flat Type updated successfully");
        setIsEditFlatType(-1);
        // Refresh flat types list to show the updated data
        await fetchFlatTypes();
      } else if (res.status === 401) {
        toast.error("You are not authorized to update this flat type.");
      } else {
        toast.error(res.data?.message || "Error updating flat type");
      }
    } catch (error) {
      console.error("Error updating flat type:", error);
      toast.error("Error updating flat type");
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setIsEditFlatType(-1);
    setEditFlatType({
      flat_type: "",
      is_common: false,
      room_ids: [],
      id: "",
    });
  };

  useEffect(() => {
    if (!showAll && containerRef.current) {
      const container = containerRef.current;
      const children = Array.from(container.children);
      let totalWidth = 0;
      let fitCount = 0;
      for (let child of children) {
        const style = window.getComputedStyle(child);
        const width = child.offsetWidth + parseFloat(style.marginRight || 0);
        if (totalWidth + width <= container.offsetWidth) {
          totalWidth += width;
          fitCount++;
        } else {
          break;
        }
      }
      setVisibleRooms((roomOptions || []).slice(0, fitCount));
    } else {
      setVisibleRooms(roomOptions || []);
    }
  }, [showAll, roomOptions]);

  return (
    <div className="max-w-7xl h-dvh my-1 mx-auto px-6 py-3 bg-white rounded-lg shadow-md">
      {/* Status Bar */}
      <div className="mb-4 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">
              Project {projectId}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            {(flatTypeList || []).length} Flat Types •{" "}
            {(projectRooms || []).length} Rooms
          </div>
        </div>
        {isLoading && (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span className="text-sm text-blue-600">Loading...</span>
          </div>
        )}
      </div>

      {/* Loading indicator - Removed as it's now in status bar */}

      {/* Room selection (optional for quick view) */}
      <div className="w-full mb-2 bg-gray-200 rounded-md p-3">
        <div className="flex items-center w-full">
          <div
            ref={containerRef}
            className="flex gap-2 items-center transition-all duration-300 flex-wrap"
            style={{
              width: "90%",
              overflowY: showAll ? "auto" : "hidden",
              maxHeight: showAll ? "180px" : "120px",
            }}
          >
            {(visibleRooms || []).map((option) => (
              <button
                key={option?.id}
                className="border rounded-md px-4 py-2 whitespace-nowrap bg-white text-[#3CB0E1]"
                disabled
              >
                {option?.rooms || ""}
              </button>
            ))}
            {(visibleRooms || []).length === 0 && (
              <span className="text-gray-500">No rooms available</span>
            )}
          </div>
          <div
            className="flex justify-end items-start pl-2"
            style={{ width: "10%" }}
          >
            {(roomOptions || []).length > (visibleRooms || []).length && (
              <button
                className="text-sm underline text-[#3CB0E1] whitespace-nowrap mx-5"
                onClick={() => setShowAll((prev) => !prev)}
              >
                {showAll ? "View Less" : "View More"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          className="bg-white border-2 border-gray-300 rounded-lg text-gray-700 px-4 py-2.5 flex items-center gap-2 shadow-sm hover:border-blue-400 hover:text-blue-600 transition-all duration-200"
          onClick={() => setCreateNewRoom(!createNewRoom)}
        >
          <IoMdAdd className="text-lg" />
          <span className="font-medium">New Room</span>
        </button>
        <button
          className="bg-blue-500 text-white rounded-lg px-4 py-2.5 flex items-center gap-2 shadow-sm hover:bg-blue-600 transition-all duration-200"
          onClick={() => setIsFlatType(!isFlatType)}
        >
          <IoMdAdd className="text-lg" />
          <span className="font-medium">New Flat Type</span>
        </button>
      </div>

      {/* Room creation input */}
      {createNewRoom && (
        <div className="w-full max-w-md mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Add New Room
          </h4>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={newRoom}
              onChange={(e) => setNewRoom(e.target.value)}
              placeholder="Enter room name"
              className="border border-gray-300 rounded-lg p-2.5 flex-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyPress={(e) => e.key === "Enter" && handleAddRoom()}
            />
            <button
              onClick={handleAddRoom}
              className="bg-blue-500 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-blue-600 transition-colors"
              disabled={isLoading}
            >
              Save
            </button>
            <button
              onClick={() => {
                setCreateNewRoom(false);
                setNewRoom("");
              }}
              className="border border-gray-300 text-gray-600 font-medium py-2.5 px-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Flat Types Section Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Flat Types</h2>
        <p className="text-sm text-gray-600">
          Manage your project's flat configurations and room assignments
        </p>
      </div>

      {/* FlatType create form */}
      {isFlatType && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-dashed border-blue-300 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Create New Flat Type
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Flat Type Name
              </label>
              <input
                type="text"
                value={flatTypeDetails.flat_type}
                onChange={(e) =>
                  handleFlatTypeChange("flat_type", e.target.value)
                }
                className="border border-gray-300 rounded-lg w-full p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 2BHK, 3BHK"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Rooms
              </label>
              <Select
                isMulti
                options={formattedRoomOptions}
                value={flatTypeDetails.room_ids}
                onChange={(e) => handleFlatTypeChange("room_ids", e)}
                placeholder="Choose rooms"
                className="basic-multi-select"
                classNamePrefix="select"
                closeMenuOnSelect={false}
                maxMenuHeight={150}
              />
            </div>

            <div className="flex items-end gap-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="customCheckbox"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  checked={flatTypeDetails.is_common}
                  onChange={() =>
                    handleFlatTypeChange(
                      "is_common",
                      !flatTypeDetails.is_common
                    )
                  }
                />
                <label
                  htmlFor="customCheckbox"
                  className="text-sm font-medium text-gray-700"
                >
                  Common Area
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              className="bg-blue-500 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              onClick={handleCreateFlatType}
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create Flat Type"}
            </button>
            <button
              className="border border-gray-300 text-gray-700 font-medium px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => {
                setIsFlatType(false);
                setFlatTypeDetails({
                  flat_type: "",
                  is_common: false,
                  room_ids: [],
                });
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Flat Types Table */}
      {(flatTypeList || []).length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Flat Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rooms
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(flatTypeList || []).map((flatType, index) => (
                  <tr
                    key={flatType.id || flatType.flat_type_id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isEditFlatType === index ? (
                        <input
                          type="text"
                          value={editFlatType.flat_type}
                          onChange={(e) =>
                            handleUpdateFlatType("flat_type", e.target.value)
                          }
                          className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter flat type name"
                        />
                      ) : (
                        <div className="text-sm font-medium text-gray-900">
                          {flatType.type_name || "Unnamed"}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {isEditFlatType === index ? (
                        <Select
                          isMulti
                          options={formattedRoomOptions}
                          value={editFlatType.room_ids}
                          onChange={(e) => handleUpdateFlatType("room_ids", e)}
                          placeholder="Choose rooms"
                          className="min-w-[200px]"
                          classNamePrefix="select"
                          closeMenuOnSelect={false}
                          maxMenuHeight={150}
                        />
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {(flatType.rooms || []).map((roomId, idx) => {
                            const roomLabel =
                              formattedRoomOptions.find(
                                (item) => item.value === roomId
                              )?.label || `Room ${roomId}`;
                            return (
                              <span
                                key={`${roomId}-${idx}`}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {roomLabel}
                              </span>
                            );
                          })}
                          {(!flatType.rooms || flatType.rooms.length === 0) && (
                            <span className="text-sm text-gray-500 italic">
                              No rooms assigned
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {isEditFlatType === index ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`editCheckbox-${index}`}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            checked={editFlatType.is_common}
                            onChange={() =>
                              handleUpdateFlatType(
                                "is_common",
                                !editFlatType.is_common
                              )
                            }
                          />
                          <label
                            htmlFor={`editCheckbox-${index}`}
                            className="text-sm font-medium text-gray-700"
                          >
                            Common Area
                          </label>
                        </div>
                      ) : (
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            flatType.is_common
                              ? "bg-purple-100 text-purple-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {flatType.is_common ? "Common Area" : "Regular"}
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {isEditFlatType === index ? (
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveFlatType}
                            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 text-sm"
                            disabled={isLoading}
                          >
                            {isLoading ? "Saving..." : "Save"}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEditFlatType(index)}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && (flatTypeList || []).length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            No flat types yet
          </h3>
          <p className="text-gray-600 mb-4">
            Get started by creating your first flat type configuration
          </p>
          <button
            onClick={() => setIsFlatType(true)}
            className="bg-blue-500 text-white px-6 py-2.5 rounded-lg hover:bg-blue-600 transition-colors inline-flex items-center gap-2"
          >
            <IoMdAdd className="text-lg" />
            Create Flat Type
          </button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
        <button
          className="bg-gray-500 text-white px-6 py-2.5 rounded-lg hover:bg-gray-600 transition-colors font-medium"
          onClick={previousStep}
        >
          ← Previous
        </button>
        <button
          className="bg-blue-500 text-white px-6 py-2.5 rounded-lg hover:bg-blue-600 transition-colors font-medium"
          onClick={nextStep}
        >
          Save & Continue →
        </button>
      </div>
    </div>
  );
}

export default FlatType;
