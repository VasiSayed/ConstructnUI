// import React, { useEffect, useState } from "react";
// import SiteBarHome from "./SiteBarHome";
// import { projectInstance, NEWchecklistInstance } from "../api/axiosInstance";

// function PendingForMakerItems() {
//   const [projects, setProjects] = useState([]);
//   const [selectedProjectId, setSelectedProjectId] = useState("");
//   const [loadingProjects, setLoadingProjects] = useState(true);
//   const [error, setError] = useState(null);

//   // Pending items state
//   const [pendingItems, setPendingItems] = useState([]);
//   const [loadingItems, setLoadingItems] = useState(false);
//   const [itemsError, setItemsError] = useState(null);

//   // Grouping state
//   const [groupBy, setGroupBy] = useState("checklist"); // 'checklist' | 'status' | 'none'
//   const [expandedGroups, setExpandedGroups] = useState({});

//   // Item states for submission
//   const [itemStates, setItemStates] = useState({});
//   // Structure: {
//   //   [itemId]: {
//   //     remarks: '',
//   //     photoFile: null,
//   //     photoPreview: null,
//   //     isSubmitting: false,
//   //     submitted: false,
//   //     error: null
//   //   }
//   // }

//   // Get user/maker accesses from localStorage
//   const accessesStr = localStorage.getItem("ACCESSES");
//   const accesses = accessesStr ? JSON.parse(accessesStr) : [];

//   // Initialize item states
//   const initializeItemStates = (items) => {
//     const newStates = {};
//     items.forEach((item) => {
//       if (!itemStates[item.id]) {
//         newStates[item.id] = {
//           remarks: "",
//           photoFile: null,
//           photoPreview: null,
//           isSubmitting: false,
//           submitted: false,
//           error: null,
//         };
//       }
//     });
//     setItemStates((prev) => ({ ...prev, ...newStates }));
//   };

//   // Fetch pending for maker items
//   const fetchPendingItems = async () => {
//     if (!selectedProjectId) {
//       setPendingItems([]);
//       return;
//     }

//     setLoadingItems(true);
//     setItemsError(null);
//     try {
//       const res = await NEWchecklistInstance.get(`/pending-for-maker/`, {
//         params: { project_id: selectedProjectId },
//         headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
//       });

//       const items = Array.isArray(res.data) ? res.data : [];
//       setPendingItems(items);
//       initializeItemStates(items);
//     } catch (err) {
//       console.error("Pending items fetch error:", err);
//       setItemsError("Failed to load pending items");
//       setPendingItems([]);
//     } finally {
//       setLoadingItems(false);
//     }
//   };

//   // Fetch projects
//   useEffect(() => {
//     async function fetchProjects() {
//       setLoadingProjects(true);
//       setError(null);
//       try {
//         const userProjects = accesses
//           .filter((a) => a.active)
//           .map((a) => Number(a.project_id));

//         const res = await projectInstance.get("/projects/", {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("access")}`,
//           },
//         });

//         const allProjects = Array.isArray(res.data)
//           ? res.data
//           : res.data.results || [];

//         const filtered = allProjects.filter((p) => userProjects.includes(p.id));

//         setProjects(filtered);
//         if (filtered.length > 0 && !selectedProjectId) {
//           setSelectedProjectId(filtered[0].id);
//         }
//       } catch (err) {
//         setError("Failed to load projects");
//         setProjects([]);
//       } finally {
//         setLoadingProjects(false);
//       }
//     }

//     if (accesses.length > 0) {
//       fetchProjects();
//     }
//   }, []);

//   // Fetch pending items when project changes
//   useEffect(() => {
//     fetchPendingItems();
//     setExpandedGroups({});
//   }, [selectedProjectId]);

//   // Group items by checklist
//   const getGroupedItems = () => {
//     if (groupBy === "none") {
//       return { "All Items": pendingItems };
//     }

//     const grouped = {};
//     pendingItems.forEach((item) => {
//       let key;
//       if (groupBy === "checklist") {
//         key = item.checklist_details?.name || `Checklist ${item.checklist}`;
//       } else if (groupBy === "status") {
//         key = item.status || "Unknown Status";
//       }

//       if (!grouped[key]) {
//         grouped[key] = [];
//       }
//       grouped[key].push(item);
//     });
//     return grouped;
//   };

//   // Toggle group expansion
//   const toggleGroup = (groupName) => {
//     setExpandedGroups((prev) => ({
//       ...prev,
//       [groupName]: !prev[groupName],
//     }));
//   };

