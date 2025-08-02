// Application constants

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  USERS: {
    PROFILE: '/users/profile',
    UPDATE: '/users/update',
  },
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
} as const;

// Application routes
export const ROUTES = {
  HOME: '/',
  DAY_TRACKER: '/day-tracker',
  KNOWLEDGE_BASE: '/knowledge-base',
  VAULT: '/vault',
  DOCUMENT_HUB: '/document-hub',
  INVENTORY: '/inventory',
} as const;

// Module names
export const MODULES = {
  DAY_TRACKER: 'Day Tracker',
  KNOWLEDGE_BASE: 'Knowledge Base',
  VAULT: 'Vault',
  DOCUMENT_HUB: 'Document Hub',
  INVENTORY: 'Inventory',
} as const;