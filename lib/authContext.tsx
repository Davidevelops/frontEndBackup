"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import apiClient from './axiosConfig';
import { apiEndpoints } from './apiEndpoints';
import toast from 'react-hot-toast';

interface User {
  id: string;
  username: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  checkSession: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkSession = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Checking session...');
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      console.log('🔑 Token in localStorage:', token ? 'Exists' : 'Not found');
      
      const response = await apiClient.get(apiEndpoints.session());
      
      if (response.data.data) {
        setUser(response.data.data);
        console.log('👤 User set:', response.data.data.username);
      } else {
        setUser(null);
      }
    } catch (err: any) {
      console.error('❌ Session check failed:', err.message);
      setUser(null);
      if (err.response?.status !== 401) {
        setError('Failed to check authentication status');
        toast.error('Failed to verify session');
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      console.log('✅ Token cleared on logout');
    }
    setUser(null);
    toast.success('Logged out successfully');
    // UPDATED: Changed redirect to lowercase 'login'
    window.location.href = '/login';  // Changed from '/' or '/logIn'
  };

  useEffect(() => {
    checkSession();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, checkSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}