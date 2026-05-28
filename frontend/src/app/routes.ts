import { createBrowserRouter } from 'react-router';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardHome from './components/DashboardHome';
import AIChatPage from './components/AIChatPage';
import DocumentUploadPage from './components/DocumentUploadPage';
import ContractAnalysisPage from './components/ContractAnalysisPage';
import TenantRightsPage from './components/TenantRightsPage';
import LaborLawPage from './components/LaborLawPage';
import DocumentLibraryPage from './components/DocumentLibraryPage';
import ChatHistoryPage from './components/ChatHistoryPage';
import SettingsPage from './components/SettingsPage';
import NotFoundPage from './components/NotFoundPage';

export const router = createBrowserRouter([
  { path: '/', Component: LandingPage },
  { path: '/login', Component: AuthPage },
  { path: '/register', Component: AuthPage },
  { path: '/forgot-password', Component: AuthPage },
  {
    path: '/app',
    Component: ProtectedRoute,
    children: [
      {
        Component: AppLayout,
        children: [
          { index: true, Component: DashboardHome },
          { path: 'chat', Component: AIChatPage },
          { path: 'upload', Component: DocumentUploadPage },
          { path: 'documents', Component: DocumentLibraryPage },
          { path: 'history', Component: ChatHistoryPage },
          { path: 'contract-analysis', Component: ContractAnalysisPage },
          { path: 'tenant-rights', Component: TenantRightsPage },
          { path: 'labor-law', Component: LaborLawPage },
          { path: 'settings', Component: SettingsPage },
          { path: '*', Component: NotFoundPage },
        ],
      },
    ],
  },
  { path: '*', Component: NotFoundPage },
]);
