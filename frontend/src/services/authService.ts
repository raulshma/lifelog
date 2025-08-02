import { apiService } from '@utils/api';
import { API_ENDPOINTS, STORAGE_KEYS } from '@utils/constants';
import type { User } from '@types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export class AuthService {
  /**
   * Login user with email and password
   */
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    
    if (response.success && response.data) {
      // Store auth token
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.data.token);
      return response.data;
    }
    
    throw new Error(response.error || 'Login failed');
  }

  /**
   * Register new user
   */
  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      userData
    );
    
    if (response.success && response.data) {
      // Store auth token
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.data.token);
      return response.data;
    }
    
    throw new Error(response.error || 'Registration failed');
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    try {
      await apiService.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    }
  }

  /**
   * Get current user profile
   */
  static async getCurrentUser(): Promise<User> {
    const response = await apiService.get<User>(API_ENDPOINTS.USERS.PROFILE);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to get user profile');
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return !!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  /**
   * Get stored auth token
   */
  static getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }
}