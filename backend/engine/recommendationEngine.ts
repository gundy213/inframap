import {
  ArchitectureType,
  ArchitectureScores,
  QuestionnaireResponse,
  ScoringResult,
  RecommendationOutput,
  Question
} from '../../shared/types';
import { ScoringEngine, ScoringUtils } from './scoringEngine';
import { RuleEngine, recommendationRules, compatibilityRules, costRules } from './rules';
import { sampleQuestions } from '../../shared/questions';

/**
 * Enhanced Recommendation Engine
 *
 * Provides intelligent infrastructure recommendations with confidence scoring,
 * detailed reasoning, and alternative options using weighted scoring rules.
 */

export class RecommendationEngine {
  private scoringEngine: ScoringEngine;
  private ruleEngine: RuleEngine;
  private questions: Question[];

  constructor(questions: Question[]) {
    this.questions = questions;
    this.scoringEngine = new ScoringEngine(questions);
    this.ruleEngine = new RuleEngine(recommendationRules);
  }

  /**
   * Generate comprehensive recommendation with confidence and reasoning
   */
  generateRecommendation(responses: QuestionnaireResponse[]): RecommendationOutput {
    // Validate responses first
    const validation = ScoringUtils.validateResponses(responses, this.questions);
    if (!validation.isValid) {
      throw new Error(`Invalid responses: ${validation.errors.join(', ')}`);
    }

    // Get detailed scoring breakdown
    const detailedScoring = this.scoringEngine.getDetailedScoring(responses);
    const rawScores = detailedScoring.totalScores;

    // Apply business rules
    const ruleAdjustedResults = this.ruleEngine.applyRules(rawScores, detailedScoring.recommendation.scores);

    // Calculate confidence score
    const confidenceScore = this.calculateConfidenceScore(ruleAdjustedResults, responses.length);

    // Generate reasoning
    const reasoning = this.generateReasoning(detailedScoring.questionBreakdown, ruleAdjustedResults[0]);

    // Generate alternatives
    const alternatives = this.generateAlternatives(ruleAdjustedResults);

    return {
      recommendation: ruleAdjustedResults[0].architecture,
      confidenceScore,
      reasoning,
      alternatives
    };
  }

  /**
   * Calculate confidence score based on score distribution and response completeness
   */
  private calculateConfidenceScore(results: ScoringResult[], totalQuestions: number): number {
    if (results.length === 0) return 0;

    const topScore = results[0].score;
    const totalScore = results.reduce((sum, result) => sum + result.score, 0);

    if (totalScore === 0) return 0;

    // Base confidence from score separation (how much better the top choice is)
    const scoreSeparation = topScore / totalScore;
    let confidence = scoreSeparation * 100;

    // Adjust for number of questions answered (more questions = higher confidence)
    const questionFactor = Math.min(totalQuestions / 6, 1); // Normalize to 6 questions as baseline
    confidence *= questionFactor;

    // Adjust for score distribution (more even distribution = lower confidence)
    const scoreVariance = this.calculateVariance(results.map(r => r.score));
    const varianceFactor = Math.max(0, 1 - (scoreVariance / (totalScore * totalScore)));
    confidence *= varianceFactor;

    return Math.round(Math.min(confidence, 100));
  }

