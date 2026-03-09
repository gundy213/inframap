import { Request, Response } from 'express';
import { RecommendationEngine } from '../engine/recommendationEngine';
import { sampleQuestions } from '../../shared/questions';
import { QuestionnaireResponse } from '../../shared/types';

// Initialize the recommendation engine with sample questions
const recommendationEngine = new RecommendationEngine(sampleQuestions);

export interface RecommendRequest {
  responses: QuestionnaireResponse[];
}

export interface SensitivityAnalysisResponse {
  baseRecommendation: string;
  baseTopMatchPercentage: number;
  baseConfidenceScore: number;
  totalVariationsTested: number;
  recommendationSwitches: number;
  changes: Array<{
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
  }>;
}

export interface RecommendResponse {
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
  }>;
}

/**
 * POST /api/recommend
 * Generate infrastructure recommendations based on questionnaire responses
 */
export const recommend = async (req: Request, res: Response): Promise<void> => {
  try {
    const { responses }: RecommendRequest = req.body;

    // Validate request body
    if (!responses || !Array.isArray(responses)) {
      res.status(400).json({
        error: 'Invalid request body. Expected { responses: QuestionnaireResponse[] }'
      });
      return;
    }

    // Validate that responses is not empty
    if (responses.length === 0) {
      res.status(400).json({
        error: 'No responses provided. Please answer at least one question.'
      });
      return;
    }

    // Generate recommendation using the engine
    const result = recommendationEngine.generateRecommendation(responses);

    // Return the recommendation
    const response: RecommendResponse = {
      recommendation: result.recommendation,
      topMatchPercentage: result.topMatchPercentage,
      confidenceScore: result.confidenceScore,
      confidenceLevel: result.confidenceLevel,
      reasoning: result.reasoning,
      alternatives: result.alternatives
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Error generating recommendation:', error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('Invalid responses')) {
        res.status(400).json({
          error: 'Invalid questionnaire responses provided.',
          details: error.message
        });
        return;
      }
    }

    // Generic error response
    res.status(500).json({
      error: 'Internal server error occurred while generating recommendation.'
    });
  }
};

/**
 * GET /api/recommend/questions
 * Get the list of available questions
 */
export const getQuestions = async (req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json({
      questions: sampleQuestions
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({
      error: 'Internal server error occurred while fetching questions.'
    });
  }
};

/**
 * POST /api/recommend/sensitivity
 * Analyze how changing one answer at a time impacts the recommendation
 */
export const sensitivityAnalysis = async (req: Request, res: Response): Promise<void> => {
  try {
    const { responses }: RecommendRequest = req.body;

    if (!responses || !Array.isArray(responses) || responses.length === 0) {
      res.status(400).json({
        error: 'Invalid request body. Expected non-empty { responses: QuestionnaireResponse[] }'
      });
      return;
    }

    const base = recommendationEngine.generateRecommendation(responses);
    const changes: SensitivityAnalysisResponse['changes'] = [];
    let totalVariationsTested = 0;

    for (const response of responses) {
      const question = sampleQuestions.find(q => q.id === response.questionId);
      if (!question) {
        continue;
      }

      const currentOption = question.options.find(o => o.id === response.selectedAnswerId);
      if (!currentOption) {
        continue;
      }

      for (const option of question.options) {
        if (option.id === response.selectedAnswerId) {
          continue;
        }

        totalVariationsTested += 1;
        const variedResponses = responses.map(r =>
          r.questionId === response.questionId
            ? { ...r, selectedAnswerId: option.id }
            : r
        );

        const varied = recommendationEngine.generateRecommendation(variedResponses);
        const changesRecommendation = varied.recommendation !== base.recommendation;

        changes.push({
          questionId: question.id,
          questionText: question.text,
          currentAnswerId: currentOption.id,
          currentAnswerText: currentOption.text,
          newAnswerId: option.id,
          newAnswerText: option.text,
          newRecommendation: varied.recommendation,
          newTopMatchPercentage: varied.topMatchPercentage,
          newConfidenceScore: varied.confidenceScore,
          newConfidenceLevel: varied.confidenceLevel,
          changesRecommendation,
          fitDelta: varied.topMatchPercentage - base.topMatchPercentage,
          certaintyDelta: varied.confidenceScore - base.confidenceScore
        });
      }
    }

    changes.sort((a, b) => {
      if (a.changesRecommendation !== b.changesRecommendation) {
        return a.changesRecommendation ? -1 : 1;
      }

      const impactA = Math.abs(a.fitDelta) + Math.abs(a.certaintyDelta);
      const impactB = Math.abs(b.fitDelta) + Math.abs(b.certaintyDelta);
      return impactB - impactA;
    });

    const response: SensitivityAnalysisResponse = {
      baseRecommendation: base.recommendation,
      baseTopMatchPercentage: base.topMatchPercentage,
      baseConfidenceScore: base.confidenceScore,
      totalVariationsTested,
      recommendationSwitches: changes.filter(c => c.changesRecommendation).length,
      changes: changes.slice(0, 20)
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error generating sensitivity analysis:', error);
    res.status(500).json({
      error: 'Internal server error occurred while generating sensitivity analysis.'
    });
  }
};
