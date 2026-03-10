import React, { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import { ProgressBar } from '../components/ProgressBar';
import { QuestionCard, Question } from '../components/QuestionCard';

// Sample questions - in a real app, these would come from an API or shared module
const sampleQuestions: Question[] = [
  {
    id: 'app-complexity',
    text: 'How complex is your application?',
    type: 'multiple-choice',
    category: 'Application Characteristics',
    options: [
      {
        id: 'simple-web',
        text: 'Simple web application or API'
      },
      {
        id: 'moderate-microservices',
        text: 'Moderate complexity with some microservices'
      },
      {
        id: 'complex-distributed',
        text: 'Complex distributed system with many services'
      }
    ]
  },
  {
    id: 'scaling-needs',
    text: 'What are your scaling requirements?',
    type: 'multiple-choice',
    category: 'Scalability',
    options: [
      {
        id: 'predictable-traffic',
        text: 'Predictable traffic patterns'
      },
      {
        id: 'variable-traffic',
        text: 'Highly variable or unpredictable traffic'
      },
      {
        id: 'steady-high-load',
        text: 'Steady high load with complex scaling rules'
      }
    ]
  },
  {
    id: 'container-usage',
    text: 'Do you prefer to use containers?',
    type: 'multiple-choice',
    category: 'Technology Preferences',
    options: [
      {
        id: 'yes-containers',
        text: 'Yes, we want to use containers'
      },
      {
        id: 'maybe-containers',
        text: 'Maybe, depending on the benefits'
      },
      {
        id: 'no-containers',
        text: 'No, we prefer traditional deployment methods'
      }
    ]
  },
  {
    id: 'operational-overhead',
    text: 'How much operational overhead are you willing to manage?',
    type: 'multiple-choice',
    category: 'Operations',
    options: [
      {
        id: 'minimal-ops',
        text: 'Minimal - we want fully managed services'
      },
      {
        id: 'some-ops',
        text: 'Some - we can handle basic monitoring and scaling'
      },
      {
        id: 'full-control',
        text: 'Full control - we want to manage everything'
      }
    ]
  },
  {
    id: 'cost-sensitivity',
    text: 'How sensitive are you to infrastructure costs?',
    type: 'multiple-choice',
    category: 'Cost',
    options: [
      {
        id: 'cost-critical',
        text: 'Very cost-sensitive - pay only for what we use'
      },
      {
        id: 'balanced-cost',
        text: 'Balanced - cost matters but not the only factor'
      },
      {
        id: 'cost-flexible',
        text: 'Flexible - willing to pay for simplicity and performance'
      }
    ]
  },
  {
    id: 'team-expertise',
    text: 'What is your team\'s expertise level?',
    type: 'multiple-choice',
    category: 'Team',
    options: [
      {
        id: 'dev-focused',
        text: 'Development-focused, prefer not to manage infrastructure'
      },
      {
        id: 'balanced-expertise',
        text: 'Balanced - some infrastructure knowledge'
      },
      {
        id: 'infra-experts',
        text: 'Infrastructure experts - comfortable with complex setups'
      }
    ]
  },
  {
    id: 'provider-preference',
    text: 'Do you have a preferred cloud provider?',
    type: 'multiple-choice',
    category: 'Provider',
    options: [
      {
        id: 'prefer-azure',
        text: 'Prefer Azure'
      },
      {
        id: 'prefer-aws',
        text: 'Prefer AWS'
      },
      {
        id: 'prefer-gcp',
        text: 'Prefer GCP'
      },
      {
        id: 'no-preference',
        text: 'No strong preference'
      }
    ]
  },
  {
    id: 'stateful-needs',
    text: 'Will you run stateful services or databases alongside your app?',
    type: 'multiple-choice',
    category: 'Data',
    options: [
      {
        id: 'yes-stateful',
        text: 'Yes, stateful services/databases'
      },
      {
        id: 'no-stateful',
        text: 'No, mostly stateless services'
      }
    ]
  },
  {
    id: 'multi-region',
    text: 'Do you require multi-region deployment or low-latency global presence?',
    type: 'multiple-choice',
    category: 'Scalability',
    options: [
      {
        id: 'multi-region-yes',
        text: 'Yes, global presence required'
      },
      {
        id: 'multi-region-no',
        text: 'No, single-region is fine'
      }
    ]
  },
  {
    id: 'compliance',
    text: 'Do you have strict regulatory or compliance requirements?',
    type: 'multiple-choice',
    category: 'Security',
    options: [
      {
        id: 'strict-compliance',
        text: 'Yes, strict compliance required'
      },
      {
        id: 'standard-compliance',
        text: 'Standard compliance only'
      }
    ]
  }
];

interface QuestionnaireResponse {
  questionId: string;
  selectedAnswerId: string;
}

interface RecommendationResult {
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
    pros: string[];
    cons: string[];
    complexity: 'Low' | 'Medium' | 'High';
    estimatedCost: string;
  }>;
}

interface WhyNotAlt {
  architecture: string;
  score: number;
  percentage: number;
  reasons: string[];
  pros: string[];
  cons: string[];
  complexity: 'Low' | 'Medium' | 'High';
  estimatedCost: string;
}

interface SensitivityChange {
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
}

interface SensitivityAnalysisResult {
  baseRecommendation: string;
  baseTopMatchPercentage: number;
  baseConfidenceScore: number;
  totalVariationsTested: number;
  recommendationSwitches: number;
  changes: SensitivityChange[];
}

