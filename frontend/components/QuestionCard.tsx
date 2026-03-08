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
    <div className={`bg-white rounded-xl md:rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100 ${className}`}>
      {question.category && (
        <div className="mb-4 md:mb-6">
          <span className="inline-block bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 text-xs font-bold px-3 md:px-4 py-1 md:py-2 rounded-full shadow-sm">
            {question.category}
          </span>
        </div>
      )}

      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 md:mb-8 leading-relaxed">
        {question.text}
      </h2>

      <div className="space-y-3 md:space-y-4">
        {question.options.map((option) => (
          <div
            key={option.id}
            className={`border-2 rounded-lg md:rounded-xl p-4 md:p-5 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
              selectedAnswerId === option.id
                ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-blue-50 shadow-lg scale-105'
                : 'border-gray-200 hover:border-purple-300'
            }`}
            onClick={() => onAnswerSelect(option.id)}
          >
            <div className="flex items-center">
              <div className={`flex-shrink-0 w-4 h-4 md:w-5 md:h-5 rounded-full border-2 mr-3 md:mr-4 transition-all ${
                selectedAnswerId === option.id
                  ? 'border-purple-500 bg-purple-500'
                  : 'border-gray-300'
              }`}>
                {selectedAnswerId === option.id && (
                  <div className="w-full h-full rounded-full bg-white scale-50 transition-transform" />
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm md:text-base font-semibold ${
                  selectedAnswerId === option.id ? 'text-purple-900' : 'text-gray-900'
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
