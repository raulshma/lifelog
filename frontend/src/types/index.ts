// Export all TypeScript type definitions from this directory

// Common types
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Module configuration
export interface ModuleConfig {
  name: string;
  path: string;
  component: React.ComponentType;
  icon: React.ComponentType;
  description?: string;
}

// App props
export interface AppProps {
  children?: React.ReactNode;
}
