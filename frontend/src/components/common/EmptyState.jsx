import React from 'react';
import Button from './Button';

const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-white border border-slate-200 rounded-xl max-w-lg mx-auto shadow-sm">
      {Icon && (
        <div className="p-4 bg-indigo-50 text-indigo-600 rounded-full mb-4">
          <Icon className="h-10 w-10" />
        </div>
      )}
      <h3 className="text-lg font-bold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-xs mb-6 leading-relaxed">
        {description}
      </p>
      {action && (
        <Button variant={action.variant || 'primary'} onClick={action.onClick} icon={action.icon}>
          {action.label}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
