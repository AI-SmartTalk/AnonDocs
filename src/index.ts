import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { documentRouter } from './routes/document.routes';
import { errorHandler } from './middleware/error.middleware';
import { createUploadsDirectory } from './utils/file.utils';
import { config } from './config';

dotenv.config();

const app = express();
const port = config.server.port;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Create uploads directory if it doesn't exist
createUploadsDirectory();

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/documents', documentRouter);

// Error handling
app.use(errorHandler);

app.listen(port, () => {
  console.log(`AnonDocs API running on port ${port}`);
});

