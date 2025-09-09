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
  membershipPending: boolean;
  isDriver: boolean;
  practicesLeft: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signUp: (name: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function GetUser(record: any): User | null {
  if (record != null) {
    let newUser: User = {
      id: record.id,
      email: record.email,
      name: record.name,
      role: record.role,
      membership: record.membership,
      membershipPending: record.membership_pending,
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
    const initializeAuth = async () => {
      setIsLoading(true);
      if (pb.authStore.record) {
        try {
          await refreshUser();
        } catch (e) {
          console.error('initial refresh failed', e);
        } finally {
          setIsLoading(false);
        }
      }
    };

    // Set up listener
    const removeListener = pb.authStore.onChange((token, record) => {
      setUser(GetUser(record));
    });

    initializeAuth();

    return () => removeListener();
  }, []);

  const refreshUser = async () => {
    const rec = pb.authStore.record;
    if (!rec) return;
    try {
      const latest = await pb.collection('users').getOne(rec.id, { requestKey: 'refreshUser' });
      pb.authStore.save(pb.authStore.token, latest);
    } catch (e) {
      console.error('Failed to refresh user', e);
    }
  };

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
    <AuthContext.Provider value={{ user, isLoading, refreshUser, login, logout, signUp }}>
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