const Questionnaire: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [responses, setResponses] = useState<QuestionnaireResponse[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [whyNotAlt, setWhyNotAlt] = useState<WhyNotAlt | null>(null);
  const [sensitivity, setSensitivity] = useState<SensitivityAnalysisResult | null>(null);
  const [isAnalyzingSensitivity, setIsAnalyzingSensitivity] = useState(false);

  const totalSteps = sampleQuestions.length;
  const currentQuestion = sampleQuestions[currentStep - 1];
  const currentResponse = responses.find(r => r.questionId === currentQuestion?.id);

  const answerText = (questionId: string, answerId: string): string => {
    const question = sampleQuestions.find(q => q.id === questionId);
    const option = question?.options.find(o => o.id === answerId);
    return option?.text ?? answerId;
  };

  const buildReportPdf = (scenarioResult: RecommendationResult, scenarioResponses: QuestionnaireResponse[]) => {
    const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
    const PW = pdf.internal.pageSize.getWidth();
    const PH = pdf.internal.pageSize.getHeight();
    const M = 40;

    // ── Colour helpers ──────────────────────────────────────────────────────
    type RGB = [number, number, number];
    const NAV:    RGB = [15,  23,  42];
    const BLUE:   RGB = [59,  130, 246];
    const INDIGO: RGB = [99,  102, 241];
    const GREEN:  RGB = [16,  185, 129];
    const AMBER:  RGB = [245, 158, 11];
    const RED:    RGB = [239, 68,  68];
    const WHITE:  RGB = [255, 255, 255];
    const SLATE:  RGB = [248, 250, 252];
    const MUTED:  RGB = [100, 116, 139];
    const BORDER: RGB = [226, 232, 240];
    const CARD:   RGB = [241, 245, 249];

    const fc = (c: RGB) => pdf.setFillColor(c[0], c[1], c[2]);
    const dc = (c: RGB) => pdf.setDrawColor(c[0], c[1], c[2]);
    const tc = (c: RGB) => pdf.setTextColor(c[0], c[1], c[2]);
    const ft = (size: number, bold = false) => {
      pdf.setFont('helvetica', bold ? 'bold' : 'normal');
      pdf.setFontSize(size);
    };

    // ── Reusable components ─────────────────────────────────────────────────
    const addFooter = () => {
      fc(NAV); pdf.rect(0, PH - 22, PW, 22, 'F');
      tc(WHITE); ft(8);
      pdf.text('InfraMap  \u00B7  Infrastructure Architecture Recommender', M, PH - 8);
      pdf.text(`Page ${pdf.getNumberOfPages()}`, PW - M, PH - 8, { align: 'right' });
      tc(NAV);
    };

    const pageHeader = (title: string) => {
      fc(BLUE); pdf.rect(0, 0, PW, 34, 'F');
      // Small logo mark
      fc(WHITE); pdf.roundedRect(M, 7, 20, 20, 3, 3, 'F');
      fc([37, 99, 235]); pdf.roundedRect(M + 2, 9, 16, 16, 2, 2, 'F');
      tc(WHITE); ft(9, true); pdf.text('I', M + 6.5, 20);
      // Section title
      ft(12, true); pdf.text(title, M + 28, 21);
      tc(NAV);
    };

    const scoreBar = (x: number, y: number, w: number, h: number, pct: number, color: RGB) => {
      fc(BORDER); dc(BORDER); pdf.setLineWidth(0);
      pdf.roundedRect(x, y, w, h, h / 2, h / 2, 'F');
      if (pct > 0) {
        fc(color);
        pdf.roundedRect(x, y, Math.max(w * (pct / 100), h), h, h / 2, h / 2, 'F');
      }
    };

    const pill = (x: number, y: number, label: string, bg: RGB, fg: RGB = WHITE) => {
      fc(bg); ft(8, true);
      const tw = pdf.getTextWidth(label);
      pdf.roundedRect(x, y - 10, tw + 14, 14, 7, 7, 'F');
      tc(fg); pdf.text(label, x + 7, y);
      tc(NAV);
    };

    const confidenceColor = (level: string): RGB =>
      level === 'High' ? GREEN : level === 'Medium' ? AMBER : RED;

    // ══════════════════════════════════════════════════════════════════════════
    // PAGE 1 — COVER
    // ══════════════════════════════════════════════════════════════════════════

    // Header band
    fc(NAV); pdf.rect(0, 0, PW, 108, 'F');
    fc(BLUE); pdf.rect(0, 103, PW, 5, 'F');

    // Logo mark — outer square, inner coloured square, "I"
    fc(WHITE); pdf.roundedRect(M, 20, 42, 42, 6, 6, 'F');
    fc(BLUE);  pdf.roundedRect(M + 4, 24, 34, 34, 4, 4, 'F');
    tc(WHITE); ft(20, true); pdf.text('I', M + 12, 47);

    // Brand name + subtitle
    ft(22, true); tc(WHITE);
    pdf.text('InfraMap', M + 54, 44);
    ft(11); tc([147, 197, 253] as RGB);
    pdf.text('Architecture Recommendation Report', M + 54, 62);
    ft(9); tc([148, 163, 184] as RGB);
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    pdf.text(`Generated ${dateStr}`, M + 54, 80);

    // ── Hero card ────────────────────────────────────────────────────────────
    const cX = M + 8, cW = PW - (M + 8) * 2, cY = 126, cH = 190;
    // Shadow
    fc([203, 213, 225] as RGB);
    pdf.roundedRect(cX + 3, cY + 3, cW, cH, 10, 10, 'F');
    // Card
    fc(WHITE); dc(BORDER); pdf.setLineWidth(0.5);
    pdf.roundedRect(cX, cY, cW, cH, 10, 10, 'FD');
    // Blue left accent bar
    fc(BLUE); pdf.roundedRect(cX, cY, 7, cH, 4, 4, 'F');
    pdf.rect(cX + 3, cY, 4, cH, 'F');

    // Confidence panel x position — declared here so it can be used as max-width boundary below
    const cpX = cX + cW - 136;

    tc(MUTED); ft(8, true);
    pdf.text('PRIMARY RECOMMENDATION', cX + 22, cY + 24);

    tc(NAV); ft(24, true);
    // Constrain to left content area (keep clear of confidence panel)
    const recMaxW = cpX - (cX + 22) - 12;
    const recLines: string[] = pdf.splitTextToSize(scenarioResult.recommendation, recMaxW);
    pdf.text(recLines[0], cX + 22, cY + 56);

    // Fit score
    tc(MUTED); ft(8);
    pdf.text('Fit Score', cX + 22, cY + 80);
    tc(BLUE); ft(20, true);
    pdf.text(`${scenarioResult.topMatchPercentage}%`, cX + 22, cY + 103);
    scoreBar(cX + 22, cY + 110, cW - 190, 9, scenarioResult.topMatchPercentage, BLUE);

    // Confidence panel (right side)
    fc(CARD); pdf.roundedRect(cpX, cY + 64, 120, 96, 8, 8, 'F');
    tc(MUTED); ft(7, true);
    pdf.text('DECISION CERTAINTY', cpX + 10, cY + 80);
    const confC = confidenceColor(scenarioResult.confidenceLevel);
    tc(confC); ft(22, true);
    pdf.text(`${scenarioResult.confidenceScore}%`, cpX + 10, cY + 108);
    pill(cpX + 10, cY + 138, scenarioResult.confidenceLevel.toUpperCase(), confC);

    // Footer hint inside card
    tc(MUTED); ft(8);
    pdf.text(`Analysed ${scenarioResponses.length} of ${sampleQuestions.length} questions`, cX + 22, cY + 176);

    // ── Three stat tiles ─────────────────────────────────────────────────────
    const tY = cY + cH + 18;
    const tW = (PW - M * 2 - 16) / 3;
    const tile = (i: number, label: string, value: string, sub: string, color: RGB) => {
      const tX = M + i * (tW + 8);
      fc(CARD); dc(BORDER); pdf.setLineWidth(0.5);
      pdf.roundedRect(tX, tY, tW, 72, 6, 6, 'FD');
      fc(color); pdf.roundedRect(tX, tY, tW, 5, 3, 3, 'F');
      pdf.rect(tX, tY + 2, tW, 3, 'F');
      tc(MUTED); ft(7, true);
      pdf.text(label.toUpperCase(), tX + 12, tY + 22);
      tc(NAV); ft(18, true);
      pdf.text(value, tX + 12, tY + 48);
      tc(MUTED); ft(8);
      pdf.text(sub, tX + 12, tY + 63);
    };
    tile(0, 'Alternatives Found',  `${scenarioResult.alternatives.length}`, 'other suitable architectures', INDIGO);
    tile(1, 'Reasoning Points',    `${scenarioResult.reasoning.length}`,    'factors informing this choice', GREEN);
    tile(2, 'Questions Answered',  `${scenarioResponses.length}`,           `of ${sampleQuestions.length} total`, BLUE);

    addFooter();

    // ══════════════════════════════════════════════════════════════════════════
    // PAGE 2 — RECOMMENDATION DETAIL + ALTERNATIVES
    // ══════════════════════════════════════════════════════════════════════════
    pdf.addPage();
    pageHeader('Recommendation Detail');
    let y = 52;

    // Section: Why this recommendation
    tc(NAV); ft(13, true); pdf.text('Why This Recommendation', M, y); y += 5;
    fc(BLUE); pdf.rect(M, y, 170, 2, 'F'); y += 14;

    scenarioResult.reasoning.forEach((reason) => {
      if (y > PH - 100) { addFooter(); pdf.addPage(); pageHeader('Recommendation Detail'); y = 52; }
      fc(BLUE); pdf.circle(M + 5, y - 3, 3.5, 'F');
      tc(NAV); ft(10);
      const lines: string[] = pdf.splitTextToSize(reason, PW - M * 2 - 20);
      lines.forEach((line, i) => { pdf.text(line, M + 16, y + i * 13); });
      y += lines.length * 13 + 7;
    });

    y += 18;

    // Section: Alternatives
    if (y > PH - 220) { addFooter(); pdf.addPage(); pageHeader('Alternative Architectures'); y = 52; }
    tc(NAV); ft(13, true); pdf.text('Alternative Architectures', M, y); y += 5;
    fc(INDIGO); pdf.rect(M, y, 192, 2, 'F'); y += 14;

    scenarioResult.alternatives.forEach((alt, idx) => {
      const aH = 94;
      if (y + aH > PH - 60) { addFooter(); pdf.addPage(); pageHeader('Alternative Architectures'); y = 52; }

      const rankColors: RGB[] = [INDIGO, BLUE, MUTED];
      const rankC = rankColors[idx] ?? MUTED;

      // Card + shadow
      fc([203, 213, 225] as RGB); pdf.roundedRect(M + 2, y + 2, PW - M * 2, aH, 6, 6, 'F');
      fc(CARD); dc(BORDER); pdf.setLineWidth(0.5);
      pdf.roundedRect(M, y, PW - M * 2, aH, 6, 6, 'FD');

      // Rank stripe
      fc(rankC); pdf.roundedRect(M, y, 30, aH, 4, 4, 'F');
      pdf.rect(M + 14, y, 16, aH, 'F');
      tc(WHITE); ft(14, true);
      pdf.text(`${idx + 2}`, M + 9, y + aH / 2 + 6);

      // Right metadata panel — fixed 152pt from right edge
      const metaX = PW - M - 152;
      const metaColW = 72;
      tc(MUTED); ft(7, true);
      pdf.text('COMPLEXITY', metaX + 4, y + 20);
      pdf.text('EST. COST', metaX + metaColW + 4, y + 20);
      tc(NAV); ft(10, true);
      pdf.text(alt.complexity, metaX + 4, y + 33);
      ft(9);
      const costLines: string[] = pdf.splitTextToSize(alt.estimatedCost, metaColW - 4);
      pdf.text(costLines[0], metaX + metaColW + 4, y + 33);

      // Name — clipped to left content area
      tc(NAV); ft(11, true);
      const nameMaxW = metaX - (M + 38) - 8;
      const nameLines: string[] = pdf.splitTextToSize(alt.architecture, nameMaxW);
      pdf.text(nameLines[0], M + 38, y + 20);

      // Fit bar — stays within left content area, % label before metadata
      const barW = metaX - (M + 38) - 48;
      tc(MUTED); ft(8);
      pdf.text('Fit Score', M + 38, y + 36);
      scoreBar(M + 38, y + 40, barW, 7, alt.percentage, rankC);
      tc(rankC); ft(10, true);
      pdf.text(`${alt.percentage}%`, M + 38 + barW + 6, y + 47);

      // First reason — clipped to left content area
      if (alt.reasons.length > 0) {
        tc(MUTED); ft(8);
        const rLine: string[] = pdf.splitTextToSize(alt.reasons[0], nameMaxW);
        pdf.text(rLine[0], M + 38, y + 76);
      }

      y += aH + 10;
    });

    addFooter();

    // ══════════════════════════════════════════════════════════════════════════
    // PAGE 3 — YOUR INPUTS
    // ══════════════════════════════════════════════════════════════════════════
    pdf.addPage();
    pageHeader('Your Inputs');
    y = 52;

    tc(NAV); ft(13, true); pdf.text('Your Questionnaire Answers', M, y); y += 5;
    fc(BLUE); pdf.rect(M, y, 200, 2, 'F'); y += 16;

    scenarioResponses.forEach((response, idx) => {
      if (y + 38 > PH - 60) { addFooter(); pdf.addPage(); pageHeader('Your Inputs (cont.)'); y = 52; }
      const rowBg: RGB = idx % 2 === 0 ? WHITE : SLATE;
      fc(rowBg); dc(BORDER); pdf.setLineWidth(0.3);
      pdf.rect(M, y, PW - M * 2, 38, 'FD');

      // Number badge
      fc(BLUE); pdf.roundedRect(M + 8, y + 9, 18, 18, 3, 3, 'F');
      tc(WHITE); ft(8, true); pdf.text(`${idx + 1}`, M + 13, y + 21);

      // Question — clip to available row width
      const q = sampleQuestions.find(qq => qq.id === response.questionId);
      const rowTextW = PW - M * 2 - 44;
      tc(MUTED); ft(8);
      const qLines: string[] = pdf.splitTextToSize(q?.text ?? response.questionId, rowTextW);
      pdf.text(qLines[0], M + 34, y + 15);
      // Answer
      tc(NAV); ft(10, true);
      const aLines: string[] = pdf.splitTextToSize(answerText(response.questionId, response.selectedAnswerId), rowTextW);
      pdf.text(aLines[0], M + 34, y + 29);

      y += 38;
    });

    addFooter();

    // ══════════════════════════════════════════════════════════════════════════
    // PAGE 4 — SENSITIVITY ANALYSIS (optional)
    // ══════════════════════════════════════════════════════════════════════════
    if (sensitivity) {
      pdf.addPage();
      pageHeader('Sensitivity Analysis');
      y = 52;

      // Stat tiles row
      const sW = (PW - M * 2 - 16) / 3;
      const statTile = (i: number, label: string, value: string, color: RGB) => {
        const sX = M + i * (sW + 8);
        const tileLabelW = sW - 20; // conservative inner width
        fc(color); pdf.roundedRect(sX, y, sW, 60, 6, 6, 'F');
        tc(WHITE); ft(20, true);
        const valLines: string[] = pdf.splitTextToSize(value, tileLabelW);
        pdf.text(valLines[0], sX + 10, y + 36);
        ft(8);
        const lblLines: string[] = pdf.splitTextToSize(label, tileLabelW);
        pdf.text(lblLines[0], sX + 10, y + 51);
      };
      const stability = sensitivity.totalVariationsTested > 0
        ? Math.round((1 - sensitivity.recommendationSwitches / sensitivity.totalVariationsTested) * 100)
        : 100;
      statTile(0, 'Variations Tested',           `${sensitivity.totalVariationsTested}`,   BLUE);
      statTile(1, 'Recommendation Switches',      `${sensitivity.recommendationSwitches}`,  AMBER);
      statTile(2, 'Recommendation Stability',     `${stability}%`, sensitivity.recommendationSwitches === 0 ? GREEN : INDIGO);
      y += 78;

      // Safe inner text width for all cards — text starts at M+16, ends at PW-M-16
      const cardTextX = M + 16;
      const cardTextW = PW - M * 2 - 32;

      const switchChanges = sensitivity.changes.filter(c => c.changesRecommendation).slice(0, 6);

      if (switchChanges.length === 0) {
        // Stable callout banner
        fc(GREEN); pdf.roundedRect(M, y, PW - M * 2, 64, 8, 8, 'F');
        fc([52, 211, 153] as RGB); pdf.roundedRect(M, y, PW - M * 2, 6, 4, 4, 'F');
        pdf.rect(M, y + 3, PW - M * 2, 3, 'F');
        tc(WHITE); ft(13, true);
        const bannerW = PW - M * 2 - 40;
        const stableLines: string[] = pdf.splitTextToSize('Recommendation is highly stable', bannerW);
        pdf.text(stableLines[0], M + 20, y + 30);
        ft(10);
        const subLines: string[] = pdf.splitTextToSize('No single answer change would alter the primary recommendation.', bannerW);
        pdf.text(subLines[0], M + 20, y + 48);
      } else {
        tc(NAV); ft(12, true);
        const headLines: string[] = pdf.splitTextToSize('Answers That Would Change the Recommendation', PW - M * 2);
        pdf.text(headLines[0], M, y); y += 5;
        fc(AMBER); pdf.rect(M, y, 282, 2, 'F'); y += 14;

        switchChanges.forEach((change) => {
          // Measure arrow text BEFORE drawing to get actual line count for dynamic card height
          ft(9, true);
          const arrowText = `"${change.currentAnswerText}"  ->  "${change.newAnswerText}"`;
          const arrowLines: string[] = pdf.splitTextToSize(arrowText, cardTextW);
          const arrowLineCount = Math.min(arrowLines.length, 2);
          // Card height: 14 (question) + 14 (arrow lines × 13) + 16 (rec row) + 16 (stats) + top/bottom pads
          const chH = 14 + (arrowLineCount * 13) + 16 + 16 + 18;

          if (y + chH > PH - 60) { addFooter(); pdf.addPage(); pageHeader('Sensitivity Analysis (cont.)'); y = 52; }

          fc(CARD); dc([253, 224, 71] as RGB); pdf.setLineWidth(0.8);
          pdf.roundedRect(M, y, PW - M * 2, chH, 6, 6, 'FD');
          fc(AMBER); pdf.roundedRect(M, y, 6, chH, 3, 3, 'F');
          pdf.rect(M + 3, y, 3, chH, 'F');

          // Question label — 1 line, clipped
          tc(MUTED); ft(8);
          const qLines: string[] = pdf.splitTextToSize(change.questionText, cardTextW);
          pdf.text(qLines[0], cardTextX, y + 14);

          // Arrow text — up to 2 lines
          tc(NAV); ft(9, true);
          arrowLines.slice(0, 2).forEach((line, li) => {
            pdf.text(line, cardTextX, y + 28 + li * 13);
          });

          // New recommendation label + value on same line
          const recRowY = y + 28 + arrowLineCount * 13 + 4;
          tc(MUTED); ft(8);
          pdf.text('New recommendation:', cardTextX, recRowY);
          tc(AMBER); ft(9, true);
          const labelOffset = cardTextX + pdf.getTextWidth('New recommendation: ');
          const archMaxW = (PW - M - 16) - labelOffset;
          const archLines: string[] = pdf.splitTextToSize(change.newRecommendation, archMaxW);
          pdf.text(archLines[0], labelOffset, recRowY);

          // Stats line
          tc(MUTED); ft(8);
          const statsText = `Fit ${change.newTopMatchPercentage}%  \u00B7  Certainty ${change.newConfidenceScore}%`;
          const statsLines: string[] = pdf.splitTextToSize(statsText, cardTextW);
          pdf.text(statsLines[0], cardTextX, recRowY + 14);

          y += chH + 8;
        });
      }

      addFooter();
    }

    return pdf;
  };

  const exportCurrentReport = () => {
    if (!result) return;

    const pdf = buildReportPdf(result, responses);
    const safeArch = result.recommendation.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    pdf.save(`infra-report-${safeArch}-${Date.now()}.pdf`);
  };

  const handleAnswerSelect = (answerId: string) => {
    const newResponse: QuestionnaireResponse = {
      questionId: currentQuestion.id,
      selectedAnswerId: answerId
    };

    setResponses(prev => {
      const filtered = prev.filter(r => r.questionId !== currentQuestion.id);
      return [...filtered, newResponse];
    });
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    setSensitivity(null);
    setIsAnalyzingSensitivity(true);

    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ responses }),
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendation');
      }

      const result = await response.json();
      setResult(result);

      const sensitivityResponse = await fetch('/api/recommend/sensitivity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ responses }),
      });

      if (sensitivityResponse.ok) {
        const sensitivityResult = await sensitivityResponse.json();
        setSensitivity(sensitivityResult);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsAnalyzingSensitivity(false);
      setIsSubmitting(false);
    }
  };

  const canProceed = currentResponse?.selectedAnswerId !== undefined;

  const getArchitectureImage = (architecture: string): string | null => {
    const images: Record<string, string> = {
      'Azure AKS': '/images/azure-aks.png',
      'Azure App Services': '/images/azure-app-services.png',
      'Azure Container Apps': '/images/azure-container-apps.png',
      'Serverless': '/images/aws-lambda.png',
      'Virtual Machines': '/images/azure-vm.png',
      'AWS Elastic Beanstalk': '/images/aws-beanstalk.png',
      'AWS ECS/Fargate': '/images/aws-ecs.png',
      'AWS Lambda': '/images/aws-lambda.png',
      'AWS EC2': '/images/aws-ec2.png',
      'AWS EKS': '/images/aws-eks.png',
      'GCP App Engine': '/images/gcp-app-engine.png',
      'GCP Cloud Run': '/images/gcp-cloud-run.png',
      'GCP Cloud Functions': '/images/gcp-cloud-functions.png',
      'GCP Compute Engine': '/images/gcp-compute-engine.png',
      'GCP GKE': '/images/gcp-gke.png',
    };
    return images[architecture] || null;
  };

  const getArchitectureIcon = (architecture: string) => {
    const icons: Record<string, string> = {
      'Azure AKS': '☸️',
      'Azure App Services': '☁️',
      'Azure Container Apps': '📦',
      'Serverless': '⚡',
      'Virtual Machines': '🖥️',
      'AWS Elastic Beanstalk': '🌱',
      'AWS ECS/Fargate': '🐳',
      'AWS Lambda': 'λ',
      'AWS EC2': '💻',
      'AWS EKS': '☸️',
      'GCP App Engine': '🔥',
      'GCP Cloud Run': '🏃',
      'GCP Cloud Functions': '⚙️',
      'GCP Compute Engine': '🖱️',
      'GCP GKE': '🎯'
    };
    return icons[architecture] || '🏗️';
  };

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'High':
        return 'from-green-100 to-emerald-100 text-green-800';
      case 'Medium':
        return 'from-yellow-100 to-amber-100 text-yellow-800';
      case 'Low':
        return 'from-blue-100 to-cyan-100 text-blue-800';
      default:
        return 'from-gray-100 to-slate-100 text-gray-800';
    }
  };

  const WhyNotModal: React.FC = () => {
    useEffect(() => {
      if (!whyNotAlt) return;

      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setWhyNotAlt(null);
        }
      };

      window.addEventListener('keydown', onKeyDown);
      return () => window.removeEventListener('keydown', onKeyDown);
    }, [whyNotAlt]);

    if (!whyNotAlt) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setWhyNotAlt(null)}>
        <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
        <div
          className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 border border-gray-100"
          role="dialog"
          aria-modal="true"
          aria-labelledby="why-not-title"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={() => setWhyNotAlt(null)}
            aria-label="Close details dialog"
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-lg transition-colors"
          >
            ×
          </button>

          <div className="flex items-center mb-6">
            <div className="w-14 h-14 mr-4 flex items-center justify-center">
              {getArchitectureImage(whyNotAlt.architecture) ? (
                <img src={getArchitectureImage(whyNotAlt.architecture)!} alt={whyNotAlt.architecture} className="w-14 h-14 object-contain" />
              ) : (
                <span className="text-4xl">{getArchitectureIcon(whyNotAlt.architecture)}</span>
              )}
            </div>
            <div>
              <h2 id="why-not-title" className="text-2xl font-bold text-gray-900">Why not {whyNotAlt.architecture}?</h2>
              <p className="text-gray-500 text-sm">Fit score: {whyNotAlt.percentage}% vs {result?.topMatchPercentage}% for {result?.recommendation}</p>
            </div>
          </div>

          {/* Score gap */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-5 mb-6">
            <div className="text-sm font-semibold text-gray-700 mb-3">Score Comparison</div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold text-purple-700">{result?.recommendation} (recommended)</span>
                  <span className="font-bold text-purple-700">{result?.topMatchPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full" style={{ width: `${result?.topMatchPercentage ?? 0}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold text-gray-600">{whyNotAlt.architecture}</span>
                  <span className="font-bold text-gray-600">{whyNotAlt.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-gradient-to-r from-gray-400 to-gray-500 h-3 rounded-full" style={{ width: `${whyNotAlt.percentage}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Why it scored lower */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Why it scored lower</h3>
            <ul className="space-y-3">
              {whyNotAlt.cons.map((con, i) => (
                <li key={i} className="flex items-start bg-red-50 rounded-xl p-3">
                  <span className="text-red-500 mr-3 font-bold mt-0.5">✗</span>
                  <span className="text-gray-700 text-sm">{con}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* When it WOULD make sense */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">When {whyNotAlt.architecture} would be a better fit</h3>
            <ul className="space-y-3">
              {whyNotAlt.reasons.map((reason, i) => (
                <li key={i} className="flex items-start bg-blue-50 rounded-xl p-3">
                  <span className="text-blue-500 mr-3 font-bold mt-0.5">→</span>
                  <span className="text-gray-700 text-sm">{reason}</span>
                </li>
              ))}
              {whyNotAlt.pros.slice(0, 2).map((pro, i) => (
                <li key={`pro-${i}`} className="flex items-start bg-green-50 rounded-xl p-3">
                  <span className="text-green-500 mr-3 font-bold mt-0.5">✓</span>
                  <span className="text-gray-700 text-sm">{pro}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-between items-center text-sm text-gray-500 bg-gray-50 rounded-xl p-4">
            <span>Complexity: <span className={`font-semibold ${ whyNotAlt.complexity === 'Low' ? 'text-green-600' : whyNotAlt.complexity === 'Medium' ? 'text-yellow-600' : 'text-red-600'}`}>{whyNotAlt.complexity}</span></span>
            <span>Est. Cost: <span className="font-semibold text-gray-800">{whyNotAlt.estimatedCost}</span></span>
          </div>
        </div>
      </div>
    );
  };

  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-6 md:py-12" aria-busy={isSubmitting || isAnalyzingSensitivity}>
        <a href="#results-main" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white text-purple-700 font-semibold px-4 py-2 rounded-lg shadow">
          Skip to results
        </a>
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          {whyNotAlt && <WhyNotModal />}
          <main id="results-main" className="bg-white rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl p-6 md:p-10 border border-gray-100">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent text-center mb-8">
              Your Infrastructure Recommendation
            </h1>

            <div className="mb-10">
              <div className="text-center mb-8">
                <div className="flex justify-center mb-6">
                  {getArchitectureImage(result.recommendation) ? (
                    <img
                      src={getArchitectureImage(result.recommendation)!}
                      alt={result.recommendation}
                      className="w-24 h-24 object-contain drop-shadow-lg"
                    />
                  ) : (
                    <div className="text-7xl">🏗️</div>
                  )}
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-5">
                  {result.recommendation}
                </h2>
                <div className={`inline-block px-6 py-3 rounded-full font-bold text-lg mb-4 bg-gradient-to-r ${getConfidenceColor(result.confidenceLevel)}`}>
                  Fit {result.topMatchPercentage}% • Decision certainty: {result.confidenceLevel} ({result.confidenceScore}%)
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    onClick={exportCurrentReport}
                    className="px-4 py-2 rounded-xl bg-white border border-blue-200 text-blue-700 font-semibold hover:bg-blue-50 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
                  >
                    Export Report (.pdf)
                  </button>
                </div>
              </div>
            </div>

            <div className="mb-10">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Why this recommendation?</h3>
              <ul className="space-y-4">
                {result.reasoning.map((reason, index) => (
                  <li key={index} className="flex items-start bg-gray-50 rounded-xl p-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">
                      {index + 1}
                    </span>
                    <span className="text-gray-700 text-lg">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {result.alternatives.length > 0 && (
              <div className="mb-10">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Architecture Comparison</h3>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full bg-white rounded-2xl shadow-xl border border-gray-100">
                    <thead>
                      <tr className="bg-gradient-to-r from-purple-50 to-blue-50">
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Architecture</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Fit Score</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Complexity</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Est. Cost</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Pros</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Cons</th>
                        <th className="px-6 py-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {result.alternatives.map((alt, index) => {
                        return (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 w-10 h-10 mr-3 flex items-center justify-center">
                                {getArchitectureImage(alt.architecture) ? (
                                  <img
                                    src={getArchitectureImage(alt.architecture)!}
                                    alt={alt.architecture}
                                    className="w-10 h-10 object-contain"
                                  />
                                ) : (
                                  <span className="text-2xl">{getArchitectureIcon(alt.architecture)}</span>
                                )}
                              </div>
                              <div>
                                <div className="text-lg font-bold text-gray-900">{alt.architecture}</div>
                                <div className="text-sm text-gray-500 mt-1">{alt.percentage}% fit</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                                <div
                                  className="bg-gradient-to-r from-purple-400 to-blue-400 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${alt.percentage}%` }}
                                />
                              </div>
                              <span className="text-sm font-semibold text-gray-700">{alt.score} pts</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                              alt.complexity === 'Low' ? 'bg-green-100 text-green-800' :
                              alt.complexity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {alt.complexity}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-semibold text-gray-900">{alt.estimatedCost}</span>
                          </td>
                          <td className="px-6 py-4">
                            <ul className="text-sm text-gray-600 space-y-1">
                              {alt.pros.slice(0, 2).map((pro, proIndex) => (
                                <li key={proIndex} className="flex items-start">
                                  <span className="text-green-500 mr-2">✓</span>
                                  <span>{pro}</span>
                                </li>
                              ))}
                            </ul>
                          </td>
                          <td className="px-6 py-4">
                            <ul className="text-sm text-gray-600 space-y-1">
                              {alt.cons.slice(0, 2).map((con, conIndex) => (
                                <li key={conIndex} className="flex items-start">
                                  <span className="text-red-500 mr-2">✗</span>
                                  <span>{con}</span>
                                </li>
                              ))}
                            </ul>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => setWhyNotAlt(alt)}
                              className="text-sm font-semibold text-purple-600 hover:text-purple-800 underline underline-offset-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 rounded"
                            >
                              Why not this?
                            </button>
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-6">
                  {result.alternatives.map((alt, index) => {
                    return (
                    <div key={index} className="rounded-2xl shadow-xl border p-6 bg-white border-gray-100">
                      <div className="flex items-center mb-4">
                        <div className="flex-shrink-0 w-12 h-12 mr-3 flex items-center justify-center">
                          {getArchitectureImage(alt.architecture) ? (
                            <img
                              src={getArchitectureImage(alt.architecture)!}
                              alt={alt.architecture}
                              className="w-12 h-12 object-contain"
                            />
                          ) : (
                            <span className="text-3xl">{getArchitectureIcon(alt.architecture)}</span>
                          )}
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-gray-900">{alt.architecture}</h4>
                          <div className="text-sm text-gray-500">{alt.percentage}% fit</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-sm font-semibold text-gray-700 mb-1">Fit Score</div>
                          <div className="flex items-center">
                            <div className="w-12 bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                                style={{ width: `${alt.percentage}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-gray-700">{alt.score} pts</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-700 mb-1">Complexity</div>
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                            alt.complexity === 'Low' ? 'bg-green-100 text-green-800' :
                            alt.complexity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {alt.complexity}
                          </span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="text-sm font-semibold text-gray-700 mb-1">Est. Cost</div>
                        <span className="text-lg font-bold text-gray-900">{alt.estimatedCost}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-sm font-semibold text-green-700 mb-2">Pros</div>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {alt.pros.slice(0, 2).map((pro, proIndex) => (
                              <li key={proIndex} className="flex items-start">
                                <span className="text-green-500 mr-2">✓</span>
                                <span>{pro}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-red-700 mb-2">Cons</div>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {alt.cons.slice(0, 2).map((con, conIndex) => (
                              <li key={conIndex} className="flex items-start">
                                <span className="text-red-500 mr-2">✗</span>
                                <span>{con}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <button
                        onClick={() => setWhyNotAlt(alt)}
                        className="w-full text-center text-sm font-semibold text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 py-2 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
                      >
                        Why not this? →
                      </button>
                    </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mb-10">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Sensitivity Analysis</h3>
              {isAnalyzingSensitivity ? (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-blue-800 font-medium" role="status" aria-live="polite">
                  Evaluating "what if" answer changes...
                </div>
              ) : sensitivity ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700">
                    Tested {sensitivity.totalVariationsTested} single-answer variations. Recommendation changed in {sensitivity.recommendationSwitches} cases.
                  </div>
                  {sensitivity.changes.filter(c => c.changesRecommendation).slice(0, 5).length > 0 ? (
                    <div className="space-y-3">
                      {sensitivity.changes.filter(c => c.changesRecommendation).slice(0, 5).map((change, idx) => (
                        <div key={`${change.questionId}-${change.newAnswerId}-${idx}`} className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
                          <p className="text-sm text-gray-700 mb-1"><span className="font-semibold">Switch trigger:</span> {change.questionText}</p>
                          <p className="text-sm text-gray-700 mb-2">{change.currentAnswerText} → {change.newAnswerText}</p>
                          <p className="text-sm font-semibold text-gray-900">New recommendation: {change.newRecommendation} (fit {change.newTopMatchPercentage}%, certainty {change.newConfidenceScore}%)</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-green-800 font-medium">
                      This recommendation is stable under all tested single-answer changes.
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-gray-700">
                  Sensitivity analysis unavailable for this run.
                </div>
              )}
            </div>

            <div className="text-center">
              <button
                onClick={() => {
                  setResult(null);
                  setSensitivity(null);
                  setResponses([]);
                  setCurrentStep(1);
                }}
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold text-base md:text-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 motion-reduce:transition-none shadow-lg hover:shadow-xl transform hover:scale-105 motion-reduce:hover:scale-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-200"
              >
                Take Questionnaire Again
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-6 md:py-12" aria-busy={isSubmitting}>
      <a href="#questionnaire-main" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white text-purple-700 font-semibold px-4 py-2 rounded-lg shadow">
        Skip to questionnaire
      </a>
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        <main id="questionnaire-main">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Infrastructure Recommendation
          </h1>
          <p className="text-lg md:text-xl text-gray-600 font-medium px-4">
            Answer these questions to get personalized cloud infrastructure recommendations.
          </p>
        </div>

        <ProgressBar
          currentStep={currentStep}
          totalSteps={totalSteps}
          className="mb-10"
        />

        <div id="question-card">
          <QuestionCard
            question={currentQuestion}
            selectedAnswerId={currentResponse?.selectedAnswerId}
            onAnswerSelect={handleAnswerSelect}
            className="mb-10"
          />
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-8" role="alert" aria-live="assertive">
            <p className="text-red-800 font-semibold text-lg">{error}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold text-base md:text-lg transition-all duration-300 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gray-300 ${
              currentStep === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-600 text-white hover:bg-gray-700 shadow-lg hover:shadow-xl transform hover:scale-105 motion-reduce:hover:scale-100'
            }`}
          >
            Back
          </button>

          <button
            onClick={handleNext}
            disabled={!canProceed || isSubmitting}
            className={`px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold text-base md:text-lg transition-all duration-300 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-200 ${
              !canProceed || isSubmitting
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105 motion-reduce:hover:scale-100'
            }`}
            aria-describedby="submit-status"
          >
            {isSubmitting ? 'Submitting...' : currentStep === totalSteps ? 'Get Recommendation' : 'Next'}
          </button>
        </div>
        <p id="submit-status" className="sr-only" aria-live="polite">{isSubmitting ? 'Submitting answers and generating recommendation.' : ''}</p>
        </main>
      </div>
    </div>
  );
};

export default Questionnaire;
