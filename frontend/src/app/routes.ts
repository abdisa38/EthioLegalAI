import { createBrowserRouter } from 'react-router';
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { lazyPage } from './routes/lazy';
import RouteErrorElement from '../shared/components/RouteErrorElement';

const LandingPage = lazyPage(() => import('./components/LandingPage'));
const AuthPage = lazyPage(() => import('./components/AuthPage'));
const DashboardHome = lazyPage(() => import('./components/DashboardHome'));
const AIChatPage = lazyPage(() => import('./components/AIChatPage'));
const DocumentUploadPage = lazyPage(() => import('./components/DocumentUploadPage'));
const ContractAnalysisPage = lazyPage(() => import('../features/contracts/pages/ContractAnalysisPage'));
const TenantRightsPage = lazyPage(() => import('./components/TenantRightsPage'));
const LaborLawPage = lazyPage(() => import('./components/LaborLawPage'));
const DocumentLibraryPage = lazyPage(() => import('./components/DocumentLibraryPage'));
const ChatHistoryPage = lazyPage(() => import('../features/chat/pages/ChatHistoryPage'));
const SettingsPage = lazyPage(() => import('./components/SettingsPage'));
const NotFoundPage = lazyPage(() => import('./components/NotFoundPage'));

export const router = createBrowserRouter([
  { path: '/', Component: LandingPage, ErrorBoundary: RouteErrorElement },
  { path: '/login', Component: AuthPage, ErrorBoundary: RouteErrorElement },
  { path: '/register', Component: AuthPage, ErrorBoundary: RouteErrorElement },
  { path: '/forgot-password', Component: AuthPage, ErrorBoundary: RouteErrorElement },
  {
    path: '/app',
    Component: ProtectedRoute,
    ErrorBoundary: RouteErrorElement,
    children: [
      {
        Component: AppLayout,
        ErrorBoundary: RouteErrorElement,
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
  { path: '*', Component: NotFoundPage, ErrorBoundary: RouteErrorElement },
]);
