"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from './api';

interface User {
  username: string;
  role?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      api.setToken(token);
      // Get current user info including role
      api.getCurrentUser()
        .then((data) => {
          setUser({
            username: data.username,
            role: data.role,
            cn: data.cn,
            mail: data.mail,
          });
        })
        .catch(() => {
          // Token invalid, clear it
          api.setToken(null);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user_role');
            localStorage.removeItem('username');
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await api.login(username, password);
      // Set user info
      setUser({
        username: response.username,
        role: response.role,
      });
      
      // Redirect berdasarkan role
      if (response.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      throw error;
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_role');
      localStorage.removeItem('username');
    }
    router.push('/login');
  };

  const isAdmin = user?.role === 'admin' || user?.is_admin === true;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin,
      }}
    >
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


