// src/router.js
import { createBrowserRouter } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import HomePage from './components/HomePage';
import LoadingPage from './components/LoadingPage';
import GeneratedFormPage from './components/GeneratedFormPage';
import ErrorPage from './components/ErrorPage';
import FormExamplesPage from './components/ExamplePage';
import Features from './components/Features';
import LoginPage from './components/LoginPage';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path:'example',
        element:<FormExamplesPage/>
      },{
        path: 'generated-form',
        element: <GeneratedFormPage />,
      },
      
      {
        path:'features',
        element:<Features/>
      },
      {
        path:'signin',
        element:<LoginPage/>
      },
      {
        path:'signup',
        element:<SignUp/>
      },
      
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'loading',
        element: <LoadingPage />,
      },
      {
        path: 'forms/:formId',
        element: <GeneratedFormPage />,
        // Add a loader function here if you want to fetch data
        // loader: async ({ params }) => {
        //   return fetchFormData(params.formId);
        // }
      },
    ],
  },
]);