import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ClockIcon,
  UserGroupIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

const Tests = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tests, setTests] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const selectedSubject = watch('subject');

  // Redirect if not teacher
  useEffect(() => {
    if (user && user.role !== 'teacher') {
      navigate('/unauthorized');
    }
  }, [user, navigate]);

  // Fetch data
  useEffect(() => {
    fetchTests();
    fetchSubjects();
    fetchQuestions();
  }, []);


  const fetchTests = async () => {
    try {
      const response = await api.getTests();
      setTests(response.data.data || []);
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

  const fetchQuestions = async () => {
    try {
      const response = await api.getQuestions();
      setQuestions(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      toast.error('Failed to fetch questions');
      setQuestions([]);
    }
  };

  const fetchTopics = async (subjectId) => {
    try {
      const response = await api.getSubjectTopics(subjectId);
      setTopics(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch topics:', error);
      toast.error('Failed to fetch topics');
      setTopics([]);
    }
  };



  // Calculate total marks automatically based on selected questions
  const calculateTotalMarks = React.useMemo(() => {
    if (selectedQuestions.length === 0) return 0;

    const selectedQuestionObjects = questions.filter(q => selectedQuestions.includes(q._id));
    return selectedQuestionObjects.reduce((total, question) => total + (question.marks || 1), 0);
  }, [selectedQuestions, questions]);

  // Update total marks field when selected questions change
  React.useEffect(() => {
    if (selectedQuestions.length > 0) {
      setValue('totalMarks', calculateTotalMarks);
    }
  }, [calculateTotalMarks, setValue, selectedQuestions.length]);

  // Fetch topics when subject changes
  useEffect(() => {
    if (selectedSubject && selectedSubject !== 'all') {
      fetchTopics(selectedSubject);
    } else {
      setTopics([]);
      setSelectedTopics([]);
    }
  }, [selectedSubject]);

  const onSubmit = async (data) => {
    try {
      // Validate that at least one question is selected
      if (selectedQuestions.length === 0) {
        toast.error('Please select at least one question for the test');
        return;
      }

      const testData = {
        title: data.title,
        description: data.description,
        questions: selectedQuestions,
        topics: selectedTopics,
        durationMinutes: parseInt(data.duration), // Backend expects durationMinutes
        totalMarks: parseInt(data.totalMarks),
        passingMarks: data.passingMarks ? parseInt(data.passingMarks) : undefined,
        instructions: data.instructions,
        isActive: data.isActive || false,
        showResultsImmediately: data.showResults || false, // Backend expects showResultsImmediately
        allowReview: data.allowReview || false,
        shuffleQuestions: data.randomizeQuestions || false, // Backend expects shuffleQuestions
        allowRepeatAttempts: data.allowRepeatAttempts || false,
        showImprovementAnalysis: data.showImprovementAnalysis || false,
        includeAllSubjects: data.subject === 'all' || data.includeAllSubjects || false, // Set includeAllSubjects when "All Subjects" is selected
        trackAttendance: data.trackAttendance || false,
        restrictToClass: data.restrictToClass && data.restrictToClass.trim() !== '' ? data.restrictToClass.trim() : null,
        restrictToSemester: data.restrictToSemester && data.restrictToSemester.trim() !== '' ? data.restrictToSemester.trim() : null,
        restrictToBatch: data.restrictToBatch && data.restrictToBatch.trim() !== '' ? data.restrictToBatch.trim() : null,
        restrictToDepartment: data.restrictToDepartment && data.restrictToDepartment.trim() !== '' ? data.restrictToDepartment.trim() : null,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : []
      };

      // Only include subject if not "All Subjects"
      if (data.subject !== 'all') {
        testData.subject = data.subject;
      }

      if (editingTest) {
        await api.updateTest(editingTest._id, testData);
        toast.success('Test updated successfully');
      } else {
        await api.createTest(testData);
        toast.success('Test created successfully');
      }

      setShowCreateModal(false);
      setEditingTest(null);
      setSelectedQuestions([]);
      setSelectedTopics([]);
      reset();
      fetchTests();
    } catch (error) {
      console.error('Test submission error:', error);
      if (error.response?.data?.errors) {
        // Handle validation errors
        const validationErrors = error.response.data.errors;
        validationErrors.forEach(err => {
          toast.error(`${err.path}: ${err.msg}`);
        });
      } else {
        toast.error(error.response?.data?.message || 'Failed to save test');
      }
    }
  };

  const handleEdit = (test) => {
    setEditingTest(test);
    setSelectedQuestions((test.questions || []).filter(q => q && q._id).map(q => q._id));
    setSelectedTopics(test.topics ? test.topics.filter(t => t && t._id).map(t => t._id) : []);
    reset({
      title: test.title,
      description: test.description,
      subject: test.includeAllSubjects ? 'all' : (test.subject && test.subject._id), // Handle "All Subjects" case
      duration: test.durationMinutes, // Backend sends durationMinutes
      totalMarks: test.totalMarks,
      passingMarks: test.passingMarks,
      instructions: test.instructions,
      isActive: test.isActive,
      showResults: test.showResultsImmediately, // Backend sends showResultsImmediately
      allowReview: test.allowReview,
      randomizeQuestions: test.shuffleQuestions, // Backend sends shuffleQuestions
      allowRepeatAttempts: test.allowRepeatAttempts,
      showImprovementAnalysis: test.showImprovementAnalysis,
      includeAllSubjects: test.includeAllSubjects,
      trackAttendance: test.trackAttendance,
      restrictToClass: test.restrictToClass || '',
      restrictToSemester: test.restrictToSemester || '',
      restrictToBatch: test.restrictToBatch || '',
      restrictToDepartment: test.restrictToDepartment || '',
      tags: test.tags ? test.tags.join(', ') : ''
    });
    // Fetch topics for the selected subject (skip if "All Subjects")
    if (test.subject && test.subject._id && !test.includeAllSubjects) {
      fetchTopics(test.subject._id);
    }
    setShowCreateModal(true);
  };

  const handleDelete = async (testId) => {
    if (window.confirm('Are you sure you want to delete this test?')) {
      try {
        await api.deleteTest(testId);
        toast.success('Test deleted successfully');
        fetchTests();
      } catch (error) {
        toast.error('Failed to delete test');
      }
    }
  };

  const toggleQuestionSelection = (questionId) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const filteredQuestions = selectedSubject && selectedSubject !== 'all'
    ? (questions || []).filter(q => q.subject && q.subject._id === selectedSubject)
    : (questions || []);

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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mock Tests</h1>
              <p className="mt-2 text-sm text-gray-600">
                Create and manage mock tests for students
              </p>
            </div>
            <button
              onClick={() => {
                setEditingTest(null);
                setSelectedQuestions([]);
                setSelectedTopics([]);
                reset();
                setShowCreateModal(true);
              }}
              className="btn-primary flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Test
            </button>
          </div>
        </div>

        {/* Tests List */}
        <div className="px-4 sm:px-0">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Tests ({tests.length})
              </h3>
            </div>
            
            {(!tests || tests.length === 0) ? (
              <div className="text-center py-12">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No tests found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating your first test.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {(tests || []).map((test) => (
                  <div key={test._id} className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h4 className="text-lg font-medium text-gray-900">
                            {test.title}
                          </h4>
                          <span className={`ml-3 badge ${
                            test.isActive ? 'badge-success' : 'badge-secondary'
                          }`}>
                            {test.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>

                        <p className="text-gray-600 mb-3">{test.description}</p>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                          <div className="flex items-center">
                            <DocumentTextIcon className="h-4 w-4 mr-1" />
                            {(test.questions || []).length} Questions
                          </div>
                          <div className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {test.durationMinutes} minutes
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium">Subject:</span>
                            <span className="ml-1">{test.subject && test.subject.name}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium">Total Marks:</span>
                            <span className="ml-1">{test.totalMarks}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {test.tags && test.tags.length > 0 && test.tags.map((tag, index) => (
                            <span key={index} className="badge badge-primary">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => navigate(`/tests/${test._id}/attempts`)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded"
                          title="View Attempts"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        {test.trackAttendance && (
                          <button
                            onClick={() => navigate(`/test-attendance/${test._id}`)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded"
                            title="View Attendance"
                          >
                            <UserGroupIcon className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(test)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(test._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-md bg-white max-h-screen overflow-y-auto">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingTest ? 'Edit Test' : 'Create New Test'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingTest(null);
                    setSelectedQuestions([]);
                    setSelectedTopics([]);
                    reset();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Test Title *
                      </label>
                      <input
                        {...register('title', { required: 'Test title is required' })}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter test title..."
                      />
                      {errors.title && (
                        <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        {...register('description')}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter test description..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subject *
                      </label>
                      <select
                        {...register('subject', { required: 'Subject is required' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="">Select subject</option>
                        <option value="all">All Subjects</option>
                        {(subjects || []).map(subject => (
                          <option key={subject._id} value={subject._id}>
                            {subject.name}
                          </option>
                        ))}
                      </select>
                      {errors.subject && (
                        <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Topics (Optional)
                      </label>
                      <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                         {(!topics || topics.length === 0) ? (
                           <p className="text-sm text-gray-500">
                             {selectedSubject === 'all' ? 'Topics not applicable for all subjects' :
                              selectedSubject ? 'No topics available' : 'Select a subject first'}
                           </p>
                        ) : (
                          (topics || []).map(topic => (
                            <label key={topic._id} className="flex items-center space-x-2 py-1">
                              <input
                                type="checkbox"
                                checked={selectedTopics.includes(topic._id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedTopics([...selectedTopics, topic._id]);
                                  } else {
                                    setSelectedTopics(selectedTopics.filter(id => id !== topic._id));
                                  }
                                }}
                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                              />
                              <span className="text-sm text-gray-700">{topic.name}</span>
                            </label>
                          ))
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration (minutes) *
                      </label>
                      <input
                        {...register('duration', { 
                          required: 'Duration is required',
                          min: { value: 1, message: 'Duration must be at least 1 minute' }
                        })}
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="60"
                      />
                      {errors.duration && (
                        <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total Marks *
                      </label>
                      <input
                        {...register('totalMarks', { 
                          required: 'Total marks is required',
                          min: { value: 1, message: 'Total marks must be at least 1' }
                        })}
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="100"
                      />
                      {errors.totalMarks && (
                        <p className="mt-1 text-sm text-red-600">{errors.totalMarks.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Passing Marks
                      </label>
                      <input
                        {...register('passingMarks', { 
                          min: { value: 0, message: 'Passing marks cannot be negative' }
                        })}
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="40"
                      />
                      {errors.passingMarks && (
                        <p className="mt-1 text-sm text-red-600">{errors.passingMarks.message}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Instructions
                      </label>
                      <textarea
                        {...register('instructions')}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter test instructions..."
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tags
                      </label>
                      <input
                        {...register('tags')}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter tags separated by commas"
                      />
                    </div>
                  </div>
                </div>

                {/* Test Settings */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Test Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <input
                        {...register('isActive')}
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        Active (students can take this test)
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        {...register('showResults')}
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        Show results immediately
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        {...register('allowReview')}
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        Allow answer review
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        {...register('randomizeQuestions')}
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        Randomize question order
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        {...register('allowRepeatAttempts')}
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        Allow repeat attempts
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        {...register('showImprovementAnalysis')}
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        Show improvement analysis (for repeat attempts)
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        {...register('includeAllSubjects')}
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        Include questions from all subjects
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        {...register('trackAttendance')}
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        Track student attendance
                      </label>
                    </div>
                  </div>
                </div>

                {/* Access Restrictions */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Access Restrictions (Optional)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Restrict to Class
                      </label>
                      <input
                        {...register('restrictToClass')}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="e.g., MCA, BCA"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Only students from this class can take the test
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Restrict to Semester
                      </label>
                      <select
                        {...register('restrictToSemester')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="">All Semesters</option>
                        <option value="1">1st Semester</option>
                        <option value="2">2nd Semester</option>
                        <option value="3">3rd Semester</option>
                        <option value="4">4th Semester</option>
                        <option value="5">5th Semester</option>
                        <option value="6">6th Semester</option>
                        <option value="7">7th Semester</option>
                        <option value="8">8th Semester</option>
                      </select>
                      <p className="mt-1 text-xs text-gray-500">
                        Only students from this semester can take the test
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Restrict to Batch
                      </label>
                      <input
                        {...register('restrictToBatch')}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="e.g., 2023-2025"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Only students from this batch can take the test
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Restrict to Department
                      </label>
                      <input
                        {...register('restrictToDepartment')}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="e.g., Computer Science, IT"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Only students from this department can take the test
                      </p>
                    </div>
                  </div>
                </div>

                {/* Question Selection */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-medium text-gray-900 mb-4">
                    Select Questions ({selectedQuestions.length} selected)
                  </h4>

                  {selectedQuestions.length === 0 && (
                    <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm text-yellow-800">
                        ⚠️ Please select at least one question to create the test.
                      </p>
                    </div>
                  )}

                  {filteredQuestions.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      {selectedSubject ? 'No questions available for selected subject' : 'Please select a subject first'}
                    </p>
                  ) : (
                    <div className="max-h-60 overflow-y-auto border border-gray-200 rounded">
                      {filteredQuestions.map((question) => (
                        <div
                          key={question._id}
                          className={`p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                            selectedQuestions.includes(question._id) ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => toggleQuestionSelection(question._id)}
                        >
                          <div className="flex items-start">
                            <input
                              type="checkbox"
                              checked={selectedQuestions.includes(question._id)}
                              onChange={() => toggleQuestionSelection(question._id)}
                              className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                            <div className="ml-3 flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {question.question}
                              </p>
                              <div className="flex gap-2 mt-1">
                                <span className="badge badge-secondary text-xs">
                                  {question.topic.name}
                                </span>
                                <span className={`badge text-xs ${
                                  question.difficulty === 'easy' ? 'badge-success' :
                                  question.difficulty === 'medium' ? 'badge-warning' :
                                  'badge-danger'
                                }`}>
                                  {question.difficulty}
                                </span>
                                {question.marks && (
                                  <span className="badge badge-info text-xs">
                                    {question.marks} marks
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingTest(null);
                      setSelectedQuestions([]);
                      setSelectedTopics([]);
                      reset();
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`btn-primary ${selectedQuestions.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={selectedQuestions.length === 0}
                    title={selectedQuestions.length === 0 ? 'Please select at least one question' : ''}
                  >
                    {editingTest ? 'Update Test' : 'Create Test'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tests;