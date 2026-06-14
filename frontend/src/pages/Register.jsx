import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { HiMail, HiLockClosed, HiUser, HiPhone, HiAcademicCap, HiOfficeBuilding } from 'react-icons/hi';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { register as registerThunk, clearError } from '../redux/slices/authSlice';

const Register = () => {
  const [role, setRole] = useState('student');
  const { register, handleSubmit, formState: { errors } } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user) {
      toast.success(`Welcome to StudentBid, ${user.fullName}!`);
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
    const registrationData = { ...data, role };
    dispatch(registerThunk(registrationData));
  };

  return (
    <div className="space-y-6">
      <div className="text-center md:text-left">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Create Account</h2>
        <p className="text-sm text-slate-500 mt-1">Get started on the StudentBid marketplace</p>
      </div>

      {/* Role Selection Tabs */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setRole('student')}
          className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-all cursor-pointer ${
            role === 'student'
              ? 'bg-indigo-50 border-indigo-600 text-indigo-700 font-semibold'
              : 'bg-white border-slate-200 text-slate-500 hover:border-slate-350 hover:bg-slate-50'
          }`}
        >
          <HiAcademicCap className="h-6 w-6" />
          <span className="text-xs">Join as Student</span>
        </button>

        <button
          type="button"
          onClick={() => setRole('client')}
          className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-all cursor-pointer ${
            role === 'client'
              ? 'bg-indigo-50 border-indigo-600 text-indigo-700 font-semibold'
              : 'bg-white border-slate-200 text-slate-500 hover:border-slate-350 hover:bg-slate-50'
          }`}
        >
          <HiOfficeBuilding className="h-6 w-6" />
          <span className="text-xs">Join as Client</span>
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          placeholder="John Doe"
          error={errors.fullName?.message}
          {...register('fullName', { required: 'Name is required' })}
        />

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
          label="Phone Number"
          type="tel"
          placeholder="9876543210"
          error={errors.phone?.message}
          {...register('phone', {
            pattern: {
              value: /^[6-9]\d{9}$/,
              message: 'Enter a valid 10-digit Indian phone number',
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

        <Button type="submit" isLoading={isLoading} fullWidth className="mt-2">
          Create Account
        </Button>
      </form>

      <div className="text-center text-xs text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-850">
          Sign In here
        </Link>
      </div>
    </div>
  );
};

export default Register;
