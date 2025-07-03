import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  UserIcon,
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = () => {
    const commonItems = [
      { name: 'Dashboard', href: '/dashboard', icon: AcademicCapIcon },
    ];

    if (user?.role === 'teacher') {
      return [
        ...commonItems,
        { name: 'Subjects', href: '/subjects', icon: BookOpenIcon },
        { name: 'Questions', href: '/questions', icon: ClipboardDocumentListIcon },
        { name: 'Tests', href: '/tests', icon: AcademicCapIcon },
        { name: 'Student Reports', href: '/student-reports', icon: UserIcon },
        { name: 'Results', href: '/results', icon: ClipboardDocumentListIcon },
      ];
    } else if (user?.role === 'student') {
      return [
        ...commonItems,
        { name: 'Available Tests', href: '/available-tests', icon: AcademicCapIcon },
        { name: 'Results', href: '/results', icon: ClipboardDocumentListIcon },
      ];
    }

    return commonItems;
  };

  const navItems = getNavItems();

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-700 shadow-lg border-b border-blue-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <AcademicCapIcon className="h-8 w-8 text-white mr-2" />
              <span className="text-xl font-bold text-white">MCQ Test</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:ml-8 md:flex md:space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200 group"
                  >
                    <Icon className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* User Info */}
            <div className="hidden md:flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-white/10 rounded-full px-3 py-1">
                <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-white" />
                </div>
                <div className="text-white">
                  <div className="text-sm font-medium">{user?.name}</div>
                  <div className="text-xs text-white/70 capitalize">{user?.role}</div>
                </div>
              </div>
            </div>

            {/* Profile Link */}
            <Link
              to="/profile"
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200"
            >
              <UserIcon className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Profile</span>
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-white/90 hover:text-white hover:bg-red-500/20 transition-all duration-200"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white/20"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white/5 rounded-lg mt-2 mb-2">
              {/* User Info Mobile */}
              <div className="flex items-center space-x-3 px-3 py-2 mb-2 bg-white/10 rounded-md">
                <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-white" />
                </div>
                <div className="text-white">
                  <div className="text-sm font-medium">{user?.name}</div>
                  <div className="text-xs text-white/70 capitalize">{user?.role}</div>
                </div>
              </div>

              {/* Navigation Items */}
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}

              {/* Profile and Logout for Mobile */}
              <div className="border-t border-white/20 pt-2 mt-2">
                <Link
                  to="/profile"
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <UserIcon className="h-5 w-5 mr-3" />
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-white/90 hover:text-white hover:bg-red-500/20 transition-all duration-200"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;