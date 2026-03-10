import express from 'express';
import cors from 'cors';
import { recommend, getQuestions, sensitivityAnalysis } from './routes/recommend';

const app = express();
// Use BACKEND_PORT to avoid collision with Cloud Run's PORT=8080 (which belongs to nginx)
const PORT = process.env.BACKEND_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.post('/api/recommend', recommend);
app.post('/api/recommend/sensitivity', sensitivityAnalysis);
app.get('/api/recommend/questions', getQuestions);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔍 Questions API: http://localhost:${PORT}/api/recommend/questions`);
    console.log(`🎯 Recommendations API: http://localhost:${PORT}/api/recommend`);
  });
}

export default app;