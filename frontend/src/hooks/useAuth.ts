import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthService, type LoginRequest, type RegisterRequest } from '@services';
import type { User } from '@types';

export interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

export const useAuth = (): UseAuthReturn => {
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Query for current user
  const {
    data: user,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ['currentUser'],
    queryFn: AuthService.getCurrentUser,
    enabled: AuthService.isAuthenticated(),
    retry: false,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: AuthService.login,
    onSuccess: (data) => {
      queryClient.setQueryData(['currentUser'], (data as any).user);
      setError(null);
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: AuthService.register,
    onSuccess: (data) => {
      queryClient.setQueryData(['currentUser'], (data as any).user);
      setError(null);
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: AuthService.logout,
    onSuccess: () => {
      queryClient.clear();
      setError(null);
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  // Clear error when query error changes
  useEffect(() => {
    if (queryError) {
      setError(queryError.message);
    }
  }, [queryError]);

  return {
    user: user || null,
    isAuthenticated: !!user,
    isLoading: isLoading || loginMutation.isPending || registerMutation.isPending,
    login: async (credentials: LoginRequest) => {
      setError(null);
      await loginMutation.mutateAsync(credentials);
    },
    register: async (userData: RegisterRequest) => {
      setError(null);
      await registerMutation.mutateAsync(userData);
    },
    logout: async () => {
      setError(null);
      await logoutMutation.mutateAsync();
    },
    error,
  };
};