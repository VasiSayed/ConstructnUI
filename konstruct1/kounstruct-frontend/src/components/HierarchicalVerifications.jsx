import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { getMyHierarchicalVerifications, verifyChecklistItemSubmission } from '../api/index';

const HierarchicalVerifications = () => {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const [processingSubmission, setProcessingSubmission] = useState(null);
  const [showImageModal, setShowImageModal] = useState(null);

  // Get user data
  const userId = useSelector((state) => state.user.user?.id);

  // Fetch verifications
  const fetchVerifications = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📡 Fetching hierarchical verifications...');
      const response = await getMyHierarchicalVerifications();

      console.log('✅ Verifications response:', response.data);
      setVerifications(response.data || []);

      const totalPending = response.data.reduce((total, checklist) => 
        total + (checklist.total_pending_verifications || 0), 0
      );

      if (totalPending === 0) {
        toast.info('No pending verifications found');
      } else {
        toast.success(`Found ${totalPending} items requiring verification`);
      }

    } catch (error) {
      console.error('❌ Error fetching verifications:', error);
      const errorMessage = error.response?.data?.error || 'Failed to fetch verifications';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle verification decision
  const handleVerificationDecision = async (submissionId, optionId, optionLabel) => {
    try {
      setProcessingSubmission(submissionId);
      
      console.log('🔄 Processing verification:', { submissionId, optionId, optionLabel });
      console.log('📡 Calling API: /verify-checklist-item-submission/');

      // Call the verification API
      const response = await verifyChecklistItemSubmission(submissionId, optionId);
      
      console.log('✅ Verification API response:', response.data);
      
      toast.success(`✅ Marked as "${optionLabel}" successfully!`);
      
      // Remove the verified submission from the list
      setVerifications(prev => prev.map(checklist => ({
        ...checklist,
        items: checklist.items.map(item => ({
          ...item,
          submissions: item.submissions.filter(sub => sub.id !== submissionId)
        })).filter(item => item.submissions.length > 0),
        total_pending_verifications: Math.max(0, (checklist.total_pending_verifications || 0) - 1)
      })).filter(checklist => checklist.items.length > 0));

    } catch (error) {
      console.error('❌ Verification failed:', error);
      console.error('❌ Error details:', error.response?.data);
      
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to submit verification';
      
      toast.error(`❌ Verification failed: ${errorMessage}`);
    } finally {
      setProcessingSubmission(null);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  // Get submission status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'VERIFYING': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading verifications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-red-800 font-semibold mb-2">Error Loading Verifications</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchVerifications}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Verification Queue</h1>
          <p className="text-gray-600 mt-1">
            Items submitted by makers that require your verification
          </p>
        </div>
        <div className="flex gap-2">
          {selectedChecklist && (
            <button
              onClick={() => setSelectedChecklist(null)}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to List
            </button>
          )}
          <button
            onClick={fetchVerifications}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Checklist Selection View */}
      {!selectedChecklist && (
        <>
          {verifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-50 rounded-lg p-8">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Pending Verifications</h3>
                <p className="text-gray-600">
                  All submissions have been verified or no new submissions are ready for verification.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {verifications.map((checklist) => (
                <div 
                  key={checklist.id} 
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedChecklist(checklist)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                      {checklist.name}
                    </h3>
                    <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                      ID: {checklist.id}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Project:</span>
                      <span>{checklist.project_id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Building:</span>
                      <span>{checklist.building_id || 'All'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Category:</span>
                      <span>{checklist.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {checklist.total_pending_verifications || 0}
                      </div>
                      <div className="text-xs text-gray-600">Pending</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {checklist.items?.length || 0}
                      </div>
                      <div className="text-xs text-gray-600">Items</div>
                    </div>
                    <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition text-sm">
                      Review →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Individual Submissions View */}
      {selectedChecklist && (
        <div className="space-y-6">
          {/* Checklist Header */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-blue-800 mb-2">
              📋 {selectedChecklist.name}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-blue-700">
              <div><strong>Project:</strong> {selectedChecklist.project_id}</div>
              <div><strong>Building:</strong> {selectedChecklist.building_id || 'All'}</div>
              <div><strong>Category:</strong> {selectedChecklist.category}</div>
              <div><strong>Pending:</strong> {selectedChecklist.total_pending_verifications}</div>
            </div>
          </div>

          {/* Submission Cards */}
          <div className="space-y-4">
            {selectedChecklist.items?.map((item) => 
              item.submissions?.map((submission, subIndex) => (
                <div 
                  key={`${item.id}-${submission.id}`}
                  className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
                >
                  {/* Submission Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {item.description}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          👤 {submission.maker_name}
                        </span>
                        <span className="flex items-center gap-1">
                          📅 {formatDate(submission.accepted_at)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                          {submission.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Submission #{submission.id}</div>
                      {item.photo_required && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 mt-1">
                          📷 Photo Required
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Maker Photo */}
                  {submission.maker_photo && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maker's Photo:
                      </label>
                      <img 
                        src={submission.maker_photo} 
                        alt="Maker submission"
                        className="h-32 w-auto object-cover rounded-lg cursor-pointer hover:opacity-90 transition"
                        onClick={() => setShowImageModal(submission.maker_photo)}
                      />
                    </div>
                  )}

                  {/* Verification Actions */}
                  <div className="border-t pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Verification Decision:
                    </label>
                    
                    {/* Debug: Show available options */}
                    {process.env.NODE_ENV === 'development' && (
                      <div className="mb-3 p-2 bg-gray-100 rounded text-xs">
                        <strong>Debug - Available Options:</strong>
                        <pre>{JSON.stringify(submission.checklist_item_options, null, 2)}</pre>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-3">
                      {submission.checklist_item_options && submission.checklist_item_options.length > 0 ? (
                        submission.checklist_item_options.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => handleVerificationDecision(
                              submission.id, 
                              option.id, 
                              option.label
                            )}
                            disabled={processingSubmission === submission.id}
                            className={option.value === 'P' 
                              ? 'px-6 py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 bg-green-600 text-white hover:bg-green-700'
                              : 'px-6 py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 bg-red-600 text-white hover:bg-red-700'
                            }
                          >
                            {processingSubmission === submission.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <span>{option.value === 'P' ? '✅' : '❌'}</span>
                            )}
                            {option.label}
                          </button>
                        ))
                      ) : (
                        <div className="text-gray-500 italic">
                          No verification options available for this submission
                        </div>
                      )}
                    </div>
                    
                    {/* Show raw submission data for debugging */}
                    {process.env.NODE_ENV === 'development' && (
                      <details className="mt-4">
                        <summary className="cursor-pointer text-sm text-gray-500">
                          Debug: View Submission Data
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                          {JSON.stringify(submission, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 max-w-4xl max-h-screen overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Submission Photo</h3>
              <button 
                onClick={() => setShowImageModal(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <img 
              src={showImageModal} 
              alt="Full size submission"
              className="max-w-full max-h-96 object-contain mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default HierarchicalVerifications;