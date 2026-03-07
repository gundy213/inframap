import {
  ArchitectureType,
  ArchitectureScores,
  QuestionnaireResponse,
  ScoringResult,
  RecommendationResult,
  Question
} from '../../shared/types';
import { sampleQuestions } from '../../shared/questions';

/**
 * Scoring Engine for Infrastructure Recommendations
 *
 * This engine calculates scores for different Azure architecture types
 * based on user responses to the questionnaire.
 */

export class ScoringEngine {
  private questions: Question[];

  constructor(questions: Question[] = sampleQuestions) {
    this.questions = questions;
  }

  /**
   * Calculate scores for all architecture types based on responses
   */
  calculateScores(responses: QuestionnaireResponse[]): ArchitectureScores {
    const initialScores: ArchitectureScores = {
      Kubernetes: 0,
      'Azure App Services': 0,
      'Azure Container Apps': 0,
      Serverless: 0,
      'Virtual Machines': 0
    };

    return responses.reduce((scores, response) => {
      const question = this.questions.find(q => q.id === response.questionId);
      if (!question) return scores;

      const selectedOption = question.options.find(opt => opt.id === response.selectedAnswerId);
      if (!selectedOption) return scores;

      // Add scores from the selected option
      Object.entries(selectedOption.scores).forEach(([architecture, score]) => {
        scores[architecture as ArchitectureType] += score;
      });

      return scores;
    }, initialScores);
  }

  /**
   * Convert raw scores to percentage-based results
   */
  private scoresToResults(scores: ArchitectureScores): ScoringResult[] {
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);

    if (totalScore === 0) {
      return Object.keys(scores).map(arch => ({
        architecture: arch as ArchitectureType,
        score: 0,
        percentage: 0
      }));
    }

    return Object.entries(scores)
      .map(([architecture, score]) => ({
        architecture: architecture as ArchitectureType,
        score,
        percentage: Math.round((score / totalScore) * 100)
      }))
      .sort((a, b) => b.score - a.score); // Sort by score descending
  }

  /**
   * Generate recommendation based on responses
   */
  generateRecommendation(responses: QuestionnaireResponse[]): RecommendationResult {
    const scores = this.calculateScores(responses);
    const results = this.scoresToResults(scores);
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);

    return {
      topRecommendation: results[0].architecture,
      scores: results,
      totalScore
    };
  }

  /**
   * Get detailed scoring breakdown for analysis
   */
  getDetailedScoring(responses: QuestionnaireResponse[]): {
    questionBreakdown: Array<{
      questionId: string;
      questionText: string;
      selectedAnswer: string;
      scores: Partial<ArchitectureScores>;
    }>;
    totalScores: ArchitectureScores;
    recommendation: RecommendationResult;
  } {
    const questionBreakdown = responses.map(response => {
      const question = this.questions.find(q => q.id === response.questionId)!;
      const selectedOption = question.options.find(opt => opt.id === response.selectedAnswerId)!;

      return {
        questionId: response.questionId,
        questionText: question.text,
        selectedAnswer: selectedOption.text,
        scores: selectedOption.scores
      };
    });

    const totalScores = this.calculateScores(responses);
    const recommendation = this.generateRecommendation(responses);

    return {
      questionBreakdown,
      totalScores,
      recommendation
    };
  }
}

/**
 * Utility functions for scoring analysis
 */
export const ScoringUtils = {
  /**
   * Get architecture descriptions for recommendations
   */
  getArchitectureDescription(architecture: ArchitectureType): string {
    const descriptions: Record<ArchitectureType, string> = {
      Kubernetes: 'Container orchestration platform ideal for complex, distributed applications with advanced scaling and management needs.',
      'Azure App Services': 'Fully managed platform for web applications and APIs, offering simplicity and quick deployment.',
      'Azure Container Apps': 'Serverless container service that provides a Kubernetes-like experience without managing infrastructure.',
      Serverless: 'Event-driven computing model where you pay only for execution time, perfect for variable workloads.',
      'Virtual Machines': 'Full control over your infrastructure with traditional virtual machine deployments.'
    };

    return descriptions[architecture];
  },

  /**
   * Validate questionnaire responses
   */
  validateResponses(responses: QuestionnaireResponse[], questions: Question[]): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const questionIds = new Set(questions.map(q => q.id));
    const responseQuestionIds = new Set(responses.map(r => r.questionId));

    // Check for missing questions
    const missingQuestions = [...questionIds].filter(id => !responseQuestionIds.has(id));
    if (missingQuestions.length > 0) {
      errors.push(`Missing responses for questions: ${missingQuestions.join(', ')}`);
    }

    // Check for invalid question IDs
    const invalidQuestions = [...responseQuestionIds].filter(id => !questionIds.has(id));
    if (invalidQuestions.length > 0) {
      errors.push(`Invalid question IDs: ${invalidQuestions.join(', ')}`);
    }

    // Check for invalid answer IDs
    responses.forEach(response => {
      const question = questions.find(q => q.id === response.questionId);
      if (question) {
        const validAnswerIds = question.options.map(opt => opt.id);
        if (!validAnswerIds.includes(response.selectedAnswerId)) {
          errors.push(`Invalid answer ID '${response.selectedAnswerId}' for question '${response.questionId}'`);
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};