  /**
   * Calculate variance of an array of numbers
   */
  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
    const squaredDifferences = numbers.map(num => Math.pow(num - mean, 2));
    return squaredDifferences.reduce((sum, diff) => sum + diff, 0) / numbers.length;
  }

  /**
   * Generate detailed reasoning based on question responses and top recommendation
   */
  private generateReasoning(
    questionBreakdown: Array<{
      questionId: string;
      questionText: string;
      selectedAnswer: string;
      scores: Partial<ArchitectureScores>;
    }>,
    topResult: ScoringResult
  ): string[] {
    const reasoning: string[] = [];
    const architecture = topResult.architecture;

    // Add primary reasoning based on key questions
    const keyInsights = this.extractKeyInsights(questionBreakdown, architecture);
    reasoning.push(...keyInsights);

    // Add architecture-specific reasoning
    const architectureReasoning = this.getArchitectureReasoning(architecture, questionBreakdown);
    reasoning.push(...architectureReasoning);

    // Add cost and operational considerations
    const costReasoning = this.getCostReasoning(architecture, questionBreakdown);
    if (costReasoning) {
      reasoning.push(costReasoning);
    }

    return reasoning;
  }

  /**
   * Extract key insights from question responses
   */
  private extractKeyInsights(
    questionBreakdown: Array<{
      questionId: string;
      questionText: string;
      selectedAnswer: string;
      scores: Partial<ArchitectureScores>;
    }>,
    architecture: ArchitectureType
  ): string[] {
    const insights: string[] = [];

    questionBreakdown.forEach(breakdown => {
      const score = breakdown.scores[architecture] || 0;
      if (score >= 2) { // Only include significant contributors
        insights.push(`${breakdown.questionText}: "${breakdown.selectedAnswer}" strongly supports ${architecture}`);
      }
    });

    return insights.slice(0, 3); // Limit to top 3 insights
  }

  /**
   * Get architecture-specific reasoning
   */
  private getArchitectureReasoning(architecture: ArchitectureType, questionBreakdown: any[]): string[] {
    const reasoning: string[] = [];

    switch (architecture) {
      case 'Kubernetes':
        reasoning.push('Kubernetes is ideal for complex, containerized applications requiring advanced orchestration and scaling capabilities.');
        if (this.hasHighComplexityAnswers(questionBreakdown)) {
          reasoning.push('Your responses indicate a need for sophisticated container management and service orchestration.');
        }
        break;

      case 'Azure App Services':
        reasoning.push('Azure App Services provides a fully managed platform perfect for web applications and APIs with minimal operational overhead.');
        if (this.hasSimpleAppAnswers(questionBreakdown)) {
          reasoning.push('Your application characteristics align well with the simplicity and rapid deployment of App Services.');
        }
        break;

      case 'Azure Container Apps':
        reasoning.push('Azure Container Apps offers serverless container execution without the complexity of managing Kubernetes infrastructure.');
        if (this.hasContainerPreference(questionBreakdown)) {
          reasoning.push('Your preference for containers combined with desire for managed services makes Container Apps an excellent fit.');
        }
        break;

      case 'Serverless':
        reasoning.push('Serverless computing minimizes infrastructure management while optimizing costs for variable workloads.');
        if (this.hasVariableTrafficAnswers(questionBreakdown)) {
          reasoning.push('Your variable traffic patterns and cost sensitivity make serverless an efficient choice.');
        }
        break;

      case 'Virtual Machines':
        reasoning.push('Virtual Machines provide full control over your infrastructure, ideal for legacy applications or custom requirements.');
        if (this.hasFullControlAnswers(questionBreakdown)) {
          reasoning.push('Your need for complete infrastructure control and flexibility aligns with traditional VM deployments.');
        }
        break;
    }

    return reasoning;
  }

  /**
   * Get cost-related reasoning
   */
  private getCostReasoning(architecture: ArchitectureType, questionBreakdown: any[]): string | null {
    const costTier = costRules.getCostTier(architecture);
    const efficiency = costRules.getCostEfficiency(architecture);

    if (this.hasCostSensitivity(questionBreakdown)) {
      return `${architecture} offers ${costTier.toLowerCase()} operational costs with ${efficiency}/10 cost efficiency, matching your cost-conscious requirements.`;
    }

    return null;
  }

  /**
   * Generate alternative recommendations with reasoning
   */
  private generateAlternatives(results: ScoringResult[]): Array<{
    architecture: ArchitectureType;
    score: number;
    percentage: number;
    reasons: string[];
  }> {
    // Return top 2-3 alternatives (excluding the primary recommendation)
    return results.slice(1, 4).map(result => ({
      architecture: result.architecture,
      score: result.score,
      percentage: result.percentage,
      reasons: this.getAlternativeReasons(result.architecture, results[0].architecture)
    }));
  }

  /**
   * Get reasons why an alternative might be considered
   */
  private getAlternativeReasons(alternative: ArchitectureType, primary: ArchitectureType): string[] {
    const reasons: string[] = [];

    // Compare cost tiers
    const altCostTier = costRules.getCostTier(alternative);
    const primaryCostTier = costRules.getCostTier(primary);

    if (altCostTier !== primaryCostTier) {
      reasons.push(`${alternative} offers ${altCostTier.toLowerCase()} costs compared to ${primaryCostTier.toLowerCase()} costs of ${primary}`);
    }

    // Compare operational complexity
    const complexityComparison = this.getComplexityComparison(alternative, primary);
    if (complexityComparison) {
      reasons.push(complexityComparison);
    }

    // Add specific use case advantages
    const useCaseAdvantages = this.getUseCaseAdvantages(alternative);
    reasons.push(...useCaseAdvantages);

    return reasons;
  }

  /**
   * Compare operational complexity between architectures
   */
  private getComplexityComparison(alt: ArchitectureType, primary: ArchitectureType): string | null {
    const complexityLevels: Record<ArchitectureType, number> = {
      'Virtual Machines': 5, // Most complex to manage
      Kubernetes: 4,
      'Azure Container Apps': 2,
      'Azure App Services': 1,
      Serverless: 1 // Least complex
    };

    const altComplexity = complexityLevels[alt];
    const primaryComplexity = complexityLevels[primary];

    if (altComplexity < primaryComplexity) {
      return `${alt} requires less operational overhead than ${primary}`;
    } else if (altComplexity > primaryComplexity) {
      return `${alt} provides more control but requires more management than ${primary}`;
    }

    return null;
  }

  /**
   * Get specific use case advantages for an architecture
   */
  private getUseCaseAdvantages(architecture: ArchitectureType): string[] {
    const advantages: Record<ArchitectureType, string[]> = {
      Kubernetes: [
        'Best for complex microservices architectures',
        'Excellent for applications requiring advanced scaling policies'
      ],
      'Azure App Services': [
        'Ideal for traditional web applications and APIs',
        'Fastest time-to-market for simple applications'
      ],
      'Azure Container Apps': [
        'Perfect bridge between containers and serverless',
        'Great for event-driven containerized applications'
      ],
      Serverless: [
        'Optimal for variable or unpredictable workloads',
        'Best cost efficiency for sporadic usage'
      ],
      'Virtual Machines': [
        'Full control over infrastructure and software stack',
        'Best for legacy applications requiring specific configurations'
      ]
    };

    return advantages[architecture] || [];
  }

  // Helper methods for analyzing question patterns
  private hasHighComplexityAnswers(questionBreakdown: any[]): boolean {
    return questionBreakdown.some(q =>
      q.questionId === 'app-complexity' &&
      (q.selectedAnswer.includes('complex') || q.selectedAnswer.includes('microservices'))
    );
  }

  private hasSimpleAppAnswers(questionBreakdown: any[]): boolean {
    return questionBreakdown.some(q =>
      q.questionId === 'app-complexity' &&
      q.selectedAnswer.includes('simple')
    );
  }

  private hasContainerPreference(questionBreakdown: any[]): boolean {
    return questionBreakdown.some(q =>
      q.questionId === 'container-usage' &&
      q.selectedAnswer.includes('containers')
    );
  }

  private hasVariableTrafficAnswers(questionBreakdown: any[]): boolean {
    return questionBreakdown.some(q =>
      q.questionId === 'scaling-needs' &&
      q.selectedAnswer.includes('variable')
    );
  }

  private hasFullControlAnswers(questionBreakdown: any[]): boolean {
    return questionBreakdown.some(q =>
      q.questionId === 'operational-overhead' &&
      q.selectedAnswer.includes('control')
    );
  }

  private hasCostSensitivity(questionBreakdown: any[]): boolean {
    return questionBreakdown.some(q =>
      q.questionId === 'cost-sensitivity' &&
      q.selectedAnswer.includes('cost-sensitive')
    );
  }
}

/**
 * Factory function to create a recommendation engine with default questions
 */
export function createRecommendationEngine() {
  return new RecommendationEngine(sampleQuestions);
}