// Minimal declarations for Node globals to appease TypeScript when @types/node isn't installed
declare const console: any;
declare const require: any;
declare const module: any;

import { RecommendationEngine } from './recommendationEngine';
import { sampleQuestions } from '../../shared/questions';
import { sampleResponseSets } from './examples';

/**
 * Basic tests for the Recommendation Engine
 */

function testRecommendationEngine() {
  console.log('Testing Recommendation Engine...\n');

  const engine = new RecommendationEngine(sampleQuestions);

  // Test 1: Kubernetes scenario
  console.log('Test 1: Kubernetes-favoring responses');
  try {
    const result = engine.generateRecommendation(sampleResponseSets.kubernetes);

    console.log(`Recommendation: ${result.recommendation}`);
    console.log(`Confidence Score: ${result.confidenceScore}%`);
    console.log(`Reasoning (${result.reasoning.length} points):`);
    result.reasoning.forEach((reason, index) => {
      console.log(`  ${index + 1}. ${reason}`);
    });
    console.log(`Alternatives (${result.alternatives.length}):`);
    result.alternatives.forEach((alt, index) => {
      console.log(`  ${index + 1}. ${alt.architecture} (${alt.percentage}%) - ${alt.reasons[0]}`);
    });

    // Basic validation
    if (result.recommendation !== 'Azure AKS') {
      console.log('❌ Expected Azure AKS as top recommendation');
    } else {
      console.log('✅ Correctly recommended Azure AKS');
    }

    if (result.confidenceScore < 0 || result.confidenceScore > 100) {
      console.log('❌ Confidence score out of range');
    } else {
      console.log('✅ Confidence score is valid');
    }

  } catch (error) {
    console.log('❌ Test 1 failed:', error);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: Serverless scenario
  console.log('Test 2: Serverless-favoring responses');
  try {
    const result = engine.generateRecommendation(sampleResponseSets.serverless);

    console.log(`Recommendation: ${result.recommendation}`);
    console.log(`Confidence Score: ${result.confidenceScore}%`);
    console.log(`Reasoning (${result.reasoning.length} points):`);
    result.reasoning.forEach((reason, index) => {
      console.log(`  ${index + 1}. ${reason}`);
    });
    console.log(`Alternatives (${result.alternatives.length}):`);
    result.alternatives.forEach((alt, index) => {
      console.log(`  ${index + 1}. ${alt.architecture} (${alt.percentage}%) - ${alt.reasons[0]}`);
    });

    // Basic validation
    if (result.recommendation !== 'Serverless') {
      console.log('❌ Expected Serverless as top recommendation');
    } else {
      console.log('✅ Correctly recommended Serverless');
    }

    if (result.confidenceScore < 0 || result.confidenceScore > 100) {
      console.log('❌ Confidence score out of range');
    } else {
      console.log('✅ Confidence score is valid');
    }

  } catch (error) {
    console.log('❌ Test 2 failed:', error);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 3: Invalid responses
  console.log('Test 3: Invalid responses handling');
  try {
    const invalidResponses = [
      { questionId: 'invalid-question', selectedAnswerId: 'invalid-answer' }
    ];
    engine.generateRecommendation(invalidResponses);
    console.log('❌ Should have thrown an error for invalid responses');
  } catch (error) {
    console.log('✅ Correctly handled invalid responses:', (error as Error).message);
  }

  console.log('\nRecommendation Engine tests completed.');
}

// Run tests if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  testRecommendationEngine();
}

export { testRecommendationEngine };