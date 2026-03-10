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
    const ruleAdjustedRaw = this.ruleEngine.applyRules(rawScores, detailedScoring.recommendation.scores);

    // Recalculate percentages as absolute match scores (score vs strong-fit benchmark)
    const strongFitBenchmark = responses.length * 3;
    const ruleAdjustedResults = ruleAdjustedRaw.map(r => ({
      ...r,
      percentage: strongFitBenchmark > 0
        ? Math.min(100, Math.max(0, Math.round((r.score / strongFitBenchmark) * 100)))
        : 0
    }));

    // Compute consistency: fraction of questions where the winner scored highest
    const topArch = ruleAdjustedResults[0].architecture;
    const consistencyFactor = detailedScoring.questionBreakdown.length > 0
      ? (detailedScoring.questionBreakdown.filter(q => {
          const values = Object.values(q.scores) as number[];
          const maxForQuestion = values.length > 0 ? Math.max(...values) : 0;
          return maxForQuestion > 0 && (q.scores[topArch as ArchitectureType] ?? 0) >= maxForQuestion;
        }).length / detailedScoring.questionBreakdown.length) * 100
      : 50;

    // Calculate confidence score
    const confidenceScore = this.calculateConfidenceScore(ruleAdjustedResults, responses.length, consistencyFactor);
    const confidenceLevel = this.getConfidenceLevel(confidenceScore);

    // Generate reasoning
    const reasoning = this.generateReasoning(detailedScoring.questionBreakdown, ruleAdjustedResults[0]);

    // Generate alternatives
    const alternatives = this.generateAlternatives(ruleAdjustedResults);

    return {
      recommendation: ruleAdjustedResults[0].architecture,
      topMatchPercentage: ruleAdjustedResults[0].percentage,
      confidenceScore,
      confidenceLevel,
      reasoning,
      alternatives
    };
  }

  /**
   * Calculate confidence score based on score distribution and response completeness
   * Uses a weighted average approach instead of multiplication for higher, more meaningful scores
   */
  private calculateConfidenceScore(results: ScoringResult[], totalQuestions: number, consistencyFactor: number = 50): number {
    if (results.length === 0) return 0;

    const topScore = results[0].score;
    const secondScore = results.length > 1 ? results[1].score : 0;

    // If the top score is zero or negative there's no meaningful recommendation
    if (topScore <= 0) return 35;

    // 1. Absolute strength: top score vs a "very good fit" benchmark of 3 pts/question (30% weight)
    const goodBenchmark = totalQuestions * 3;
    const absoluteStrength = Math.min((topScore / goodBenchmark) * 100, 100);

    // 2. Score dominance: gap to runner-up, 2x-amplified so small gaps register clearly (40% weight)
    const scoreDominance = secondScore < topScore
      ? Math.min(((topScore - secondScore) / topScore) * 200, 100)
      : 0;

    // 3. Answer consistency: % of questions that "voted" for the winner (20% weight)
    const consistency = Math.min(consistencyFactor, 100);

    // 4. Question completeness (10% weight)
    const questionFactor = Math.min((totalQuestions / 10) * 100, 100);

    let confidence =
      (absoluteStrength * 0.30) +
      (scoreDominance * 0.40) +
      (consistency * 0.20) +
      (questionFactor * 0.10);

    // Lower floor (35) so weak signals produce genuine "Low" ratings
    confidence = Math.max(confidence, 35);
    confidence = Math.min(confidence, 100);

    return Math.round(confidence);
  }

  /**
   * Convert confidence score to confidence level
   */
  private getConfidenceLevel(confidenceScore: number): 'Low' | 'Medium' | 'High' {
    if (confidenceScore >= 65) {
      return 'High';
    } else if (confidenceScore >= 48) {
      return 'Medium';
    } else {
      return 'Low';
    }
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
      case 'Azure AKS':
        reasoning.push('Azure AKS is ideal for complex, containerized applications requiring advanced orchestration and scaling capabilities.');
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

      case 'AWS EC2':
        reasoning.push('AWS EC2 gives you raw virtual machine instances with full control over compute and networking on AWS.');
        if (this.hasFullControlAnswers(questionBreakdown)) {
          reasoning.push('Your requirement for custom OS-level configuration and persistent compute matches EC2 well.');
        }
        break;

      case 'AWS Lambda':
        reasoning.push('AWS Lambda is a serverless compute option ideal for short-lived, event-driven workloads on AWS.');
        if (this.hasVariableTrafficAnswers(questionBreakdown)) {
          reasoning.push('Your variable traffic patterns and cost sensitivity suggest Lambda could reduce operational costs.');
        }
        break;

      case 'AWS ECS/Fargate':
        reasoning.push('AWS ECS with Fargate provides container execution without managing servers, integrating well with AWS services.');
        if (this.hasContainerPreference(questionBreakdown)) {
          reasoning.push('Containers with minimal ops overhead align well with ECS/Fargate.');
        }
        break;

      case 'AWS Elastic Beanstalk':
        reasoning.push('Elastic Beanstalk is a managed platform for deploying web apps with minimal infrastructure management on AWS.');
        if (this.hasSimpleAppAnswers(questionBreakdown)) {
          reasoning.push('This matches simple web app deployments where rapid time-to-market matters.');
        }
        break;

      case 'AWS EKS':
        reasoning.push('AWS EKS is managed Kubernetes on AWS for advanced orchestration and scaling needs.');
        if (this.hasHighComplexityAnswers(questionBreakdown)) {
          reasoning.push('Complex microservices and advanced operational requirements make EKS a strong candidate.');
        }
        break;

      case 'GCP Compute Engine':
        reasoning.push('GCP Compute Engine provides virtual machines with full customization and control on GCP.');
        if (this.hasFullControlAnswers(questionBreakdown)) {
          reasoning.push('Your need for VM-level control and legacy support aligns with Compute Engine.');
        }
        break;

      case 'GCP Cloud Functions':
        reasoning.push('GCP Cloud Functions are event-driven serverless functions suitable for lightweight integrations and automation.');
        if (this.hasVariableTrafficAnswers(questionBreakdown)) {
          reasoning.push('Functions can be cost-effective for sporadic workloads and event-driven flows.');
        }
        break;

      case 'GCP Cloud Run':
        reasoning.push('GCP Cloud Run runs stateless containers with serverless scaling on GCP.');
        if (this.hasContainerPreference(questionBreakdown)) {
          reasoning.push('Stateless containers and pay-per-use scaling fit Cloud Run well.');
        }
        break;

      case 'GCP App Engine':
        reasoning.push('GCP App Engine is a fully managed platform for web apps with minimal operational overhead on GCP.');
        if (this.hasSimpleAppAnswers(questionBreakdown)) {
          reasoning.push('App Engine suits opinionated web apps where rapid deployment is desired.');
        }
        break;

      case 'GCP GKE':
        reasoning.push('GCP GKE is managed Kubernetes for container orchestration and scaling on GCP.');
        if (this.hasHighComplexityAnswers(questionBreakdown)) {
          reasoning.push('GKE is appropriate when you need advanced orchestration paired with GCP services.');
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
    pros: string[];
    cons: string[];
    complexity: 'Low' | 'Medium' | 'High';
    estimatedCost: string;
  }> {
    // Return next best 3 alternatives (excluding the primary recommendation)
    return results.slice(1, 4).map(result => ({
      architecture: result.architecture,
      score: result.score,
      percentage: result.percentage,
      reasons: this.getAlternativeReasons(result.architecture, results[0].architecture),
      pros: this.getArchitecturePros(result.architecture),
      cons: this.getArchitectureCons(result.architecture),
      complexity: this.getArchitectureComplexity(result.architecture),
      estimatedCost: this.getEstimatedCost(result.architecture)
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
      'Virtual Machines': 5,
      'Azure AKS': 4,
      'Azure Container Apps': 2,
      'Azure App Services': 1,
      Serverless: 1,
      'AWS Elastic Beanstalk': 1,
      'AWS ECS/Fargate': 2,
      'AWS Lambda': 1,
      'AWS EC2': 5,
      'AWS EKS': 4,
      'GCP App Engine': 1,
      'GCP Cloud Run': 2,
      'GCP Cloud Functions': 1,
      'GCP Compute Engine': 5,
      'GCP GKE': 4
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
      'Azure AKS': [
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
      ,
      'AWS Elastic Beanstalk': [
        'Managed platform for quick deployments on AWS',
        'Good for teams that want minimal infrastructure management on AWS'
      ],
      'AWS ECS/Fargate': [
        'Serverless containers with tight AWS integration',
        'Good balance between control and operational simplicity'
      ],
      'AWS Lambda': [
        'Excellent for event-driven workloads and integrations with AWS services',
        'High cost efficiency for sporadic or bursty workloads'
      ],
      'AWS EC2': [
        'Raw virtual machines for total control and customization',
        'Suitable for legacy or specialized workloads needing OS-level access'
      ],
      'AWS EKS': [
        'Managed Kubernetes on AWS with deep ecosystem integrations',
        'Best when you need Kubernetes features and AWS services together'
      ],
      'GCP App Engine': [
        'Fully managed platform for rapid application deployment on GCP',
        'Great for opinionated web apps with minimal ops overhead'
      ],
      'GCP Cloud Run': [
        'Serverless containers with automatic scaling on GCP',
        'Good for stateless container workloads with pay-per-use billing'
      ],
      'GCP Cloud Functions': [
        'Event-driven serverless functions integrated with GCP services',
        'Excellent for lightweight integrations and automation'
      ],
      'GCP Compute Engine': [
        'Virtual machines with full control over machines on GCP',
        'Best for custom infrastructure and legacy migrations'
      ],
      'GCP GKE': [
        'Managed Kubernetes with strong networking and GCP integrations',
        'Ideal for containerized microservices at scale on GCP'
      ]
    };

    return advantages[architecture] || [];
  }

  /**
   * Get pros for each architecture
   */
  private getArchitecturePros(architecture: ArchitectureType): string[] {
    const pros: Record<ArchitectureType, string[]> = {
      'Azure AKS': [
        'Excellent scalability and orchestration',
        'Vendor-neutral and highly flexible',
        'Strong community and ecosystem',
        'Advanced deployment strategies'
      ],
      'Azure App Services': [
        'Fully managed platform',
        'Quick deployment and scaling',
        'Built-in CI/CD integration',
        'Strong Azure ecosystem integration'
      ],
      'Azure Container Apps': [
        'Serverless container experience',
        'Event-driven scaling',
        'Dapr integration for microservices',
        'Managed infrastructure'
      ],
      Serverless: [
        'Pay only for execution time',
        'Automatic scaling',
        'No infrastructure management',
        'Fast development cycles'
      ],
      'Virtual Machines': [
        'Full control over infrastructure',
        'Support for legacy applications',
        'Custom configurations possible',
        'Predictable performance'
      ],
      'AWS Elastic Beanstalk': [
        'Managed application platform',
        'Multi-language support',
        'Easy deployment and scaling',
        'AWS service integration'
      ],
      'AWS ECS/Fargate': [
        'Serverless container orchestration',
        'Deep AWS integration',
        'Cost-effective for container workloads',
        'Managed scaling and patching'
      ],
      'AWS Lambda': [
        'True serverless computing',
        'Sub-second billing',
        'Massive concurrency support',
        'Rich AWS service integrations'
      ],
      'AWS EC2': [
        'Complete infrastructure control',
        'Wide instance type selection',
        'Custom AMIs and configurations',
        'Reserved instance discounts'
      ],
      'AWS EKS': [
        'Managed Kubernetes on AWS',
        'Strong AWS service integration',
        'Enterprise-grade security',
        'Extensive partner ecosystem'
      ],
      'GCP App Engine': [
        'Fully managed application platform',
        'Automatic scaling and patching',
        'Strong GCP service integration',
        'Traffic splitting for testing'
      ],
      'GCP Cloud Run': [
        'Serverless containers',
        'Any language/framework support',
        'Automatic HTTPS and scaling',
        'GCP service mesh integration'
      ],
      'GCP Cloud Functions': [
        'Event-driven serverless functions',
        'Sub-second cold starts',
        'GCP service integrations',
        'Pay-per-invocation pricing'
      ],
      'GCP Compute Engine': [
        'Full VM control on GCP',
        'Custom machine types',
        'Preemptible instances for cost savings',
        'Global load balancing'
      ],
      'GCP GKE': [
        'Managed Kubernetes on GCP',
        'Advanced networking features',
        'Multi-cluster support',
        'Integrated monitoring and logging'
      ]
    };

    return pros[architecture] || [];
  }

  /**
   * Get cons for each architecture
   */
  private getArchitectureCons(architecture: ArchitectureType): string[] {
    const cons: Record<ArchitectureType, string[]> = {
      'Azure AKS': [
        'Steep learning curve',
        'Complex operational overhead',
        'Higher management costs',
        'Requires specialized skills'
      ],
      'Azure App Services': [
        'Limited customization options',
        'Vendor lock-in to Azure',
        'Scaling limitations for very large apps',
        'Less control over underlying infrastructure'
      ],
      'Azure Container Apps': [
        'Newer service with evolving features',
        'Limited to Azure ecosystem',
        'May have cold start issues',
        'Less mature than alternatives'
      ],
      Serverless: [
        'Cold start latency',
        'Limited execution time',
        'Vendor-specific runtimes',
        'Debugging complexity'
      ],
      'Virtual Machines': [
        'High management overhead',
        'Manual scaling required',
        'Security patching responsibility',
        'Higher operational costs'
      ],
      'AWS Elastic Beanstalk': [
        'Limited to supported platforms',
        'Less flexible than custom deployments',
        'AWS vendor lock-in',
        'May require workarounds for complex setups'
      ],
      'AWS ECS/Fargate': [
        'AWS-specific container orchestration',
        'Learning curve for ECS concepts',
        'May be overkill for simple applications',
        'Vendor lock-in concerns'
      ],
      'AWS Lambda': [
        'Limited to supported runtimes',
        'Cold start performance issues',
        'Complex debugging and monitoring',
        'Vendor lock-in to AWS'
      ],
      'AWS EC2': [
        'Manual management required',
        'Security responsibility',
        'Scaling complexity',
        'Higher operational costs'
      ],
      'AWS EKS': [
        'Complex Kubernetes management',
        'AWS-specific features and limitations',
        'Higher operational overhead',
        'Requires Kubernetes expertise'
      ],
      'GCP App Engine': [
        'Limited to supported runtimes',
        'Less control over infrastructure',
        'May not support all application types',
        'GCP vendor lock-in'
      ],
      'GCP Cloud Run': [
        'Limited to containerized workloads',
        'Cold start considerations',
        'May require container expertise',
        'GCP ecosystem dependency'
      ],
      'GCP Cloud Functions': [
        'Limited execution time',
        'Cold start latency',
        'Debugging challenges',
        'GCP vendor lock-in'
      ],
      'GCP Compute Engine': [
        'Manual management overhead',
        'Security patching responsibility',
        'Scaling complexity',
        'Higher operational costs'
      ],
      'GCP GKE': [
        'Kubernetes complexity',
        'Operational overhead',
        'Requires specialized skills',
        'Management costs'
      ]
    };

    return cons[architecture] || [];
  }

  /**
   * Get complexity level for each architecture
   */
  private getArchitectureComplexity(architecture: ArchitectureType): 'Low' | 'Medium' | 'High' {
    const complexityLevels: Record<ArchitectureType, 'Low' | 'Medium' | 'High'> = {
      'Azure App Services': 'Low',
      'AWS Elastic Beanstalk': 'Low',
      'GCP App Engine': 'Low',
      Serverless: 'Low',
      'AWS Lambda': 'Low',
      'GCP Cloud Functions': 'Low',
      'Azure Container Apps': 'Medium',
      'AWS ECS/Fargate': 'Medium',
      'GCP Cloud Run': 'Medium',
      'Virtual Machines': 'High',
      'AWS EC2': 'High',
      'GCP Compute Engine': 'High',
      'Azure AKS': 'High',
      'AWS EKS': 'High',
      'GCP GKE': 'High'
    };

    return complexityLevels[architecture] || 'Medium';
  }

  /**
   * Get estimated cost range for each architecture
   */
  private getEstimatedCost(architecture: ArchitectureType): string {
    const costRanges: Record<ArchitectureType, string> = {
      'Azure App Services': '$50-500/month',
      'AWS Elastic Beanstalk': '$50-500/month',
      'GCP App Engine': '$50-500/month',
      Serverless: '$10-200/month',
      'AWS Lambda': '$10-200/month',
      'GCP Cloud Functions': '$10-200/month',
      'Azure Container Apps': '$100-800/month',
      'AWS ECS/Fargate': '$100-800/month',
      'GCP Cloud Run': '$100-800/month',
      'Virtual Machines': '$200-2000+/month',
      'AWS EC2': '$200-2000+/month',
      'GCP Compute Engine': '$200-2000+/month',
      'Azure AKS': '$500-5000+/month',
      'AWS EKS': '$500-5000+/month',
      'GCP GKE': '$500-5000+/month'
    };

    return costRanges[architecture] || '$100-1000/month';
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