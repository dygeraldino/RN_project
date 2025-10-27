import { useCallback, useEffect, useState } from "react";
import { ThemeService, themeService } from "../theme/themeService";
import { deleteDatabaseFile } from "../../data/datasources/resetDatabase";

export interface SettingsControllerOptions {
  theme?: ThemeService;
  onLogout?: () => void;
}

export function useSettingsController(options: SettingsControllerOptions = {}) {
  const { theme = themeService, onLogout } = options;
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    void theme.isDark().then(setIsDark);
    unsubscribe = theme.subscribe(setIsDark);
    return () => {
      unsubscribe?.();
    };
  }, [theme]);

  const toggleTheme = useCallback(async () => {
    const next = await theme.toggleTheme();
    setIsDark(next);
  }, [theme]);

  const selectOption = useCallback(
    async (title: string) => {
      if (title === "Cerrar sesión") {
        onLogout?.();
        return;
      }

      if (title === "Almacenamiento") {
        await deleteDatabaseFile();
        return;
      }
    },
    [onLogout]
  );

  return {
    isDark,
    toggleTheme,
    selectOption,
  };
}
