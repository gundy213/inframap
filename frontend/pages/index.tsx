import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
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
  topMatchPercentage: number;
  confidenceScore: number;
  confidenceLevel: 'Low' | 'Medium' | 'High';
  reasoning: string[];
  alternatives: Array<{
    architecture: string;
    score: number;
    percentage: number;
    reasons: string[];
    pros: string[];
    cons: string[];
    complexity: 'Low' | 'Medium' | 'High';
    estimatedCost: string;
  }>;
}

interface WhyNotAlt {
  architecture: string;
  score: number;
  percentage: number;
  reasons: string[];
  pros: string[];
  cons: string[];
  complexity: 'Low' | 'Medium' | 'High';
  estimatedCost: string;
}

interface SensitivityChange {
  questionId: string;
  questionText: string;
  currentAnswerId: string;
  currentAnswerText: string;
  newAnswerId: string;
  newAnswerText: string;
  newRecommendation: string;
  newTopMatchPercentage: number;
  newConfidenceScore: number;
  newConfidenceLevel: 'Low' | 'Medium' | 'High';
  changesRecommendation: boolean;
  fitDelta: number;
  certaintyDelta: number;
}

interface SensitivityAnalysisResult {
  baseRecommendation: string;
  baseTopMatchPercentage: number;
  baseConfidenceScore: number;
  totalVariationsTested: number;
  recommendationSwitches: number;
  changes: SensitivityChange[];
}

