import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import {
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

const TakeTest = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [attempt, setAttempt] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // Redirect if not student
  useEffect(() => {
    if (user && user.role !== 'student') {
      navigate('/unauthorized');
    }
  }, [user, navigate]);

  // Fetch attempt data
  useEffect(() => {
    fetchAttempt();
  }, [fetchAttempt]);

  // Timer effect
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining, handleAutoSubmit]);

  // Auto-save answers
  useEffect(() => {
    const saveTimer = setInterval(() => {
      if (Object.keys(answers).length > 0) {
        saveAnswers();
      }
    }, 30000); // Save every 30 seconds

    return () => clearInterval(saveTimer);
  }, [answers, saveAnswers]);

  // Prevent page refresh/close
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const fetchAttempt = useCallback(async () => {
    try {
      const response = await api.getAttempt(attemptId);
      const attemptData = response.data.data;

      if (attemptData.status === 'completed') {
        toast.error('This test has already been completed');
        navigate('/results');
        return;
      }

      setAttempt(attemptData);

      // Convert answers array to object format expected by client
      const answersObj = {};
      if (attemptData.answers && Array.isArray(attemptData.answers)) {
        attemptData.answers.forEach(answer => {
          if (answer.selectedOption !== null) {
            // Convert selectedOption from 'A', 'B', 'C', 'D' to 0, 1, 2, 3
            const optionIndex = answer.selectedOption.charCodeAt(0) - 65; // 'A' = 65
            answersObj[answer.question._id || answer.question] = optionIndex;
          }
        });
      }
      setAnswers(answersObj);

      // Calculate time remaining
      const startTime = new Date(attemptData.startTime);
      const duration = (attemptData.mockTest && attemptData.mockTest.durationMinutes) ? attemptData.mockTest.durationMinutes * 60 * 1000 : 0; // Convert to milliseconds
      const elapsed = Date.now() - startTime.getTime();
      const remaining = Math.max(0, Math.floor((duration - elapsed) / 1000));

      setTimeRemaining(remaining);

      if (remaining <= 0) {
        handleAutoSubmit();
      }
    } catch (error) {
      console.error('Failed to fetch attempt:', error);
      toast.error('Failed to load test');
      navigate('/available-tests');
    } finally {
      setLoading(false);
    }
  }, [attemptId, navigate, handleAutoSubmit]);

  const saveAnswers = useCallback(async () => {
    try {
      await api.saveAnswers(attemptId, answers);
    } catch (error) {
      console.error('Failed to save answers:', error);
    }
  }, [attemptId, answers]);

  const handleAnswerChange = async (questionId, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));

    // Show immediate result if enabled
    if (attempt?.mockTest?.showResultsImmediately) {
      try {
        // Submit the answer immediately
        await api.submitAnswer(attemptId, {
          questionId,
          selectedOption: String.fromCharCode(65 + answerIndex), // Convert 0,1,2,3 to A,B,C,D
          timeSpent: 0
        });

        // Show immediate feedback
        const currentQuestion = attempt.mockTest.questions[currentQuestionIndex];
        const correctAnswer = currentQuestion.correctOption;
        const selectedOption = String.fromCharCode(65 + answerIndex);
        const isCorrect = selectedOption === correctAnswer;

        if (isCorrect) {
          toast.success('Correct! ✅', { duration: 2000 });
        } else {
          toast.error(`Incorrect! The correct answer is ${correctAnswer}`, { duration: 3000 });
        }
      } catch (error) {
        console.error('Failed to submit answer:', error);
      }
    }
  };

  const handleAutoSubmit = useCallback(async () => {
    if (submitting) return;
    
    setSubmitting(true);
    try {
      await api.submitTest(attemptId, answers);
      toast.success('Test submitted automatically due to time expiry');
      navigate('/results');
    } catch (error) {
      toast.error('Failed to submit test');
    }
  }, [attemptId, answers, navigate, submitting]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.submitTest(attemptId, answers);
      toast.success('Test submitted successfully');
      navigate('/results');
    } catch (error) {
      toast.error('Failed to submit test');
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionStatus = (questionId) => {
    if (answers[questionId] !== undefined) {
      return 'answered';
    }
    return 'unanswered';
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Test not found</h2>
          <button
            onClick={() => navigate('/tests')}
            className="mt-4 btn-primary"
          >
            Back to Tests
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = ((attempt.mockTest && attempt.mockTest.questions && attempt.mockTest.questions[currentQuestionIndex]) || {});
  const totalQuestions = ((attempt.mockTest && attempt.mockTest.questions && attempt.mockTest.questions.length) || 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {attempt.mockTest.title}
              </h1>
              <p className="text-sm text-gray-500">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`flex items-center px-3 py-2 rounded-lg ${
                timeRemaining < 300 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
              }`}>
                <ClockIcon className="h-5 w-5 mr-2" />
                <span className="font-mono font-medium">
                  {formatTime(timeRemaining)}
                </span>
              </div>
              
              <button
                onClick={() => setShowSubmitConfirm(true)}
                disabled={submitting}
                className="btn-primary"
              >
                Submit Test
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Panel */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-gray-900">
                    Question {currentQuestionIndex + 1}
                  </h2>
                  <div className="flex items-center space-x-2">
                    {currentQuestion.difficultyLevel && (
                      <span className={`badge ${
                        currentQuestion.difficultyLevel === 'easy' ? 'badge-success' :
                        currentQuestion.difficultyLevel === 'medium' ? 'badge-warning' :
                        'badge-danger'
                      }`}>
                        {currentQuestion.difficultyLevel}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="prose max-w-none">
                  <p className="text-gray-900 text-lg leading-relaxed">
                    {currentQuestion.questionText}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {(currentQuestion.options || []).map((option, index) => (
                  <label
                    key={index}
                    className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
                      answers[currentQuestion._id] === index
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion._id}`}
                      value={index}
                      checked={answers[currentQuestion._id] === index}
                      onChange={() => handleAnswerChange(currentQuestion._id, index)}
                      className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <span className="ml-3 text-gray-900 flex-1">
                      <span className="font-medium mr-2">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      {option.text}
                    </span>
                  </label>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t">
                <button
                  onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="btn-secondary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Previous
                </button>

                <div className="text-sm text-gray-500">
                  {getAnsweredCount()} of {totalQuestions} answered
                </div>

                <button
                  onClick={() => setCurrentQuestionIndex(prev => Math.min(totalQuestions - 1, prev + 1))}
                  disabled={currentQuestionIndex === totalQuestions - 1}
                  className="btn-secondary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ArrowRightIcon className="h-4 w-4 ml-2" />
                </button>
              </div>
            </div>
          </div>

          {/* Question Navigator */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4 sticky top-6">
              <h3 className="font-medium text-gray-900 mb-4">Question Navigator</h3>
              
              <div className="grid grid-cols-5 gap-2 mb-4">
                {((attempt.mockTest && attempt.mockTest.questions) || []).map((question, index) => (
                  <button
                    key={question._id}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`w-8 h-8 text-xs font-medium rounded ${
                      index === currentQuestionIndex
                        ? 'bg-primary-600 text-white'
                        : getQuestionStatus(question._id) === 'answered'
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-100 rounded mr-2"></div>
                  <span className="text-gray-600">Answered ({getAnsweredCount()})</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-100 rounded mr-2"></div>
                  <span className="text-gray-600">Not Answered ({totalQuestions - getAnsweredCount()})</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-primary-600 rounded mr-2"></div>
                  <span className="text-gray-600">Current</span>
                </div>
              </div>

              {timeRemaining < 300 && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
                    <span className="text-sm font-medium text-red-800">
                      Time Running Out!
                    </span>
                  </div>
                  <p className="text-xs text-red-600 mt-1">
                    Please submit your test soon.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/3 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-yellow-600" />
              <h3 className="text-lg font-medium text-gray-900 mt-2">
                Submit Test?
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to submit your test? You have answered{' '}
                  <span className="font-medium">{getAnsweredCount()}</span> out of{' '}
                  <span className="font-medium">{totalQuestions}</span> questions.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Once submitted, you cannot modify your answers.
                </p>
              </div>
              <div className="flex justify-center space-x-3 px-4 py-3">
                <button
                  onClick={() => setShowSubmitConfirm(false)}
                  className="btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Test'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TakeTest;