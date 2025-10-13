import fs from 'fs';
import path from 'path';
import { config } from '../config';

export function createUploadsDirectory(): void {
  const absolutePath = path.resolve(config.upload.uploadDir);

  if (!fs.existsSync(absolutePath)) {
    fs.mkdirSync(absolutePath, { recursive: true });
    console.log(`Created uploads directory: ${absolutePath}`);
  }
}