const Questionnaire: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [responses, setResponses] = useState<QuestionnaireResponse[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [whyNotAlt, setWhyNotAlt] = useState<WhyNotAlt | null>(null);
  const [sensitivity, setSensitivity] = useState<SensitivityAnalysisResult | null>(null);
  const [isAnalyzingSensitivity, setIsAnalyzingSensitivity] = useState(false);

  const totalSteps = sampleQuestions.length;
  const currentQuestion = sampleQuestions[currentStep - 1];
  const currentResponse = responses.find(r => r.questionId === currentQuestion?.id);

  const answerText = (questionId: string, answerId: string): string => {
    const question = sampleQuestions.find(q => q.id === questionId);
    const option = question?.options.find(o => o.id === answerId);
    return option?.text ?? answerId;
  };

  const buildReportPdf = (scenarioResult: RecommendationResult, scenarioResponses: QuestionnaireResponse[]) => {
    const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 40;
    const maxWidth = pageWidth - (margin * 2);
    let y = 48;

    const addLine = (text: string, size = 11, bold = false, gap = 16) => {
      pdf.setFont('helvetica', bold ? 'bold' : 'normal');
      pdf.setFontSize(size);
      const lines = pdf.splitTextToSize(text, maxWidth);
      lines.forEach((line: string) => {
        if (y > 790) {
          pdf.addPage();
          y = 48;
        }
        pdf.text(line, margin, y);
        y += gap;
      });
    };

    addLine('Infrastructure Recommendation Report', 18, true, 22);
    addLine(`Generated: ${new Date().toLocaleString()}`, 10, false, 18);
    y += 4;

    addLine('Recommendation Summary', 14, true, 20);
    addLine(`Recommendation: ${scenarioResult.recommendation}`);
    addLine(`Fit Score: ${scenarioResult.topMatchPercentage}%`);
    addLine(`Decision Certainty: ${scenarioResult.confidenceLevel} (${scenarioResult.confidenceScore}%)`);
    y += 4;

    addLine('Why This Recommendation', 14, true, 20);
    scenarioResult.reasoning.forEach((reason, idx) => addLine(`${idx + 1}. ${reason}`));
    y += 4;

    addLine('Alternatives', 14, true, 20);
    scenarioResult.alternatives.forEach((alt, idx) => {
      addLine(`${idx + 1}. ${alt.architecture} - Fit ${alt.percentage}% (${alt.score} pts), Complexity ${alt.complexity}, Cost ${alt.estimatedCost}`);
    });
    y += 4;

    addLine('Inputs', 14, true, 20);
    scenarioResponses.forEach(response => {
      const question = sampleQuestions.find(q => q.id === response.questionId);
      addLine(`- ${question?.text ?? response.questionId}: ${answerText(response.questionId, response.selectedAnswerId)}`);
    });

    if (sensitivity) {
      y += 4;
      addLine('Sensitivity Analysis', 14, true, 20);
      addLine(`Variations tested: ${sensitivity.totalVariationsTested}`);
      addLine(`Recommendation switches: ${sensitivity.recommendationSwitches}`);
      sensitivity.changes
        .filter(change => change.changesRecommendation)
        .slice(0, 5)
        .forEach((change, idx) => {
          addLine(`${idx + 1}. Change "${change.questionText}" from "${change.currentAnswerText}" to "${change.newAnswerText}" -> ${change.newRecommendation} (fit ${change.newTopMatchPercentage}%, certainty ${change.newConfidenceScore}%)`);
        });
    }

    return pdf;
  };

  const exportCurrentReport = () => {
    if (!result) return;

    const pdf = buildReportPdf(result, responses);
    const safeArch = result.recommendation.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    pdf.save(`infra-report-${safeArch}-${Date.now()}.pdf`);
  };

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
    setSensitivity(null);
    setIsAnalyzingSensitivity(true);

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

      const sensitivityResponse = await fetch('http://localhost:3001/api/recommend/sensitivity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ responses }),
      });

      if (sensitivityResponse.ok) {
        const sensitivityResult = await sensitivityResponse.json();
        setSensitivity(sensitivityResult);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsAnalyzingSensitivity(false);
      setIsSubmitting(false);
    }
  };

  const canProceed = currentResponse?.selectedAnswerId !== undefined;

  const getArchitectureImage = (architecture: string): string | null => {
    const images: Record<string, string> = {
      'Kubernetes': '/images/kubernetes.svg',
      'Azure App Services': '/images/azure-app-services.png',
      'Azure Container Apps': '/images/azure-container-apps.png',
      'Serverless': '/images/aws-lambda.png',
      'Virtual Machines': '/images/azure-vm.png',
      'AWS Elastic Beanstalk': '/images/aws-beanstalk.png',
      'AWS ECS/Fargate': '/images/aws-ecs.png',
      'AWS Lambda': '/images/aws-lambda.png',
      'AWS EC2': '/images/aws-ec2.png',
      'AWS EKS': '/images/aws-eks.png',
      'GCP App Engine': '/images/gcp-app-engine.png',
      'GCP Cloud Run': '/images/gcp-cloud-run.png',
      'GCP Cloud Functions': '/images/gcp-cloud-functions.png',
      'GCP Compute Engine': '/images/gcp-compute-engine.png',
      'GCP GKE': '/images/gcp-gke.png',
    };
    return images[architecture] || null;
  };

  const getArchitectureIcon = (architecture: string) => {
    const icons: Record<string, string> = {
      'Kubernetes': '🚢',
      'Azure App Services': '☁️',
      'Azure Container Apps': '📦',
      'Serverless': '⚡',
      'Virtual Machines': '🖥️',
      'AWS Elastic Beanstalk': '🌱',
      'AWS ECS/Fargate': '🐳',
      'AWS Lambda': 'λ',
      'AWS EC2': '💻',
      'AWS EKS': '☸️',
      'GCP App Engine': '🔥',
      'GCP Cloud Run': '🏃',
      'GCP Cloud Functions': '⚙️',
      'GCP Compute Engine': '🖱️',
      'GCP GKE': '🎯'
    };
    return icons[architecture] || '🏗️';
  };

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'High':
        return 'from-green-100 to-emerald-100 text-green-800';
      case 'Medium':
        return 'from-yellow-100 to-amber-100 text-yellow-800';
      case 'Low':
        return 'from-blue-100 to-cyan-100 text-blue-800';
      default:
        return 'from-gray-100 to-slate-100 text-gray-800';
    }
  };

  const WhyNotModal: React.FC = () => {
    if (!whyNotAlt) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setWhyNotAlt(null)}>
        <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
        <div
          className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 border border-gray-100"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={() => setWhyNotAlt(null)}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-lg transition-colors"
          >
            ×
          </button>

          <div className="flex items-center mb-6">
            <div className="w-14 h-14 mr-4 flex items-center justify-center">
              {getArchitectureImage(whyNotAlt.architecture) ? (
                <img src={getArchitectureImage(whyNotAlt.architecture)!} alt={whyNotAlt.architecture} className="w-14 h-14 object-contain" />
              ) : (
                <span className="text-4xl">{getArchitectureIcon(whyNotAlt.architecture)}</span>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Why not {whyNotAlt.architecture}?</h2>
              <p className="text-gray-500 text-sm">Fit score: {whyNotAlt.percentage}% vs {result?.topMatchPercentage}% for {result?.recommendation}</p>
            </div>
          </div>

          {/* Score gap */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-5 mb-6">
            <div className="text-sm font-semibold text-gray-700 mb-3">Score Comparison</div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold text-purple-700">{result?.recommendation} (recommended)</span>
                  <span className="font-bold text-purple-700">{result?.topMatchPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full" style={{ width: `${result?.topMatchPercentage ?? 0}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold text-gray-600">{whyNotAlt.architecture}</span>
                  <span className="font-bold text-gray-600">{whyNotAlt.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-gradient-to-r from-gray-400 to-gray-500 h-3 rounded-full" style={{ width: `${whyNotAlt.percentage}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Why it scored lower */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Why it scored lower</h3>
            <ul className="space-y-3">
              {whyNotAlt.cons.map((con, i) => (
                <li key={i} className="flex items-start bg-red-50 rounded-xl p-3">
                  <span className="text-red-500 mr-3 font-bold mt-0.5">✗</span>
                  <span className="text-gray-700 text-sm">{con}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* When it WOULD make sense */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">When {whyNotAlt.architecture} would be a better fit</h3>
            <ul className="space-y-3">
              {whyNotAlt.reasons.map((reason, i) => (
                <li key={i} className="flex items-start bg-blue-50 rounded-xl p-3">
                  <span className="text-blue-500 mr-3 font-bold mt-0.5">→</span>
                  <span className="text-gray-700 text-sm">{reason}</span>
                </li>
              ))}
              {whyNotAlt.pros.slice(0, 2).map((pro, i) => (
                <li key={`pro-${i}`} className="flex items-start bg-green-50 rounded-xl p-3">
                  <span className="text-green-500 mr-3 font-bold mt-0.5">✓</span>
                  <span className="text-gray-700 text-sm">{pro}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-between items-center text-sm text-gray-500 bg-gray-50 rounded-xl p-4">
            <span>Complexity: <span className={`font-semibold ${ whyNotAlt.complexity === 'Low' ? 'text-green-600' : whyNotAlt.complexity === 'Medium' ? 'text-yellow-600' : 'text-red-600'}`}>{whyNotAlt.complexity}</span></span>
            <span>Est. Cost: <span className="font-semibold text-gray-800">{whyNotAlt.estimatedCost}</span></span>
          </div>
        </div>
      </div>
    );
  };

  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-6 md:py-12">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          {whyNotAlt && <WhyNotModal />}
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl p-6 md:p-10 border border-gray-100">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent text-center mb-8">
              Your Infrastructure Recommendation
            </h1>

            <div className="mb-10">
              <div className="text-center mb-8">
                <div className="flex justify-center mb-6">
                  {getArchitectureImage(result.recommendation) ? (
                    <img
                      src={getArchitectureImage(result.recommendation)!}
                      alt={result.recommendation}
                      className="w-24 h-24 object-contain drop-shadow-lg"
                    />
                  ) : (
                    <div className="text-7xl">🏗️</div>
                  )}
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-5">
                  {result.recommendation}
                </h2>
                <div className={`inline-block px-6 py-3 rounded-full font-bold text-lg mb-4 bg-gradient-to-r ${getConfidenceColor(result.confidenceLevel)}`}>
                  Fit {result.topMatchPercentage}% • Decision certainty: {result.confidenceLevel} ({result.confidenceScore}%)
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    onClick={exportCurrentReport}
                    className="px-4 py-2 rounded-xl bg-white border border-blue-200 text-blue-700 font-semibold hover:bg-blue-50 transition-colors"
                  >
                    Export Report (.pdf)
                  </button>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Architecture Comparison</h3>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full bg-white rounded-2xl shadow-xl border border-gray-100">
                    <thead>
                      <tr className="bg-gradient-to-r from-purple-50 to-blue-50">
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Architecture</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Fit Score</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Complexity</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Est. Cost</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Pros</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Cons</th>
                        <th className="px-6 py-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {result.alternatives.map((alt, index) => {
                        return (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 w-10 h-10 mr-3 flex items-center justify-center">
                                {getArchitectureImage(alt.architecture) ? (
                                  <img
                                    src={getArchitectureImage(alt.architecture)!}
                                    alt={alt.architecture}
                                    className="w-10 h-10 object-contain"
                                  />
                                ) : (
                                  <span className="text-2xl">{getArchitectureIcon(alt.architecture)}</span>
                                )}
                              </div>
                              <div>
                                <div className="text-lg font-bold text-gray-900">{alt.architecture}</div>
                                <div className="text-sm text-gray-500 mt-1">{alt.percentage}% fit</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                                <div
                                  className="bg-gradient-to-r from-purple-400 to-blue-400 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${alt.percentage}%` }}
                                />
                              </div>
                              <span className="text-sm font-semibold text-gray-700">{alt.score} pts</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                              alt.complexity === 'Low' ? 'bg-green-100 text-green-800' :
                              alt.complexity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {alt.complexity}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-semibold text-gray-900">{alt.estimatedCost}</span>
                          </td>
                          <td className="px-6 py-4">
                            <ul className="text-sm text-gray-600 space-y-1">
                              {alt.pros.slice(0, 2).map((pro, proIndex) => (
                                <li key={proIndex} className="flex items-start">
                                  <span className="text-green-500 mr-2">✓</span>
                                  <span>{pro}</span>
                                </li>
                              ))}
                            </ul>
                          </td>
                          <td className="px-6 py-4">
                            <ul className="text-sm text-gray-600 space-y-1">
                              {alt.cons.slice(0, 2).map((con, conIndex) => (
                                <li key={conIndex} className="flex items-start">
                                  <span className="text-red-500 mr-2">✗</span>
                                  <span>{con}</span>
                                </li>
                              ))}
                            </ul>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => setWhyNotAlt(alt)}
                              className="text-sm font-semibold text-purple-600 hover:text-purple-800 underline underline-offset-2 whitespace-nowrap transition-colors"
                            >
                              Why not this?
                            </button>
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-6">
                  {result.alternatives.map((alt, index) => {
                    return (
                    <div key={index} className="rounded-2xl shadow-xl border p-6 bg-white border-gray-100">
                      <div className="flex items-center mb-4">
                        <div className="flex-shrink-0 w-12 h-12 mr-3 flex items-center justify-center">
                          {getArchitectureImage(alt.architecture) ? (
                            <img
                              src={getArchitectureImage(alt.architecture)!}
                              alt={alt.architecture}
                              className="w-12 h-12 object-contain"
                            />
                          ) : (
                            <span className="text-3xl">{getArchitectureIcon(alt.architecture)}</span>
                          )}
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-gray-900">{alt.architecture}</h4>
                          <div className="text-sm text-gray-500">{alt.percentage}% fit</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-sm font-semibold text-gray-700 mb-1">Fit Score</div>
                          <div className="flex items-center">
                            <div className="w-12 bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                                style={{ width: `${alt.percentage}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-gray-700">{alt.score} pts</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-700 mb-1">Complexity</div>
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                            alt.complexity === 'Low' ? 'bg-green-100 text-green-800' :
                            alt.complexity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {alt.complexity}
                          </span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="text-sm font-semibold text-gray-700 mb-1">Est. Cost</div>
                        <span className="text-lg font-bold text-gray-900">{alt.estimatedCost}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-sm font-semibold text-green-700 mb-2">Pros</div>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {alt.pros.slice(0, 2).map((pro, proIndex) => (
                              <li key={proIndex} className="flex items-start">
                                <span className="text-green-500 mr-2">✓</span>
                                <span>{pro}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-red-700 mb-2">Cons</div>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {alt.cons.slice(0, 2).map((con, conIndex) => (
                              <li key={conIndex} className="flex items-start">
                                <span className="text-red-500 mr-2">✗</span>
                                <span>{con}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <button
                        onClick={() => setWhyNotAlt(alt)}
                        className="w-full text-center text-sm font-semibold text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 py-2 rounded-xl transition-colors"
                      >
                        Why not this? →
                      </button>
                    </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mb-10">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Sensitivity Analysis</h3>
              {isAnalyzingSensitivity ? (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-blue-800 font-medium">
                  Evaluating "what if" answer changes...
                </div>
              ) : sensitivity ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700">
                    Tested {sensitivity.totalVariationsTested} single-answer variations. Recommendation changed in {sensitivity.recommendationSwitches} cases.
                  </div>
                  {sensitivity.changes.filter(c => c.changesRecommendation).slice(0, 5).length > 0 ? (
                    <div className="space-y-3">
                      {sensitivity.changes.filter(c => c.changesRecommendation).slice(0, 5).map((change, idx) => (
                        <div key={`${change.questionId}-${change.newAnswerId}-${idx}`} className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
                          <p className="text-sm text-gray-700 mb-1"><span className="font-semibold">Switch trigger:</span> {change.questionText}</p>
                          <p className="text-sm text-gray-700 mb-2">{change.currentAnswerText} → {change.newAnswerText}</p>
                          <p className="text-sm font-semibold text-gray-900">New recommendation: {change.newRecommendation} (fit {change.newTopMatchPercentage}%, certainty {change.newConfidenceScore}%)</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-green-800 font-medium">
                      This recommendation is stable under all tested single-answer changes.
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-gray-700">
                  Sensitivity analysis unavailable for this run.
                </div>
              )}
            </div>

            <div className="text-center">
              <button
                onClick={() => {
                  setResult(null);
                  setSensitivity(null);
                  setResponses([]);
                  setCurrentStep(1);
                }}
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold text-base md:text-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-6 md:py-12">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Infrastructure Recommendation
          </h1>
          <p className="text-lg md:text-xl text-gray-600 font-medium px-4">
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

        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold text-base md:text-lg transition-all duration-300 ${
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
            className={`px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold text-base md:text-lg transition-all duration-300 ${
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
