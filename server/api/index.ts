// api/index.ts
// Vercel serverless entry point — re-exports the Express app.
// Vercel routes every incoming request through this file.

import { app } from '../src/server';

export default app;
