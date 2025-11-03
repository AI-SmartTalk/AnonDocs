import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { anonymizeRouter } from './routes/anonymize.routes';
import { errorHandler } from './middleware/error.middleware';
import { config } from './config';

const app = express();
const port = config.server.port;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/anonymize', anonymizeRouter);

// Error handling
app.use(errorHandler);

app.listen(port, () => {
  console.log(`AnonDocs API running on port ${port}`);
  console.log(`POST /api/anonymize - Anonymize text`);
});
