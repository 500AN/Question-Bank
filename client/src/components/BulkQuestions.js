import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  TrashIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const BulkQuestions = ({ isOpen, onClose, onSuccess }) => {
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importMode, setImportMode] = useState('manual'); // 'manual' or 'excel'
  const [selectedFile, setSelectedFile] = useState(null);
  const [importResults, setImportResults] = useState(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      questions: [
        {
          questionText: '',
          options: [
            { text: '', label: 'A' },
            { text: '', label: 'B' },
            { text: '', label: 'C' },
            { text: '', label: 'D' },
          ],
          correctOption: 'A',
          explanation: '',
          subject: '',
          topic: '',
          difficultyLevel: 'medium',
          tags: '',
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
  });

  const selectedSubject = watch('questions.0.subject');

  useEffect(() => {
    if (isOpen) {
      fetchSubjects();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedSubject) {
      fetchTopics(selectedSubject);
    }
  }, [selectedSubject]);

  const fetchSubjects = async () => {
    try {
      const response = await api.getSubjects();
      setSubjects(response.data.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to fetch subjects');
    }
  };

  const fetchTopics = async (subjectId) => {
    try {
      const response = await api.getSubjectTopics(subjectId);
      setTopics(response.data.data);
    } catch (error) {
      console.error('Error fetching topics:', error);
      setTopics([]);
    }
  };

  const addQuestion = () => {
    append({
      questionText: '',
      options: [
        { text: '', label: 'A' },
        { text: '', label: 'B' },
        { text: '', label: 'C' },
        { text: '', label: 'D' },
      ],
      correctOption: 'A',
      explanation: '',
      subject: '',
      topic: '',
      difficultyLevel: 'medium',
      tags: '',
    });
  };

  const removeQuestion = (index) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Transform data for API
      const questionsData = data.questions.map((question) => ({
        ...question,
        tags: question.tags ? question.tags.split(',').map((tag) => tag.trim()) : [],
      }));

      const response = await api.bulkCreateQuestions(questionsData);
      
      if (response.data.success) {
        toast.success(response.data.message);
        setImportResults(response.data.data);
        if (response.data.data.errorCount === 0) {
          onSuccess();
          onClose();
        }
      }
    } catch (error) {
      console.error('Error creating questions:', error);
      toast.error(error.response?.data?.message || 'Failed to create questions');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    setLoading(true);
    try {
      const response = await api.importQuestionsFromExcel(selectedFile);
      
      if (response.data.success) {
        toast.success(response.data.message);
        setImportResults(response.data.data);
        if (response.data.data.errorCount === 0) {
          onSuccess();
          onClose();
        }
      }
    } catch (error) {
      console.error('Error importing questions:', error);
      toast.error(error.response?.data?.message || 'Failed to import questions');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await api.downloadQuestionTemplate();
      
      // Create blob and download
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'question_template.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Template downloaded successfully');
    } catch (error) {
      console.error('Error downloading template:', error);
      toast.error('Failed to download template');
    }
  };

  const handleClose = () => {
    reset();
    setSelectedFile(null);
    setImportResults(null);
    setImportMode('manual');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Bulk Add Questions
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Mode Selection */}
          <div className="mb-6">
            <div className="flex space-x-4">
              <button
                onClick={() => setImportMode('manual')}
                className={`px-4 py-2 rounded-md font-medium ${
                  importMode === 'manual'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Manual Entry
              </button>
              <button
                onClick={() => setImportMode('excel')}
                className={`px-4 py-2 rounded-md font-medium ${
                  importMode === 'excel'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Excel Import
              </button>
            </div>
          </div>

          {importMode === 'manual' ? (
            <div className="overflow-y-auto max-h-[60vh]">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {fields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Question {index + 1}
                      </h3>
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestion(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Question Text */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Question Text *
                        </label>
                        <textarea
                          {...register(`questions.${index}.questionText`, {
                            required: 'Question text is required',
                          })}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter your question here..."
                        />
                        {errors.questions?.[index]?.questionText && (
                          <p className="text-red-600 text-sm mt-1">
                            {errors.questions[index].questionText.message}
                          </p>
                        )}
                      </div>

                      {/* Options */}
                      {['A', 'B', 'C', 'D'].map((label, optionIndex) => (
                        <div key={label}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Option {label} *
                          </label>
                          <input
                            {...register(`questions.${index}.options.${optionIndex}.text`, {
                              required: `Option ${label} is required`,
                            })}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={`Option ${label}`}
                          />
                          <input
                            {...register(`questions.${index}.options.${optionIndex}.label`)}
                            type="hidden"
                            value={label}
                          />
                          {errors.questions?.[index]?.options?.[optionIndex]?.text && (
                            <p className="text-red-600 text-sm mt-1">
                              {errors.questions[index].options[optionIndex].text.message}
                            </p>
                          )}
                        </div>
                      ))}

                      {/* Correct Option */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Correct Answer *
                        </label>
                        <select
                          {...register(`questions.${index}.correctOption`, {
                            required: 'Correct answer is required',
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                        </select>
                      </div>

                      {/* Subject */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Subject *
                        </label>
                        <select
                          {...register(`questions.${index}.subject`, {
                            required: 'Subject is required',
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Subject</option>
                          {subjects.map((subject) => (
                            <option key={subject._id} value={subject._id}>
                              {subject.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Topic */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Topic *
                        </label>
                        <select
                          {...register(`questions.${index}.topic`, {
                            required: 'Topic is required',
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Topic</option>
                          {topics.map((topic) => (
                            <option key={topic._id} value={topic._id}>
                              {topic.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Difficulty */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Difficulty
                        </label>
                        <select
                          {...register(`questions.${index}.difficultyLevel`)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>

                      {/* Explanation */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Explanation
                        </label>
                        <textarea
                          {...register(`questions.${index}.explanation`)}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Explain the correct answer..."
                        />
                      </div>

                      {/* Tags */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tags (comma-separated)
                        </label>
                        <input
                          {...register(`questions.${index}.tags`)}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="tag1, tag2, tag3"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Another Question
                  </button>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? 'Creating...' : 'Create Questions'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Excel Import Section */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Upload Excel file
                      </span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        accept=".xlsx,.xls"
                        className="sr-only"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                      />
                      <span className="mt-1 block text-sm text-gray-500">
                        Select .xlsx or .xls file
                      </span>
                    </label>
                  </div>
                  {selectedFile && (
                    <p className="mt-2 text-sm text-green-600">
                      Selected: {selectedFile.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={downloadTemplate}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                  Download Template
                </button>

                <div className="flex space-x-3">
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleFileUpload}
                    disabled={!selectedFile || loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Importing...' : 'Import Questions'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Import Results */}
          {importResults && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Import Results</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-green-100 p-3 rounded">
                  <p className="text-2xl font-bold text-green-600">{importResults.successCount}</p>
                  <p className="text-sm text-green-700">Successful</p>
                </div>
                <div className="bg-red-100 p-3 rounded">
                  <p className="text-2xl font-bold text-red-600">{importResults.errorCount}</p>
                  <p className="text-sm text-red-700">Errors</p>
                </div>
                <div className="bg-blue-100 p-3 rounded">
                  <p className="text-2xl font-bold text-blue-600">{importResults.totalProcessed}</p>
                  <p className="text-sm text-blue-700">Total Processed</p>
                </div>
              </div>
              
              {importResults.errors && importResults.errors.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-red-600 mb-2">Errors:</h4>
                  <div className="max-h-32 overflow-y-auto">
                    {importResults.errors.map((error, index) => (
                      <p key={index} className="text-sm text-red-600">
                        {importMode === 'excel' ? `Row ${error.row}` : `Question ${error.index}`}: {error.message}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkQuestions;