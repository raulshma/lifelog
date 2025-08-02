/**
 * Workspace Configuration
 * Centralized configuration for the LifeLog monorepo workspace
 */

module.exports = {
  // Workspace Information
  name: 'lifelog',
  version: '1.0.0',
  description: 'LifeLog - A comprehensive life organization application',

  // Workspace Structure
  workspaces: ['frontend', 'backend'],

  // Development Ports
  ports: {
    frontend: 5173,
    backend: 3001,
    database: 5432,
  },

  // Environment Configuration
  environments: {
    development: {
      nodeEnv: 'development',
      enableHotReload: true,
      enableSourceMaps: true,
      logLevel: 'debug',
    },
    production: {
      nodeEnv: 'production',
      enableHotReload: false,
      enableSourceMaps: false,
      logLevel: 'info',
    },
  },

  // Build Configuration
  build: {
    outputDir: {
      frontend: 'frontend/dist',
      backend: 'backend/dist',
    },
    cleanBeforeBuild: true,
    generateSourceMaps: {
      development: true,
      production: false,
    },
  },

  // Development Tools
  tools: {
    linting: {
      enabled: true,
      autoFix: true,
      maxWarnings: 0,
    },
    formatting: {
      enabled: true,
      formatOnSave: true,
    },
    typeChecking: {
      enabled: true,
      strict: true,
    },
    testing: {
      enabled: true,
      coverage: true,
      threshold: 80,
    },
  },

  // Git Configuration
  git: {
    hooks: {
      preCommit: ['lint-staged'],
      commitMsg: ['commitlint'],
    },
    conventionalCommits: true,
  },

  // Scripts Configuration
  scripts: {
    development: ['dev', 'dev:frontend', 'dev:backend', 'setup'],
    building: ['build', 'build:frontend', 'build:backend', 'build:prod'],
    quality: ['lint', 'lint:fix', 'format', 'format:check', 'type-check'],
    testing: ['test', 'test:frontend', 'test:backend'],
    database: ['db:generate', 'db:migrate', 'db:push', 'db:studio'],
  },

  // Dependencies Management
  dependencies: {
    shared: ['typescript', 'eslint', 'prettier', 'husky', 'lint-staged'],
    frontend: [
      'react',
      'react-dom',
      'vite',
      '@fluentui/react-components',
      'react-router-dom',
      '@tanstack/react-query',
    ],
    backend: ['fastify', 'drizzle-orm', 'better-auth', 'pg', 'bcryptjs'],
  },
};
