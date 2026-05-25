// src/types/express.d.ts
// Augments Express Request type to include authenticated user

import { Role } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: Role;
        name?: string;
      };
    }
  }
}

export {};
