import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { useAuthController } from '../hooks/useAuthController';

type AuthMode = 'login' | 'signup';

type ControllerValue = ReturnType<typeof useAuthController>;

export type AuthContextValue = ControllerValue & {
  mode: AuthMode;
  setMode: (mode: AuthMode) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const controller = useAuthController();
  const [mode, setModeState] = useState<AuthMode>('login');

  const setMode = (next: AuthMode) => {
    setModeState(next);
  };

  const value: AuthContextValue = useMemo(
    () => ({
      ...controller,
      mode,
      setMode,
    }),
    [controller, mode],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
