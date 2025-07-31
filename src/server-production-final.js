import { createApp, validateEnvironment, logger } from './app-production.js';

// Validate environment variables first
validateEnvironment();

// Create Express app
const app = createApp();

// Graceful shutdown handler
let server;

const gracefulShutdown = () => {
  logger.info('Received shutdown signal, closing server...');
  
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
    
    // Force shutdown after 30 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 30000);
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start server
const PORT = process.env.PORT || 8080;
server = app.listen(PORT, () => {
  logger.info(`Production server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  logger.info(`CORS origins: ${process.env.ALLOWED_ORIGINS || 'localhost only'}`);
  logger.info(`Log sensitive data: ${process.env.LOG_SENSITIVE_DATA === 'true'}`);
});

// Handle server startup errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} is already in use`);
  } else {
    logger.error('Server startup error:', err);
  }
  process.exit(1);
});