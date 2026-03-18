import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiFileText, FiGrid, FiRefreshCw, FiPlus } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const ViewAllFormsPage = () => {
  const { user, token } = useSelector((state) => state.auth);
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const navigate = useNavigate();

  const fetchForms = async () => {
    if (!user || !token) return;
    setLoading(true);

    try {
      const response = await axios.get(`/api/user/${user.user_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setForms(response.data.forms || []);
      setError('');
    } catch (err) {
      setError('Unable to load forms. Please try again later.');
      console.error('Error fetching forms:', err);
      toast.error('Failed to load forms.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !token) {
      navigate('/signin');
      return;
    }
    fetchForms();
  }, [user, token, navigate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeDropdown && !event.target.closest(`[data-dropdown-id="${activeDropdown}"]`)) {
        setActiveDropdown(null);
      }
    };
    
    if (activeDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [activeDropdown]);

  const handleFormClick = (form) => {
    navigate(`/forms/${form.form_id}`, { state: { form } });
  };

  const handleDeleteForm = async (formId, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`/api/forms/${formId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      toast.success('Form deleted successfully!');
      fetchForms();
      setActiveDropdown(null);
    } catch (error) {
      console.error('Error deleting form:', error);
      toast.error('Failed to delete form. Please try again.');
    }
  };

  const toggleDropdown = (formId, e) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === formId ? null : formId);
  };

  const getStatusBadge = (status) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    switch (status) {
      case 'active':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'draft':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'archived':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 flex items-center gap-2">
          <FiRefreshCw className="animate-spin" />
          Loading forms...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Forms</h1>
          <p className="text-gray-600">Manage and view all your created forms</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Your Forms ({forms.length})
              </h2>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-blue-500 hover:text-blue-600 font-medium"
              >
                Back to Dashboard
              </button>
            </div>
          </div>

          <div className="p-6">
            {forms.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-600 text-lg mb-4">No forms found</p>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors mx-auto"
                >
                  <FiPlus className="w-5 h-5" />
                  Create Your First Form
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {forms.map((form) => (
                  <div
                    key={form.form_id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleFormClick(form)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {form.title || 'Untitled Form'}
                      </h3>
                      <div className="relative" data-dropdown-id={form.form_id}>
                        <button 
                          className="text-gray-400 hover:text-gray-600 p-1" 
                          onClick={(e) => toggleDropdown(form.form_id, e)}
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                        {activeDropdown === form.form_id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                            <div className="py-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFormClick(form);
                                  setActiveDropdown(null);
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Edit Form
                              </button>
                              <button
                                onClick={(e) => handleDeleteForm(form.form_id, e)}
                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                              >
                                Delete Form
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {form.description || 'No description provided'}
                    </p>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {form.responses || 0} responses
                      </div>
                      <span className={getStatusBadge(form.status || 'draft')}>
                        {form.status || 'draft'}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs">
                      Created {formatDate(form.createdAt || form.created_at || new Date())}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAllFormsPage;
