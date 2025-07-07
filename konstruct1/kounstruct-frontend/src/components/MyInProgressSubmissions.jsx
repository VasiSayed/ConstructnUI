import React, { useEffect, useState } from "react";
import SiteBarHome from "./SiteBarHome";
import { checklistInstance } from "../api/axiosInstance"; // Adjust path if needed

function MyInProgressSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [photoFiles, setPhotoFiles] = useState({}); // {submissionId: File}

  useEffect(() => {
    fetchSubmissions();
    // eslint-disable-next-line
  }, []);

  async function fetchSubmissions() {
    setLoading(true);
    setError(null);
    try {
      const res = await checklistInstance.get("my-inprogress-checklistitem-submissions/");
      setSubmissions(res.data);
    } catch (err) {
      setError(
        (err.response && err.response.data && JSON.stringify(err.response.data)) ||
        err.message ||
        "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  const getChecklistItemLabel = (item) => {
    if (item.checklist_item_description) return item.checklist_item_description;
    if (typeof item.checklist_item === "object" && item.checklist_item.description)
      return item.checklist_item.description;
    return `Checklist Item #${item.checklist_item}`;
  };

  // Handler to mark as done (no photo required)
  async function markAsDone(itemId) {
    setUpdatingId(itemId);
    setError(null);
    try {
      await checklistInstance.patch(`submissions/${itemId}/`, {
        status: "COMPLETED"
      });
      await fetchSubmissions();
    } catch (err) {
      setError("Could not mark as done.");
    } finally {
      setUpdatingId(null);
    }
  }

  // Handler to upload photo (for photo_required)
  async function submitPhoto(itemId) {
    if (!photoFiles[itemId]) {
      setError("Please select a photo to upload.");
      return;
    }
    setUpdatingId(itemId);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("maker_photo", photoFiles[itemId]);
      formData.append("status", "COMPLETED"); // You can remove this if not needed

      await checklistInstance.patch(`submissions/${itemId}/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      // Clean up the selected file and reload
      setPhotoFiles((prev) => {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      });
      await fetchSubmissions();
    } catch (err) {
      setError("Photo upload failed.");
    } finally {
      setUpdatingId(null);
    }
  }

  // Track file input
  const handleFileChange = (itemId, e) => {
    setPhotoFiles((prev) => ({
      ...prev,
      [itemId]: e.target.files[0],
    }));
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SiteBarHome />
      <main className="ml-[15%] w-full p-6">
        <h2 className="text-2xl font-bold mb-4">My In-Progress Checklist Item Submissions</h2>
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && submissions.length === 0 && (
          <p>No in-progress submissions found.</p>
        )}

        <ul className="space-y-4">
          {submissions.map((item) => (
            <li
              key={item.id}
              className="bg-white p-4 rounded-md shadow border border-gray-100"
            >
              <div className="font-semibold text-lg mb-2">
                {getChecklistItemLabel(item)}
              </div>
              <div className="text-gray-600 mb-1">
                <strong>Status:</strong>{" "}
                <span className="font-semibold text-yellow-600">
                  {item.status}
                </span>
              </div>
              <div className="text-gray-600 mb-1">
                <strong>Accepted At:</strong>{" "}
                {item.accepted_at ? new Date(item.accepted_at).toLocaleString() : "—"}
              </div>
              <div className="text-gray-600 mb-1">
                <strong>Photo Required:</strong>{" "}
                <span className={item.photo_required ? "text-red-600 font-semibold" : "text-green-600 font-semibold"}>
                  {item.photo_required ? "Yes" : "No"}
                </span>
              </div>
              {item.selected_option && (
                <div className="text-gray-600 mb-1">
                  <strong>Selected Option:</strong> {item.selected_option}
                </div>
              )}
              {item.check_remark && (
                <div className="text-gray-600">
                  <strong>Remark:</strong> {item.check_remark}
                </div>
              )}

              {/* Logic for photo submission */}
              {item.photo_required ? (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    className="mt-2"
                    onChange={(e) => handleFileChange(item.id, e)}
                    disabled={updatingId === item.id}
                  />
                  <button
                    className={`mt-2 px-4 py-2 rounded text-white ${
                      !photoFiles[item.id] || updatingId === item.id
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                    disabled={!photoFiles[item.id] || updatingId === item.id}
                    onClick={() => submitPhoto(item.id)}
                  >
                    {updatingId === item.id ? "Submitting..." : "Submit Photo"}
                  </button>
                </div>
              ) : (
                <button
                  className={`mt-2 px-4 py-2 rounded text-white ${
                    updatingId === item.id
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                  disabled={updatingId === item.id}
                  onClick={() => markAsDone(item.id)}
                >
                  {updatingId === item.id ? "Updating..." : "Mark as Done"}
                </button>
              )}
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

export default MyInProgressSubmissions;
