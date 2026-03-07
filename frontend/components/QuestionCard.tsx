import React from 'react';

export interface AnswerOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  text: string;
  type: 'multiple-choice';
  options: AnswerOption[];
  category?: string;
}

interface QuestionCardProps {
  question: Question;
  selectedAnswerId?: string;
  onAnswerSelect: (answerId: string) => void;
  className?: string;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedAnswerId,
  onAnswerSelect,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {question.category && (
        <div className="mb-4">
          <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
            {question.category}
          </span>
        </div>
      )}

      <h2 className="text-xl font-semibold text-gray-900 mb-6 leading-relaxed">
        {question.text}
      </h2>

      <div className="space-y-3">
        {question.options.map((option) => (
          <div
            key={option.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedAnswerId === option.id
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onAnswerSelect(option.id)}
          >
            <div className="flex items-start">
              <div className={`flex-shrink-0 w-4 h-4 rounded-full border-2 mt-0.5 mr-3 ${
                selectedAnswerId === option.id
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-gray-300'
              }`}>
                {selectedAnswerId === option.id && (
                  <div className="w-full h-full rounded-full bg-white scale-50" />
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  selectedAnswerId === option.id ? 'text-blue-900' : 'text-gray-900'
                }`}>
                  {option.text}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
