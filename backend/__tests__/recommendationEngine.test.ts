import { RecommendationEngine } from '../engine/recommendationEngine';
import { sampleQuestions } from '../../shared/questions';
import { QuestionnaireResponse } from '../../shared/types';

describe('RecommendationEngine', () => {
  test('produces a recommendation and includes confidence and reasoning', () => {
    // Build a full set of responses by selecting the first option for each question
    const responses: QuestionnaireResponse[] = sampleQuestions.map(q => ({
      questionId: q.id,
      selectedAnswerId: q.options[0].id
    }));

    const engine = new RecommendationEngine(sampleQuestions);
    const output = engine.generateRecommendation(responses);

    expect(output.recommendation).toBeDefined();
    expect(typeof output.confidenceScore).toBe('number');
    expect(Array.isArray(output.reasoning)).toBe(true);
    expect(Array.isArray(output.alternatives)).toBe(true);
  });
});
