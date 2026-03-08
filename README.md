# infra.io

A rule-based recommendation engine that analyzes questionnaire responses to recommend optimal Azure infrastructure architectures.

## Architecture Options

- **Kubernetes**: Container orchestration for complex, distributed applications
- **Azure App Services**: Fully managed platform for web apps and APIs
- **Azure Container Apps**: Serverless containers without Kubernetes management
- **Serverless**: Event-driven computing with pay-per-use pricing
- **Virtual Machines**: Full infrastructure control with traditional VMs

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Install all dependencies:
```bash
npm run install:all
```

2. Start the development servers:
```bash
npm run dev
```

This will start both the backend API (port 3001) and frontend React app (port 5173).

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## API Endpoints

### POST /api/recommend
Generate infrastructure recommendations based on questionnaire responses.

**Request Body:**
```json
{
  "responses": [
    {
      "questionId": "app-complexity",
      "selectedAnswerId": "complex-distributed"
    }
  ]
}
```

**Response:**
```json
{
  "recommendation": "Kubernetes",
  "confidenceScore": 87,
  "reasoning": ["Detailed reasoning points..."],
  "alternatives": [...]
}
```

### GET /api/recommend/questions
Get the list of available questions.

## Engine Output Format

```typescript
interface RecommendationOutput {
  recommendation: ArchitectureType;    // Top recommended architecture
  confidenceScore: number;             // 0-100 confidence percentage
  reasoning: string[];                 // Detailed reasoning points
  alternatives: Array<{                // Alternative options
    architecture: ArchitectureType;
    score: number;
    percentage: number;
    reasons: string[];
  }>;
}
```

## How It Works

### 1. Weighted Scoring
Each questionnaire answer contributes weighted scores to different architectures based on relevance.

### 2. Business Rules
The engine applies configurable business rules for:
- Minimum score thresholds
- Architecture-specific bonuses
- Cost efficiency adjustments

### 3. Confidence Calculation
Confidence scores are calculated based on:
- Score separation (how much better the top choice is)
- Response completeness
- Score distribution variance

### 4. Reasoning Generation
Detailed reasoning includes:
- Key insights from questionnaire responses
- Architecture-specific advantages
- Cost and operational considerations

## Example Output

### Kubernetes Recommendation
```json
{
  "recommendation": "Kubernetes",
  "confidenceScore": 87,
  "reasoning": [
    "How complex is your application?: \"Complex distributed system...\" strongly supports Kubernetes",
    "Kubernetes is ideal for complex, containerized applications...",
    // ... more reasoning points
  ],
  "alternatives": [
    {
      "architecture": "Azure Container Apps",
      "score": 18,
      "percentage": 26,
      "reasons": [
        "Azure Container Apps offers medium costs...",
        // ... more reasons
      ]
    }
  ]
}
```

## Project Structure

```
├── .github/
│   └── workflows/
│       └── ci.yml                  # CI pipeline (tests + container builds)
├── backend/
│   ├── __tests__/
│   │   ├── api.integration.test.ts
│   │   ├── recommendationEngine.test.ts
│   │   └── scoringEngine.test.ts
│   ├── engine/
│   │   ├── recommendationEngine.ts    # Main recommendation engine
│   │   ├── scoringEngine.ts          # Core scoring logic
│   │   ├── rules.ts                  # Business rules and compatibility
│   │   ├── examples.ts               # Usage examples and sample data
│   │   └── test.ts                   # Basic validation tests
│   ├── routes/
│   │   └── recommend.ts              # API endpoints
│   ├── Dockerfile
│   ├── jest.config.cjs
│   ├── server.ts                     # Express server
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── components/
│   │   ├── ProgressBar.tsx           # Progress indicator
│   │   └── QuestionCard.tsx          # Question display component
│   ├── pages/
│   │   └── index.tsx                 # Questionnaire + results UI
│   ├── public/
│   │   └── images/                   # Architecture/provider icons
│   ├── src/
│   │   ├── main.tsx                  # React entry point
│   │   └── index.css                 # Global styles
│   ├── Dockerfile
│   ├── index.html                    # HTML template
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── shared/
│   ├── types.ts                      # TypeScript type definitions
│   └── questions.ts                  # Sample questionnaire data
└── package.json                      # Root package.json
```

## Development

### Frontend (React + TypeScript + Vite)
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Features**: Multi-step form, progress bar, responsive design

### Backend (Node.js + Express + TypeScript)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Features**: REST API, error handling, CORS support

## Key Features

### Intelligent Scoring
- **Weighted Contributions**: Each answer affects multiple architectures with different weights
- **Business Rules**: Configurable rules for special conditions and bonuses
- **Score Normalization**: Results normalized to percentages for easy comparison

### Comprehensive Reasoning
- **Question Analysis**: Identifies which answers most strongly support the recommendation
- **Architecture Insights**: Provides specific advantages of the recommended architecture
- **Cost Considerations**: Includes cost efficiency and operational cost analysis

### Alternative Suggestions
- **Top Alternatives**: Shows 2-3 alternative architectures with scores
- **Comparative Analysis**: Explains why alternatives might be considered
- **Use Case Matching**: Highlights specific scenarios where alternatives excel

### Confidence Assessment
- **Score Separation**: Higher confidence when top choice significantly outperforms others
- **Response Completeness**: More questions answered increases confidence
- **Distribution Analysis**: More even score distributions reduce confidence

## Running Tests

To run the basic validation tests:

```bash
cd backend/engine
npx ts-node test.ts
```

## Deployment

### Build for Production

1. Build both frontend and backend:
```bash
npm run build
```

2. Start the production server:
```bash
npm run start
```

The built frontend will be served by the Express server from the `/` route.