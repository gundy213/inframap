import React from 'react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps,
  className = ''
}) => {
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-semibold text-gray-700 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Question {currentStep} of {totalSteps}
        </span>
        <span className="text-sm text-gray-500 font-medium">
          {Math.round(progressPercentage)}% Complete
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-3 shadow-inner">
        <div
          className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
};
