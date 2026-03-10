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
          'Azure AKS': -1,
          'AWS Elastic Beanstalk': 3,
          'AWS ECS/Fargate': 2,
          'AWS Lambda': 2,
          'AWS EC2': 1,
          'AWS EKS': -1,
          'GCP App Engine': 3,
          'GCP Cloud Run': 2,
          'GCP Cloud Functions': 2,
          'GCP Compute Engine': 1,
          'GCP GKE': -1
        }
      },
      {
        id: 'moderate-microservices',
        text: 'Moderate complexity with some microservices',
        scores: {
          'Azure Container Apps': 3,
          'Azure AKS': 2,
          'Azure App Services': 2,
          Serverless: 1,
          'Virtual Machines': 1,
          'AWS ECS/Fargate': 3,
          'AWS EKS': 2,
          'AWS Elastic Beanstalk': 2,
          'AWS Lambda': 1,
          'AWS EC2': 1,
          'GCP Cloud Run': 3,
          'GCP GKE': 2,
          'GCP App Engine': 2,
          'GCP Cloud Functions': 1,
          'GCP Compute Engine': 1
        }
      },
      {
        id: 'complex-distributed',
        text: 'Complex distributed system with many services',
        scores: {
          'Azure AKS': 4,
          'Azure Container Apps': 2,
          'Azure App Services': -2,
          Serverless: -2,
          'Virtual Machines': 2,
          'AWS EKS': 4,
          'AWS ECS/Fargate': 2,
          'AWS EC2': 2,
          'AWS Elastic Beanstalk': -2,
          'AWS Lambda': -2,
          'GCP GKE': 4,
          'GCP Cloud Run': 2,
          'GCP Compute Engine': 2,
          'GCP App Engine': -2,
          'GCP Cloud Functions': -2
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
          'Azure AKS': 2,
          Serverless: -1,
          'AWS Elastic Beanstalk': 3,
          'AWS EC2': 3,
          'AWS ECS/Fargate': 2,
          'AWS EKS': 2,
          'AWS Lambda': -1,
          'GCP App Engine': 3,
          'GCP Compute Engine': 3,
          'GCP Cloud Run': 2,
          'GCP GKE': 2,
          'GCP Cloud Functions': -1
        }
      },
      {
        id: 'variable-traffic',
        text: 'Highly variable or unpredictable traffic',
        scores: {
          Serverless: 4,
          'Azure Container Apps': 3,
          'Azure AKS': 3,
          'Azure App Services': 2,
          'Virtual Machines': -1,
          'AWS Lambda': 4,
          'AWS ECS/Fargate': 3,
          'AWS EKS': 3,
          'AWS Elastic Beanstalk': 2,
          'AWS EC2': -1,
          'GCP Cloud Functions': 4,
          'GCP Cloud Run': 3,
          'GCP GKE': 3,
          'GCP App Engine': 2,
          'GCP Compute Engine': -1
        }
      },
      {
        id: 'steady-high-load',
        text: 'Steady high load with complex scaling rules',
        scores: {
          'Azure AKS': 4,
          'Azure Container Apps': 3,
          'Virtual Machines': 2,
          'Azure App Services': 1,
          Serverless: 1,
          'AWS EKS': 4,
          'AWS ECS/Fargate': 3,
          'AWS EC2': 2,
          'AWS Elastic Beanstalk': 1,
          'AWS Lambda': 1,
          'GCP GKE': 4,
          'GCP Cloud Run': 3,
          'GCP Compute Engine': 2,
          'GCP App Engine': 1,
          'GCP Cloud Functions': 1
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
          'Azure AKS': 4,
          'Azure Container Apps': 4,
          'Azure App Services': -1,
          Serverless: 1,
          'Virtual Machines': 1,
          'AWS EKS': 4,
          'AWS ECS/Fargate': 4,
          'AWS Elastic Beanstalk': -1,
          'AWS EC2': 1,
          'GCP GKE': 4,
          'GCP Cloud Run': 4,
          'GCP App Engine': -1,
          'GCP Compute Engine': 1,
          'AWS Lambda': 1,
          'GCP Cloud Functions': 1
        }
      },
      {
        id: 'maybe-containers',
        text: 'Maybe, depending on the benefits',
        scores: {
          'Azure Container Apps': 3,
          'Azure AKS': 2,
          'Azure App Services': 2,
          Serverless: 1,
          'Virtual Machines': 2,
          'AWS ECS/Fargate': 3,
          'AWS EKS': 2,
          'AWS Elastic Beanstalk': 2,
          'AWS EC2': 2,
          'GCP Cloud Run': 3,
          'GCP GKE': 2,
          'GCP App Engine': 2,
          'GCP Compute Engine': 2
        }
      },
      {
        id: 'no-containers',
        text: 'No, we prefer traditional deployment methods',
        scores: {
          'Azure App Services': 3,
          'Virtual Machines': 3,
          Serverless: 2,
          'Azure Container Apps': -2,
          'Azure AKS': -2,
          'AWS Elastic Beanstalk': 3,
          'AWS EC2': 3,
          'AWS Lambda': 2,
          'AWS ECS/Fargate': -2,
          'AWS EKS': -2,
          'GCP App Engine': 3,
          'GCP Compute Engine': 3,
          'GCP Cloud Functions': 2,
          'GCP Cloud Run': -2,
          'GCP GKE': -2
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
          'Virtual Machines': -2,
          'Azure AKS': -2,
          'AWS Lambda': 4,
          'AWS Elastic Beanstalk': 3,
          'AWS ECS/Fargate': 3,
          'AWS EC2': -2,
          'AWS EKS': -2,
          'GCP Cloud Functions': 4,
          'GCP App Engine': 4,
          'GCP Cloud Run': 3,
          'GCP Compute Engine': -2,
          'GCP GKE': -2
        }
      },
      {
        id: 'some-ops',
        text: 'Some - we can handle basic monitoring and scaling',
        scores: {
          'Azure Container Apps': 3,
          'Azure App Services': 3,
          'Azure AKS': 2,
          Serverless: 2,
          'Virtual Machines': 2,
          'AWS ECS/Fargate': 3,
          'AWS Elastic Beanstalk': 3,
          'AWS EKS': 2,
          'AWS Lambda': 2,
          'AWS EC2': 2,
          'GCP Cloud Run': 3,
          'GCP App Engine': 3,
          'GCP GKE': 2,
          'GCP Cloud Functions': 2,
          'GCP Compute Engine': 2
        }
      },
      {
        id: 'full-control',
        text: 'Full control - we want to manage everything',
        scores: {
          'Virtual Machines': 4,
          'Azure AKS': 3,
          'Azure Container Apps': -1,
          'Azure App Services': -2,
          Serverless: -2,
          'AWS EC2': 4,
          'AWS EKS': 3,
          'AWS ECS/Fargate': -1,
          'AWS Elastic Beanstalk': -2,
          'AWS Lambda': -2,
          'GCP Compute Engine': 4,
          'GCP GKE': 3,
          'GCP Cloud Run': -1,
          'GCP App Engine': -2,
          'GCP Cloud Functions': -2
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
          'Azure AKS': 1,
          'Virtual Machines': 1,
          'AWS Lambda': 4,
          'AWS ECS/Fargate': 2,
          'AWS Elastic Beanstalk': 1,
          'AWS EC2': 1,
          'AWS EKS': 1,
          'GCP Cloud Functions': 4,
          'GCP Cloud Run': 2,
          'GCP App Engine': 1,
          'GCP Compute Engine': 1,
          'GCP GKE': 1
        }
      },
      {
        id: 'balanced-cost',
        text: 'Balanced - cost matters but not the only factor',
        scores: {
          'Azure App Services': 3,
          'Azure Container Apps': 3,
          Serverless: 2,
          'Azure AKS': 2,
          'Virtual Machines': 2,
          'AWS Elastic Beanstalk': 3,
          'AWS ECS/Fargate': 3,
          'AWS Lambda': 2,
          'AWS EC2': 2,
          'AWS EKS': 2,
          'GCP App Engine': 3,
          'GCP Cloud Run': 3,
          'GCP Cloud Functions': 2,
          'GCP Compute Engine': 2,
          'GCP GKE': 2
        }
      },
      {
        id: 'cost-flexible',
        text: 'Flexible - willing to pay for simplicity and performance',
        scores: {
          'Virtual Machines': 3,
          'Azure AKS': 3,
          'Azure App Services': 2,
          'Azure Container Apps': 2,
          Serverless: 1,
          'AWS EC2': 3,
          'AWS EKS': 3,
          'AWS Elastic Beanstalk': 2,
          'AWS ECS/Fargate': 2,
          'AWS Lambda': 1,
          'GCP Compute Engine': 3,
          'GCP GKE': 3,
          'GCP App Engine': 2,
          'GCP Cloud Run': 2,
          'GCP Cloud Functions': 1
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
          'Virtual Machines': -2,
          'Azure AKS': -2,
          'AWS Lambda': 4,
          'AWS Elastic Beanstalk': 3,
          'AWS ECS/Fargate': 3,
          'AWS EC2': -2,
          'AWS EKS': -2,
          'GCP Cloud Functions': 4,
          'GCP App Engine': 4,
          'GCP Cloud Run': 3,
          'GCP Compute Engine': -2,
          'GCP GKE': -2
        }
      },
      {
        id: 'balanced-expertise',
        text: 'Balanced - some infrastructure knowledge',
        scores: {
          'Azure Container Apps': 3,
          'Azure App Services': 3,
          'Azure AKS': 2,
          Serverless: 2,
          'Virtual Machines': 2,
          'AWS ECS/Fargate': 3,
          'AWS Elastic Beanstalk': 3,
          'AWS EKS': 2,
          'AWS Lambda': 2,
          'AWS EC2': 2,
          'GCP Cloud Run': 3,
          'GCP App Engine': 3,
          'GCP GKE': 2,
          'GCP Cloud Functions': 2,
          'GCP Compute Engine': 2
        }
      },
      {
        id: 'infra-experts',
        text: 'Infrastructure experts - comfortable with complex setups',
        scores: {
          'Azure AKS': 4,
          'Virtual Machines': 4,
          'Azure Container Apps': 2,
          'Azure App Services': 1,
          Serverless: 1,
          'AWS EKS': 4,
          'AWS EC2': 4,
          'AWS ECS/Fargate': 2,
          'AWS Elastic Beanstalk': 1,
          'AWS Lambda': 1,
          'GCP GKE': 4,
          'GCP Compute Engine': 4,
          'GCP Cloud Run': 2,
          'GCP App Engine': 1,
          'GCP Cloud Functions': 1
        }
      }
    ]
  }
  ,
  // New questions for better accuracy and cloud provider mapping
  {
    id: 'provider-preference',
    text: 'Do you have a preferred cloud provider?',
    type: 'multiple-choice',
    category: 'Provider',
    options: [
      {
        id: 'prefer-azure',
        text: 'Prefer Azure',
        scores: {
          'Azure App Services': 4,
          'Azure Container Apps': 3,
          Serverless: 2,
          'Virtual Machines': 2,
          'Azure AKS': 2,
          'AWS Elastic Beanstalk': 0,
          'AWS ECS/Fargate': 0,
          'AWS Lambda': 0,
          'AWS EC2': 0,
          'AWS EKS': 0,
          'GCP App Engine': 0,
          'GCP Cloud Run': 0,
          'GCP Cloud Functions': 0,
          'GCP Compute Engine': 0,
          'GCP GKE': 0
        }
      },
      {
        id: 'prefer-aws',
        text: 'Prefer AWS',
        scores: {
          'AWS Elastic Beanstalk': 4,
          'AWS ECS/Fargate': 3,
          'AWS Lambda': 2,
          'AWS EC2': 2,
          'AWS EKS': 2,
          'Azure App Services': 0,
          'Azure Container Apps': 0,
          Serverless: 0,
          'Virtual Machines': 0,
          'Azure AKS': 0,
          'GCP App Engine': 0,
          'GCP Cloud Run': 0,
          'GCP Cloud Functions': 0,
          'GCP Compute Engine': 0,
          'GCP GKE': 0
        }
      },
      {
        id: 'prefer-gcp',
        text: 'Prefer GCP',
        scores: {
          'GCP App Engine': 4,
          'GCP Cloud Run': 3,
          'GCP Cloud Functions': 2,
          'GCP Compute Engine': 2,
          'GCP GKE': 2,
          'Azure App Services': 0,
          'Azure Container Apps': 0,
          Serverless: 0,
          'Virtual Machines': 0,
          'Azure AKS': 0,
          'AWS Elastic Beanstalk': 0,
          'AWS ECS/Fargate': 0,
          'AWS Lambda': 0,
          'AWS EC2': 0,
          'AWS EKS': 0
        }
      },
      {
        id: 'no-preference',
        text: 'No strong preference',
        scores: {
          'Azure AKS': 2,
          'Azure App Services': 2,
          'Azure Container Apps': 2,
          Serverless: 2,
          'Virtual Machines': 2,
          'AWS Elastic Beanstalk': 2,
          'AWS ECS/Fargate': 2,
          'AWS Lambda': 2,
          'AWS EC2': 2,
          'AWS EKS': 2,
          'GCP App Engine': 2,
          'GCP Cloud Run': 2,
          'GCP Cloud Functions': 2,
          'GCP Compute Engine': 2,
          'GCP GKE': 2
        }
      }
    ]
  },
  {
    id: 'stateful-needs',
    text: 'Will you run stateful services or databases alongside your app?',
    type: 'multiple-choice',
    category: 'Data',
    options: [
      { id: 'yes-stateful', text: 'Yes, stateful services/databases', scores: {
        'Virtual Machines': 4,
        'AWS EC2': 4,
        'GCP Compute Engine': 4,
        'Azure AKS': 3,
        'AWS EKS': 3,
        'GCP GKE': 3,
        'Azure App Services': 1,
        'Azure Container Apps': 1,
        'AWS Elastic Beanstalk': 1,
        'GCP App Engine': 1,
        Serverless: -2,
        'AWS Lambda': -2,
        'GCP Cloud Functions': -2
      } },
      { id: 'no-stateful', text: 'No, mostly stateless services', scores: {
        Serverless: 3,
        'Azure Container Apps': 3,
        'AWS ECS/Fargate': 3,
        'GCP Cloud Run': 3,
        'Azure AKS': 2,
        'AWS EKS': 2,
        'GCP GKE': 2,
        'Virtual Machines': 1,
        'AWS EC2': 1,
        'GCP Compute Engine': 1
      } }
    ]
  },
  {
    id: 'multi-region',
    text: 'Do you require multi-region deployment or low-latency global presence?',
    type: 'multiple-choice',
    category: 'Scalability',
    options: [
      { id: 'multi-region-yes', text: 'Yes, global presence required', scores: {
        'Azure AKS': 3,
        'AWS EKS': 3,
        'GCP GKE': 3,
        Serverless: 3,
        'Azure Container Apps': 2,
        'AWS ECS/Fargate': 2,
        'GCP Cloud Run': 2,
        'Virtual Machines': 2,
        'AWS EC2': 2,
        'GCP Compute Engine': 2
      } },
      { id: 'multi-region-no', text: 'No, single-region is fine', scores: {
        'Azure App Services': 2,
        Serverless: 2,
        'Virtual Machines': 2,
        'Azure AKS': 2,
        'AWS Elastic Beanstalk': 2,
        'GCP App Engine': 2
      } }
    ]
  },
  {
    id: 'compliance',
    text: 'Do you have strict regulatory or compliance requirements?',
    type: 'multiple-choice',
    category: 'Security',
    options: [
      { id: 'strict-compliance', text: 'Yes, strict compliance required', scores: {
        'Virtual Machines': 4,
        'AWS EC2': 4,
        'GCP Compute Engine': 4,
        'Azure AKS': 2,
        'AWS EKS': 2,
        'GCP GKE': 2,
        'Azure App Services': 2,
        'AWS Elastic Beanstalk': 1,
        'GCP App Engine': 1,
        Serverless: -1,
        'AWS Lambda': -1,
        'GCP Cloud Functions': -1
      } },
      { id: 'standard-compliance', text: 'Standard compliance only', scores: {
        'Azure App Services': 3,
        Serverless: 2,
        'Azure Container Apps': 2,
        'AWS Elastic Beanstalk': 3,
        'AWS Lambda': 2,
        'GCP App Engine': 3,
        'GCP Cloud Functions': 2,
        'Virtual Machines': 2,
        'Azure AKS': 2
      } }
    ]
  }
];

// Sample questionnaire
export const sampleQuestionnaire = {
  id: 'infra-recommendation-v1',
  title: 'Infrastructure Recommendation Questionnaire',
  description: 'Answer these questions to get personalized infrastructure recommendations across Azure, AWS, and GCP.',
  questions: sampleQuestions
};
