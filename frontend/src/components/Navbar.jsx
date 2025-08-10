import React, { useState, useRef, useEffect } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';

const Navbar = () => {
  const authState = useSelector((state) => state.auth);
  const { isLoggedIn, isAuthenticated, user, token } = authState;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    console.log('🚪 Logging out...');
    dispatch(logout());
    navigate('/');
  };

  const userIsAuthenticated = isLoggedIn || isAuthenticated;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-gray-800">
          <a href="/"><span className="text-blue-600">T</span> FormCraft</a>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          <Link to={userIsAuthenticated ? "/dashboard" : "/"} className="text-gray-600 hover:text-blue-600">
            Home
          </Link>
          <Link to="/features" className="text-gray-600 hover:text-blue-600">
            Features
          </Link>
          <Link to="/example" className="text-gray-600 hover:text-blue-600">
            Examples
          </Link>
        </div>

        {userIsAuthenticated ? (
          <div className="relative" ref={dropdownRef}>
            <div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
            >
              <FaUserCircle className="text-2xl text-blue-600" />
              <span className="text-gray-700 font-medium">
                {user?.firstName ? user.firstName : user?.email || 'Profile'}
              </span>
            </div>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <Link to="/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/signin" className="px-5 py-2 text-gray-700 font-semibold border border-gray-200 rounded-lg hover:bg-gray-100">
            Sign In
          </Link>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
