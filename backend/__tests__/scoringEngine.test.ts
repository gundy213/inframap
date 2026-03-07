import { ScoringEngine } from '../engine/scoringEngine';
import { sampleQuestions } from '../../shared/questions';
import { QuestionnaireResponse } from '../../shared/types';

describe('ScoringEngine', () => {
  test('generates AWS Lambda as top recommendation for serverless-heavy responses', () => {
    const responses: QuestionnaireResponse[] = [
      { questionId: 'scaling-needs', selectedAnswerId: 'variable-traffic' },
      { questionId: 'operational-overhead', selectedAnswerId: 'minimal-ops' },
      { questionId: 'cost-sensitivity', selectedAnswerId: 'cost-critical' },
      { questionId: 'team-expertise', selectedAnswerId: 'dev-focused' },
      { questionId: 'provider-preference', selectedAnswerId: 'prefer-aws' }
    ];

    const engine = new ScoringEngine(sampleQuestions);
    const recommendation = engine.generateRecommendation(responses);
    expect(recommendation.topRecommendation).toBe('AWS Lambda');
  });
});
