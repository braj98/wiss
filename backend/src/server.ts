/**
 * Server Entry Point
 * 
 * Start the Express server
 */

import { createApp } from './app.js';

const PORT = process.env.PORT || 3001;

const app = createApp();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