//   // Handle photo upload
//   const handlePhotoUpload = (itemId, file) => {
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setItemStates((prev) => ({
//           ...prev,
//           [itemId]: {
//             ...prev[itemId],
//             photoFile: file,
//             photoPreview: reader.result,
//           },
//         }));
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   // Remove photo
//   const removePhoto = (itemId) => {
//     setItemStates((prev) => ({
//       ...prev,
//       [itemId]: {
//         ...prev[itemId],
//         photoFile: null,
//         photoPreview: null,
//       },
//     }));
//   };

//   // Handle remarks change
//   const handleRemarksChange = (itemId, remarks) => {
//     setItemStates((prev) => ({
//       ...prev,
//       [itemId]: {
//         ...prev[itemId],
//         remarks: remarks,
//       },
//     }));
//   };

//   // Submit item (maker submission)
//   const submitItem = async (itemId) => {
//     const itemState = itemStates[itemId];
//     const item = pendingItems.find((i) => i.id === itemId);

//     // Validation - removed photo requirement check since API doesn't handle photos
//     if (!itemState?.remarks?.trim()) {
//       setItemStates((prev) => ({
//         ...prev,
//         [itemId]: {
//           ...prev[itemId],
//           error: "Please provide fix description/remarks",
//         },
//       }));
//       return;
//     }

//     // Start submitting
//     setItemStates((prev) => ({
//       ...prev,
//       [itemId]: {
//         ...prev[itemId],
//         isSubmitting: true,
//         error: null,
//       },
//     }));

//     try {
//       // Call the mark-as-done-maker API
//       const response = await NEWchecklistInstance.post(
//         "/mark-as-done-maker/",
//         {
//           checklist_item_id: itemId,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("access")}`,
//           },
//         }
//       );

//       // Success
//       setItemStates((prev) => ({
//         ...prev,
//         [itemId]: {
//           ...prev[itemId],
//           isSubmitting: false,
//           submitted: true,
//           error: null,
//         },
//       }));

//       // Log the response for debugging
//       console.log("Maker submission response:", response.data);

//       // Refresh the list after a short delay
//       setTimeout(() => {
//         fetchPendingItems();
//       }, 2000);
//     } catch (error) {
//       console.error("Submit error:", error);
//       setItemStates((prev) => ({
//         ...prev,
//         [itemId]: {
//           ...prev[itemId],
//           isSubmitting: false,
//           error:
//             error.response?.data?.detail ||
//             "Failed to submit. Please try again.",
//         },
//       }));
//     }
//   };

//   // Get statistics
//   const getStats = () => {
//     const total = pendingItems.length;
//     const submitted = Object.values(itemStates).filter(
//       (s) => s.submitted
//     ).length;
//     const withPhotos = Object.values(itemStates).filter(
//       (s) => s.photoFile
//     ).length;
//     return { total, submitted, pending: total - submitted, withPhotos };
//   };

//   const stats = getStats();
//   const groupedItems = getGroupedItems();

//   return (
//     <div className="flex min-h-screen bg-gray-50">
//       <SiteBarHome />
//       <main className="ml-[15%] w-full p-6">
//         <h2 className="text-2xl font-bold mb-4">
//           Pending for Maker - Fix Required Items
//         </h2>

//         {/* Project Dropdown */}
//         <div className="mb-6">
//           <label className="block mb-2 font-semibold">Select Project:</label>
//           {loadingProjects ? (
//             <p>Loading projects...</p>
//           ) : error ? (
//             <p className="text-red-500">{error}</p>
//           ) : (
//             <select
//               className="p-2 border rounded"
//               value={selectedProjectId}
//               onChange={(e) => setSelectedProjectId(Number(e.target.value))}
//               disabled={projects.length === 0}
//             >
//               {projects.length === 0 && <option>No projects</option>}
//               {projects.map((p) => (
//                 <option key={p.id} value={p.id}>
//                   {p.name || `Project #${p.id}`}
//                 </option>
//               ))}
//             </select>
//           )}
//         </div>

//         {/* Selected Project Info */}
//         {selectedProjectId && (
//           <div className="bg-white rounded-lg shadow p-4 mb-6">
//             <div className="flex justify-between items-center">
//               <div>
//                 <h3 className="font-semibold mb-2">Selected Project:</h3>
//                 <p>Project ID: {selectedProjectId}</p>
//                 <p>
//                   Project Name:{" "}
//                   {projects.find((p) => p.id === selectedProjectId)?.name ||
//                     "N/A"}
//                 </p>
//               </div>
//               <div className="text-right">
//                 <div className="text-sm bg-orange-100 rounded-lg px-3 py-2">
//                   <span className="font-medium">Items to Fix: </span>
//                   <span className="text-orange-600 font-bold">
//                     {stats.total}
//                   </span>
//                   {stats.submitted > 0 && (
//                     <>
//                       <span className="mx-1">|</span>
//                       <span className="text-green-600">
//                         {stats.submitted} submitted
//                       </span>
//                     </>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Grouping Controls */}
//         <div className="mb-4 flex items-center gap-4">
//           <label className="font-medium">Group by:</label>
//           <div className="flex gap-2">
//             <button
//               onClick={() => setGroupBy("checklist")}
//               className={`px-3 py-1 rounded ${
//                 groupBy === "checklist"
//                   ? "bg-blue-600 text-white"
//                   : "bg-gray-200 hover:bg-gray-300"
//               }`}
//             >
//               Checklist
//             </button>
//             <button
//               onClick={() => setGroupBy("status")}
//               className={`px-3 py-1 rounded ${
//                 groupBy === "status"
//                   ? "bg-blue-600 text-white"
//                   : "bg-gray-200 hover:bg-gray-300"
//               }`}
//             >
//               Status
//             </button>
//             <button
//               onClick={() => setGroupBy("none")}
//               className={`px-3 py-1 rounded ${
//                 groupBy === "none"
//                   ? "bg-blue-600 text-white"
//                   : "bg-gray-200 hover:bg-gray-300"
//               }`}
//             >
//               No Grouping
//             </button>
//           </div>
//         </div>

//         {/* Main Content */}
//         {loadingItems ? (
//           <div className="bg-white rounded-lg shadow p-6">
//             <p>Loading pending items...</p>
//           </div>
//         ) : itemsError ? (
//           <div className="bg-white rounded-lg shadow p-6">
//             <p className="text-red-500">{itemsError}</p>
//           </div>
//         ) : pendingItems.length === 0 ? (
//           <div className="bg-white rounded-lg shadow p-6">
//             <p className="text-gray-600">No pending items for this project.</p>
//           </div>
//         ) : (
//           <div className="space-y-4">
//             {Object.entries(groupedItems).map(([groupName, items]) => (
//               <div key={groupName} className="bg-white rounded-lg shadow">
//                 {/* Group Header */}
//                 {groupBy !== "none" && (
//                   <div
//                     className="px-6 py-4 border-b cursor-pointer hover:bg-gray-50"
//                     onClick={() => toggleGroup(groupName)}
//                   >
//                     <div className="flex justify-between items-center">
//                       <h3 className="text-lg font-semibold flex items-center gap-2">
//                         <svg
//                           className={`w-5 h-5 transition-transform ${
//                             expandedGroups[groupName] ? "rotate-90" : ""
//                           }`}
//                           fill="currentColor"
//                           viewBox="0 0 20 20"
//                         >
//                           <path
//                             fillRule="evenodd"
//                             d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
//                             clipRule="evenodd"
//                           />
//                         </svg>
//                         {groupName}
//                       </h3>
//                       <span className="text-sm text-gray-600">
//                         {items.length} item{items.length !== 1 ? "s" : ""}
//                       </span>
//                     </div>
//                   </div>
//                 )}

//                 {/* Group Items */}
//                 {(groupBy === "none" || expandedGroups[groupName]) && (
//                   <div className="p-6 space-y-4">
//                     {items.map((item, index) => {
//                       const itemState = itemStates[item.id] || {};
//                       const isSubmitted = itemState.submitted;
//                       const lastSubmission = item.submissions?.find(
//                         (sub) =>
//                           sub.status === "rejected_by_checker" ||
//                           sub.status === "rejected_by_supervisor"
//                       );

//                       return (
//                         <div
//                           key={item.id}
//                           className={`border-2 rounded-lg p-4 transition-all ${
//                             isSubmitted
//                               ? "border-green-300 bg-green-50"
//                               : "border-red-300 bg-red-50"
//                           }`}
//                         >
//                           {/* Item Header */}
//                           <div className="flex justify-between items-start mb-3">
//                             <div className="flex-1">
//                               <h5 className="font-semibold text-lg flex items-center gap-2">
//                                 <span className="bg-red-600 text-white px-2 py-1 rounded text-xs">
//                                   Fix Required
//                                 </span>
//                                 {item.title || `Item ${item.id}`}
//                                 {isSubmitted && (
//                                   <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
//                                     ✓ Fixed & Submitted
//                                   </span>
//                                 )}
//                               </h5>
//                               <div className="text-sm text-gray-600 mt-1">
//                                 <span>Status: {item.status}</span>
//                                 <span className="mx-2">•</span>
//                                 <span>
//                                   Photo:{" "}
//                                   <span
//                                     className={
//                                       item.photo_required
//                                         ? "text-red-600 font-semibold"
//                                         : ""
//                                     }
//                                   >
//                                     {item.photo_required
//                                       ? "Required"
//                                       : "Optional"}
//                                   </span>
//                                 </span>
//                                 {item.checklist_details?.name && (
//                                   <>
//                                     <span className="mx-2">•</span>
//                                     <span>
//                                       Checklist: {item.checklist_details.name}
//                                     </span>
//                                   </>
//                                 )}
//                               </div>
//                               {item.description && (
//                                 <p className="text-sm text-gray-700 mt-2 italic">
//                                   {item.description}
//                                 </p>
//                               )}
//                             </div>
//                             <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs ml-4">
//                               ID: {item.id}
//                             </span>
//                           </div>

//                           {/* Rejection Details */}
//                           {lastSubmission && (
//                             <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
//                               <h6 className="font-semibold text-sm mb-1">
//                                 Rejection Details:
//                               </h6>
//                               <div className="text-sm text-gray-700">
//                                 <p>
//                                   <strong>Rejected by:</strong>{" "}
//                                   {lastSubmission.status ===
//                                   "rejected_by_checker"
//                                     ? "Checker"
//                                     : "Supervisor"}
//                                 </p>
//                                 {lastSubmission.remarks && (
//                                   <p>
//                                     <strong>Reason:</strong>{" "}
//                                     {lastSubmission.remarks}
//                                   </p>
//                                 )}
//                                 {lastSubmission.checked_at && (
//                                   <p>
//                                     <strong>Date:</strong>{" "}
//                                     {new Date(
//                                       lastSubmission.checked_at
//                                     ).toLocaleDateString()}
//                                   </p>
//                                 )}
//                               </div>
//                             </div>
//                           )}

//                           {!isSubmitted ? (
//                             <>
//                               {/* Fix Description */}
//                               <div className="mb-4">
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                                   Fix Description / Remarks
//                                   <span className="text-red-600 ml-1">*</span>
//                                 </label>
//                                 <textarea
//                                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                   rows="3"
//                                   placeholder="Describe what you fixed or changed..."
//                                   value={itemState.remarks || ""}
//                                   onChange={(e) =>
//                                     handleRemarksChange(item.id, e.target.value)
//                                   }
//                                   required
//                                 />
//                               </div>

//                               {/* Photo Upload */}
//                               <div className="mb-4">
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                                   Photo of Fixed Work
//                                   {item.photo_required && (
//                                     <span className="text-red-600 ml-1">
//                                       *Required
//                                     </span>
//                                   )}
//                                 </label>
//                                 {!itemState.photoPreview ? (
//                                   <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
//                                     <input
//                                       type="file"
//                                       accept="image/*"
//                                       onChange={(e) =>
//                                         handlePhotoUpload(
//                                           item.id,
//                                           e.target.files[0]
//                                         )
//                                       }
//                                       className="hidden"
//                                       id={`photo-${item.id}`}
//                                     />
//                                     <label
//                                       htmlFor={`photo-${item.id}`}
//                                       className="cursor-pointer"
//                                     >
//                                       <svg
//                                         className="mx-auto h-12 w-12 text-gray-400"
//                                         stroke="currentColor"
//                                         fill="none"
//                                         viewBox="0 0 48 48"
//                                       >
//                                         <path
//                                           d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
//                                           strokeWidth="2"
//                                           strokeLinecap="round"
//                                           strokeLinejoin="round"
//                                         />
//                                       </svg>
//                                       <p className="mt-2 text-sm text-gray-600">
//                                         Click to upload photo of fixed work
//                                       </p>
//                                     </label>
//                                   </div>
//                                 ) : (
//                                   <div className="relative">
//                                     <img
//                                       src={itemState.photoPreview}
//                                       alt="Preview"
//                                       className="w-full h-48 object-cover rounded-lg"
//                                     />
//                                     <button
//                                       onClick={() => removePhoto(item.id)}
//                                       className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
//                                     >
//                                       <svg
//                                         className="w-4 h-4"
//                                         fill="none"
//                                         stroke="currentColor"
//                                         viewBox="0 0 24 24"
//                                       >
//                                         <path
//                                           strokeLinecap="round"
//                                           strokeLinejoin="round"
//                                           strokeWidth="2"
//                                           d="M6 18L18 6M6 6l12 12"
//                                         />
//                                       </svg>
//                                     </button>
//                                   </div>
//                                 )}
//                               </div>

//                               {/* Error Message */}
//                               {itemState.error && (
//                                 <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
//                                   {itemState.error}
//                                 </div>
//                               )}

//                               {/* Submit Button */}
//                               <div className="flex justify-end gap-3">
//                                 <button
//                                   onClick={() => submitItem(item.id)}
//                                   disabled={
//                                     itemState.isSubmitting ||
//                                     !itemState.remarks?.trim()
//                                   }
//                                   className={`px-6 py-2 rounded-lg font-semibold transition-all ${
//                                     itemState.isSubmitting
//                                       ? "bg-gray-400 cursor-not-allowed"
//                                       : !itemState.remarks?.trim()
//                                       ? "bg-gray-300 cursor-not-allowed"
//                                       : "bg-blue-600 hover:bg-blue-700 text-white"
//                                   }`}
//                                 >
//                                   {itemState.isSubmitting ? (
//                                     <span className="flex items-center">
//                                       <svg
//                                         className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
//                                         xmlns="http://www.w3.org/2000/svg"
//                                         fill="none"
//                                         viewBox="0 0 24 24"
//                                       >
//                                         <circle
//                                           className="opacity-25"
//                                           cx="12"
//                                           cy="12"
//                                           r="10"
//                                           stroke="currentColor"
//                                           strokeWidth="4"
//                                         ></circle>
//                                         <path
//                                           className="opacity-75"
//                                           fill="currentColor"
//                                           d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                                         ></path>
//                                       </svg>
//                                       Submitting Fix...
//                                     </span>
//                                   ) : (
//                                     "Submit Fixed Item"
//                                   )}
//                                 </button>
//                               </div>
//                             </>
//                           ) : (
//                             <div className="text-center py-4">
//                               <div className="text-green-600 font-semibold text-lg mb-2">
//                                 ✓ Fix Submitted Successfully
//                               </div>
//                               <p className="text-sm text-gray-600">
//                                 This item has been fixed and resubmitted for
//                                 review.
//                               </p>
//                             </div>
//                           )}
//                         </div>
//                       );
//                     })}
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         )}

//         {/* Summary */}
//         {stats.total > 0 && (
//           <div className="mt-6 p-4 bg-orange-50 rounded-lg">
//             <div className="flex justify-between items-center">
//               <div className="text-sm text-gray-700">
//                 <strong>Summary:</strong> {stats.submitted} of {stats.total}{" "}
//                 items fixed
//                 {stats.pending > 0 && ` • ${stats.pending} remaining`}
//               </div>
//               {stats.submitted === stats.total && (
//                 <div className="text-green-600 font-semibold">
//                   ✓ All items have been fixed!
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }

