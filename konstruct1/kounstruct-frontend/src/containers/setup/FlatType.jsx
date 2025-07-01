import React, { useState, useEffect, useRef } from "react";
import { IoMdAdd } from "react-icons/io";
import Select from "react-select";
import { toast } from "react-hot-toast";
import {
  createRoom,
  getRooms,
  createFlatType,
  getFlatTypes,
  updateFlatType,
} from "../../api";
import { useSelector, useDispatch } from "react-redux";
import { setRoomTypes, setFlatTypes } from "../../store/userSlice";

function FlatType({ nextStep, previousStep }) {
  const dispatch = useDispatch();

  const projectId = useSelector((state) => state.user.selectedProject.id);
  const organizationId = useSelector((state) => state.user.organization.id);
  const companyId = useSelector((state) => state.user.company.id);
  const rooms = useSelector((state) => state.user.rooms);
  const flatTypes = useSelector(
    (state) => state.user.flatTypes?.[projectId] || []
  );

  const [selectedOptions, setSelectedOptions] = useState([]);
  const [newRoom, setNewRoom] = useState("");
  const [roomOptions, setRoomOptions] = useState([...rooms]);
  const [showAll, setShowAll] = useState(false);
  const [createNewRoom, setCreateNewRoom] = useState(false);
  const [flatTypeDetails, setFlatTypeDetails] = useState({
    flat_type: "",
    color: "",
    is_common: false,
    room_ids: [],
  });
  const [isEditFlatType, setIsEditFlatType] = useState(-1);
  const [flatTypeList, setFlatTypeList] = useState(flatTypes);
  const [editFlatType, setEditFlatType] = useState({
    flat_type: "",
    color: "",
    is_common: false,
    room_ids: [],
    id: "",
  });

  const fetchRooms = async () => {
    const response = await getRooms(companyId);
    if (response.status === 200) {
      setRoomOptions(response.data.data.rooms);
      dispatch(setRoomTypes(response.data.data.rooms));
    }
  };

  const fetchFlatTypes = async () => {
    const response = await getFlatTypes(projectId);
    if (response.status === 200) {
      console.log(response.data.data);
      setFlatTypeList(response.data.data);
      dispatch(
        setFlatTypes({
          project_id: projectId,
          data: response.data.data,
        })
      );
    }
  };

  useEffect(() => {
    if (companyId) fetchRooms();
    if (projectId) fetchFlatTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, projectId]);

  // Adding a new room
  const handleAddRoom = async () => {
    if (
      newRoom &&
      !roomOptions?.find(
        (room) => room?.room_type.toLowerCase() === newRoom.toLowerCase()
      )
    ) {
      const response = await createRoom({
        room_types: newRoom,
        company_id: companyId,
        // organization_id: organizationId,
        // project_id: projectId,
      });

      if (response.status === 200) {
        await fetchRooms();
        setNewRoom("");
      } else {
        toast.error("Failed to add room");
      }
    } else {
      toast.error("Room already exists");
    }
  };

  const handleOptionChange = (option) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter((item) => item !== option));
    } else if (selectedOptions.length < 15) {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  const visibleOptions =
    showAll && roomOptions.length > 0
      ? roomOptions
      : roomOptions.length > 0
      ? roomOptions?.slice(0, 10)
      : [];

  const formattedRoomOptions = roomOptions?.map((room) => ({
    value: room?.id,
    label: room?.room_type,
  }));

  const generateColor = (text) => {
    let hash = 2166136261; // FNV-1a 32-bit prime offset
    for (let i = 0; i < text.length; i++) {
      hash ^= text.charCodeAt(i);
      hash +=
        (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    const color = "#" + ("00000" + (hash >>> 0).toString(16)).slice(-6);
    return color;
  };

  const handleFlatTypeChange = (field, value) => {
    console.log(field, value);
    if (field === "flat_type") {
      setFlatTypeDetails({
        ...flatTypeDetails,
        color: generateColor(value),
        [field]: value,
      });
    } else {
      setFlatTypeDetails({
        ...flatTypeDetails,
        [field]: value,
      });
    }
  };

  const validateCreateFlatType = () => {
    if (flatTypeDetails.flat_type === "") {
      toast.error("Flat Type is required");
      return false;
    }
    if (flatTypeDetails.room_ids.length === 0) {
      toast.error("At least one room is required");
      return false;
    }

    const isFlatTypeExists = flatTypeList?.find(
      (item) => item.flat_type === flatTypeDetails.flat_type
    );
    if (isFlatTypeExists) {
      toast.error("Flat Type already exists");
      return false;
    }

    const isColorExists = flatTypeList?.find(
      (item) => item.color === flatTypeDetails.color
    );
    if (isColorExists) {
      toast.error("Color already exists");
      return false;
    }

    return true;
  };

  const handleCreateFlatType = async () => {
    if (!validateCreateFlatType()) return;

    const response = await createFlatType({
      ...flatTypeDetails,
      room_types: flatTypeDetails.room_ids.map((item) => item.label),
      room_ids: flatTypeDetails.room_ids.map((item) => item.value),
      project_id: projectId,
    });
    if (response.status === 200) {
      console.log(response.data.data);
      toast.success(response.data.message);
      await fetchFlatTypes();
      setFlatTypeDetails({
        flat_type: "",
        color: "",
        is_common: false,
        room_ids: [],
      });
    } else {
      toast.error(response.data.message);
    }
  };

  const handleEditFlatType = async (index) => {
    setIsEditFlatType(index);
    const flat = flatTypes[index];
    console.log(flat, "RESP FLAT");
    setEditFlatType({
      id: flat.flat_type_id,
      flat_type: flat.flat_type,
      color: flat.color,
      is_common: flat.is_common,
      room_ids: formattedRoomOptions.filter((item) =>
        flat.room_ids.includes(item.value)
      ),
    });
  };

  const handleUpdateFlatType = async (field, value) => {
    setEditFlatType({
      ...editFlatType,
      [field]: value,
    });
  };

  const handleSaveFlatType = async () => {
    setIsEditFlatType(-1);
    console.log(editFlatType, "EDIT FLAT TYPE");

    const response = await updateFlatType({
      project_id: projectId,
      flat_type_id: editFlatType.id,
      flat_type: editFlatType.flat_type,
      color: editFlatType.color,
      is_common: editFlatType.is_common,
      room_ids: editFlatType.room_ids.map((item) => item.value),
      room_types: editFlatType.room_ids.map((item) => item.label),
    });
    if (response.status === 200) {
      toast.success(response.data.message);
      await fetchFlatTypes();
    } else {
      toast.error(response.data.message);
    }
  };

  // const [showAll, setShowAll] = useState(false);
  const containerRef = useRef(null);
  // const [showAll, setShowAll] = useState(false);
  const [visibleRooms, setVisibleRooms] = useState(roomOptions);

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

      setVisibleRooms(roomOptions.slice(0, fitCount));
    } else {
      setVisibleRooms(roomOptions);
    }
  }, [showAll, roomOptions]);

  const [isFlatType, setIsFlatType] = useState(false);
  return (
    <div className="max-w-7xl h-dvh my-1 mx-auto px-6 py-3 bg-white rounded-lg shadow-md">
      {/* <h2 className="text-lg font-bold mb-4">Flat Type Setup</h2> */}
      {/* Room selection section */}
      <div className="w-full mb-2 bg-gray-200 rounded-md p-3">
        <div className="flex items-center w-full">
          {/* 90% width for room options */}
          <div
            ref={containerRef}
            className={`flex gap-2 items-center transition-all duration-300 flex-wrap`}
            style={{
              width: "90%",
              overflowY: showAll ? "auto" : "hidden", // Show scroll only when expanded
              maxHeight: showAll ? "180px" : "120px", // Limit to ~3 lines when collapsed, adjust 180px to fit your button size
            }}
          >
            {visibleRooms.map((option) => (
              <button
                key={option?.id}
                className={`border rounded-md px-4 py-2 whitespace-nowrap ${
                  selectedOptions.includes(option)
                    ? "bg-[#3CB0E1] text-white"
                    : "bg-white text-[#3CB0E1]"
                }`}
                onClick={() => handleOptionChange(option)}
              >
                {option?.room_type || ""}
              </button>
            ))}
          </div>

          {/* 10% width for toggle button */}
          <div
            className="flex justify-end items-start pl-2"
            style={{ width: "10%" }}
          >
            <button
              className="text-sm underline text-[#3CB0E1] whitespace-nowrap mx-5"
              onClick={() => setShowAll((prev) => !prev)}
            >
              {showAll ? "View Less" : "View More"}
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          className="border rounded-md text-gray-800 px-5 py-2 flex items-center gap-1 shadow-md"
          onClick={() => setCreateNewRoom(!createNewRoom)}
        >
          <IoMdAdd /> New Room
        </button>
        <button
          className="border py-2 px-5 rounded-md shadow-md flex items-center gap-2"
          onClick={() => setIsFlatType(!isFlatType)}
        >
          <IoMdAdd /> New Flat Type
        </button>
      </div>
      <div className="w-80 my-5">
        {createNewRoom && (
          <div className="flex items-center">
            <input
              type="text"
              value={newRoom}
              onChange={(e) => setNewRoom(e.target.value)}
              placeholder="Enter New Room"
              className="border rounded-md p-2 mr-2 w-full"
            />
            <button
              onClick={handleAddRoom}
              className="bg-[#3CB0E1] text-white font-bold py-2 px-4 rounded hover:bg-[#3CB0E1] whitespace-nowrap"
            >
              Save
            </button>
          </div>
        )}
      </div>
      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isFlatType && (
          <div
            className="border rounded-md w-full p-6 flex flex-col justify-between gap-y-6"
            style={{
              height: "320px",
            }}
          >
            <div className="flex gap-5 items-center">
              <div className="flex items-center">
                <input
                  type="text"
                  value={flatTypeDetails.flat_type}
                  onChange={(e) =>
                    handleFlatTypeChange("flat_type", e.target.value)
                  }
                  className="border rounded-md w-full p-2"
                  placeholder="Enter Flat Type"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="color"
                  value={flatTypeDetails.color}
                  className="w-8 h-8"
                  onChange={(e) =>
                    setFlatTypeDetails({
                      ...flatTypeDetails,
                      color: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="customCheckbox"
                  className="w-3 h-3 text-violet-500 border-gray-300 rounded focus:ring focus:ring-violet-300"
                  checked={flatTypeDetails.is_common}
                  onChange={() =>
                    handleFlatTypeChange(
                      "is_common",
                      !flatTypeDetails.is_common
                    )
                  }
                />
                <label htmlFor="customCheckbox" className="text-gray-700">
                  Common
                </label>
              </div>
            </div>
            <Select
              isMulti
              options={formattedRoomOptions}
              value={flatTypeDetails.room_ids}
              onChange={(e) => handleFlatTypeChange("room_ids", e)}
              placeholder="Select up to 15 Options"
              className="basic-multi-select"
              classNamePrefix="select"
            />
            <button
              className="border text-black font-bold px-6 py-2 text-center rounded-md w-full"
              onClick={handleCreateFlatType}
              style={{
                textAlign: "center",
              }}
            >
              Create Flat Type
            </button>
          </div>
        )}
        {flatTypes.length > 0 &&
          flatTypes.map((flatType, index) => (
            <div
              className="border rounded-md w-full p-6 flex flex-col justify-between gap-y-6 shadow-md"
              style={{ rowGap: "24px", height: "320px" }}
            >
              {isEditFlatType === index ? (
                <div className="flex gap-3 items-center">
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={editFlatType.flat_type}
                      onChange={(e) =>
                        handleUpdateFlatType("flat_type", e.target.value)
                      }
                      className="border rounded-md w-full p-2"
                      placeholder="Enter Flat Type"
                      disabled={isEditFlatType !== index}
                    />
                  </div>
                  <input
                    type="color"
                    value={editFlatType.color}
                    className="w-8 h-8"
                    disabled={isEditFlatType !== index}
                    onChange={(e) =>
                      handleUpdateFlatType("color", e.target.value)
                    }
                  />
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="customCheckbox"
                      className="w-3 h-3 text-violet-500 border-gray-300 rounded focus:ring focus:ring-violet-300"
                      checked={editFlatType.is_common}
                      onChange={() =>
                        handleUpdateFlatType(
                          "is_common",
                          !editFlatType.is_common
                        )
                      }
                      disabled={isEditFlatType !== index}
                    />
                    <label htmlFor="customCheckbox" className="text-gray-700">
                      Common
                    </label>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3 items-center">
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={flatType.flat_type}
                      className="border rounded-md w-full p-1"
                      placeholder="Enter Flat Type"
                      disabled={true}
                    />
                  </div>
                  <input
                    type="color"
                    value={flatType.color}
                    className="w-8 h-8"
                    disabled={isEditFlatType !== index}
                  />
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="customCheckbox"
                      className="w-3 h-3 text-violet-500 border-gray-300 rounded focus:ring focus:ring-violet-300"
                      checked={flatType.is_common}
                      disabled={true}
                    />
                    <label htmlFor="customCheckbox" className="text-gray-700">
                      Common
                    </label>
                  </div>
                </div>
              )}
              <div className="flex justify-center">
                {isEditFlatType === index ? (
                  <div className="w-full">
                    <Select
                      isMulti
                      options={formattedRoomOptions}
                      value={editFlatType.room_ids}
                      onChange={(e) => handleUpdateFlatType("room_ids", e)}
                      placeholder="Select up to 15 Options"
                      className="w-full"
                      classNamePrefix="select"
                      readOnly
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 max-h-40 overflow-y-auto items-center w-full gap-2 flex-wrap">
                    {flatType.room_ids?.map((room, index) => (
                      <div
                        key={room}
                        className="border rounded-md w-full px-2 py-2 text-xs"
                      >
                        {
                          formattedRoomOptions.find(
                            (item) => item.value === room
                          )?.label
                        }
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-center mt-2">
                {isEditFlatType === index ? (
                  <button
                    onClick={() => handleSaveFlatType(index)}
                    className="bg-[#3CB0E1] text-white font-bold py-2 px-6 rounded flex items-center gap-1"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => handleEditFlatType(index)}
                    className="border text-gray-500 font-medium py-1 px-6 rounded flex items-center gap-1"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          ))}
      </div>
      <div className="flex justify-between mt-6">
        <button
          className="bg-[#3CB0E1] text-white px-4 py-2 rounded-md"
          onClick={previousStep}
        >
          Previous
        </button>
        <button
          className="bg-[#3CB0E1] text-white px-4 py-2 rounded-md"
          onClick={nextStep}
        >
          Save & Proceed to Next Step
        </button>
      </div>
    </div>
  );
}

export default FlatType;
