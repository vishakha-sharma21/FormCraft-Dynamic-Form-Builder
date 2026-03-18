import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import InputQuery from './InputQuery';
import axios from 'axios';
import { FiPlus, FiGrid, FiFileText, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
  const { isLoggedIn, user, token } = useSelector((state) => state.auth);
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const navigate = useNavigate();

  const fetchForms = async () => {
    if (!user || !token) return;
    setLoading(true); // Set loading to true when fetching starts

    try {
      const response = await axios.get(`/api/user/${user.user_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log('Dashboard - Forms API Response:', response.data);
      console.log('Dashboard - Forms array:', response.data.forms);
      
      setForms(response.data.forms || []);
      setError(''); // Clear any previous errors
    } catch (err) {
      setError('Unable to load forms. Please try again later.');
      console.error('Error fetching forms:', err);
      toast.error('Failed to load forms.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn || !user || !token) {
      navigate('/signin');
      return;
    }
    fetchForms();
  }, [isLoggedIn, user, token, navigate]);

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

  const handleSaveForm = async ({ title, fields }) => {
    try {
      if (!user || !user.user_id) {
        throw new Error('User not authenticated');
      }

      const payload = {
        userId: user.user_id,
        title: title,
        fields: fields,
      };

      await axios.post('/api/forms/save', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      toast.success('Form saved successfully!');
      await fetchForms();
      setShowCreateForm(false);

    } catch (error) {
      console.error('Error saving form:', error);
      toast.error('Failed to save form. Please try again.');
    }
  };

  const handleCreateNewForm = () => {
    setShowCreateForm(true);
  };

  const handleBrowseTemplates = () => {
    navigate('/example');
  };

  const handleViewAllForms = () => {
    navigate('/view-all-forms');
  };

  const handleFormClick = (form) => {
    console.log('Form clicked:', form);
    // Navigate to form details/edit page
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
      fetchForms(); // Refresh the forms list
      setActiveDropdown(null); // Close dropdown
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

  const totalForms = forms.length;
  const activeForms = forms.filter((form) => form.status === 'active').length;
  const totalResponses = forms.reduce((sum, form) => sum + (form.responses || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {loading ? (
        <div className="text-gray-600 flex items-center justify-center">
          <FiRefreshCw className="animate-spin" />
          Loading dashboard...
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user.firstName || user.name || user.email}! 👋
            </h1>
            <p className="text-gray-600">Ready to create amazing forms today?</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Forms</p>
                  <p className="text-3xl font-bold text-gray-900">{totalForms}</p>
                  <p className="text-gray-500 text-sm">All time created</p>
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <FiFileText className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Active Forms</p>
                  <p className="text-3xl font-bold text-gray-900">{activeForms}</p>
                  <p className="text-gray-500 text-sm">Currently collecting responses</p>
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <FiGrid className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Responses</p>
                  <p className="text-3xl font-bold text-gray-900">{totalResponses.toLocaleString()}</p>
                  <p className="text-gray-500 text-sm">Across all forms</p>
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Create Your Next Form</h2>
              <p className="text-gray-600">Start building a new form from scratch or choose from our templates</p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleCreateNewForm}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <FiPlus className="w-5 h-5" />
                Create New Form
              </button>

              <button
                onClick={handleBrowseTemplates}
                className="bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium flex items-center gap-2 border border-gray-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Browse Templates
              </button>
            </div>
          </div>

          {showCreateForm && (
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Create Your Form</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <InputQuery onBack={() => setShowCreateForm(false)} onSaveDraft={handleSaveForm} />
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Your Forms</h2>
                <button
                  onClick={handleViewAllForms}
                  className="text-blue-500 hover:text-blue-600 font-medium"
                >
                  View All
                </button>
              </div>
            </div>

            <div className="p-6">

              {forms.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-600 text-lg">No forms found. Start by creating one!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {forms.slice(0, 6).map((form) => (
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
    )}
  </div>
);

};

export default Dashboard;