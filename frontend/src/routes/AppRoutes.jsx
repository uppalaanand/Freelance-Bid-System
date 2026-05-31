import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import AuthLayout from '../layouts/AuthLayout';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import useAuth from '../hooks/useAuth';

// Pages
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Register from '../pages/Register';
import BrowseProjects from '../pages/BrowseProjects';
import ProjectDetails from '../pages/ProjectDetails';
import CreateProject from '../pages/CreateProject';
import EditProject from '../pages/EditProject';
import StudentProfile from '../pages/StudentProfile';
import ClientProfile from '../pages/ClientProfile';
import StudentDashboard from '../pages/StudentDashboard';
import ClientDashboard from '../pages/ClientDashboard';
import AdminDashboard from '../pages/AdminDashboard';
import Chat from '../pages/Chat';
import Payments from '../pages/Payments';
import Notifications from '../pages/Notifications';
import Settings from '../pages/Settings';
import MyBids from '../pages/MyBids';
import MyProjects from '../pages/MyProjects';
import NotFound from '../pages/NotFound';

const DashboardRedirect = () => {
  const { user, isLoading } = useAuth();
  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  if (user.role === 'student') return <Navigate to="/dashboard/student" replace />;
  if (user.role === 'client') return <Navigate to="/dashboard/client" replace />;
  if (user.role === 'admin') return <Navigate to="/dashboard/admin" replace />;
  return <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes with MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/projects" element={<BrowseProjects />} />
        <Route path="/projects/:id" element={<ProjectDetails />} />
        <Route path="/student/:id" element={<StudentProfile />} />
        <Route path="/client/:id" element={<ClientProfile />} />
      </Route>

      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Dashboard routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardRedirect />} />
        <Route
          path="/dashboard/student"
          element={
            <RoleRoute roles={['student']}>
              <StudentDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/dashboard/client"
          element={
            <RoleRoute roles={['client']}>
              <ClientDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/dashboard/admin"
          element={
            <RoleRoute roles={['admin']}>
              <AdminDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/dashboard/create-project"
          element={
            <RoleRoute roles={['client']}>
              <CreateProject />
            </RoleRoute>
          }
        />
        <Route
          path="/dashboard/edit-project/:id"
          element={
            <RoleRoute roles={['client']}>
              <EditProject />
            </RoleRoute>
          }
        />
        <Route
          path="/dashboard/my-projects"
          element={
            <RoleRoute roles={['client']}>
              <MyProjects />
            </RoleRoute>
          }
        />
        <Route
          path="/dashboard/my-bids"
          element={
            <RoleRoute roles={['student']}>
              <MyBids />
            </RoleRoute>
          }
        />
        <Route path="/dashboard/chat" element={<Chat />} />
        <Route path="/dashboard/chat/:chatId" element={<Chat />} />
        <Route path="/dashboard/payments" element={<Payments />} />
        <Route path="/dashboard/notifications" element={<Notifications />} />
        <Route path="/dashboard/settings" element={<Settings />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
