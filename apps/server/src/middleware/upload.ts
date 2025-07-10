import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { AUDIO_UPLOAD_CONFIG } from '../types';

// Configure multer for audio file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    // Store files in temporary directory
    cb(null, 'uploads/temp/');
  },
  filename: (_req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `audio-${uniqueSuffix}${ext}`);
  },
});

// File filter for audio files
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedExtensions = ['.wav', '.mp3', '.m4a'];
  const allowedMimeTypes = [
    'audio/wav',
    'audio/wave',
    'audio/x-wav',
    'audio/mpeg',
    'audio/mp3',
    'audio/mp4',
    'audio/x-m4a',
  ];

  const ext = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype.toLowerCase();

  if (allowedExtensions.includes(ext) && allowedMimeTypes.includes(mimeType)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file format. Allowed formats: ${allowedExtensions.join(', ')}`
      )
    );
  }
};

// Configure multer with file size limits
export const uploadAudio = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: AUDIO_UPLOAD_CONFIG.maxSize, // 10MB
    files: 1, // Only one file at a time
  },
}).single('audio'); // Field name should be 'audio'

import fs from 'fs';

// Cleanup function for temporary files
export const cleanupTempFile = (filePath: string): void => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ Cleaned up temporary file: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Failed to cleanup file ${filePath}:`, error);
  }
};

// Create uploads directory if it doesn't exist
const uploadsDir = 'uploads/temp';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`📁 Created uploads directory: ${uploadsDir}`);
}
