import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowLeftIcon,
  AcademicCapIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const ImprovementAnalysis = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchImprovementAnalysis = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.getImprovementAnalysis(testId);
      setAnalysisData(response.data);
    } catch (error) {
      console.error('Failed to fetch improvement analysis:', error);
      toast.error('Failed to load improvement analysis');
    } finally {
      setLoading(false);
    }
  }, [testId]);

  useEffect(() => {
    if (user && user.role === 'student') {
      fetchImprovementAnalysis();
    }
  }, [user, fetchImprovementAnalysis]);

  const getChangeIcon = (change) => {
    if (change > 0) return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />;
    if (change < 0) return <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />;
    return <div className="h-4 w-4" />;
  };

  const getChangeColor = (change) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600 bg-green-100';
    if (percentage >= 80) return 'text-blue-600 bg-blue-100';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-100';
    if (percentage >= 60) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getGrade = (percentage) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    return 'F';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">No analysis data available</h2>
          <button
            onClick={() => navigate('/results')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Results
          </button>
        </div>
      </div>
    );
  }

  const { testInfo, attempts, overallImprovement, trends, questionAnalysis } = analysisData;

  // Add null checks for overallImprovement and its properties
  if (!overallImprovement) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Insufficient data for analysis</h2>
          <p className="mt-2 text-gray-600">You need at least one completed attempt to view improvement analysis.</p>
          <button
            onClick={() => navigate('/results')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Results
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/results')}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Results
        </button>
        <h1 className="text-3xl font-bold text-gray-900">{testInfo?.title || 'Test Analysis'}</h1>
        <p className="mt-2 text-gray-600">Improvement Analysis</p>
      </div>

      {/* Overall Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <AcademicCapIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Attempts</p>
              <p className="text-2xl font-bold text-gray-900">{testInfo?.totalAttempts || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Best Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {overallImprovement?.bestAttempt?.percentage?.toFixed(1) || '0.0'}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <ArrowTrendingUpIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Improvement</p>
              <p className={`text-2xl font-bold ${getChangeColor(overallImprovement?.totalImprovement?.percentageChange || 0)}`}>
                {(overallImprovement?.totalImprovement?.percentageChange || 0) > 0 ? '+' : ''}
                {(overallImprovement?.totalImprovement?.percentageChange || 0).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Best Streak</p>
              <p className="text-2xl font-bold text-gray-900">{trends?.bestStreak || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-lg shadow mb-8 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Progress Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-2">First vs Latest Attempt</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">First Attempt:</span>
                <span className={`px-2 py-1 rounded text-sm font-medium ${getGradeColor(overallImprovement?.firstAttempt?.percentage || 0)}`}>
                  {(overallImprovement?.firstAttempt?.percentage || 0).toFixed(1)}% ({getGrade(overallImprovement?.firstAttempt?.percentage || 0)})
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Latest Attempt:</span>
                <span className={`px-2 py-1 rounded text-sm font-medium ${getGradeColor(overallImprovement?.lastAttempt?.percentage || 0)}`}>
                  {(overallImprovement?.lastAttempt?.percentage || 0).toFixed(1)}% ({getGrade(overallImprovement?.lastAttempt?.percentage || 0)})
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Score:</span>
                <span className={`px-2 py-1 rounded text-sm font-medium ${getGradeColor(overallImprovement?.averageScore || 0)}`}>
                  {(overallImprovement?.averageScore || 0).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-2">Trends</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Overall Trend:</span>
                <div className="flex items-center">
                  {getChangeIcon(overallImprovement?.totalImprovement?.percentageChange || 0)}
                  <span className={`ml-1 text-sm font-medium ${getChangeColor(overallImprovement?.totalImprovement?.percentageChange || 0)}`}>
                    {trends?.improving ? 'Improving' : 'Needs Work'}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Consistent Progress:</span>
                <span className={`text-sm font-medium ${trends?.consistentImprovement ? 'text-green-600' : 'text-orange-600'}`}>
                  {trends?.consistentImprovement === null ? 'N/A' : trends?.consistentImprovement ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attempt History */}
      <div className="bg-white rounded-lg shadow mb-8 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Attempt History</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attempt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Percentage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Improvement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(attempts || []).map((attempt, index) => (
                <tr key={attempt.attemptNumber || index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{attempt.attemptNumber || index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {attempt.score || 0}/{testInfo?.totalMarks || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-sm font-medium ${getGradeColor(attempt.percentage || 0)}`}>
                      {(attempt.percentage || 0).toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getGrade(attempt.percentage || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {index > 0 && (
                      <div className="flex items-center">
                        {getChangeIcon(attempt.improvement || 0)}
                        <span className={`ml-1 text-sm font-medium ${getChangeColor(attempt.improvement || 0)}`}>
                          {(attempt.improvement || 0) > 0 ? '+' : ''}{(attempt.improvement || 0).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Question-wise Analysis */}
      {questionAnalysis && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Question-wise Analysis</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-900">Consistently Correct</p>
                    <p className="text-2xl font-bold text-green-600">{questionAnalysis.consistentlyCorrect || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <ArrowTrendingUpIcon className="h-6 w-6 text-yellow-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-yellow-900">Improved</p>
                    <p className="text-2xl font-bold text-yellow-600">{questionAnalysis.improved || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <XCircleIcon className="h-6 w-6 text-red-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-900">Need Attention</p>
                    <p className="text-2xl font-bold text-red-600">{questionAnalysis.needsAttention || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {questionAnalysis.details && questionAnalysis.details.length > 0 && (
              <div className="mt-6">
                <h4 className="text-md font-medium text-gray-700 mb-3">Detailed Question Analysis</h4>
                <div className="space-y-3">
                  {questionAnalysis.details.map((question, index) => (
                    <div key={question.questionId || index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            Question {index + 1}: {question.questionText || 'Question text not available'}
                          </p>
                          <div className="mt-2 flex items-center space-x-4">
                            <span className="text-xs text-gray-500">
                              Correct: {question.correctCount || 0}/{(attempts || []).length}
                            </span>
                            <span className="text-xs text-gray-500">
                              Success Rate: {question.successRate ? question.successRate.toFixed(1) : '0.0'}%
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            question.status === 'consistent' 
                              ? 'bg-green-100 text-green-800'
                              : question.status === 'improved'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {question.status === 'consistent' && <CheckCircleIcon className="h-3 w-3 mr-1" />}
                            {question.status === 'improved' && <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />}
                            {question.status === 'needs-attention' && <XCircleIcon className="h-3 w-3 mr-1" />}
                            {question.status === 'consistent' ? 'Consistent' : 
                             question.status === 'improved' ? 'Improved' : 'Needs Attention'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImprovementAnalysis;