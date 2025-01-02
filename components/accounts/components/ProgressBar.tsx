import React from 'react';

interface ProgressBarProps {
  value: number;
  maxValue: number;
  colorClass?: string;
  label?: string;
}

export function ProgressBar({
  value,
  maxValue,
  colorClass = 'bg-blue-600',
  label
}: ProgressBarProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex justify-between text-sm text-gray-600">
          <span>{label}</span>
          <span>{percentage.toFixed(1)}%</span>
        </div>
      )}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClass} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
