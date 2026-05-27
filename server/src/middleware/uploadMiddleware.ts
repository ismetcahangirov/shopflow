// src/middleware/uploadMiddleware.ts
// Multer file upload middleware with type and size checks, plus Cloudinary helper

import multer from 'multer';
import { Request } from 'express';
import { AppError } from '../utils/AppError';
import cloudinary from '../config/cloudinary';
import { logger } from '../config/logger';

// ── Multer Storage Configuration (In-Memory) ─────────────
const storage = multer.memoryStorage();

// ── File Filter (Only Images) ────────────────────────────
function fileFilter(_req: Request, file: Express.Multer.File, callback: multer.FileFilterCallback): void {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

  if (allowedTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new AppError('Yalnız JPEG, PNG və WEBP şəkilləri yüklənə bilər', 400, 'INVALID_FILE_TYPE'));
  }
}

// ── Upload Middleware (Max 2MB) ──────────────────────────
export const uploadImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
});

// ── Cloudinary Buffer Upload Helper ──────────────────────
export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
}

export function uploadToCloudinary(
  fileBuffer: Buffer,
  folder: string,
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `shopflow/${folder}`,
        resource_type: 'image',
      },
      (error, result) => {
        if (error || !result) {
          logger.error('Cloudinary upload error', { error });
          return reject(new AppError('Şəkil yüklənərkən xəta baş verdi', 500, 'UPLOAD_ERROR'));
        }
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      },
    );

    uploadStream.end(fileBuffer);
  });
}