// export default PendingForMakerItems;
import React, { useEffect, useState } from "react";
import SiteBarHome from "./SiteBarHome";
import { projectInstance, NEWchecklistInstance } from "../api/axiosInstance";

function PendingForMakerItems() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [error, setError] = useState(null);

  // Updated state to handle both assigned and available items
  const [assignedItems, setAssignedItems] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [itemsError, setItemsError] = useState(null);

  // Status filter state
  const [statusFilter, setStatusFilter] = useState("all");

  // New state for view mode
  const [viewMode, setViewMode] = useState("assigned"); // 'assigned' | 'available' | 'all'

  // Navigation state for single page navigation
  const [currentView, setCurrentView] = useState("items"); // 'items' | 'details'
  const [selectedItem, setSelectedItem] = useState(null);

  // Grouping state
  const [groupBy, setGroupBy] = useState("checklist"); // 'checklist' | 'status' | 'none'
  const [expandedGroups, setExpandedGroups] = useState({});

  // Item states for submission
  const [itemStates, setItemStates] = useState({});

  // Get user/maker accesses from localStorage
  const accessesStr = localStorage.getItem("ACCESSES");
  const accesses = accessesStr ? JSON.parse(accessesStr) : [];

  // Get current items based on view mode
  const getCurrentItems = () => {
    switch (viewMode) {
      case "assigned":
        return assignedItems;
      case "available":
        return availableItems;
      case "all":
        return [...assignedItems, ...availableItems];
      default:
        return assignedItems;
    }
  };

  // Initialize item states
  const initializeItemStates = (items) => {
    const newStates = {};
    items.forEach((item) => {
      if (!itemStates[item.id]) {
        newStates[item.id] = {
          remarks: "",
          photoFile: null,
          photoPreview: null,
          isSubmitting: false,
          submitted: false,
          error: null,
        };
      }
    });
    setItemStates((prev) => ({ ...prev, ...newStates }));
  };

  // Filter items by status
  const filteredItems =
    statusFilter === "all"
      ? getCurrentItems()
      : getCurrentItems().filter((item) => item.status === statusFilter);

  // Status options for filter (only relevant for maker)
  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "pending_for_maker", label: "Pending for Maker" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
  ];

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "pending_for_maker":
        return "bg-red-100 text-red-700";
      case "rejected_by_checker":
        return "bg-orange-100 text-orange-700";
      case "rejected_by_supervisor":
        return "bg-purple-100 text-purple-700";
      case "created":
        return "bg-blue-100 text-blue-700";
      case "in_progress":
        return "bg-yellow-100 text-yellow-700";
      case "completed":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Reset when filter changes
  useEffect(() => {
    if (currentView !== "items") {
      setCurrentView("items");
      setSelectedItem(null);
    }
  }, [statusFilter, viewMode]);

  // Fetch pending for maker items
  const fetchPendingItems = async () => {
    if (!selectedProjectId) {
      setAssignedItems([]);
      setAvailableItems([]);
      return;
    }

    setLoadingItems(true);
    setItemsError(null);
    try {
      const res = await NEWchecklistInstance.get(`/pending-for-maker/`, {
        params: { project_id: selectedProjectId },
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      });

      console.log("API Response:", res.data);

      // FIXED: Handle both assigned_to_me and available_for_me
      const assignedData = res.data?.assigned_to_me || [];
      const availableData = res.data?.available_for_me || [];

      console.log("Assigned items:", assignedData);
      console.log("Available items:", availableData);

      setAssignedItems(assignedData);
      setAvailableItems(availableData);

      // Initialize states for all items
      initializeItemStates([...assignedData, ...availableData]);
    } catch (err) {
      console.error("Pending items fetch error:", err);
      setItemsError("Failed to load pending items");
      setAssignedItems([]);
      setAvailableItems([]);
    } finally {
      setLoadingItems(false);
    }
  };

  // Fetch projects
  useEffect(() => {
    async function fetchProjects() {
      setLoadingProjects(true);
      setError(null);
      try {
        const userProjects = accesses
          .filter((a) => a.active)
          .map((a) => Number(a.project_id));

        const res = await projectInstance.get("/projects/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        });

        const allProjects = Array.isArray(res.data)
          ? res.data
          : res.data.results || [];

        const filtered = allProjects.filter((p) => userProjects.includes(p.id));

        setProjects(filtered);
        if (filtered.length > 0 && !selectedProjectId) {
          setSelectedProjectId(filtered[0].id);
        }
      } catch (err) {
        setError("Failed to load projects");
        setProjects([]);
      } finally {
        setLoadingProjects(false);
      }
    }

    if (accesses.length > 0) {
      fetchProjects();
    }
  }, []);

  // Fetch pending items when project changes
  useEffect(() => {
    fetchPendingItems();
    setExpandedGroups({});
    setCurrentView("items");
    setSelectedItem(null);
  }, [selectedProjectId]);

  // Group items by checklist
  const getGroupedItems = () => {
    if (groupBy === "none") {
      return { "All Items": filteredItems };
    }

    const grouped = {};
    filteredItems.forEach((item) => {
      let key;
      if (groupBy === "checklist") {
        // Since API doesn't provide checklist_details, use checklist ID
        key = `Checklist ${item.checklist}`;
      } else if (groupBy === "status") {
        key = item.status || "Unknown Status";
      }

      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
    });
    return grouped;
  };

  // Toggle group expansion
  const toggleGroup = (groupName) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  // Navigate to item details
  const navigateToItem = (item) => {
    setSelectedItem(item);
    setCurrentView("details");
  };

  // Go back to main view
  const handleGoBack = () => {
    setCurrentView("items");
    setSelectedItem(null);
  };

  // Handle photo upload
  const handlePhotoUpload = (itemId, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setItemStates((prev) => ({
          ...prev,
          [itemId]: {
            ...prev[itemId],
            photoFile: file,
            photoPreview: reader.result,
          },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove photo
  const removePhoto = (itemId) => {
    setItemStates((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        photoFile: null,
        photoPreview: null,
      },
    }));
  };

  // Handle remarks change
  const handleRemarksChange = (itemId, remarks) => {
    setItemStates((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        remarks: remarks,
      },
    }));
  };

  // Submit item (maker submission)
  const submitItem = async (itemId) => {
    const itemState = itemStates[itemId];
    const item = [...assignedItems, ...availableItems].find(
      (i) => i.id === itemId
    );

    // Validation
    if (!itemState?.remarks?.trim()) {
      setItemStates((prev) => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          error: "Please provide fix description/remarks",
        },
      }));
      return;
    }

    // Start submitting
    setItemStates((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        isSubmitting: true,
        error: null,
      },
    }));

    try {
      // Call the mark-as-done-maker API
      const response = await NEWchecklistInstance.post(
        "/mark-as-done-maker/",
        {
          checklist_item_id: itemId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );

      // Success
      setItemStates((prev) => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          isSubmitting: false,
          submitted: true,
          error: null,
        },
      }));

      console.log("Maker submission response:", response.data);

      // Refresh the list after a short delay
      setTimeout(() => {
        fetchPendingItems();
      }, 2000);
    } catch (error) {
      console.error("Submit error:", error);
      setItemStates((prev) => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          isSubmitting: false,
          error:
            error.response?.data?.detail ||
            "Failed to submit. Please try again.",
        },
      }));
    }
  };

  // Get statistics
  const getStats = () => {
    const currentItems = getCurrentItems();
    const total = currentItems.length;
    const submitted = Object.values(itemStates).filter(
      (s) => s.submitted
    ).length;
    const withPhotos = Object.values(itemStates).filter(
      (s) => s.photoFile
    ).length;
    return {
      total,
      submitted,
      pending: total - submitted,
      withPhotos,
      assigned: assignedItems.length,
      available: availableItems.length,
    };
  };

  const stats = getStats();
  const groupedItems = getGroupedItems();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SiteBarHome />
      <main className="ml-[15%] w-full p-6">
        {/* Conditional Rendering: Main View or Item Details */}
        {currentView === "items" ? (
          // MAIN VIEW (Project Selection, Filters, Items)
          <div>
            <h2 className="text-2xl font-bold mb-6">
              Pending for Maker - Fix Required Items
            </h2>

            {/* Project Selection and Info - Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Project Dropdown */}
              <div className="bg-white rounded-lg shadow p-4">
                <label className="block mb-2 font-semibold text-gray-700">
                  Select Project:
                </label>
                {loadingProjects ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-gray-600">Loading projects...</span>
                  </div>
                ) : error ? (
                  <p className="text-red-500 text-sm">{error}</p>
                ) : (
                  <select
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={selectedProjectId}
                    onChange={(e) =>
                      setSelectedProjectId(Number(e.target.value))
                    }
                    disabled={projects.length === 0}
                  >
                    {projects.length === 0 && (
                      <option>No projects available</option>
                    )}
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name || `Project #${p.id}`}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Selected Project Info */}
              {selectedProjectId && (
                <div className="bg-white rounded-lg shadow p-4">
                  <h3 className="font-semibold text-gray-700 mb-2">
                    Selected Project Details:
                  </h3>
                  <div className="text-sm text-gray-600">
                    <p>
                      <span className="font-medium">ID:</span>{" "}
                      {selectedProjectId}
                    </p>
                    <p>
                      <span className="font-medium">Name:</span>{" "}
                      {projects.find((p) => p.id === selectedProjectId)?.name ||
                        "N/A"}
                    </p>
                  </div>
                  <div className="mt-3">
                    <div className="text-sm bg-red-100 rounded-lg px-3 py-2">
                      <span className="font-medium">Items: </span>
                      <span className="text-purple-600 font-bold">
                        {stats.assigned} assigned
                      </span>
                      <span className="mx-1">|</span>
                      <span className="text-blue-600 font-bold">
                        {stats.available} available
                      </span>
                      {stats.submitted > 0 && (
                        <>
                          <span className="mx-1">|</span>
                          <span className="text-green-600">
                            {stats.submitted} submitted
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                View Mode
              </h3>
              <div className="flex gap-3 mb-4">
                <button
                  onClick={() => setViewMode("assigned")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    viewMode === "assigned"
                      ? "bg-purple-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Assigned to Me ({assignedItems.length})
                </button>
                <button
                  onClick={() => setViewMode("available")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    viewMode === "available"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Available for Me ({availableItems.length})
                </button>
                <button
                  onClick={() => setViewMode("all")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    viewMode === "all"
                      ? "bg-green-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All Items ({assignedItems.length + availableItems.length})
                </button>
              </div>

              {/* Status Filter */}
              <h4 className="text-md font-semibold text-gray-800 mb-3">
                Filter by Status
              </h4>
              <div className="flex flex-wrap gap-3">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setStatusFilter(option.value)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      statusFilter === option.value
                        ? "bg-red-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {statusFilter !== "all" && (
                <p className="text-sm text-gray-600 mt-2">
                  Currently showing:{" "}
                  {
                    statusOptions.find((opt) => opt.value === statusFilter)
                      ?.label
                  }
                </p>
              )}
            </div>

            {/* Grouping Controls */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex items-center gap-4">
                <label className="font-medium text-gray-700">Group by:</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setGroupBy("checklist")}
                    className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                      groupBy === "checklist"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    Checklist
                  </button>
                  <button
                    onClick={() => setGroupBy("status")}
                    className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                      groupBy === "status"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    Status
                  </button>
                  <button
                    onClick={() => setGroupBy("none")}
                    className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                      groupBy === "none"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    No Grouping
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            {loadingItems ? (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                  <span className="text-gray-600">
                    Loading pending items...
                  </span>
                </div>
              </div>
            ) : itemsError ? (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center py-8">
                  <p className="text-red-500 mb-2">{itemsError}</p>
                  <button
                    onClick={fetchPendingItems}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center py-8">
                  <p className="text-gray-600">
                    {statusFilter === "all"
                      ? `No ${
                          viewMode === "assigned"
                            ? "assigned"
                            : viewMode === "available"
                            ? "available"
                            : ""
                        } items for this project.`
                      : `No items found with status: ${
                          statusOptions.find(
                            (opt) => opt.value === statusFilter
                          )?.label
                        }`}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedItems).map(([groupName, items]) => (
                  <div key={groupName} className="bg-white rounded-lg shadow">
                    {/* Group Header */}
                    {groupBy !== "none" && (
                      <div
                        className="px-6 py-4 border-b cursor-pointer hover:bg-gray-50"
                        onClick={() => toggleGroup(groupName)}
                      >
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <svg
                              className={`w-5 h-5 transition-transform ${
                                expandedGroups[groupName] ? "rotate-90" : ""
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {groupName}
                          </h3>
                          <span className="text-sm text-gray-600">
                            {items.length} item{items.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Group Items */}
                    {(groupBy === "none" || expandedGroups[groupName]) && (
                      <div className="p-6 space-y-4">
                        {items.map((item, index) => {
                          const itemState = itemStates[item.id] || {};
                          const isSubmitted = itemState.submitted;
                          const lastSubmission = item.latest_submission;
                          const isAssigned = assignedItems.some(
                            (i) => i.id === item.id
                          );

                          return (
                            <div
                              key={item.id}
                              className={`border-2 rounded-lg p-4 transition-all hover:shadow-md ${
                                isSubmitted
                                  ? "border-green-300 bg-green-50"
                                  : isAssigned
                                  ? "border-purple-300 bg-purple-50"
                                  : "border-blue-300 bg-blue-50"
                              }`}
                            >
                              {/* Item Header */}
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                  <h5 className="font-semibold text-lg flex items-center gap-2">
                                    <span
                                      className={`px-2 py-1 rounded text-xs ${
                                        isAssigned
                                          ? "bg-purple-600 text-white"
                                          : "bg-blue-600 text-white"
                                      }`}
                                    >
                                      {isAssigned
                                        ? "Assigned to Me"
                                        : "Available"}
                                    </span>
                                    {item.title || `Item ${item.id}`}
                                    {isSubmitted && (
                                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                                        ✓ Fixed & Submitted
                                      </span>
                                    )}
                                  </h5>
                                  <div className="text-sm text-gray-600 mt-1">
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                        item.status
                                      )}`}
                                    >
                                      {item.status
                                        .replace("_", " ")
                                        .toUpperCase()}
                                    </span>
                                    <span className="mx-2">•</span>
                                    <span>
                                      Photo:{" "}
                                      <span
                                        className={
                                          item.photo_required
                                            ? "text-red-600 font-semibold"
                                            : ""
                                        }
                                      >
                                        {item.photo_required
                                          ? "Required"
                                          : "Optional"}
                                      </span>
                                    </span>
                                    <span className="mx-2">•</span>
                                    <span>Checklist: {item.checklist}</span>
                                  </div>
                                  {item.description && (
                                    <p className="text-sm text-gray-700 mt-2 italic">
                                      {item.description}
                                    </p>
                                  )}
                                  {lastSubmission && (
                                    <div className="mt-2 text-xs text-gray-600 bg-gray-100 p-2 rounded">
                                      <strong>Latest:</strong> Attempt #
                                      {lastSubmission.attempts} -{" "}
                                      {lastSubmission.status}
                                      {lastSubmission.created_at && (
                                        <span className="ml-2">
                                          (
                                          {new Date(
                                            lastSubmission.created_at
                                          ).toLocaleDateString()}
                                          )
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-col gap-2 ml-4">
                                  <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs">
                                    ID: {item.id}
                                  </span>
                                  <button
                                    onClick={() => navigateToItem(item)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded transition-colors"
                                  >
                                    View Details
                                  </button>
                                </div>
                              </div>

                              {/* Quick Action Buttons */}
                              <div className="flex gap-2 pt-2">
                                {!isSubmitted && (
                                  <>
                                    <button
                                      onClick={() => navigateToItem(item)}
                                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors"
                                    >
                                      🔧 Fix Item
                                    </button>
                                    <button
                                      onClick={() => navigateToItem(item)}
                                      className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded transition-colors"
                                    >
                                      📋 View Details
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Summary */}
            {stats.total > 0 && (
              <div className="mt-6 p-4 bg-orange-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-700">
                    <strong>Summary:</strong> {stats.submitted} of {stats.total}{" "}
                    items fixed ({stats.assigned} assigned, {stats.available}{" "}
                    available)
                    {stats.pending > 0 && ` • ${stats.pending} remaining`}
                  </div>
                  {stats.submitted === stats.total && (
                    <div className="text-green-600 font-semibold">
                      ✓ All items have been fixed!
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          // ITEM DETAILS VIEW (rest of the component remains the same)
          <div>
            {/* Header with Go Back */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <button
                  onClick={handleGoBack}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium mr-4 transition-colors flex items-center"
                >
                  ← Go Back
                </button>
                <h2 className="text-2xl font-bold text-gray-800">
                  🔧 Fix Item:{" "}
                  {selectedItem?.title || `Item ${selectedItem?.id}`}
                </h2>
              </div>
            </div>

            {/* Item Fix Form */}
            {selectedItem && (
              <div className="bg-white rounded-lg shadow p-6">
                {(() => {
                  const itemState = itemStates[selectedItem.id] || {};
                  const isSubmitted = itemState.submitted;
                  const lastSubmission = selectedItem.latest_submission;
                  const isAssigned = assignedItems.some(
                    (i) => i.id === selectedItem.id
                  );

                  return (
                    <div
                      className={`transition-all ${
                        isSubmitted
                          ? "bg-green-50"
                          : isAssigned
                          ? "bg-purple-50"
                          : "bg-blue-50"
                      } rounded-lg p-6`}
                    >
                      {/* Item Info */}
                      <div className="mb-6 p-4 bg-white rounded-lg border">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              isAssigned
                                ? "bg-purple-600 text-white"
                                : "bg-blue-600 text-white"
                            }`}
                          >
                            {isAssigned ? "Assigned to Me" : "Available for Me"}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <strong>ID:</strong> {selectedItem.id}
                          </div>
                          <div>
                            <strong>Status:</strong>{" "}
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                selectedItem.status
                              )}`}
                            >
                              {selectedItem.status
                                .replace("_", " ")
                                .toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <strong>Photo Required:</strong>{" "}
                            {selectedItem.photo_required ? "Yes" : "No"}
                          </div>
                          <div>
                            <strong>Checklist:</strong> {selectedItem.checklist}
                          </div>
                        </div>
                        {selectedItem.description && (
                          <div className="mt-3 text-sm">
                            <strong>Description:</strong>{" "}
                            {selectedItem.description}
                          </div>
                        )}
                      </div>

                      {/* Latest Submission Details */}
                      {lastSubmission && (
                        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <h6 className="font-semibold text-sm mb-2 text-yellow-800">
                            📋 Latest Submission Details:
                          </h6>
                          <div className="text-sm text-gray-700 space-y-1">
                            <p>
                              <strong>Status:</strong> {lastSubmission.status}
                            </p>
                            <p>
                              <strong>Attempts:</strong>{" "}
                              {lastSubmission.attempts}
                            </p>
                            {lastSubmission.remarks && (
                              <p>
                                <strong>Remarks:</strong>{" "}
                                {lastSubmission.remarks}
                              </p>
                            )}
                            {lastSubmission.created_at && (
                              <p>
                                <strong>Created:</strong>{" "}
                                {new Date(
                                  lastSubmission.created_at
                                ).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {!isSubmitted ? (
                        <>
                          {/* Fix Description */}
                          <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Fix Description / Remarks
                              <span className="text-red-600 ml-1">*</span>
                            </label>
                            <textarea
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows="4"
                              placeholder="Describe what you fixed or changed..."
                              value={itemState.remarks || ""}
                              onChange={(e) =>
                                handleRemarksChange(
                                  selectedItem.id,
                                  e.target.value
                                )
                              }
                              required
                            />
                          </div>

                          {/* Photo Upload */}
                          <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Photo of Fixed Work
                              {selectedItem.photo_required && (
                                <span className="text-red-600 ml-1">
                                  *Required
                                </span>
                              )}
                            </label>
                            {!itemState.photoPreview ? (
                              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) =>
                                    handlePhotoUpload(
                                      selectedItem.id,
                                      e.target.files[0]
                                    )
                                  }
                                  className="hidden"
                                  id={`photo-${selectedItem.id}`}
                                />
                                <label
                                  htmlFor={`photo-${selectedItem.id}`}
                                  className="cursor-pointer"
                                >
                                  <svg
                                    className="mx-auto h-16 w-16 text-gray-400"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 48 48"
                                  >
                                    <path
                                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                  <p className="mt-3 text-lg text-gray-600">
                                    Click to upload photo of fixed work
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    PNG, JPG, GIF up to 10MB
                                  </p>
                                </label>
                              </div>
                            ) : (
                              <div className="relative">
                                <img
                                  src={itemState.photoPreview}
                                  alt="Preview"
                                  className="w-full h-64 object-cover rounded-lg"
                                />
                                <button
                                  onClick={() => removePhoto(selectedItem.id)}
                                  className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                                >
                                  <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Error Message */}
                          {itemState.error && (
                            <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
                              <div className="flex items-center">
                                <svg
                                  className="w-5 h-5 mr-2"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                {itemState.error}
                              </div>
                            </div>
                          )}

                          {/* Submit Button */}
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={handleGoBack}
                              className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => submitItem(selectedItem.id)}
                              disabled={
                                itemState.isSubmitting ||
                                !itemState.remarks?.trim()
                              }
                              className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                                itemState.isSubmitting
                                  ? "bg-gray-400 cursor-not-allowed"
                                  : !itemState.remarks?.trim()
                                  ? "bg-gray-300 cursor-not-allowed"
                                  : "bg-green-600 hover:bg-green-700 text-white shadow-lg"
                              }`}
                            >
                              {itemState.isSubmitting ? (
                                <span className="flex items-center">
                                  <svg
                                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
                                  Submitting Fix...
                                </span>
                              ) : (
                                "✅ Submit Fixed Item"
                              )}
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-8">
                          <div className="text-green-600 font-semibold text-2xl mb-3">
                            ✅ Fix Submitted Successfully
                          </div>
                          <p className="text-lg text-gray-600 mb-4">
                            This item has been fixed and resubmitted for review.
                          </p>
                          <div className="bg-white p-4 rounded-lg border max-w-md mx-auto">
                            <p className="text-sm text-gray-700">
                              <strong>Fix Description:</strong>
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {itemState.remarks}
                            </p>
                          </div>
                          <button
                            onClick={handleGoBack}
                            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                          >
                            ← Back to Items List
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default PendingForMakerItems;