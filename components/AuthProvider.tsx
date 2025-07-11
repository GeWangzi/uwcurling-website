'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { pb } from '@/lib/pocketbase';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'member' | 'admin';
  membership: boolean;
  isDriver: boolean;
  practicesLeft: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signUp: (name: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function GetUser(record: any): User | null {
  if (record != null) {
    let newUser : User = {
      id: record.id,
      email: record.email,
      name: record.name,
      role: record.role,
      membership: record.membership,
      isDriver: record.is_driver,
      practicesLeft: record.practices_left,
    }

    return newUser;
  }
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Initialize auth state
    const initializeAuth = () => {
      setIsLoading(true);
      setUser(GetUser(pb.authStore.record));
      setIsLoading(false);
    };

    // Set up listener
    const removeListener = pb.authStore.onChange((token, record) => {
      setUser(GetUser(record));
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
            role: 'member',
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