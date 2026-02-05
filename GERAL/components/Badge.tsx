import React from 'react';

interface BadgeProps {
  status: string;
}

export const Badge: React.FC<BadgeProps> = ({ status }) => {
  const getStyles = (s: string) => {
    switch (s.toLowerCase()) {
      case 'aprovado':
      case 'aberta':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejeitado':
      case 'cancelada':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'preenchida':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStyles(status)} capitalize`}>
      {status}
    </span>
  );
};