import { ArchitectureType, ArchitectureScores, ScoringResult } from '../../shared/types';

/**
 * Business Rules for Infrastructure Recommendations
 *
 * This module contains rules that apply business logic to scoring results,
 * such as minimum thresholds, tie-breaking, and special conditions.
 */

export interface RecommendationRule {
  id: string;
  name: string;
  description: string;
  condition: (scores: ArchitectureScores) => boolean;
  action: (results: ScoringResult[]) => ScoringResult[];
  priority: number; // Higher priority rules are applied first
}

/**
 * Predefined rules for infrastructure recommendations
 */
export const recommendationRules: RecommendationRule[] = [
  {
    id: 'minimum-score-threshold',
    name: 'Minimum Score Threshold',
    description: 'Ensure all architectures have at least a minimum score for consideration',
    condition: (scores) => {
      const minScore = Math.min(...Object.values(scores));
      return minScore < 5; // If any architecture has less than 5 points total
    },
    action: (results) => {
      // Boost architectures with very low scores to ensure they're still considered
      return results.map(result => ({
        ...result,
        score: result.score < 2 ? result.score + 1 : result.score
      }));
    },
    priority: 1
  },
  {
    id: 'kubernetes-complexity-bonus',
    name: 'Kubernetes Complexity Bonus',
    description: 'Apply bonus for Kubernetes when multiple high-complexity indicators are present',
    condition: (scores) => {
      // This would be checked based on specific question responses in a real implementation
      return scores.Kubernetes > scores['Azure Container Apps'] + 3;
    },
    action: (results) => {
      const kubernetesResult = results.find(r => r.architecture === 'Kubernetes');
      if (kubernetesResult) {
        kubernetesResult.score += 1; // Small bonus for complexity handling
      }
      return results;
    },
    priority: 2
  },
  {
    id: 'serverless-cost-efficiency',
    name: 'Serverless Cost Efficiency',
    description: 'Boost serverless when cost sensitivity is high and traffic is variable',
    condition: (scores) => {
      return scores.Serverless > scores['Azure App Services'] + 2;
    },
    action: (results) => {
      const serverlessResult = results.find(r => r.architecture === 'Serverless');
      if (serverlessResult) {
        serverlessResult.score += 0.5; // Fractional bonus for cost efficiency
      }
      return results;
    },
    priority: 3
  }
];

/**
 * Rule Engine for applying business logic to recommendations
 */
export class RuleEngine {
  private rules: RecommendationRule[];

  constructor(rules: RecommendationRule[] = recommendationRules) {
    // Sort rules by priority (highest first)
    this.rules = rules.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Apply all applicable rules to scoring results
   */
  applyRules(scores: ArchitectureScores, results: ScoringResult[]): ScoringResult[] {
    let modifiedResults = [...results];

    for (const rule of this.rules) {
      if (rule.condition(scores)) {
        modifiedResults = rule.action(modifiedResults);
        // Re-sort after applying rule
        modifiedResults.sort((a, b) => b.score - a.score);
      }
    }

    return modifiedResults;
  }

  /**
   * Get active rules for given scores (for debugging/analysis)
   */
  getActiveRules(scores: ArchitectureScores): RecommendationRule[] {
    return this.rules.filter(rule => rule.condition(scores));
  }
}

/**
 * Architecture Compatibility Rules
 */
export const compatibilityRules = {
  /**
   * Check if an architecture is suitable for certain use cases
   */
  isSuitableFor: (architecture: ArchitectureType, useCase: string): boolean => {
    const suitabilityMap: Record<string, ArchitectureType[]> = {
      'high-traffic-web-app': ['Kubernetes', 'Azure Container Apps', 'Azure App Services'],
      'microservices': ['Kubernetes', 'Azure Container Apps'],
      'api-backend': ['Azure App Services', 'Serverless', 'Azure Container Apps'],
      'event-driven': ['Serverless', 'Azure Container Apps'],
      'legacy-app': ['Virtual Machines', 'Azure App Services'],
      'data-processing': ['Kubernetes', 'Virtual Machines', 'Azure Container Apps'],
      'real-time-processing': ['Kubernetes', 'Azure Container Apps'],
      'static-website': ['Azure App Services', 'Serverless']
    };

    return suitabilityMap[useCase]?.includes(architecture) ?? true;
  },

  /**
   * Get recommended architectures for a specific use case
   */
  getRecommendationsForUseCase: (useCase: string): ArchitectureType[] => {
    return compatibilityRules.isSuitableFor('Kubernetes', useCase) ?
      ['Kubernetes', 'Azure Container Apps', 'Azure App Services', 'Serverless', 'Virtual Machines'] :
      [];
  }
};

/**
 * Cost Estimation Rules (simplified)
 */
export const costRules = {
  /**
   * Estimate relative cost tier for each architecture
   */
  getCostTier: (architecture: ArchitectureType): 'Low' | 'Medium' | 'High' => {
    const costTiers: Record<ArchitectureType, 'Low' | 'Medium' | 'High'> = {
      Serverless: 'Low',
      'Azure App Services': 'Low',
      'Azure Container Apps': 'Medium',
      'Virtual Machines': 'High',
      Kubernetes: 'High'
    };

    return costTiers[architecture];
  },

  /**
   * Get cost efficiency score (higher is better)
   */
  getCostEfficiency: (architecture: ArchitectureType): number => {
    const efficiencyScores: Record<ArchitectureType, number> = {
      Serverless: 9,
      'Azure App Services': 8,
      'Azure Container Apps': 7,
      Kubernetes: 5,
      'Virtual Machines': 4
    };

    return efficiencyScores[architecture];
  }
};
