import { Request, Response } from 'express';
import { RecommendationEngine } from '../engine/recommendationEngine';
import { sampleQuestions } from '../../shared/questions';
import { QuestionnaireResponse } from '../../shared/types';

// Initialize the recommendation engine with sample questions
const recommendationEngine = new RecommendationEngine(sampleQuestions);

export interface RecommendRequest {
  responses: QuestionnaireResponse[];
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
