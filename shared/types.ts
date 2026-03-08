// Architecture types for infrastructure recommendations
export type ArchitectureType =
  | 'Kubernetes'
  | 'Azure App Services'
  | 'Azure Container Apps'
  | 'Serverless'
  | 'Virtual Machines'
  // AWS offerings
  | 'AWS Elastic Beanstalk'
  | 'AWS ECS/Fargate'
  | 'AWS Lambda'
  | 'AWS EC2'
  | 'AWS EKS'
  // GCP offerings
  | 'GCP App Engine'
  | 'GCP Cloud Run'
  | 'GCP Cloud Functions'
  | 'GCP Compute Engine'
  | 'GCP GKE';

// Scoring weights for each architecture type
export interface ArchitectureScores {
  Kubernetes: number;
  'Azure App Services': number;
  'Azure Container Apps': number;
  Serverless: number;
  'Virtual Machines': number;
  'AWS Elastic Beanstalk': number;
  'AWS ECS/Fargate': number;
  'AWS Lambda': number;
  'AWS EC2': number;
  'AWS EKS': number;
  'GCP App Engine': number;
  'GCP Cloud Run': number;
  'GCP Cloud Functions': number;
  'GCP Compute Engine': number;
  'GCP GKE': number;
}

// Answer option for multiple choice questions
export interface AnswerOption {
  id: string;
  text: string;
  scores: Partial<ArchitectureScores>; // Partial scores for each architecture
}

// Question interface
export interface Question {
  id: string;
  text: string;
  type: 'multiple-choice';
  options: AnswerOption[];
  category?: string; // Optional category for grouping questions
}

// Questionnaire response
export interface QuestionnaireResponse {
  questionId: string;
  selectedAnswerId: string;
}

// Complete questionnaire
export interface Questionnaire {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

// Scoring result
export interface ScoringResult {
  architecture: ArchitectureType;
  score: number;
  percentage: number;
}

// Recommendation result
export interface RecommendationResult {
  topRecommendation: ArchitectureType;
  scores: ScoringResult[];
  totalScore: number;
}

// Enhanced recommendation output with confidence and reasoning
export interface RecommendationOutput {
  recommendation: ArchitectureType;
  confidenceScore: number; // 0-100 percentage
  confidenceLevel: 'Low' | 'Medium' | 'High'; // Confidence level description
  reasoning: string[];
  alternatives: Array<{
    architecture: ArchitectureType;
    score: number;
    percentage: number;
    reasons: string[];
    pros: string[];
    cons: string[];
    complexity: 'Low' | 'Medium' | 'High';
    estimatedCost: string;
  }>;
}
