import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'success' | 'danger' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

export function Button({
  variant = 'default',
  size = 'md',
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lamaPurple';
  
  const variantStyles = {
    default: 'bg-lamaPurple text-gray-800 hover:bg-purple-400',
    outline: 'border border-gray-300 bg-transparent hover:bg-lamaPurpleLight',
    ghost: 'bg-transparent hover:bg-lamaPurpleLight',
    link: 'bg-transparent underline text-gray-700 hover:text-gray-900',
    success: 'bg-lamaGreen text-white hover:bg-green-500',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    warning: 'bg-lamaYellow text-gray-800 hover:bg-yellow-400'
  };
  
  const sizeStyles = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };
  
  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;
  
  return (
    <button className={combinedClassName} {...props}>
      {children}
    </button>
  );
}