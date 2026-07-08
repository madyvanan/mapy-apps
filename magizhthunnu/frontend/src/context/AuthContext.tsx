import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { User } from '../types';
import * as authService from '../services/auth.service';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

type AuthAction =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'UPDATE_PROFILE'; payload: Partial<User> };

const initialState: AuthState = { user: null, isLoading: true, isAuthenticated: false };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN':
      return { user: action.payload, isLoading: false, isAuthenticated: true };
    case 'LOGOUT':
      return { user: null, isLoading: false, isAuthenticated: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'UPDATE_PROFILE':
      return state.user ? { ...state, user: { ...state.user, ...action.payload } } : state;
    default:
      return state;
  }
};

interface RegisterResult {
  id: string;
  mailVerificationRequired: boolean;
  mobileVerificationRequired: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; mobile: string; role?: string }) => Promise<RegisterResult>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    authService.getMe()
      .then((res) => {
        if (res.data.data) dispatch({ type: 'LOGIN', payload: res.data.data });
        else dispatch({ type: 'LOGOUT' });
      })
      .catch(() => dispatch({ type: 'LOGOUT' }));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authService.login({ email, password });
    if (res.data.data) dispatch({ type: 'LOGIN', payload: res.data.data });
  };

  const register = async (data: { name: string; email: string; password: string; mobile: string; role?: string }) => {
    const res = await authService.register(data);
    if (!res.data.data) throw new Error('Registration failed');
    return res.data.data;
  };

  const logout = async () => {
    await authService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
