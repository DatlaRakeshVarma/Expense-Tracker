import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, Moon, Sun, IndianRupee, Menu, X, User } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/expenses', label: 'Expenses' },
    { path: '/analytics', label: 'Analytics' },
  ];

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo + Desktop Navigation */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-3 flex-shrink-0">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg shadow-md transform hover:scale-105 transition-transform duration-200">
                <IndianRupee className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                ExpenseTracker
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex space-x-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md transform scale-105'
                      : 'text-gray-700 hover:text-emerald-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-emerald-400 dark:hover:bg-gray-700'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side - Desktop Controls */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 transform hover:scale-110"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            
            {/* User Info */}
            <div className="flex items-center space-x-3 px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="p-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="text-sm">
                <span className="font-medium text-gray-900 dark:text-white">
                  {user?.name}
                </span>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.email}
                </div>
              </div>
            </div>
            
            {/* Logout Button */}
            <button
              onClick={logout}
              className="p-2 rounded-lg text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 transform hover:scale-110"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>

          {/* Mobile Controls */}
          <div className="lg:hidden flex items-center space-x-3">
            {/* Dark Mode Toggle - Mobile */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={handleMobileMenuToggle}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
              title="Menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            {/* User Info Section - Mobile */}
            <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-base font-medium text-gray-900 dark:text-white">
                    {user?.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Links - Mobile */}
            <div className="px-4 py-4 space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={closeMobileMenu}
                  className={`block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                      : 'text-gray-700 hover:text-emerald-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-emerald-400 dark:hover:bg-gray-700'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Logout Section - Mobile */}
            <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  logout();
                  closeMobileMenu();
                }}
                className="flex items-center space-x-3 w-full px-4 py-3 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
              >
                <LogOut className="h-5 w-5" />
                <span className="text-base font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;