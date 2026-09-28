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
<<<<<<< HEAD
  LoginOtpRequest,
=======
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
  LoginRequest,
  RegisterRequest,
  Role,
  UserResponse,
<<<<<<< HEAD
  VerifyOtpRequest,
} from '@/types';

/**
 * The result of a login attempt. Either the session was established immediately
 * (`status: 'authenticated'`, carrying the user) or the server issued a one-time
 * code and the caller must complete the challenge (`status: 'challenge'`).
 */
export type LoginOutcome =
  | { status: 'authenticated'; user: UserResponse }
  | { status: 'challenge'; challengeToken: string };

=======
} from '@/types';

>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
interface AuthContextValue {
  user: UserResponse | null;
  /** True while the initial "restore session" check is running. */
  initializing: boolean;
  isAuthenticated: boolean;
<<<<<<< HEAD
  /** Password sign-in. Resolves to an authenticated session or a 2FA challenge. */
  login: (credentials: LoginRequest) => Promise<LoginOutcome>;
  /** Passwordless sign-in: request a one-time code by email + WhatsApp. */
  requestLoginOtp: (payload: LoginOtpRequest) => Promise<{ challengeToken: string }>;
  /** Complete any OTP challenge (2FA or passwordless) with the 6-digit code. */
  verifyOtp: (payload: VerifyOtpRequest) => Promise<UserResponse>;
=======
  login: (credentials: LoginRequest) => Promise<UserResponse>;
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
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
<<<<<<< HEAD
    async (credentials: LoginRequest): Promise<LoginOutcome> => {
      const auth = await authService.login(credentials);
      // A 2FA-enabled account gets a challenge instead of tokens; the caller
      // then routes to the OTP screen to finish signing in.
      if (auth.twoFactorRequired && auth.challengeToken) {
        return { status: 'challenge', challengeToken: auth.challengeToken };
      }
      return { status: 'authenticated', user: applySession(auth) };
    },
    [applySession],
  );

  const requestLoginOtp = useCallback(
    async (payload: LoginOtpRequest) => {
      const auth = await authService.requestLoginOtp(payload);
      // The endpoint is intentionally non-enumerating: it always returns a
      // challenge token, even when no account matches (an unbound token simply
      // fails at verify), so we never leak whether the identifier exists.
      return { challengeToken: auth.challengeToken ?? '' };
    },
    [],
  );

  const verifyOtp = useCallback(
    async (payload: VerifyOtpRequest) => {
      const auth = await authService.verifyOtp(payload);
=======
    async (credentials: LoginRequest) => {
      const auth = await authService.login(credentials);
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
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
<<<<<<< HEAD
      requestLoginOtp,
      verifyOtp,
=======
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
      register,
      logout,
      refreshUser,
      hasRole,
      setUser,
    }),
<<<<<<< HEAD
    [user, initializing, login, requestLoginOtp, verifyOtp, register, logout, refreshUser, hasRole, setUser],
=======
    [user, initializing, login, register, logout, refreshUser, hasRole, setUser],
>>>>>>> f117f25f2db8e7e1d3024b22a6e4d99cb85b01e6
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
