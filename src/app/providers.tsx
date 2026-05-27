"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { createCursorTheme } from "./theme";
import type { ColorMode } from "./theme";

type ProvidersProps = {
  children: ReactNode;
};

type ColorModeContextValue = {
  mode: ColorMode;
  toggleMode: () => void;
};

const ColorModeContext = createContext<ColorModeContextValue | null>(null);

export function useColorMode() {
  const context = useContext(ColorModeContext);

  if (!context) {
    throw new Error("useColorMode must be used within Providers");
  }

  return context;
}

export function Providers({ children }: ProvidersProps) {
  const [mode, setMode] = useState<ColorMode>("light");
  const theme = useMemo(() => createCursorTheme(mode), [mode]);
  const contextValue = useMemo<ColorModeContextValue>(
    () => ({
      mode,
      toggleMode: () => setMode((current) => (current === "light" ? "dark" : "light")),
    }),
    [mode],
  );

  useEffect(() => {
    queueMicrotask(() => {
      const storedMode = window.localStorage.getItem("cursteroids-mode");

      if (storedMode === "light" || storedMode === "dark") {
        setMode(storedMode);
      } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setMode("dark");
      }
    });
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = mode;
    window.localStorage.setItem("cursteroids-mode", mode);
  }, [mode]);

  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ColorModeContext.Provider value={contextValue}>{children}</ColorModeContext.Provider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
