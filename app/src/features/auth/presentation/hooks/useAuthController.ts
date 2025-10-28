import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authRepository, AuthRepositoryImpl } from '../../data/repositories/authRepositoryImpl';
import { User } from '../../domain/models/user';

const REMEMBER_EMAIL_KEY = 'remember_email';
const REMEMBER_ME_KEY = 'remember_me';

export interface UseAuthControllerOptions {
  repository?: AuthRepositoryImpl;
}

export function useAuthController(options: UseAuthControllerOptions = {}) {
  const repository = options.repository ?? authRepository;

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [savedEmail, setSavedEmail] = useState<string>('');
  const [initialising, setInitialising] = useState(true);

  const loadRememberedCredentials = useCallback(async () => {
    const [storedEmail, storedRemember] = await Promise.all([
      AsyncStorage.getItem(REMEMBER_EMAIL_KEY),
      AsyncStorage.getItem(REMEMBER_ME_KEY),
    ]);

    if (storedEmail) {
      setSavedEmail(storedEmail);
    }
    if (storedRemember) {
      setRememberMe(storedRemember === 'true');
    }
  }, []);

  const persistRememberPreferences = useCallback(
    async (email: string, remember: boolean) => {
      if (remember) {
        await Promise.all([
          AsyncStorage.setItem(REMEMBER_EMAIL_KEY, email),
          AsyncStorage.setItem(REMEMBER_ME_KEY, 'true'),
        ]);
      } else {
        await Promise.all([
          AsyncStorage.removeItem(REMEMBER_EMAIL_KEY),
          AsyncStorage.removeItem(REMEMBER_ME_KEY),
        ]);
      }
    },
    [],
  );

  const checkAuthState = useCallback(async () => {
    try {
      const authenticated = await repository.isAuthenticated();
      if (authenticated) {
        const user = await repository.getCurrentUser();
        if (user) {
          setCurrentUser(user);
        }
      }
    } catch (err) {
      console.warn('useAuthController.checkAuthState error', err);
    } finally {
      setInitialising(false);
    }
  }, [repository]);

  useEffect(() => {
    void loadRememberedCredentials();
    void checkAuthState();
  }, [loadRememberedCredentials, checkAuthState]);

  const login = useCallback(
    async (email: string, password: string, options?: { remember?: boolean }) => {
      setIsLoading(true);
      setError(null);
      try {
        const user = await repository.login(email, password);
        if (!user) {
          setError('Correo o contraseña incorrectos');
          return null;
        }
        setCurrentUser(user);
        const remember = options?.remember ?? rememberMe;
        await persistRememberPreferences(email, remember);
        return user;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(`Error de conexión: ${message}`);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [repository, persistRememberPreferences, rememberMe],
  );

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const user = await repository.signUp(name, email, password);
        if (!user) {
          setError('Error al registrar usuario');
          return null;
        }
        setCurrentUser(user);
        return user;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(`Error de conexión: ${message}`);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [repository],
  );

  const signUpDirect = useCallback(
    async (name: string, email: string, password: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const user = await repository.signUpDirect(name, email, password);
        if (!user) {
          setError('Error al registrar usuario');
          return null;
        }
        setCurrentUser(user);
        return user;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(`Error de conexión: ${message}`);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [repository],
  );

  const verifyEmail = useCallback(
    async (email: string, code: string) => repository.verifyEmail(email, code),
    [repository],
  );

  const forgotPassword = useCallback(
    async (email: string) => repository.forgotPassword(email),
    [repository],
  );

  const resetPassword = useCallback(
    async (token: string, newPassword: string) =>
      repository.resetPassword(token, newPassword),
    [repository],
  );

  const logout = useCallback(async () => {
    try {
      await repository.logout();
    } finally {
      setCurrentUser(null);
    }
  }, [repository]);

  const value = useMemo(
    () => ({
      currentUser,
      isLoading,
      error,
      rememberMe,
      savedEmail,
      initialising,
      setRememberMe,
      setSavedEmail,
      login,
      signUp,
      signUpDirect,
      verifyEmail,
      forgotPassword,
      resetPassword,
      logout,
      checkAuthState,
    }),
    [
      currentUser,
      error,
      forgotPassword,
      initialising,
      isLoading,
      login,
      logout,
      rememberMe,
      resetPassword,
      savedEmail,
      signUp,
      signUpDirect,
      verifyEmail,
      checkAuthState,
    ],
  );

  return value;
}
