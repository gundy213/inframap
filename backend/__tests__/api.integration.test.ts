import request from 'supertest';
import app from '../server';
import { sampleQuestions } from '../../shared/questions';
import { QuestionnaireResponse } from '../../shared/types';

describe('API Integration - /api/recommend', () => {
  test('returns recommendation payload for full questionnaire', async () => {
    const responses: QuestionnaireResponse[] = sampleQuestions.map(q => ({
      questionId: q.id,
      selectedAnswerId: q.options[0].id
    }));

    const res = await request(app)
      .post('/api/recommend')
      .send({ responses })
      .set('Accept', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('recommendation');
    expect(res.body).toHaveProperty('confidenceScore');
    expect(res.body).toHaveProperty('reasoning');
    expect(Array.isArray(res.body.reasoning)).toBe(true);
    expect(res.body).toHaveProperty('alternatives');
    expect(Array.isArray(res.body.alternatives)).toBe(true);
  });

  test('returns 400 for invalid payload', async () => {
    const res = await request(app)
      .post('/api/recommend')
      .send({ responses: [] })
      .set('Accept', 'application/json');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
