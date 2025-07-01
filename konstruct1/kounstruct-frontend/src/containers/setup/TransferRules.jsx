import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { createTransferRule, getTransferRules } from "../../api";
import { toast } from "react-hot-toast";

function TransferRules({ nextStep, previousStep }) {
  const projectId = useSelector((state) => state.user.selectedProject.id);

  const [selectedLevel, setSelectedLevel] = useState("question_level");

  useEffect(() => {
    const fetchTransferRules = async () => {
      const response = await getTransferRules(projectId);
      console.log(response.data, "RESPONSE");
      if (response.status === 200) {
        const transferRule = response.data.data?.["Transfer-Rule"][0];
        if (transferRule) {
          const matchingRule = Object.keys(transferRule).find(
            (key) => transferRule[key] === true
          );
          if (matchingRule) {
            setSelectedLevel(matchingRule);
          }
        }

        toast.success(response.data.message);
      }
    };
    fetchTransferRules();
  }, [projectId]);

  const handleSubmit = async () => {
    const data = {
      project_id: projectId,
      flat_level: selectedLevel === "flat_level",
      room_level: selectedLevel === "room_level",
      checklist_level: selectedLevel === "checklist_level",
      question_level: selectedLevel === "question_level",
    };
    const response = await createTransferRule(data);
    if (response.status === 200) {
      toast.success(response.data.message);
      nextStep();
    } else {
      toast.error(response.data.message);
    }
  };

  const handleSelection = (event) => {
    setSelectedLevel(event.target.value);
    console.log(event.target.value);
  };
  return (
    <div className="max-w-7xl h-dvh my-1 mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="bg-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-green-700">
          Note :
        </h2>

        <p className=" text-gray-600 mb-8 text-justify text-xl">
          You have the option to select the transfer at Question-level /
          Checklist-level . For Example: If you choose Question-level, the
          moment a question has a positive answer it will be transferred to the
          next level. If you choose to transfer at the checklist level, a
          checklist will move to the next level only after all the Questions in
          the checklist have marked positive.
        </p>

        <form className="mb-8">
          <div className="flex flex-col-10 gap-4">
            <label className="flex items-center justify-between space-x-3 py-2 border border-gray-200 rounded-md px-4">
              <input
                type="radio"
                name="flat_level"
                value="flat_level"
                checked={selectedLevel === "flat_level"}
                onChange={handleSelection}
                className="form-radio h-4 w-4 text-green-600"
              />
              <span className="text-gray-700 text-xl">Flat Level</span>
            </label>

            <label className="flex items-center justify-between space-x-3 py-2 border border-gray-200 rounded-md px-4">
              <input
                type="radio"
                name="room_level"
                value="room_level"
                checked={selectedLevel === "room_level"}
                onChange={handleSelection}
                className="form-radio h-4 w-4 text-green-600"
              />
              <span className="text-gray-700 text-xl">Room Level</span>
            </label>

            <label className="flex items-center justify-between space-x-3 py-2 border border-gray-200 rounded-md px-4">
              <input
                type="radio"
                name="checklist_level"
                value="checklist_level"
                checked={selectedLevel === "checklist_level"}
                onChange={handleSelection}
                className="form-radio h-4 w-4 text-green-600"
              />
              <span className="text-gray-700 text-xl">Checklist Level</span>
            </label>

            <label className="flex items-center justify-between space-x-3 py-2 border border-gray-200 rounded-md px-4">
              <input
                type="radio"
                name="question_level"
                value="question_level"
                checked={selectedLevel === "question_level"}
                onChange={handleSelection}
                className="form-radio h-4 w-4 text-green-600"
              />
              <span className="text-gray-700 text-xl">Question Level</span>
            </label>
          </div>
        </form>

        <div className="flex justify-between">
          <button
            className="bg-gray-400 text-white px-4 py-2 mt-2 rounded-md"
            onClick={previousStep}
          >
            Previous
          </button>
          <button
            onClick={handleSubmit}
            className="bg-[#3CB0E1] text-white px-4 py-2 rounded-md"
          >
            Submit
          </button>

          {/* Display Success Message */}
          {/* {successMessage && (
            <div className="mt-4 text-green-600 font-semibold">
              {successMessage}
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
}

export default TransferRules;
