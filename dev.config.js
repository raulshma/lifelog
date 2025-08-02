/**
 * Development Configuration
 * Centralized configuration for development environment
 */

module.exports = {
  // Server Configuration
  server: {
    frontend: {
      port: 5173,
      host: 'localhost',
      open: true,
    },
    backend: {
      port: 3001,
      host: '0.0.0.0',
    },
  },

  // Database Configuration
  database: {
    host: 'localhost',
    port: 5432,
    name: 'lifelog',
    ssl: false,
  },

  // Development Tools
  tools: {
    enableHotReload: true,
    enableSourceMaps: true,
    enableTypeChecking: true,
    enableLinting: true,
  },

  // Logging Configuration
  logging: {
    level: 'debug',
    enablePrettyPrint: true,
    enableFileLogging: false,
  },

  // CORS Configuration
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  },

  // Build Configuration
  build: {
    sourceMaps: true,
    minify: false,
    target: 'es2020',
  },
};
