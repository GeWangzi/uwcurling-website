'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { pb } from '@/lib/pocketbase';

interface AuthContextType {
  user: any | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signUp: (name: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Initialize auth state
    const initializeAuth = () => {
      setIsLoading(true);
      setUser(pb.authStore.record);
      setIsLoading(false);
    };

    // Set up listener
    const removeListener = pb.authStore.onChange((token, record) => {
      setUser(record);
    });

    initializeAuth();

    return () => removeListener();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
        console.log('Logging in with:', { email, password });
      await pb.collection('users').authWithPassword(email, password);
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    pb.authStore.clear();
    router.push('/login');
  };

    const signUp = async (name: string, email: string, password: string) => {
        setIsLoading(true);
        try {
        await pb.collection('users').create({
            name,
            email,
            password,
            passwordConfirm: password,
            membership: false,
            is_driver: false,
            practices_left: 2,
        });
        await login(email, password);
        } finally {
        setIsLoading(false);
        }
    };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, signUp }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}