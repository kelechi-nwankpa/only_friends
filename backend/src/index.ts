import { createApp } from './app.js';
import { config, validateConfig } from './config/index.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';

async function main(): Promise<void> {
  try {
    // Validate configuration
    validateConfig();

    // Connect to database
    await connectDatabase();

    // Create and start Express app
    const app = createApp();

    const server = app.listen(config.port, () => {
      console.log(`
🚀 Server is running!
📍 Environment: ${config.nodeEnv}
🔗 URL: http://localhost:${config.port}
📚 API: http://localhost:${config.port}/v1
❤️  Health: http://localhost:${config.port}/health
      `);
    });

    // Graceful shutdown
    const shutdown = async (signal: string): Promise<void> => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        console.log('HTTP server closed');
        await disconnectDatabase();
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();
