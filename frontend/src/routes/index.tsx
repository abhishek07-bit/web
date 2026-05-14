import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import AuthLayout from '../layouts/AuthLayout';
import InterviewLayout from '../layouts/InterviewLayout';

import LandingPage from '../pages/Landing';
import LoginPage from '../pages/Auth/Login';
import SignupPage from '../pages/Auth/Signup';
import DashboardPage from '../pages/Dashboard';
import ResumeUploadPage from '../pages/ResumeUpload';
import InterviewSetupPage from '../pages/InterviewSetup';
import MockInterviewPage from '../pages/MockInterview';
import FeedbackPage from '../pages/Feedback';
import AnalyticsPage from '../pages/Analytics';
import SettingsPage from '../pages/Settings';
import CompanyPrepPage from '../pages/CompanyPrep';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> },
    ],
  },
  {
    element: <AppLayout />,
    children: [
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'resume', element: <ResumeUploadPage /> },
      { path: 'interview/setup', element: <InterviewSetupPage /> },
      { path: 'feedback/:id', element: <FeedbackPage /> },
      { path: 'analytics', element: <AnalyticsPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'company-prep', element: <CompanyPrepPage /> },
    ],
  },
  {
    element: <InterviewLayout />,
    children: [
      { path: 'interview/session', element: <MockInterviewPage /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
