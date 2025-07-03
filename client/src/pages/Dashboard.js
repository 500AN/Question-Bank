import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ChartBarIcon,
  ClockIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, activityResponse] = await Promise.all([
        api.getDashboardStats(),
        api.getRecentActivity()
      ]);

      setStats(statsResponse.data.data);
      setRecentActivity(activityResponse.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTeacherStats = () => [
    {
      name: 'Total Questions',
      value: stats.totalQuestions || '0',
      icon: ClipboardDocumentListIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Active Tests',
      value: stats.activeTests || '0',
      icon: AcademicCapIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Students Enrolled',
      value: stats.studentsEnrolled || '0',
      icon: UserGroupIcon,
      color: 'bg-purple-500',
    },
    {
      name: 'Total Attempts',
      value: stats.totalAttempts || '0',
      icon: ChartBarIcon,
      color: 'bg-orange-500',
    },
  ];

  const getStudentStats = () => [
    {
      name: 'Tests Taken',
      value: stats.testsTaken || '0',
      icon: AcademicCapIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Average Score',
      value: `${stats.averageScore || '0'}%`,
      icon: ChartBarIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Available Tests',
      value: stats.availableTests || '0',
      icon: ClipboardDocumentListIcon,
      color: 'bg-purple-500',
    },
    {
      name: 'Subjects',
      value: stats.subjects || '0',
      icon: AcademicCapIcon,
      color: 'bg-orange-500',
    },
  ];

  const displayStats = user?.role === 'teacher' ? getTeacherStats() : getStudentStats();

  const getQuickActions = () => {
    if (user?.role === 'teacher') {
      return [
        {
          name: 'Create Question',
          description: 'Add new MCQ questions to your question bank',
          href: '/questions',
          icon: ClipboardDocumentListIcon,
          color: 'bg-blue-600 hover:bg-blue-700',
        },
        {
          name: 'Create Test',
          description: 'Create a new mock test for students',
          href: '/tests',
          icon: AcademicCapIcon,
          color: 'bg-green-600 hover:bg-green-700',
        },
        {
          name: 'View Results',
          description: 'Monitor student performance and results',
          href: '/results',
          icon: ChartBarIcon,
          color: 'bg-purple-600 hover:bg-purple-700',
        },
      ];
    } else {
      return [
        {
          name: 'Take Test',
          description: 'Browse and take available mock tests',
          href: '/available-tests',
          icon: AcademicCapIcon,
          color: 'bg-blue-600 hover:bg-blue-700',
        },
        {
          name: 'View Results',
          description: 'Check your test performance and reviews',
          href: '/results',
          icon: ChartBarIcon,
          color: 'bg-green-600 hover:bg-green-700',
        },
        {
          name: 'Update Profile',
          description: 'Manage your profile information',
          href: '/profile',
          icon: UserGroupIcon,
          color: 'bg-purple-600 hover:bg-purple-700',
        },
      ];
    }
  };

  const quickActions = getQuickActions();

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
          <div className="border-b border-gray-200 pb-5">
            <h1 className="text-3xl font-bold leading-6 text-gray-900">
              Welcome back, {user?.name}!
            </h1>
            <p className="mt-2 max-w-4xl text-sm text-gray-500">
              {user?.role === 'teacher'
                ? 'Manage your questions and tests, track student performance.'
                : 'Take tests, track your progress, and improve your knowledge.'}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="px-4 sm:px-0">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {displayStats.map((stat) => (
              <div
                key={stat.name}
                className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
              >
                <dt>
                  <div className={`absolute ${stat.color} rounded-md p-3`}>
                    <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </p>
                </dt>
                <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </dd>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-4 sm:px-0 mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action) => (
              <div
                key={action.name}
                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg shadow hover:shadow-md transition-shadow duration-200"
              >
                <div>
                  <span className={`rounded-lg inline-flex p-3 ${action.color} text-white`}>
                    <action.icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium">
                    <Link to={action.href} className="focus:outline-none">
                      <span className="absolute inset-0" aria-hidden="true" />
                      {action.name}
                    </Link>
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">{action.description}</p>
                </div>
                <span
                  className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400"
                  aria-hidden="true"
                >
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="m11.293 17.293 1.414 1.414L19.414 12l-6.707-6.707-1.414 1.414L15.586 11H5v2h10.586l-4.293 4.293z" />
                  </svg>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="px-4 sm:px-0 mt-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Recent Activity
              </h3>
              <div className="mt-5">
                {recentActivity.length === 0 ? (
                  <div className="text-center py-12">
                    <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {user?.role === 'teacher'
                        ? 'Start by creating your first question or test.'
                        : 'Take your first test to see activity here.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                          {activity.type === 'test_attempt' || activity.type === 'my_attempt' ? (
                            <TrophyIcon className="h-6 w-6 text-blue-600" />
                          ) : (
                            <ClockIcon className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.message}
                          </p>
                          <p className="text-sm text-gray-500">
                            Score: {activity.score} • {new Date(activity.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;