import React from 'react';
import { FaSpinner } from 'react-icons/fa';

const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const spinnerClasses = `animate-spin text-primary-600 ${sizes[size]} ${className}`;

  return <FaSpinner className={spinnerClasses} />;
};

export default Spinner;