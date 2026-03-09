# infra.io

A rule-based infrastructure recommendation platform that analyzes questionnaire responses and suggests the best-fit architecture across Azure, AWS, and GCP.

## Architecture Options

- Kubernetes, AWS EKS, GCP GKE
- Azure App Services / Container Apps
- AWS Elastic Beanstalk / ECS Fargate / Lambda / EC2
- GCP App Engine / Cloud Run / Cloud Functions / Compute Engine
- Virtual Machines and provider-managed VM variants

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

This starts both the backend API (port 3001) and frontend Vite app (port 5173).

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
  "topMatchPercentage": 83,
  "confidenceScore": 53,
  "confidenceLevel": "Medium",
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
  topMatchPercentage: number;          // Absolute fit score (0-100)
  confidenceScore: number;             // 0-100 confidence percentage
  confidenceLevel: 'Low' | 'Medium' | 'High';
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

### 3. Fit and Confidence
- **Fit score (`topMatchPercentage`)**: absolute score of the winner vs a strong-fit benchmark.
- **Decision certainty (`confidenceScore`)**: certainty of the decision based on winner strength, dominance over runner-up, answer consistency, and completeness.

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

## Docker Images

CI publishes Docker images with semantic version and commit SHA tags:

- `docker.io/<dockerhub-user>/infra-recommender-frontend:<app-version>`
- `docker.io/<dockerhub-user>/infra-recommender-frontend:<git-sha>`
- `docker.io/<dockerhub-user>/infra-recommender-frontend:latest`
- `docker.io/<dockerhub-user>/infra-recommender-backend:<app-version>`
- `docker.io/<dockerhub-user>/infra-recommender-backend:<git-sha>`
- `docker.io/<dockerhub-user>/infra-recommender-backend:latest`

`<app-version>` comes from the root `package.json` `version` field.

## Cloud Run Notes

- Frontend nginx container listens on port `8080`.
- Deploy Cloud Run frontend with `--port 8080`.
- Prefer deploying immutable image tags (`:<app-version>` or `:<git-sha>`) instead of `:latest`.

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