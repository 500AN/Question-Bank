import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import {
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
  ArrowLeftIcon,
  DocumentArrowDownIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const TestAttendance = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && (user.role === 'teacher' || user.role === 'admin')) {
      fetchAttendanceData();
    }
  }, [user, testId]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      console.log('TestAttendance - Fetching data for testId:', testId);
      console.log('TestAttendance - User:', user);
      const response = await api.getTestAttendance(testId);
      console.log('TestAttendance - Response:', response);
      setAttendanceData(response.data);
    } catch (error) {
      console.error('TestAttendance - Failed to fetch attendance data:', error);
      console.error('TestAttendance - Error response:', error.response);
      toast.error('Failed to fetch attendance data');
      navigate('/tests');
    } finally {
      setLoading(false);
    }
  };

  const exportAttendance = async () => {
    try {
      const response = await api.get(`/tests/${testId}/attendance/export`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `test-attendance-${testId}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Attendance report exported successfully');
    } catch (error) {
      console.error('Failed to export attendance:', error);
      toast.error('Failed to export attendance report');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Attempted':
        return 'text-green-600 bg-green-100';
      case 'Not Attempted':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    if (percentage >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!attendanceData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Data Available</h2>
          <p className="text-gray-600">Unable to load attendance data.</p>
        </div>
      </div>
    );
  }

  const { test, summary, attendance } = attendanceData;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/tests')}
            className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Test Attendance</h1>
            <p className="text-gray-600 mt-1">{test?.title}</p>
          </div>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={exportAttendance}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Test Info */}
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Test Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Marks</p>
            <p className="text-lg font-semibold text-gray-900">{test?.totalMarks || 0}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Duration</p>
            <p className="text-lg font-semibold text-gray-900">{test?.durationMinutes || 0} minutes</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Restrictions</p>
            <div className="text-sm text-gray-900">
              {test?.restrictions?.batch && <div>Batch: {test.restrictions.batch}</div>}
              {test?.restrictions?.semester && <div>Semester: {test.restrictions.semester}</div>}
              {test?.restrictions?.department && <div>Dept: {test.restrictions.department}</div>}
              {test?.restrictions?.class && <div>Class: {test.restrictions.class}</div>}
              {!test?.restrictions?.batch && !test?.restrictions?.semester &&
               !test?.restrictions?.department && !test?.restrictions?.class && (
                <div className="text-gray-500">No restrictions</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Eligible Students</p>
              <p className="text-2xl font-bold text-gray-900">{summary?.totalEligible || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Attempted</p>
              <p className="text-2xl font-bold text-gray-900">{summary?.totalAttempted || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <XCircleIcon className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Not Attempted</p>
              <p className="text-2xl font-bold text-gray-900">{summary?.totalNotAttempted || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Attendance %</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary?.attendancePercentage ? summary.attendancePercentage.toFixed(1) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ClockIcon className="h-6 w-6 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">
              Average Score: {summary?.averageScore ? summary.averageScore.toFixed(1) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Student Attendance Details</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Roll Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attempts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Best Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Attempt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendance?.map((record) => (
                <tr key={record.student._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {record.student.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {record.student.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.student.rollNumber || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      {record.student.class && <div>Class: {record.student.class}</div>}
                      {record.student.semester && <div>Sem: {record.student.semester}</div>}
                      {record.student.batch && <div>Batch: {record.student.batch}</div>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.totalAttempts}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {record.attempted ? (
                      <span className={`font-medium ${getScoreColor(record.bestScore)}`}>
                        {record.bestScore.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.lastAttemptDate ? (
                      new Date(record.lastAttemptDate).toLocaleDateString()
                    ) : (
                      'Never'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.attempts.length > 0 && (
                      <div className="space-y-1">
                        {record.attempts.map((attempt, index) => (
                          <div key={index} className="text-xs">
                            Attempt {attempt.attemptNumber}: {attempt.percentage.toFixed(1)}%
                            {attempt.submittedAt && (
                              <span className="text-gray-400 ml-1">
                                ({new Date(attempt.submittedAt).toLocaleDateString()})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {attendance?.length === 0 && (
          <div className="text-center py-12">
            <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
            <p className="mt-1 text-sm text-gray-500">
              No eligible students found for this test based on the restrictions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestAttendance;