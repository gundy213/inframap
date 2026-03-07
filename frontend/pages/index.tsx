import React, { useState } from 'react';
import { ProgressBar } from '../components/ProgressBar';
import { QuestionCard, Question } from '../components/QuestionCard';

// Sample questions - in a real app, these would come from an API or shared module
const sampleQuestions: Question[] = [
  {
    id: 'app-complexity',
    text: 'How complex is your application?',
    type: 'multiple-choice',
    category: 'Application Characteristics',
    options: [
      {
        id: 'simple-web',
        text: 'Simple web application or API'
      },
      {
        id: 'moderate-microservices',
        text: 'Moderate complexity with some microservices'
      },
      {
        id: 'complex-distributed',
        text: 'Complex distributed system with many services'
      }
    ]
  },
  {
    id: 'scaling-needs',
    text: 'What are your scaling requirements?',
    type: 'multiple-choice',
    category: 'Scalability',
    options: [
      {
        id: 'predictable-traffic',
        text: 'Predictable traffic patterns'
      },
      {
        id: 'variable-traffic',
        text: 'Highly variable or unpredictable traffic'
      },
      {
        id: 'steady-high-load',
        text: 'Steady high load with complex scaling rules'
      }
    ]
  },
  {
    id: 'container-usage',
    text: 'Do you prefer to use containers?',
    type: 'multiple-choice',
    category: 'Technology Preferences',
    options: [
      {
        id: 'yes-containers',
        text: 'Yes, we want to use containers'
      },
      {
        id: 'maybe-containers',
        text: 'Maybe, depending on the benefits'
      },
      {
        id: 'no-containers',
        text: 'No, we prefer traditional deployment methods'
      }
    ]
  },
  {
    id: 'operational-overhead',
    text: 'How much operational overhead are you willing to manage?',
    type: 'multiple-choice',
    category: 'Operations',
    options: [
      {
        id: 'minimal-ops',
        text: 'Minimal - we want fully managed services'
      },
      {
        id: 'some-ops',
        text: 'Some - we can handle basic monitoring and scaling'
      },
      {
        id: 'full-control',
        text: 'Full control - we want to manage everything'
      }
    ]
  },
  {
    id: 'cost-sensitivity',
    text: 'How sensitive are you to infrastructure costs?',
    type: 'multiple-choice',
    category: 'Cost',
    options: [
      {
        id: 'cost-critical',
        text: 'Very cost-sensitive - pay only for what we use'
      },
      {
        id: 'balanced-cost',
        text: 'Balanced - cost matters but not the only factor'
      },
      {
        id: 'cost-flexible',
        text: 'Flexible - willing to pay for simplicity and performance'
      }
    ]
  },
  {
    id: 'team-expertise',
    text: 'What is your team\'s expertise level?',
    type: 'multiple-choice',
    category: 'Team',
    options: [
      {
        id: 'dev-focused',
        text: 'Development-focused, prefer not to manage infrastructure'
      },
      {
        id: 'balanced-expertise',
        text: 'Balanced - some infrastructure knowledge'
      },
      {
        id: 'infra-experts',
        text: 'Infrastructure experts - comfortable with complex setups'
      }
    ]
  },
  {
    id: 'provider-preference',
    text: 'Do you have a preferred cloud provider?',
    type: 'multiple-choice',
    category: 'Provider',
    options: [
      {
        id: 'prefer-azure',
        text: 'Prefer Azure'
      },
      {
        id: 'prefer-aws',
        text: 'Prefer AWS'
      },
      {
        id: 'prefer-gcp',
        text: 'Prefer GCP'
      },
      {
        id: 'no-preference',
        text: 'No strong preference'
      }
    ]
  },
  {
    id: 'stateful-needs',
    text: 'Will you run stateful services or databases alongside your app?',
    type: 'multiple-choice',
    category: 'Data',
    options: [
      {
        id: 'yes-stateful',
        text: 'Yes, stateful services/databases'
      },
      {
        id: 'no-stateful',
        text: 'No, mostly stateless services'
      }
    ]
  },
  {
    id: 'multi-region',
    text: 'Do you require multi-region deployment or low-latency global presence?',
    type: 'multiple-choice',
    category: 'Scalability',
    options: [
      {
        id: 'multi-region-yes',
        text: 'Yes, global presence required'
      },
      {
        id: 'multi-region-no',
        text: 'No, single-region is fine'
      }
    ]
  },
  {
    id: 'compliance',
    text: 'Do you have strict regulatory or compliance requirements?',
    type: 'multiple-choice',
    category: 'Security',
    options: [
      {
        id: 'strict-compliance',
        text: 'Yes, strict compliance required'
      },
      {
        id: 'standard-compliance',
        text: 'Standard compliance only'
      }
    ]
  }
];

interface QuestionnaireResponse {
  questionId: string;
  selectedAnswerId: string;
}

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

const Questionnaire: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [responses, setResponses] = useState<QuestionnaireResponse[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totalSteps = sampleQuestions.length;
  const currentQuestion = sampleQuestions[currentStep - 1];
  const currentResponse = responses.find(r => r.questionId === currentQuestion?.id);

  const handleAnswerSelect = (answerId: string) => {
    const newResponse: QuestionnaireResponse = {
      questionId: currentQuestion.id,
      selectedAnswerId: answerId
    };

    setResponses(prev => {
      const filtered = prev.filter(r => r.questionId !== currentQuestion.id);
      return [...filtered, newResponse];
    });
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ responses }),
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendation');
      }

      const result = await response.json();
      setResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = currentResponse?.selectedAnswerId !== undefined;

  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent text-center mb-8">
              Your Infrastructure Recommendation
            </h1>

            <div className="mb-10">
              <div className="text-center mb-8">
                <div className="text-7xl mb-6">🏗️</div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  {result.recommendation}
                </h2>
                <div className="text-xl text-gray-600 font-medium">
                  Confidence: <span className="text-purple-600">{result.confidenceScore}%</span>
                </div>
              </div>
            </div>

            <div className="mb-10">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Why this recommendation?</h3>
              <ul className="space-y-4">
                {result.reasoning.map((reason, index) => (
                  <li key={index} className="flex items-start bg-gray-50 rounded-xl p-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">
                      {index + 1}
                    </span>
                    <span className="text-gray-700 text-lg">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {result.alternatives.length > 0 && (
              <div className="mb-10">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Alternative Options</h3>
                <div className="space-y-5">
                  {result.alternatives.map((alt, index) => (
                    <div key={index} className="border-2 border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-bold text-gray-900 text-xl">{alt.architecture}</h4>
                        <span className="text-sm bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 px-3 py-1 rounded-full font-semibold">{alt.percentage}% match</span>
                      </div>
                      <ul className="text-gray-600 space-y-2">
                        {alt.reasons.map((reason, reasonIndex) => (
                          <li key={reasonIndex} className="flex items-start">
                            <span className="mr-3 text-purple-500">•</span>
                            <span className="text-lg">{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-center">
              <button
                onClick={() => {
                  setResult(null);
                  setResponses([]);
                  setCurrentStep(1);
                }}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Take Questionnaire Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-12">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Infrastructure Recommendation
          </h1>
          <p className="text-xl text-gray-600 font-medium">
            Answer these questions to get personalized cloud infrastructure recommendations.
          </p>
        </div>

        <ProgressBar
          currentStep={currentStep}
          totalSteps={totalSteps}
          className="mb-10"
        />

        <QuestionCard
          question={currentQuestion}
          selectedAnswerId={currentResponse?.selectedAnswerId}
          onAnswerSelect={handleAnswerSelect}
          className="mb-10"
        />

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-8">
            <p className="text-red-800 font-semibold text-lg">{error}</p>
          </div>
        )}

        <div className="flex justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
              currentStep === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-600 text-white hover:bg-gray-700 shadow-lg hover:shadow-xl transform hover:scale-105'
            }`}
          >
            Back
          </button>

          <button
            onClick={handleNext}
            disabled={!canProceed || isSubmitting}
            className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
              !canProceed || isSubmitting
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105'
            }`}
          >
            {isSubmitting ? 'Submitting...' : currentStep === totalSteps ? 'Get Recommendation' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;
