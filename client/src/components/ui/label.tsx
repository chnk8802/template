import React from 'react';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  // No additional props needed
}

export const Label: React.FC<LabelProps> = ({ className = '', ...props }) => {
  return (
    <label
      className={`text-sm font-medium text-gray-700 ${className}`}
      {...props}
    />
  );
};