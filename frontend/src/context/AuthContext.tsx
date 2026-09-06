import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { authService, userService } from '@/lib/services';
import { setAuthFailureHandler } from '@/lib/api';
import { tokenStore } from '@/lib/tokenStore';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  Role,
  UserResponse,
} from '@/types';

interface AuthContextValue {
  user: UserResponse | null;
  /** True while the initial "restore session" check is running. */
  initializing: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<UserResponse>;
  register: (payload: RegisterRequest) => Promise<UserResponse>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  /** Convenience: does the current user hold ANY of the given roles? */
  hasRole: (...roles: Role[]) => boolean;
  /** Locally patch the cached user after a profile update. */
  setUser: (user: UserResponse) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserResponse | null>(null);
  const [initializing, setInitializing] = useState(true);
  // Guards against a logout race hydrating a user after sign-out.
  const activeRef = useRef(true);

  const applySession = useCallback((auth: AuthResponse) => {
    tokenStore.setTokens(auth.accessToken, auth.refreshToken);
    setUserState(auth.user);
    return auth.user;
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUserState(null);
    // Best-effort server notification; ignore failures (token may be gone).
    authService.logout().catch(() => undefined);
  }, []);

  const login = useCallback(
    async (credentials: LoginRequest) => {
      const auth = await authService.login(credentials);
      return applySession(auth);
    },
    [applySession],
  );

  const register = useCallback(
    async (payload: RegisterRequest) => {
      const auth = await authService.register(payload);
      return applySession(auth);
    },
    [applySession],
  );

  const refreshUser = useCallback(async () => {
    const fresh = await userService.me();
    if (activeRef.current) setUserState(fresh);
  }, []);

  const setUser = useCallback((next: UserResponse) => {
    setUserState(next);
  }, []);

  const hasRole = useCallback(
    (...roles: Role[]) => (user ? roles.includes(user.role) : false),
    [user],
  );

  // On the API layer's auth failure (failed refresh) → hard logout.
  useEffect(() => {
    setAuthFailureHandler(() => {
      tokenStore.clear();
      setUserState(null);
    });
  }, []);

  // Restore an existing session on first load.
  useEffect(() => {
    activeRef.current = true;
    const token = tokenStore.getAccessToken();
    if (!token) {
      setInitializing(false);
      return;
    }
    userService
      .me()
      .then((me) => {
        if (activeRef.current) setUserState(me);
      })
      .catch(() => {
        tokenStore.clear();
      })
      .finally(() => {
        if (activeRef.current) setInitializing(false);
      });
    return () => {
      activeRef.current = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      initializing,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      refreshUser,
      hasRole,
      setUser,
    }),
    [user, initializing, login, register, logout, refreshUser, hasRole, setUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
