import { Outlet, Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Spinner from '../components/common/Spinner';

const AuthLayout = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    if (!user) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Spinner size="lg" />
        </div>
      );
    }
    if (user.role === 'student') return <Navigate to="/dashboard/student" replace />;
    if (user.role === 'client') return <Navigate to="/dashboard/client" replace />;
    if (user.role === 'admin') return <Navigate to="/dashboard/admin" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Left branding panel (hidden on mobile) */}
      {/* <div className="hidden md:flex md:w-1/2 bg-gradient-to-tr from-indigo-700 via-indigo-600 to-sky-500 flex-col justify-between p-12 text-white">
        <div className="flex items-center gap-2">
          <span className="text-3xl font-extrabold tracking-tight">StudentBid</span>
        </div>
        <div className="space-y-6">
          <h1 className="text-4xl lg:text-5xl font-black leading-tight">
            Find Projects.<br />
            Build Experience.<br />
            Earn Money.
          </h1>
          <p className="text-indigo-100 text-lg leading-relaxed max-w-md">
            The exclusive localized freelance bidding marketplace created just for college students. Start coding, designing, or writing for real-world clients today.
          </p>
        </div>
        <div>
          <p className="text-xs text-indigo-200">
            &copy; {new Date().getFullYear()} StudentBid Portal. All rights reserved.
          </p>
        </div>
      </div> */}

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sm:p-10">
          <div className="flex justify-center md:hidden mb-6">
            <span className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent">
              StudentBid
            </span>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
