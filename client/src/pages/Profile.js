import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  CameraIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

const Profile = () => {
  const { user, updateProfile, loadUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm();

  useEffect(() => {
    if (user) {
      console.log('Profile component - User data received:', user);
      reset({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        // Student fields
        class: user.class || '',
        semester: user.semester || '',
        batch: user.batch || '',
        rollNumber: user.rollNumber || '',
        // Teacher fields
        department: user.department || '',
        qualification: user.qualification || '',
        experience: user.experience || ''
      });
      console.log('Profile component - Form reset with values:', {
        class: user.class || '',
        semester: user.semester || '',
        batch: user.batch || '',
        rollNumber: user.rollNumber || '',
        department: user.department || '',
        qualification: user.qualification || '',
        experience: user.experience || ''
      });
    }
  }, [user, reset]);

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Profile picture must be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      setProfilePicture(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      console.log('Profile update - Form data being submitted:', data);
      const formData = new FormData();

      // Add all form fields, including empty ones
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined) {
          formData.append(key, data[key] || '');
        }
      });

      // Add profile picture if selected
      if (profilePicture) {
        formData.append('profilePicture', profilePicture);
      }

      console.log('Profile update - FormData entries:');
      for (const [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      const result = await updateProfile(formData);
      console.log('Profile update - Result:', result);
      if (result.success) {
        toast.success('Profile updated successfully');
        setIsEditing(false);
        setProfilePicture(null);
        setProfilePicturePreview(null);
        await loadUser(); // Refresh user data
      } else {
        toast.error(result.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
    setProfilePicture(null);
    setProfilePicturePreview(null);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'teacher': return 'bg-blue-100 text-blue-800';
      case 'student': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return '👑';
      case 'teacher': return '👨‍🏫';
      case 'student': return '🎓';
      default: return '👤';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header with Profile Card */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  {/* Profile Picture */}
                  <div className="relative">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                      {profilePicturePreview ? (
                        <img
                          src={profilePicturePreview}
                          alt="Profile Preview"
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : user?.profilePicture ? (
                        <img
                          src={user.profilePicture.startsWith('http') ? user.profilePicture : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${user.profilePicture}`}
                          alt="Profile"
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : (
                        <UserCircleIcon className="w-20 h-20 text-gray-400" />
                      )}
                    </div>
                    {isEditing && (
                      <>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePictureChange}
                          className="hidden"
                          id="profile-picture-upload"
                        />
                        <label
                          htmlFor="profile-picture-upload"
                          className="absolute -bottom-2 -right-2 bg-blue-500 text-white rounded-full p-2 shadow-lg hover:bg-blue-600 transition-colors cursor-pointer"
                        >
                          <CameraIcon className="w-4 h-4" />
                        </label>
                      </>
                    )}
                  </div>
                  
                  {/* User Info */}
                  <div className="text-white">
                    <h1 className="text-3xl font-bold">{user?.name || 'User Name'}</h1>
                    <p className="text-blue-100 text-lg">{user?.email}</p>
                    <div className="flex items-center mt-2">
                      <span className="text-2xl mr-2">{getRoleIcon(user?.role)}</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user?.role)}`}>
                        {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Edit Button */}
                <div className="flex space-x-3">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-white text-blue-600 px-6 py-3 rounded-xl font-medium hover:bg-blue-50 transition-colors shadow-lg flex items-center space-x-2"
                    >
                      <PencilIcon className="w-5 h-5" />
                      <span>Edit Profile</span>
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleCancel}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-1"
                      >
                        <XMarkIcon className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <UserIcon className="w-6 h-6 mr-2" />
                Basic Information
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      {...register('name', { required: 'Name is required' })}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
                      } ${errors.name ? 'border-red-300' : 'border-gray-300'}`}
                      placeholder="Enter your full name"
                    />
                    <UserIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                  </div>
                  {errors.name && (
                    <p className="text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠️</span>
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Email Address *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      {...register('email', { 
                        required: 'Email is required',
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
                      } ${errors.email ? 'border-red-300' : 'border-gray-300'}`}
                      placeholder="Enter your email address"
                    />
                    <EnvelopeIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠️</span>
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      {...register('phone')}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
                      } border-gray-300`}
                      placeholder="Enter your phone number"
                    />
                    <PhoneIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      {...register('dateOfBirth')}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
                      } border-gray-300`}
                    />
                    <CalendarIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                  </div>
                </div>

                {/* Address */}
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <div className="relative">
                    <textarea
                      {...register('address')}
                      disabled={!isEditing}
                      rows={3}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${
                        !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
                      } border-gray-300`}
                      placeholder="Enter your address"
                    />
                    <MapPinIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Role-specific Information */}
          {user?.role === 'student' && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <AcademicCapIcon className="w-6 h-6 mr-2" />
                  Academic Information
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Roll Number */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Roll Number
                    </label>
                    <input
                      type="text"
                      {...register('rollNumber')}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                        !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
                      } border-gray-300`}
                      placeholder="Enter your roll number"
                    />
                  </div>

                  {/* Class */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Class
                    </label>
                    <input
                      type="text"
                      {...register('class')}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                        !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
                      } border-gray-300`}
                      placeholder="Enter your class"
                    />
                  </div>

                  {/* Semester */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Semester
                    </label>
                    <select
                      {...register('semester')}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                        !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
                      } border-gray-300`}
                    >
                      <option value="">Select Semester</option>
                      <option value="1st">1st Semester</option>
                      <option value="2nd">2nd Semester</option>
                      <option value="3rd">3rd Semester</option>
                      <option value="4th">4th Semester</option>
                      <option value="5th">5th Semester</option>
                      <option value="6th">6th Semester</option>
                      <option value="7th">7th Semester</option>
                      <option value="8th">8th Semester</option>
                    </select>
                  </div>

                  {/* Batch */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Batch
                    </label>
                    <input
                      type="text"
                      {...register('batch')}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                        !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
                      } border-gray-300`}
                      placeholder="Enter your batch (e.g., 2020-2023)"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {user?.role === 'teacher' && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <BuildingOfficeIcon className="w-6 h-6 mr-2" />
                  Professional Information
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Department */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Department
                    </label>
                    <input
                      type="text"
                      {...register('department')}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                        !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
                      } border-gray-300`}
                      placeholder="Enter your department"
                    />
                  </div>

                  {/* Experience */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Experience (Years)
                    </label>
                    <input
                      type="number"
                      {...register('experience')}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                        !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
                      } border-gray-300`}
                      placeholder="Years of experience"
                    />
                  </div>

                  {/* Qualification */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Qualification
                    </label>
                    <textarea
                      {...register('qualification')}
                      disabled={!isEditing}
                      rows={3}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none ${
                        !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
                      } border-gray-300`}
                      placeholder="Enter your qualifications"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          {isEditing && (
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-5 h-5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Profile;