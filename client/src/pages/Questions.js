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
  FunnelIcon,
  DocumentArrowUpIcon,
} from '@heroicons/react/24/outline';
import BulkQuestions from '../components/BulkQuestions';

const Questions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [filters, setFilters] = useState({
    subject: '',
    topic: '',
    difficulty: '',
    search: ''
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      marks: 1 // Set default marks to 1
    }
  });

  const selectedSubject = watch('subject');

  // Redirect if not teacher
  useEffect(() => {
    if (user && user.role !== 'teacher') {
      navigate('/unauthorized');
    }
  }, [user, navigate]);

  // Fetch data
  useEffect(() => {
    fetchQuestions();
    fetchSubjects();
  }, []);

  // Fetch topics when subject changes in form
  useEffect(() => {
    if (selectedSubject) {
      fetchTopics(selectedSubject);
    }
  }, [selectedSubject]);

  const fetchQuestions = async () => {
    try {
      const response = await api.getQuestions();
      setQuestions(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      toast.error('Failed to fetch questions');
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Set default marks when creating new question
  useEffect(() => {
    if (!editingQuestion) {
      setValue('marks', 1);
    }
  }, [editingQuestion, setValue]);

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

  const onSubmit = async (data) => {
    try {
      // Transform the data to match server expectations
      const transformedData = {
        questionText: data.question,
        options: data.options.map((optionText, index) => ({
          text: optionText,
          label: String.fromCharCode(65 + index) // Convert 0,1,2,3 to A,B,C,D
        })),
        correctOption: String.fromCharCode(65 + parseInt(data.correctAnswer)), // Convert number to letter
        explanation: data.explanation || '',
        subject: data.subject,
        topic: data.topic,
        difficultyLevel: data.difficulty,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
      };

      if (editingQuestion) {
        await api.updateQuestion(editingQuestion._id, transformedData);
        toast.success('Question updated successfully');
      } else {
        await api.createQuestion(transformedData);
        toast.success('Question created successfully');
      }
      
      setShowCreateModal(false);
      setEditingQuestion(null);
      reset();
      fetchQuestions();
    } catch (error) {
      console.error('Error saving question:', error);
      toast.error(error.response?.data?.message || 'Failed to save question');
    }
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    
    // Convert server format to form format
    const formOptions = question.options.map(option => option.text);
    const correctAnswerIndex = question.options.findIndex(option => option.label === question.correctOption);
    
    reset({
      question: question.questionText,
      options: formOptions,
      correctAnswer: correctAnswerIndex,
      explanation: question.explanation || '',
      subject: question.subject._id,
      topic: question.topic._id,
      difficulty: question.difficultyLevel,
      tags: question.tags ? question.tags.join(', ') : ''
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await api.deleteQuestion(questionId);
        toast.success('Question deleted successfully');
        fetchQuestions();
      } catch (error) {
        toast.error('Failed to delete question');
      }
    }
  };

  const filteredQuestions = (questions || []).filter(question => {
    return (
      (!filters.subject || (question.subject && question.subject._id === filters.subject)) &&
      (!filters.topic || (question.topic && question.topic._id === filters.topic)) &&
      (!filters.difficulty || question.difficultyLevel === filters.difficulty) &&
      (!filters.search || (question.questionText && question.questionText.toLowerCase().includes(filters.search.toLowerCase())))
    );
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Questions</h1>
              <p className="mt-2 text-sm text-gray-600">
                Manage your MCQ questions
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowBulkModal(true)}
                className="btn-secondary flex items-center"
              >
                <DocumentArrowUpIcon className="h-5 w-5 mr-2" />
                Bulk Add
              </button>
              <button
                onClick={() => {
                  setEditingQuestion(null);
                  reset();
                  setShowCreateModal(true);
                }}
                className="btn-primary flex items-center"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Question
            </button>
          </div>
        </div>
      </div>

        {/* Filters */}
        <div className="px-4 sm:px-0 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center mb-4">
              <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Filters</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <select
                  value={filters.subject}
                  onChange={(e) => {
                    setFilters({ ...filters, subject: e.target.value, topic: '' });
                    if (e.target.value) {
                      fetchTopics(e.target.value);
                    } else {
                      setTopics([]);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Subjects</option>
                  {subjects.map(subject => (
                    <option key={subject._id} value={subject._id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Topic
                </label>
                <select
                  value={filters.topic}
                  onChange={(e) => setFilters({ ...filters, topic: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  disabled={!filters.subject}
                >
                  <option value="">All Topics</option>
                  {topics.map(topic => (
                    <option key={topic._id} value={topic._id}>
                      {topic.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty
                </label>
                <select
                  value={filters.difficulty}
                  onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Search questions..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="px-4 sm:px-0">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Questions ({filteredQuestions.length})
              </h3>
            </div>
            
            {filteredQuestions.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-12 w-12 text-gray-400">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No questions found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating your first question.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredQuestions.map((question) => (
                  <div key={question._id} className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-gray-900 mb-2">
                          {question.questionText}
                        </h4>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="badge badge-primary">
                            {question.subject.name}
                          </span>
                          <span className="badge badge-secondary">
                            {question.topic.name}
                          </span>
                          <span className={`badge ${
                            question.difficultyLevel === 'easy' ? 'badge-success' :
                            question.difficultyLevel === 'medium' ? 'badge-warning' :
                            'badge-danger'
                          }`}>
                            {question.difficultyLevel}
                          </span>
                          {question.marks && (
                            <span className="badge badge-info">
                              {question.marks} marks
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                          {question.options.map((option, index) => (
                            <div
                              key={index}
                              className={`p-2 rounded ${
                                option.label === question.correctOption
                                  ? 'bg-green-50 text-green-800 border border-green-200'
                                  : 'bg-gray-50'
                              }`}
                            >
                              {option.label}. {option.text}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleEdit(question)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(question._id)}
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
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingQuestion ? 'Edit Question' : 'Create New Question'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingQuestion(null);
                    reset();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Question Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question Text *
                  </label>
                  <textarea
                    {...register('question', { required: 'Question text is required' })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter your question..."
                  />
                  {errors.question && (
                    <p className="mt-1 text-sm text-red-600">{errors.question.message}</p>
                  )}
                </div>

                {/* Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Options *
                  </label>
                  {[0, 1, 2, 3].map((index) => (
                    <div key={index} className="mb-2">
                      <input
                        {...register(`options.${index}`, { required: 'Option is required' })}
                        type="text"
                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                      {errors.options?.[index] && (
                        <p className="mt-1 text-sm text-red-600">{errors.options[index].message}</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Correct Answer */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Correct Answer *
                  </label>
                  <select
                    {...register('correctAnswer', { required: 'Correct answer is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select correct answer</option>
                    <option value="0">Option A</option>
                    <option value="1">Option B</option>
                    <option value="2">Option C</option>
                    <option value="3">Option D</option>
                  </select>
                  {errors.correctAnswer && (
                    <p className="mt-1 text-sm text-red-600">{errors.correctAnswer.message}</p>
                  )}
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject *
                  </label>
                  <select
                    {...register('subject', { required: 'Subject is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select subject</option>
                    {subjects.map(subject => (
                      <option key={subject._id} value={subject._id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
                  )}
                </div>

                {/* Topic */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Topic *
                  </label>
                  <select
                    {...register('topic', { required: 'Topic is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    disabled={!selectedSubject}
                  >
                    <option value="">Select topic</option>
                    {topics.map(topic => (
                      <option key={topic._id} value={topic._id}>
                        {topic.name}
                      </option>
                    ))}
                  </select>
                  {errors.topic && (
                    <p className="mt-1 text-sm text-red-600">{errors.topic.message}</p>
                  )}
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty
                  </label>
                  <select
                    {...register('difficulty')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select difficulty</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                {/* Marks */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marks *
                  </label>
                  <input
                    {...register('marks', {
                      required: 'Marks is required',
                      min: { value: 1, message: 'Marks must be at least 1' },
                      max: { value: 100, message: 'Marks cannot exceed 100' }
                    })}
                    type="number"
                    min="1"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter marks for this question"
                  />
                  {errors.marks && (
                    <p className="mt-1 text-sm text-red-600">{errors.marks.message}</p>
                  )}
                </div>

                {/* Explanation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Explanation
                  </label>
                  <textarea
                    {...register('explanation')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Optional explanation for the answer..."
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <input
                    {...register('tags')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter tags separated by commas..."
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingQuestion(null);
                      reset();
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingQuestion ? 'Update Question' : 'Create Question'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Questions Modal */}
      <BulkQuestions
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onSuccess={() => {
          fetchQuestions();
          setShowBulkModal(false);
        }}
      />
    </div>
  );
};

export default Questions;