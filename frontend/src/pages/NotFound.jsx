import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <h1 className="text-9xl font-black text-indigo-600 tracking-widest animate-pulse">404</h1>
      <div className="bg-indigo-600 text-white px-3 py-1 text-sm rounded rotate-12 absolute -mt-20 select-none">
        Page Not Found
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mt-6 mb-2">Lost in Space?</h2>
      <p className="text-slate-500 max-w-sm mb-8 text-sm leading-relaxed">
        The page you are looking for does not exist or has been relocated. Let's get you back on track!
      </p>
      <Link to="/">
        <Button size="lg" className="shadow-lg shadow-indigo-100">
          Go Back Home
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;
