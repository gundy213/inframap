// Lightweight declarations for static analysis when @types/node isn't installed
declare const console: any;
declare const require: any;
declare const module: any;

import { RecommendationEngine } from './recommendationEngine';
import { QuestionnaireResponse } from '../../shared/types';
import { sampleQuestions } from '../../shared/questions';

/**
 * Example usage of the Recommendation Engine
 */

// Sample responses that would favor Kubernetes
const kubernetesFavoringResponses: QuestionnaireResponse[] = [
  {
    questionId: 'app-complexity',
    selectedAnswerId: 'complex-distributed'
  },
  {
    questionId: 'scaling-needs',
    selectedAnswerId: 'steady-high-load'
  },
  {
    questionId: 'container-usage',
    selectedAnswerId: 'yes-containers'
  },
  {
    questionId: 'operational-overhead',
    selectedAnswerId: 'some-ops'
  },
  {
    questionId: 'cost-sensitivity',
    selectedAnswerId: 'balanced-cost'
  },
  {
    questionId: 'team-expertise',
    selectedAnswerId: 'infra-experts'
  }
];

// Sample responses that would favor Serverless
const serverlessFavoringResponses: QuestionnaireResponse[] = [
  {
    questionId: 'app-complexity',
    selectedAnswerId: 'simple-web'
  },
  {
    questionId: 'scaling-needs',
    selectedAnswerId: 'variable-traffic'
  },
  {
    questionId: 'container-usage',
    selectedAnswerId: 'no-containers'
  },
  {
    questionId: 'operational-overhead',
    selectedAnswerId: 'minimal-ops'
  },
  {
    questionId: 'cost-sensitivity',
    selectedAnswerId: 'cost-critical'
  },
  {
    questionId: 'team-expertise',
    selectedAnswerId: 'dev-focused'
  }
];

// Example usage function
export function demonstrateRecommendationEngine() {
  const engine = new RecommendationEngine(sampleQuestions);

  console.log('=== Kubernetes-Favoring Scenario ===');
  try {
    const kubernetesResult = engine.generateRecommendation(kubernetesFavoringResponses);
    console.log(JSON.stringify(kubernetesResult, null, 2));
  } catch (error) {
    console.error('Error generating Kubernetes recommendation:', error);
  }

  console.log('\n=== Serverless-Favoring Scenario ===');
  try {
    const serverlessResult = engine.generateRecommendation(serverlessFavoringResponses);
    console.log(JSON.stringify(serverlessResult, null, 2));
  } catch (error) {
    console.error('Error generating Serverless recommendation:', error);
  }
}

// Export sample response sets for testing
export const sampleResponseSets = {
  kubernetes: kubernetesFavoringResponses,
  serverless: serverlessFavoringResponses
};