import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  EyeIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

const Results = () => {
  const navigate = useNavigate();
  const { testId } = useParams();
  const { user } = useAuth();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [showReview, setShowReview] = useState(false);
  const [testInfo, setTestInfo] = useState(null);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      let response;
      if (testId) {
        // Fetch attempts for a specific test (teacher view)
        response = await api.getTestAttempts(testId);
        setAttempts(response.data.data.attempts || []);

        // Also fetch test info
        try {
          const testResponse = await api.getTest(testId);
          setTestInfo(testResponse.data.data);
        } catch (error) {
          console.error('Failed to fetch test info:', error);
        }
      } else {
        // Fetch all results (general view)
        response = user.role === 'student'
          ? await api.getMyResults()
          : await api.getAllResults();
        setAttempts(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch results:', error);
      toast.error('Failed to fetch results');
    } finally {
      setLoading(false);
    }
  };

  const handleViewReview = async (attemptId) => {
    try {
      const response = await api.getAttemptReview(attemptId);
      setSelectedAttempt(response.data.data);
      setShowReview(true);
    } catch (error) {
      console.error('Failed to fetch attempt review:', error);
      toast.error('Failed to fetch attempt review');
    }
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getGrade = (percentage) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    return 'F';
  };

  const formatDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 'N/A';
    const duration = new Date(endTime) - new Date(startTime);
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {testId ? 'Test Results' : 'My Results'}
            </h1>
            {testInfo && (
              <p className="mt-1 text-sm text-gray-500">
                Results for: {testInfo.title}
              </p>
            )}
          </div>
          
          {user.role === 'student' && !testId && (
            <div className="flex space-x-3">
              <button
                onClick={() => navigate('/available-tests')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                Take New Test
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Test Info Summary (for specific test view) */}
      {testInfo && (
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Total Questions</p>
              <p className="text-2xl font-bold text-gray-900">{testInfo.questions?.length || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Total Marks</p>
              <p className="text-2xl font-bold text-gray-900">{testInfo.totalMarks || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Duration</p>
              <p className="text-2xl font-bold text-gray-900">{testInfo.durationMinutes || 0} min</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Total Attempts</p>
              <p className="text-2xl font-bold text-gray-900">{attempts.length}</p>
            </div>
          </div>
        </div>
      )}

      {/* Results List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            {user.role === 'student' ? 'Your Test Results' : 'Student Results'}
          </h3>
        </div>
        
        <div className="px-4 sm:px-0">
          {attempts.length === 0 ? (
            <div className="text-center py-12">
              <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {user.role === 'student' 
                  ? 'Take your first test to see results here.'
                  : 'No student has completed any tests yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {(attempts || []).map((attempt) => (
                <div key={attempt._id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {attempt.mockTest?.title || 'Unknown Test'}
                        </h3>
                        <span className="ml-3 badge badge-primary">
                          {attempt.mockTest?.subject?.name || 'Unknown Subject'}
                        </span>
                      </div>

                      {user.role === 'teacher' && (
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-900 mb-2">Student Information</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="font-medium">Name:</span> {attempt.student?.name || 'N/A'}
                            </div>
                            <div>
                              <span className="font-medium">Email:</span> {attempt.student?.email || 'N/A'}
                            </div>
                            {attempt.student?.class && (
                              <div>
                                <span className="font-medium">Class:</span> {attempt.student.class}
                              </div>
                            )}
                            {attempt.student?.semester && (
                              <div>
                                <span className="font-medium">Semester:</span> {attempt.student.semester}
                              </div>
                            )}
                            {attempt.student?.batch && (
                              <div>
                                <span className="font-medium">Batch:</span> {attempt.student.batch}
                              </div>
                            )}
                            {attempt.student?.rollNumber && (
                              <div>
                                <span className="font-medium">Roll Number:</span> {attempt.student.rollNumber}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm font-medium text-gray-500">Score</p>
                          <p className={`text-2xl font-bold ${getScoreColor(attempt.percentage || 0)}`}>
                            {attempt.score || 0}/{attempt.totalMarks || 0}
                          </p>
                          <p className={`text-sm ${getScoreColor(attempt.percentage || 0)}`}>
                            {(attempt.percentage || 0).toFixed(1)}%
                          </p>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm font-medium text-gray-500">Grade</p>
                          <p className={`text-2xl font-bold ${getScoreColor(attempt.percentage || 0)}`}>
                            {getGrade(attempt.percentage || 0)}
                          </p>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm font-medium text-gray-500">Attempt</p>
                          <p className="text-2xl font-bold text-gray-900">
                            #{attempt.attemptNumber || 1}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          Duration: {formatDuration(attempt.startTime, attempt.endTime)}
                        </div>
                        <div className="flex items-center">
                          <DocumentTextIcon className="h-4 w-4 mr-1" />
                          {attempt.totalQuestions || 0} Questions
                        </div>
                        <div>
                          Completed: {attempt.endTime ? new Date(attempt.endTime).toLocaleDateString() : 'N/A'}
                        </div>
                        {attempt.mockTest?.passingMarks && (
                          <div className={`flex items-center ${
                            (attempt.score || 0) >= attempt.mockTest.passingMarks
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}>
                            {(attempt.score || 0) >= attempt.mockTest.passingMarks ? (
                              <CheckCircleIcon className="h-4 w-4 mr-1" />
                            ) : (
                              <XCircleIcon className="h-4 w-4 mr-1" />
                            )}
                            {(attempt.score || 0) >= attempt.mockTest.passingMarks ? 'Passed' : 'Failed'}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2 ml-4">
                      {attempt.mockTest?.allowReview && (
                        <button
                          onClick={() => handleViewReview(attempt._id)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          Review
                        </button>
                      )}
                      
                      {user.role === 'student' && attempt.mockTest?.showImprovementAnalysis && (
                        <button
                          onClick={() => navigate(`/improvement/${attempt.mockTest._id}`)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                        >
                          <ChartBarIcon className="h-4 w-4 mr-1" />
                          Analysis
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showReview && selectedAttempt && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Test Review: {selectedAttempt.mockTest?.title || 'Unknown Test'}
                </h3>
                <button
                  onClick={() => setShowReview(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Score</p>
                    <p className={`text-xl font-bold ${getScoreColor(selectedAttempt.percentage || 0)}`}>
                      {selectedAttempt.score || 0}/{selectedAttempt.totalMarks || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Percentage</p>
                    <p className={`text-xl font-bold ${getScoreColor(selectedAttempt.percentage || 0)}`}>
                      {(selectedAttempt.percentage || 0).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Grade</p>
                    <p className={`text-xl font-bold ${getScoreColor(selectedAttempt.percentage || 0)}`}>
                      {getGrade(selectedAttempt.percentage || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Duration</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatDuration(selectedAttempt.startTime, selectedAttempt.endTime)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                <h4 className="text-md font-medium text-gray-900 mb-4">Questions & Answers</h4>
                <div className="space-y-6">
                  {(selectedAttempt.mockTest?.questions || []).map((question, index) => {
                    const userAnswer = selectedAttempt.answers?.find(a => a.question === question._id);
                    const isCorrect = userAnswer?.isCorrect || false;
                    
                    return (
                      <div key={question._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h5 className="text-sm font-medium text-gray-900">
                            Question {index + 1}
                          </h5>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isCorrect 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {isCorrect ? (
                              <>
                                <CheckCircleIcon className="h-3 w-3 mr-1" />
                                Correct
                              </>
                            ) : (
                              <>
                                <XCircleIcon className="h-3 w-3 mr-1" />
                                Incorrect
                              </>
                            )}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-3">{question.questionText}</p>
                        
                        <div className="space-y-2">
                          {(question.options || []).map((option, optionIndex) => {
                            const optionLabel = String.fromCharCode(65 + optionIndex); // A, B, C, D
                            const isUserAnswer = userAnswer?.selectedOption === optionLabel;
                            const isCorrectAnswer = question.correctOption === optionLabel;
                            
                            let optionClass = 'p-2 rounded border text-sm ';
                            if (isCorrectAnswer) {
                              optionClass += 'bg-green-50 border-green-200 text-green-800';
                            } else if (isUserAnswer && !isCorrectAnswer) {
                              optionClass += 'bg-red-50 border-red-200 text-red-800';
                            } else {
                              optionClass += 'bg-gray-50 border-gray-200 text-gray-700';
                            }
                            
                            return (
                              <div key={optionIndex} className={optionClass}>
                                <span className="font-medium">{optionLabel}.</span> {option.text}
                                {isCorrectAnswer && (
                                  <span className="ml-2 text-green-600 font-medium">(Correct Answer)</span>
                                )}
                                {isUserAnswer && !isCorrectAnswer && (
                                  <span className="ml-2 text-red-600 font-medium">(Your Answer)</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        
                        {question.explanation && (
                          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                            <p className="text-sm font-medium text-blue-900 mb-1">Explanation:</p>
                            <p className="text-sm text-blue-800">{question.explanation}</p>
                          </div>
                        )}
                        
                        <div className="mt-2 text-xs text-gray-500">
                          Marks: {userAnswer?.marksAwarded || 0}/{question.marks || 1}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowReview(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;