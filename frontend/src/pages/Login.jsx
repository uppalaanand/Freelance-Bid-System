import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { HiMail, HiLockClosed } from 'react-icons/hi';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { login, clearError } from '../redux/slices/authSlice';
import { useEffect } from 'react';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user) {
      toast.success(`Welcome back, ${user.fullName}!`);
      if (user.role === 'student') navigate('/dashboard/student');
      else if (user.role === 'client') navigate('/dashboard/client');
      else if (user.role === 'admin') navigate('/dashboard/admin');
      else navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const onSubmit = (data) => {
    dispatch(login(data));
  };

  return (
    <div className="space-y-6">
      <div className="text-center md:text-left">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Login</h2>
        <p className="text-sm text-slate-500 mt-1">Access your StudentBid dashboard</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="name@university.edu"
          error={errors.email?.message}
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Invalid email address',
            },
          })}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password', {
            required: 'Password is required',
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters',
            },
          })}
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            {/* <input
              type="checkbox"
              className="rounded border-slate-350 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            /> */}
            {/* <span className="text-xs text-slate-500 font-medium">Remember me</span> */}
          </label>
          <a href="#" className="text-xs font-semibold text-indigo-600 hover:text-indigo-850">
            Forgot Password?
          </a>
        </div>

        <Button type="submit" isLoading={isLoading} fullWidth className="mt-2">
          Sign In
        </Button>
      </form>

      <div className="text-center text-xs text-slate-500">
        Don't have an account?{' '}
        <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-850">
          Register here
        </Link>
      </div>
    </div>
  );
};

export default Login;
