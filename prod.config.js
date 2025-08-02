/**
 * Production Configuration
 * Centralized configuration for production environment
 */

module.exports = {
  // Server Configuration
  server: {
    frontend: {
      port: process.env.FRONTEND_PORT || 3000,
      host: process.env.FRONTEND_HOST || '0.0.0.0',
    },
    backend: {
      port: process.env.PORT || 3001,
      host: process.env.HOST || '0.0.0.0',
    },
  },

  // Database Configuration
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    name: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true',
  },

  // Production Tools
  tools: {
    enableHotReload: false,
    enableSourceMaps: false,
    enableTypeChecking: true,
    enableLinting: true,
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enablePrettyPrint: false,
    enableFileLogging: true,
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || [],
    credentials: true,
  },

  // Build Configuration
  build: {
    sourceMaps: false,
    minify: true,
    target: 'es2020',
  },
};
