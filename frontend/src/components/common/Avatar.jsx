import React from 'react';

const COLORS = [
  'bg-indigo-500 text-white',
  'bg-emerald-500 text-white',
  'bg-sky-500 text-white',
  'bg-amber-500 text-white',
  'bg-rose-500 text-white',
  'bg-violet-500 text-white',
];

const Avatar = ({ src, name = '', size = 'md', className = '' }) => {
  const getInitials = (fullName) => {
    if (!fullName) return '';
    const parts = fullName.split(' ');
    const initials = parts.map((p) => p[0]).join('');
    return initials.slice(0, 2).toUpperCase();
  };

  const getColorClass = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % COLORS.length;
    return COLORS[index];
  };

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-lg font-semibold',
    xl: 'h-20 w-20 text-2xl font-bold',
  };

  const avatarSize = sizeClasses[size] || sizeClasses.md;

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`rounded-full object-cover border border-slate-200 shadow-sm ${avatarSize} ${className}`}
      />
    );
  }

  const initials = getInitials(name);
  const colorClass = getColorClass(name || 'User');

  return (
    <div
      className={`rounded-full flex items-center justify-center font-medium select-none shadow-sm ${colorClass} ${avatarSize} ${className}`}
    >
      {initials || 'U'}
    </div>
  );
};

export default Avatar;
