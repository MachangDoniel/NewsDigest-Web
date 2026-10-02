import React from 'react';
import { PaperId, PAPERS } from '../types';

interface PaperBadgeProps {
  paper: PaperId;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
}

export const PaperBadge: React.FC<PaperBadgeProps> = ({
  paper,
  size = 'sm',
  showName = false,
}) => {
  const info = PAPERS[paper] || PAPERS.dailystar;

  const sizeClasses = {
    sm: 'h-5 px-1.5 text-[11px]',
    md: 'h-6 px-2 text-xs',
    lg: 'h-8 px-3 text-sm font-semibold',
  };

  const monogramSize = {
    sm: 'w-4 h-4 text-[10px]',
    md: 'w-5 h-5 text-xs',
    lg: 'w-7 h-7 text-sm font-bold',
  };

  if (!showName) {
    return (
      <span
        style={{ backgroundColor: info.color }}
        className={`inline-flex items-center justify-center rounded font-bold text-white shadow-xs select-none ${monogramSize[size]} font-bangla`}
        title={info.name}
      >
        {info.monogram}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium text-white shadow-xs select-none ${sizeClasses[size]} font-bangla`}
      style={{ backgroundColor: info.color }}
    >
      <span className="font-bold">{info.monogram}</span>
      <span>{info.shortName}</span>
    </span>
  );
};
