import app from './app.js';
import { closePool } from './config/db.js';
import { env } from './config/env.js';

const server = app.listen(env.port, '0.0.0.0', () => {
  console.log(`API server listening on port ${env.port}`);
});

let shuttingDown = false;

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log(`${signal} received, shutting down gracefully`);

  const forceExitTimer = setTimeout(() => {
    console.error('Graceful shutdown timed out');
    process.exit(1);
  }, 10000);
  forceExitTimer.unref();

  server.close(async (error) => {
    try {
      await closePool();
      clearTimeout(forceExitTimer);

      if (error) {
        console.error('HTTP server shutdown failed', error);
        process.exit(1);
      }

      console.log('API server stopped');
      process.exit(0);
    } catch (closeError) {
      console.error('Database shutdown failed', closeError);
      process.exit(1);
    }
  });
}

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});
