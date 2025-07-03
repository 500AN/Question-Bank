import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import {
  ClockIcon,
  DocumentTextIcon,
  PlayIcon,
  InformationCircleIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';

const AvailableTests = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tests, setTests] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [filters, setFilters] = useState({
    subject: '',
    search: ''
  });

  // Redirect if not student
  useEffect(() => {
    if (user && user.role !== 'student') {
      navigate('/unauthorized');
    }
  }, [user, navigate]);

  // Fetch data
  useEffect(() => {
    fetchTests();
    fetchSubjects();
  }, []);



  const fetchTests = async () => {
    try {
      const response = await api.getTests();
      // Filter only active tests for students and ensure data exists
      const testsData = response.data.data || [];
      setTests(testsData.filter(test => test.isActive));
    } catch (error) {
      console.error('Failed to fetch tests:', error);
      toast.error('Failed to fetch tests');
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await api.getSubjects();
      setSubjects(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
      toast.error('Failed to fetch subjects');
      setSubjects([]);
    }
  };

  const handleStartTest = async (testId) => {
    try {
      const response = await api.startTest(testId);
      toast.success('Test started successfully');
      navigate(`/test/${response.data.data.attemptId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start test');
    }
  };

  const showTestInstructions = (test) => {
    setSelectedTest(test);
    setShowInstructions(true);
  };

  const filteredTests = (tests || []).filter(test => {
    // Basic filters
    const matchesSubject = !filters.subject || (test.subject && test.subject._id === filters.subject);
    const matchesSearch = !filters.search ||
      (test.title && test.title.toLowerCase().includes(filters.search.toLowerCase())) ||
      (test.description && test.description.toLowerCase().includes(filters.search.toLowerCase()));

    // Access restriction filters - check if student meets the requirements
    // If a restriction is set, the student must match it
    if (test.restrictToClass && test.restrictToClass.trim() !== '') {
      if (!user.class || user.class.toLowerCase().trim() !== test.restrictToClass.toLowerCase().trim()) {
        return false;
      }
    }

    if (test.restrictToSemester && test.restrictToSemester.trim() !== '') {
      if (!user.semester || user.semester.toLowerCase().trim() !== test.restrictToSemester.toLowerCase().trim()) {
        return false;
      }
    }

    if (test.restrictToBatch && test.restrictToBatch.trim() !== '') {
      if (!user.batch || user.batch.toLowerCase().trim() !== test.restrictToBatch.toLowerCase().trim()) {
        return false;
      }
    }

    if (test.restrictToDepartment && test.restrictToDepartment.trim() !== '') {
      if (!user.department || user.department.toLowerCase().trim() !== test.restrictToDepartment.toLowerCase().trim()) {
        return false;
      }
    }
    return matchesSubject && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Available Tests</h1>
            <p className="mt-2 text-lg text-gray-600">
              Choose a test to start your practice session
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 sm:px-0 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Subject
                </label>
                <select
                  value={filters.subject}
                  onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Subjects</option>
                  {(subjects || []).map(subject => (
                    <option key={subject._id} value={subject._id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Tests
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Search by title or description..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tests Grid */}
        <div className="px-4 sm:px-0">
          {filteredTests.length === 0 ? (
            <div className="text-center py-12">
              <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tests available</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filters.subject || filters.search 
                  ? 'Try adjusting your filters to see more tests.'
                  : 'Check back later for new tests.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTests.map((test) => (
                <div key={test._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="badge badge-primary">
                        {test.subject && test.subject.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {(test.questions || []).length} Questions
                      </span>
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {test.title}
                    </h3>

                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {test.description}
                    </p>

                    <div className="space-y-2 mb-6">
                      <div className="flex items-center text-sm text-gray-500">
                        <ClockIcon className="h-4 w-4 mr-2" />
                        Duration: {test.durationMinutes} minutes
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <DocumentTextIcon className="h-4 w-4 mr-2" />
                        Total Marks: {test.totalMarks}
                      </div>
                      {test.passingMarks && (
                        <div className="flex items-center text-sm text-gray-500">
                          <AcademicCapIcon className="h-4 w-4 mr-2" />
                          Passing Marks: {test.passingMarks}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {test.tags && test.tags.length > 0 && test.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="badge badge-secondary text-xs">
                          {tag}
                        </span>
                      ))}
                      {test.tags && test.tags.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{test.tags.length - 3} more
                        </span>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => showTestInstructions(test)}
                        className="flex-1 btn-secondary flex items-center justify-center"
                      >
                        <InformationCircleIcon className="h-4 w-4 mr-2" />
                        Instructions
                      </button>
                      <button
                        onClick={() => handleStartTest(test._id)}
                        className="flex-1 btn-primary flex items-center justify-center"
                      >
                        <PlayIcon className="h-4 w-4 mr-2" />
                        Start Test
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Instructions Modal */}
      {showInstructions && selectedTest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Test Instructions - {selectedTest.title}
                </h3>
                <button
                  onClick={() => {
                    setShowInstructions(false);
                    setSelectedTest(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Test Details */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Test Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Subject:</span> {selectedTest.subject.name}
                    </div>
                    <div>
                      <span className="font-medium">Questions:</span> {selectedTest.questions.length}
                    </div>
                    <div>
                      <span className="font-medium">Duration:</span> {selectedTest.durationMinutes} minutes
                    </div>
                    <div>
                      <span className="font-medium">Total Marks:</span> {selectedTest.totalMarks}
                    </div>
                    {selectedTest.passingMarks && (
                      <div>
                        <span className="font-medium">Passing Marks:</span> {selectedTest.passingMarks}
                      </div>
                    )}
                  </div>
                </div>

                {/* General Instructions */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">General Instructions</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>Read each question carefully before selecting your answer</li>
                    <li>You can navigate between questions using the navigation panel</li>
                    <li>Make sure to submit your test before the time runs out</li>
                    <li>Once submitted, you cannot modify your answers</li>
                    {selectedTest.randomizeQuestions && (
                      <li>Questions will be presented in random order</li>
                    )}
                    {selectedTest.showResults && (
                      <li>Results will be shown immediately after submission</li>
                    )}
                    {selectedTest.allowReview && (
                      <li>You can review your answers after submission</li>
                    )}
                  </ul>
                </div>

                {/* Custom Instructions */}
                {selectedTest.instructions && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Additional Instructions</h4>
                    <div className="text-sm text-gray-600 whitespace-pre-wrap">
                      {selectedTest.instructions}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => {
                      setShowInstructions(false);
                      setSelectedTest(null);
                    }}
                    className="btn-secondary"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowInstructions(false);
                      handleStartTest(selectedTest._id);
                    }}
                    className="btn-primary flex items-center"
                  >
                    <PlayIcon className="h-4 w-4 mr-2" />
                    Start Test
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailableTests;