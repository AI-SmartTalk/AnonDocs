import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { anonymizeRouter } from './routes/anonymize.routes';
import { documentRouter } from './routes/document.routes';
import { streamRouter } from './routes/stream.routes';
import { errorHandler } from './middleware/error.middleware';
import { config } from './config';
import { docxFormatterService } from './services/docx-formatter.service';

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

// Cleanup old DOCX files on startup and periodically (every hour)
const cleanupOldFiles = () => {
  try {
    docxFormatterService.cleanupOldFiles(24); // Delete files older than 24 hours
    console.log('Cleaned up old DOCX files');
  } catch (error) {
    console.error('Error cleaning up old files:', error);
  }
};

cleanupOldFiles(); // Run on startup
const cleanupInterval = setInterval(cleanupOldFiles, 60 * 60 * 1000); // Every hour

app.listen(port, () => {
  console.log(`AnonDocs API running on port ${port}`);
  console.log(`POST /api/anonymize - Anonymize text`);
  console.log(`POST /api/document - Anonymize document`);
  console.log(`  - DOCX: Returns download URL (formatting preserved)`);
  console.log(`  - PDF/TXT: Returns anonymized text only`);
  console.log(`GET  /api/document/download/:filename - Download DOCX`);
  console.log(`POST /api/stream/anonymize - Stream text anonymization progress`);
  console.log(`POST /api/stream/document - Stream document anonymization progress`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  clearInterval(cleanupInterval);
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  clearInterval(cleanupInterval);
  process.exit(0);
});
