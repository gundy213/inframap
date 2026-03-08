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
    <fieldset className={`bg-white rounded-xl md:rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100 ${className}`} aria-describedby={`${question.id}-hint`}>
      {question.category && (
        <div className="mb-4 md:mb-6">
          <span className="inline-block bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 text-xs font-bold px-3 md:px-4 py-1 md:py-2 rounded-full shadow-sm">
            {question.category}
          </span>
        </div>
      )}

      <legend className="text-xl md:text-2xl font-bold text-gray-900 mb-6 md:mb-8 leading-relaxed">
        {question.text}
      </legend>
      <p id={`${question.id}-hint`} className="sr-only">Use Tab to focus options, then press Space or Enter to choose.</p>

      <div className="space-y-3 md:space-y-4" role="radiogroup" aria-label={question.text}>
        {question.options.map((option) => (
          <label
            key={option.id}
            htmlFor={`${question.id}-${option.id}`}
            className={`block border-2 rounded-lg md:rounded-xl p-4 md:p-5 cursor-pointer transition-all duration-300 motion-reduce:transition-none hover:shadow-lg motion-reduce:hover:shadow-none hover:scale-105 motion-reduce:hover:scale-100 focus-within:ring-4 focus-within:ring-purple-200 ${
              selectedAnswerId === option.id
                ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-blue-50 shadow-lg scale-105 motion-reduce:scale-100'
                : 'border-gray-200 hover:border-purple-300'
            }`}
          >
            <input
              id={`${question.id}-${option.id}`}
              type="radio"
              name={question.id}
              value={option.id}
              className="sr-only"
              checked={selectedAnswerId === option.id}
              onChange={() => onAnswerSelect(option.id)}
            />
            <div className="flex items-center">
              <div className={`flex-shrink-0 w-4 h-4 md:w-5 md:h-5 rounded-full border-2 mr-3 md:mr-4 transition-all motion-reduce:transition-none ${
                selectedAnswerId === option.id
                  ? 'border-purple-500 bg-purple-500'
                  : 'border-gray-300'
              }`}>
                {selectedAnswerId === option.id && (
                  <div className="w-full h-full rounded-full bg-white scale-50 transition-transform motion-reduce:transition-none" />
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm md:text-base font-semibold ${selectedAnswerId === option.id ? 'text-purple-900' : 'text-gray-900'}`}>
                  {option.text}
                </p>
              </div>
            </div>
          </label>
        ))}
      </div>
    </fieldset>
  );
};
