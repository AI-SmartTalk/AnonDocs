import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { anonymizeRouter } from './routes/anonymize.routes';
import { documentRouter } from './routes/document.routes';
import { streamRouter } from './routes/stream.routes';
import { errorHandler } from './middleware/error.middleware';
import { config } from './config';
import { docxFormatterService } from './services/docx-formatter.service';
import { llmService } from './services/llm.service';
import { providerHealthService } from './services/provider-health.service';

const app = express();
const port = config.server.port;

// Derrière un reverse proxy, sans quoi toutes les requêtes partagent l'IP du proxy
// et la limite de débit les bloque ensemble.
app.set('trust proxy', config.server.trustProxy);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
/**
 * Le fournisseur par défaut est utilisable s'il est configuré et que son dernier
 * appel n'a pas été refusé. Aucun appel au modèle ici : chaque sonde serait facturée.
 */
function readiness() {
  const defaultProvider = config.llm.defaultProvider;
  const providers = Object.fromEntries(
    (['openai', 'anthropic', 'ollama'] as const).map((provider) => [
      provider,
      {
        configured: llmService.getAvailableProviders().includes(provider),
        ...providerHealthService.get(provider),
      },
    ])
  );
  const current = providers[defaultProvider];
  const ready = current.configured && current.lastFailure !== 'auth';
  return { ready, defaultProvider, providers };
}

// Vivacité : les sondes Docker/k8s redémarrent le conteneur sur un non-200,
// ce qui ne réparerait pas une clé révoquée. L'état réel est dans `status`.
app.get('/health', (_req, res) => {
  const { ready, defaultProvider, providers } = readiness();
  res.json({
    status: ready ? 'ok' : 'degraded',
    defaultProvider,
    providers,
    timestamp: new Date().toISOString(),
  });
});

// Disponibilité, pour le monitoring : 503 tant que l'anonymisation ne peut pas aboutir.
app.get('/health/ready', (_req, res) => {
  const { ready, defaultProvider, providers } = readiness();
  res.status(ready ? 200 : 503).json({ status: ready ? 'ok' : 'degraded', defaultProvider, providers });
});

app.use(
  '/api',
  rateLimit({
    windowMs: 60 * 1000,
    limit: config.server.rateLimitPerMinute,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
  })
);

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
