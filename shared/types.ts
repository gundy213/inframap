// Architecture types for infrastructure recommendations
export type ArchitectureType =
  | 'Kubernetes'
  | 'Azure App Services'
  | 'Azure Container Apps'
  | 'Serverless'
  | 'Virtual Machines';

// Scoring weights for each architecture type
export interface ArchitectureScores {
  Kubernetes: number;
  'Azure App Services': number;
  'Azure Container Apps': number;
  Serverless: number;
  'Virtual Machines': number;
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
  reasoning: string[];
  alternatives: Array<{
    architecture: ArchitectureType;
    score: number;
    percentage: number;
    reasons: string[];
  }>;
}
