// import React, { useState } from "react";

// const Checklistdetails = ({
//   setShowForm,
//   setDetailForm,
//   checklist,
//   categoryOptions,
//   subCategoryOptions,
// }) => {
//   console.log(checklist, "CHECKLIST", subCategoryOptions, categoryOptions);

//   if (!checklist) return null;

//   const getCategoryNameById = (id) => {
//     return categoryOptions.find((option) => option.id === id)?.category;
//   };

//   const getSubCategoryNameById = (id) => {
//     return subCategoryOptions.find((option) => option.id === id)?.sub_category;
//   };

//   return (
//     <>
//       <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-md">
//         {/* Header */}
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-2 mb-6">
//             <div className="w-6 h-6 bg-purple-700 rounded-full flex items-center justify-center">
//               <svg
//                 className="w-4 h-4 text-white"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
//                 />
//               </svg>
//             </div>
//             <h1 className="text-purple-700 text-xl">Checklist Detail</h1>
//             <button
//               className="bg-gray-200 px-2 py-1 rounded justify-end text-end"
//               onClick={() => setShowForm(true)}
//             >
//               ✎
//             </button>
//           </div>
//           <button
//             className="bg-purple-700 text-white px-4 py-2 rounded"
//             onClick={() => setDetailForm(false)}
//           >
//             Back
//           </button>
//         </div>

//         {/* Info Grid */}
//         <div className="bg-white rounded p-4 mb-6 shadow-sm">
//           <div className="grid grid-cols-4 gap-4">
//             <div>
//               <div className="text-gray-500 text-sm mb-1">Category</div>
//               <div className="text-gray-700">
//                 {getCategoryNameById(checklist.checklist_category_id)}
//               </div>
//             </div>
//             <div>
//               <div className="text-gray-500 text-sm mb-1">Sub Category</div>
//               <div className="text-gray-700">
//                 {getSubCategoryNameById(checklist.checklist_sub_category_id)}
//               </div>
//             </div>
//             {/* <div>
//               <div className="text-gray-500 text-sm mb-1">
//                 Title of the Checklist
//               </div>
//               <div className="text-gray-700">
//                 Civil Finishes Checklist (Ananda)
//               </div>
//             </div> */}
//             <div>
//               <div className="text-gray-500 text-sm mb-1">No. of Questions</div>
//               <div className="text-gray-700">{checklist.questions.length}</div>
//             </div>
//           </div>
//           <div className="mt-4 flex items-center">
//             <span className="text-gray-500 text-sm mr-2">Status</span>
//             <div className="w-12 h-6 bg-green-700 rounded-full relative">
//               <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
//             </div>
//           </div>
//         </div>

//         {/* Questions */}
//         <div className="space-y-4">
//           {checklist.questions.map((question, index) => (
//             <div key={question.id} className="bg-white rounded p-4 shadow-sm">
//               <div className="flex justify-between items-start mb-4">
//                 <span className="text-gray-700">{index + 1}</span>
//                 <button className="text-gray-400 hover:text-gray-600">
//                   <svg
//                     className="w-5 h-5"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
//                     />
//                   </svg>
//                 </button>
//               </div>

//               <div className="text-gray-700 mb-4">{question.question}</div>

//               {question.options && (
//                 <div className="grid grid-cols-2 gap-4 mb-4">
//                   <div>
//                     <span className="text-gray-500 text-sm">Answer Type :</span>
//                     <span className="text-gray-700 ml-2">
//                       {question.options.length > 0 ? "Multiple Choice" : "Text"}
//                     </span>
//                   </div>
//                   <div className="flex items-center">
//                     <span className="text-gray-500 text-sm mr-2">Answers:</span>
//                     <div className="flex gap-4 text-gray-700">
//                       {question.options.map((option) => (
//                         <span key={option.value}>
//                           {option.value} ({option.submission})
//                         </span>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* <div className="flex gap-8">
//                 <div className="flex items-center gap-2">
//                   <span className="text-gray-500 text-sm">
//                     Question Mandatory
//                   </span>
//                   <div className="w-12 h-6 bg-pink-200 rounded-full relative">
//                     <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <span className="text-gray-500 text-sm">Image Mandatory</span>
//                   <div className="w-12 h-6 bg-pink-200 rounded-full relative">
//                     <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
//                   </div>
//                 </div>
//               </div> */}
//             </div>
//           ))}
//         </div>
//       </div>
//     </>
//   );
// };

// export default Checklistdetails;


import React, { useState } from "react";

const Checklistdetails = ({ setShowForm, setDetailForm, checklist }) => {
  console.log(checklist, "CHECKLIST");

  if (!checklist) return null;

  // Use the correct data structure from API response
  const questionsData = checklist.items || [];

  return (
    <>
      <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-md">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-6 h-6 bg-purple-700 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h1 className="text-purple-700 text-xl">Checklist Detail</h1>
            <button
              className="bg-gray-200 px-2 py-1 rounded justify-end text-end"
              onClick={() => setShowForm(true)}
            >
              ✎
            </button>
          </div>
          <button
            className="bg-purple-700 text-white px-4 py-2 rounded"
            onClick={() => setDetailForm(false)}
          >
            Back
          </button>
        </div>

        {/* Info Grid */}
        <div className="bg-white rounded p-4 mb-6 shadow-sm">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <div className="text-gray-500 text-sm mb-1">Checklist Name</div>
              <div className="text-gray-700">
                {checklist.name || "Unnamed Checklist"}
              </div>
            </div>
            <div>
              <div className="text-gray-500 text-sm mb-1">Category ID</div>
              <div className="text-gray-700">{checklist.category || "N/A"}</div>
            </div>
            <div>
              <div className="text-gray-500 text-sm mb-1">Project ID</div>
              <div className="text-gray-700">
                {checklist.project_id || "N/A"}
              </div>
            </div>
            <div>
              <div className="text-gray-500 text-sm mb-1">No. of Questions</div>
              <div className="text-gray-700">{questionsData.length}</div>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-gray-500 text-sm mr-2">Status</span>
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                checklist.status === "completed"
                  ? "bg-green-100 text-green-800"
                  : checklist.status === "in_progress"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {checklist.status?.replace("_", " ").toUpperCase() ||
                "NOT STARTED"}
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          {questionsData.map((question, index) => (
            <div
              key={question.id}
              className="bg-white rounded p-4 shadow-sm border"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-purple-700 font-bold text-lg">
                  {index + 1}
                </span>
                <div className="flex items-center gap-2">
                  {question.photo_required && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      📷 Photo Required
                    </span>
                  )}
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      question.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : question.status === "in_progress"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {question.status?.replace("_", " ").toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="text-gray-700 mb-4 font-medium">
                {question.title}
              </div>

              {question.options && question.options.length > 0 && (
                <div className="mb-4">
                  <div className="text-gray-500 text-sm mb-2">
                    Answer Options:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {question.options.map((option) => (
                      <span
                        key={option.id}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          option.choice === "P"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {option.name} (
                        {option.choice === "P" ? "Positive" : "Negative"})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {question.description && (
                <div className="text-gray-600 text-sm italic">
                  Description: {question.description}
                </div>
              )}
            </div>
          ))}
        </div>

        {questionsData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No questions found in this checklist.
          </div>
        )}
      </div>
    </>
  );
};

export default Checklistdetails;
