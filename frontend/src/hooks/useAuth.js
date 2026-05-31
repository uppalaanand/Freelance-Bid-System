import { useSelector } from 'react-redux';

const useAuth = () => {
  const { user, isAuthenticated, isLoading } = useSelector((state) => state.auth);

  return {
    user,
    isAuthenticated,
    isLoading,
    isStudent: user?.role === 'student',
    isClient: user?.role === 'client',
    isAdmin: user?.role === 'admin',
  };
};

export default useAuth;
