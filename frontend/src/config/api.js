// API Configuration for Production
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://formcraft-dynamic-form-builder.onrender.com';

// Debug: Log the API URL being used
console.log('🔗 API Configuration:', {
  ENV_URL: import.meta.env.VITE_API_URL,
  FINAL_URL: API_BASE_URL
});

// For development, use localhost
// For production, this will be set to your Render URL
export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    SIGNUP: '/api/auth/signup',
    SIGNIN: '/api/auth/signin',
    GENERATE_FORM: '/generate-form',
    FORMS: '/api/forms',
    DELETE_FORM: (formId) => `/api/forms/${formId}`
  }
};

export default API_CONFIG;
