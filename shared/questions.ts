import { Question } from './types';

// Example questions for infrastructure recommendation questionnaire
export const sampleQuestions: Question[] = [
  {
    id: 'app-complexity',
    text: 'How complex is your application?',
    type: 'multiple-choice',
    category: 'Application Characteristics',
    options: [
      {
        id: 'simple-web',
        text: 'Simple web application or API',
        scores: {
          'Azure App Services': 3,
          'Azure Container Apps': 2,
          Serverless: 2,
          'Virtual Machines': 1,
          Kubernetes: 1
        }
      },
      {
        id: 'moderate-microservices',
        text: 'Moderate complexity with some microservices',
        scores: {
          'Azure Container Apps': 3,
          Kubernetes: 2,
          'Azure App Services': 2,
          Serverless: 1,
          'Virtual Machines': 1
        }
      },
      {
        id: 'complex-distributed',
        text: 'Complex distributed system with many services',
        scores: {
          Kubernetes: 4,
          'Azure Container Apps': 2,
          'Azure App Services': 1,
          Serverless: 1,
          'Virtual Machines': 2
        }
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
        text: 'Predictable traffic patterns',
        scores: {
          'Azure App Services': 3,
          'Virtual Machines': 3,
          'Azure Container Apps': 2,
          Kubernetes: 2,
          Serverless: 1
        }
      },
      {
        id: 'variable-traffic',
        text: 'Highly variable or unpredictable traffic',
        scores: {
          Serverless: 4,
          'Azure Container Apps': 3,
          Kubernetes: 3,
          'Azure App Services': 2,
          'Virtual Machines': 1
        }
      },
      {
        id: 'steady-high-load',
        text: 'Steady high load with complex scaling rules',
        scores: {
          Kubernetes: 4,
          'Azure Container Apps': 3,
          'Virtual Machines': 2,
          'Azure App Services': 1,
          Serverless: 1
        }
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
        text: 'Yes, we want to use containers',
        scores: {
          Kubernetes: 4,
          'Azure Container Apps': 4,
          'Azure App Services': 1,
          Serverless: 1,
          'Virtual Machines': 1
        }
      },
      {
        id: 'maybe-containers',
        text: 'Maybe, depending on the benefits',
        scores: {
          'Azure Container Apps': 3,
          Kubernetes: 2,
          'Azure App Services': 2,
          Serverless: 1,
          'Virtual Machines': 2
        }
      },
      {
        id: 'no-containers',
        text: 'No, we prefer traditional deployment methods',
        scores: {
          'Azure App Services': 3,
          'Virtual Machines': 3,
          Serverless: 2,
          'Azure Container Apps': 1,
          Kubernetes: 1
        }
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
        text: 'Minimal - we want fully managed services',
        scores: {
          Serverless: 4,
          'Azure App Services': 4,
          'Azure Container Apps': 3,
          'Virtual Machines': 1,
          Kubernetes: 1
        }
      },
      {
        id: 'some-ops',
        text: 'Some - we can handle basic monitoring and scaling',
        scores: {
          'Azure Container Apps': 3,
          'Azure App Services': 3,
          Kubernetes: 2,
          Serverless: 2,
          'Virtual Machines': 2
        }
      },
      {
        id: 'full-control',
        text: 'Full control - we want to manage everything',
        scores: {
          'Virtual Machines': 4,
          Kubernetes: 3,
          'Azure Container Apps': 1,
          'Azure App Services': 1,
          Serverless: 1
        }
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
        text: 'Very cost-sensitive - pay only for what we use',
        scores: {
          Serverless: 4,
          'Azure Container Apps': 2,
          'Azure App Services': 1,
          Kubernetes: 1,
          'Virtual Machines': 1
        }
      },
      {
        id: 'balanced-cost',
        text: 'Balanced - cost matters but not the only factor',
        scores: {
          'Azure App Services': 3,
          'Azure Container Apps': 3,
          Serverless: 2,
          Kubernetes: 2,
          'Virtual Machines': 2
        }
      },
      {
        id: 'cost-flexible',
        text: 'Flexible - willing to pay for simplicity and performance',
        scores: {
          'Virtual Machines': 3,
          Kubernetes: 3,
          'Azure App Services': 2,
          'Azure Container Apps': 2,
          Serverless: 1
        }
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
        text: 'Development-focused, prefer not to manage infrastructure',
        scores: {
          Serverless: 4,
          'Azure App Services': 4,
          'Azure Container Apps': 3,
          'Virtual Machines': 1,
          Kubernetes: 1
        }
      },
      {
        id: 'balanced-expertise',
        text: 'Balanced - some infrastructure knowledge',
        scores: {
          'Azure Container Apps': 3,
          'Azure App Services': 3,
          Kubernetes: 2,
          Serverless: 2,
          'Virtual Machines': 2
        }
      },
      {
        id: 'infra-experts',
        text: 'Infrastructure experts - comfortable with complex setups',
        scores: {
          Kubernetes: 4,
          'Virtual Machines': 4,
          'Azure Container Apps': 2,
          'Azure App Services': 1,
          Serverless: 1
        }
      }
    ]
  }
];

// Sample questionnaire
export const sampleQuestionnaire = {
  id: 'infra-recommendation-v1',
  title: 'Infrastructure Recommendation Questionnaire',
  description: 'Answer these questions to get personalized infrastructure recommendations for Azure.',
  questions: sampleQuestions
};
