import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../redux/authSlice';
import { FiLock, FiMail } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';

const API_BASE_URL = 'http://localhost:3000';

// Message box component
const MessageBox = ({ message, type }) => {
  if (!message) return null;
  const bgColor = type === 'error' ? 'bg-red-100' : 'bg-green-100';
  const borderColor = type === 'error' ? 'border-red-400' : 'border-green-400';
  const textColor = type === 'error' ? 'text-red-700' : 'text-green-700';

  return (
    <div className={`p-4 mb-4 text-sm ${textColor} ${bgColor} rounded-lg border ${borderColor}`} role="alert">
      {message}
    </div>
  );
};

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      console.log('🔄 Starting login process...', { email });
      
      const res = await fetch(`${API_BASE_URL}/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log('📡 Server response:', data);

      if (!res.ok) throw new Error(data.error || 'Login failed.');

      // Validate response structure
      if (!data.token || !data.user) {
        throw new Error('Invalid server response: missing token or user data');
      }

      console.log('✅ Login successful, updating state...');

      // Update Redux store FIRST
      dispatch(loginSuccess({ token: data.token, user: data.user }));
      console.log('✅ Redux state updated');

      // Verify localStorage was updated
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      console.log('💾 LocalStorage check:', { 
        tokenStored: !!storedToken, 
        userStored: !!storedUser 
      });

      setSuccessMessage('Login successful! Redirecting...');

      // Navigate after a short delay to show success message
      setTimeout(() => {
        console.log('🚀 Navigating to dashboard...');
        navigate('/dashboard', { replace: true });
      }, 1000);

    } catch (err) {
      console.error('❌ Login error:', err);
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">Welcome Back</h2>
        <p className="mt-2 text-center text-sm text-gray-600">Sign in to your FormCraft account</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow sm:rounded-lg sm:px-10">
          {error && <MessageBox message={error} type="error" />}
          {successMessage && <MessageBox message={successMessage} type="success" />}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="py-2 pl-10 block w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="you@example.com"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="py-2 pl-10 block w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <label className="flex items-center text-sm">
                <input type="checkbox" className="mr-2" />
                Remember me
              </label>
              <a href="#" className="text-sm text-blue-600 hover:underline">Forgot password?</a>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
              >
                {loading ? 'Signing In...' : 'Sign In'} →
              </button>
            </div>
          </form>

          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6">
            <button className="flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-sm hover:bg-gray-50 w-full">
              <FcGoogle className="mr-2" /> Google
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="/signup" className="text-blue-600 hover:underline font-medium">
              Sign up for free
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;