import React from 'react';

interface RecommendationResult {
  recommendation: string;
  confidenceScore: number;
  reasoning: string[];
  alternatives: Array<{
    architecture: string;
    score: number;
    percentage: number;
    reasons: string[];
  }>;
}

interface ResultsPageProps {
  result?: RecommendationResult;
  onRetake?: () => void;
}

const ResultsPage: React.FC<ResultsPageProps> = ({ result, onRetake }) => {
  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Results Available</h1>
          <p className="text-gray-600 mb-6">Please complete the questionnaire first.</p>
          {onRetake && (
            <button
              onClick={onRetake}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Take Questionnaire
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Your Infrastructure Recommendation
          </h1>

          <div className="mb-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🏗️</div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {result.recommendation}
              </h2>
              <div className="text-lg text-gray-600">
                Confidence: {result.confidenceScore}%
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Why this recommendation?</h3>
            <ul className="space-y-3">
              {result.reasoning.map((reason, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          {result.alternatives.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Alternative Options</h3>
              <div className="space-y-4">
                {result.alternatives.map((alt, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-gray-900">{alt.architecture}</h4>
                      <span className="text-sm text-gray-500">{alt.percentage}% match</span>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {alt.reasons.map((reason, reasonIndex) => (
                        <li key={reasonIndex} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-center">
            {onRetake && (
              <button
                onClick={onRetake}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Take Questionnaire Again
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
