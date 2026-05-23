import { createBrowserRouter } from 'react-router';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import DashboardLayout from './components/DashboardLayout';
import DashboardHome from './components/DashboardHome';
import AIChatPage from './components/AIChatPage';
import DocumentUploadPage from './components/DocumentUploadPage';
import ContractAnalysisPage from './components/ContractAnalysisPage';
import TenantRightsPage from './components/TenantRightsPage';
import LaborLawPage from './components/LaborLawPage';
import DocumentLibraryPage from './components/DocumentLibraryPage';
import ChatHistoryPage from './components/ChatHistoryPage';
import SettingsPage from './components/SettingsPage';

export const router = createBrowserRouter([
  { path: '/', Component: LandingPage },
  { path: '/login', Component: AuthPage },
  { path: '/register', Component: AuthPage },
  { path: '/forgot-password', Component: AuthPage },
  {
    path: '/app',
    Component: DashboardLayout,
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
    ],
  },
]);
