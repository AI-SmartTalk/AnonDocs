import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { anonymizeRouter } from './routes/anonymize.routes';
import { documentRouter } from './routes/document.routes';
import { streamRouter } from './routes/stream.routes';
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
app.use('/api/document', documentRouter);
app.use('/api/stream', streamRouter);

// Error handling
app.use(errorHandler);

app.listen(port, () => {
  console.log(`AnonDocs API running on port ${port}`);
  console.log(`POST /api/anonymize - Anonymize text`);
  console.log(`POST /api/document - Anonymize document (PDF/DOCX/TXT)`);
  console.log(`POST /api/stream/anonymize - Stream text anonymization progress`);
  console.log(`POST /api/stream/document - Stream document anonymization progress`);
});
