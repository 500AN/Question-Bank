import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  BookOpenIcon,
  AcademicCapIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const Subjects = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [expandedSubjects, setExpandedSubjects] = useState(new Set());
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    topics: []
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await api.getSubjects();
      setSubjects(response.data.data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setError('Failed to fetch subjects');
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSubject) {
        await api.updateSubject(editingSubject._id, formData);
      } else {
        await api.createSubject(formData);
      }
      
      setShowModal(false);
      setEditingSubject(null);
      setFormData({ name: '', code: '', description: '', topics: [] });
      fetchSubjects();
    } catch (error) {
      console.error('Error saving subject:', error);
      setError(error.response?.data?.message || 'Failed to save subject');
    }
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      code: subject.code || '',
      description: subject.description || '',
      topics: subject.topics || []
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        await api.deleteSubject(id);
        fetchSubjects();
      } catch (error) {
        console.error('Error deleting subject:', error);
        setError('Failed to delete subject');
      }
    }
  };

  const toggleSubjectExpansion = (subjectId) => {
    const newExpanded = new Set(expandedSubjects);
    if (newExpanded.has(subjectId)) {
      newExpanded.delete(subjectId);
    } else {
      newExpanded.add(subjectId);
    }
    setExpandedSubjects(newExpanded);
  };

  const addTopic = () => {
    setFormData({
      ...formData,
      topics: [...formData.topics, '']
    });
  };

  const updateTopic = (index, value) => {
    const newTopics = [...formData.topics];
    newTopics[index] = value;
    setFormData({
      ...formData,
      topics: newTopics
    });
  };

  const removeTopic = (index) => {
    const newTopics = formData.topics.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      topics: newTopics
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Subjects</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage subjects and their topics for the MCQ test system.
          </p>
        </div>
        {user?.role === 'teacher' && (
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Subject
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(subjects || []).map((subject) => (
          <div key={subject._id} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AcademicCapIcon className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">{subject.name}</h3>
                    {subject.code && (
                      <p className="text-sm text-gray-500">{subject.code}</p>
                    )}
                  </div>
                </div>
                {user?.role === 'teacher' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(subject)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(subject._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {subject.description && (
                <p className="mt-3 text-sm text-gray-600">{subject.description}</p>
              )}

              {subject.topics && subject.topics.length > 0 && (
                <div className="mt-4">
                  <button
                    onClick={() => toggleSubjectExpansion(subject._id)}
                    className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    {expandedSubjects.has(subject._id) ? (
                      <ChevronDownIcon className="h-4 w-4 mr-1" />
                    ) : (
                      <ChevronRightIcon className="h-4 w-4 mr-1" />
                    )}
                    {(subject.topics || []).length} Topics
                  </button>

                  {expandedSubjects.has(subject._id) && (
                    <div className="mt-2 space-y-1">
                      {(subject.topics || []).map((topic, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-600">
                          <BookOpenIcon className="h-3 w-3 mr-2 text-gray-400" />
                          {topic}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 text-xs text-gray-500">
                Created: {new Date(subject.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {subjects.length === 0 && !loading && (
        <div className="text-center py-12">
          <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No subjects</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new subject.</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingSubject ? 'Edit Subject' : 'Add New Subject'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., MCA101"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">Topics</label>
                    <button
                      type="button"
                      onClick={addTopic}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      + Add Topic
                    </button>
                  </div>
                  <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                    {(formData.topics || []).map((topic, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={topic}
                          onChange={(e) => updateTopic(index, e.target.value)}
                          className="flex-1 border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Topic name"
                        />
                        <button
                          type="button"
                          onClick={() => removeTopic(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingSubject(null);
                      setFormData({ name: '', code: '', description: '', topics: [] });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    {editingSubject ? 'Update' : 'Create'}
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

export default Subjects;