import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export default function Card({ title, children, actions, className = '' }: CardProps) {
  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      {(title || actions) && (
        <div className="flex justify-between items-center mb-4">
          {title && <h2 className="text-xl font-semibold text-gray-900">{title}</h2>}
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
