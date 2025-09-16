import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'purple' | 'sky' | 'yellow' | 'green';
}

export function Card({ children, className = '', variant = 'default' }: CardProps) {
  const variantStyles = {
    default: 'bg-white',
    purple: 'bg-lamaPurpleLight',
    sky: 'bg-lamaSkyLight',
    yellow: 'bg-lamaYellowLight',
    green: 'bg-lamaGreenLight'
  };
  
  return (
    <div className={`${variantStyles[variant]} rounded-lg border border-gray-200 shadow-sm ${className}`}>
      {children}
    </div>
  );
}