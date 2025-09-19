import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiClient, createApiClient } from '../lib/apiClient';

type Nullable<T> = T | null;

const USER_TOKEN_KEY = 'userToken';

export interface UserProfile {
  id: string;
  username?: string | null;
  displayName?: string | null;
  phone?: string | null;
  email?: string | null;
  profilePhoto?: string | null;
  country?: string | null;
  city?: string | null;
  town?: string | null;
}

interface OtpRequestResult {
  success: boolean;
  error?: string;
  debugOtp?: string;
}

interface OtpVerifyResult {
  success: boolean;
  error?: string;
}

interface AuthContextValue {
  user: Nullable<UserProfile>;
  token: Nullable<string>;
  initializing: boolean;
  requestOtp: (phone: string) => Promise<OtpRequestResult>;
  verifyOtp: (phone: string, otp: string) => Promise<OtpVerifyResult>;
  logout: () => Promise<void>;
  api: ApiClient;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const getErrorMessage = (error: unknown, fallback: string) => {
  if (!error) {
    return fallback;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<Nullable<string>>(null);
  const [user, setUser] = useState<Nullable<UserProfile>>(null);
  const [initializing, setInitializing] = useState(true);
  const tokenRef = useRef<Nullable<string>>(null);

  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  const api = useMemo<ApiClient>(() => createApiClient(() => tokenRef.current), []);

  const loadProfile = useCallback(
    async (userId?: string) => {
      try {
        const profile = await api<UserProfile & { id: string }>('/profile');
        if (profile) {
          setUser({
            id: userId || profile.id || '',
            username: profile.username,
            displayName: profile.displayName,
            phone: profile.phone,
            email: profile.email,
            profilePhoto: profile.profilePhoto,
            country: profile.country,
            city: profile.city,
            town: profile.town,
          });
        }
      } catch (error) {
        const status =
          error && typeof error === 'object' && 'status' in (error as { status?: unknown })
            ? Number((error as { status?: unknown }).status)
            : undefined;

        if (status === 401) {
          await AsyncStorage.removeItem(USER_TOKEN_KEY);
          setToken(null);
          tokenRef.current = null;
          setUser(null);
          return;
        }

        const message = getErrorMessage(error, 'Failed to load profile');
        console.warn(message);
      }
    },
    [api],
  );

  const bootstrapAuth = useCallback(async () => {
    try {
      const storedToken = await AsyncStorage.getItem(USER_TOKEN_KEY);
      if (!storedToken) {
        return;
      }

      setToken(storedToken);
      tokenRef.current = storedToken;
      await loadProfile();
    } finally {
      setInitializing(false);
    }
  }, [loadProfile]);

  useEffect(() => {
    bootstrapAuth();
  }, [bootstrapAuth]);

  const requestOtp = useCallback<AuthContextValue['requestOtp']>(async (rawPhone) => {
    const phone = (rawPhone || '').trim();
    if (!phone) {
      return { success: false, error: 'Phone number is required.' };
    }

    try {
      const response = await api<Record<string, string>>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ phone }),
      });

      return {
        success: true,
        debugOtp: response?.debugOtp,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : getErrorMessage(error, 'Failed to send OTP.');
      return { success: false, error: message };
    }
  }, [api]);

  const verifyOtp = useCallback<AuthContextValue['verifyOtp']>(async (rawPhone, rawOtp) => {
    const phone = (rawPhone || '').trim();
    const otp = (rawOtp || '').trim();

    if (!phone || !otp) {
      return { success: false, error: 'Phone number and OTP are required.' };
    }

    try {
      const response = await api<{ token: string; userId: string }>('/auth/verify', {
        method: 'POST',
        body: JSON.stringify({ phone, otp }),
      });

      if (!response?.token) {
        return { success: false, error: 'Authentication token missing from response.' };
      }

      await AsyncStorage.setItem(USER_TOKEN_KEY, response.token);
      setToken(response.token);
      tokenRef.current = response.token;
      await loadProfile(response.userId);

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : getErrorMessage(error, 'Failed to verify OTP.');
      return { success: false, error: message };
    }
  }, [api, loadProfile]);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(USER_TOKEN_KEY);
    setUser(null);
    setToken(null);
    tokenRef.current = null;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      initializing,
      requestOtp,
      verifyOtp,
      logout,
      api,
    }),
    [api, initializing, logout, requestOtp, token, user, verifyOtp],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
