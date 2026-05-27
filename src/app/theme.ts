"use client";

import { createTheme } from "@mui/material/styles";

export type ColorMode = "light" | "dark";

export function createCursorTheme(mode: ColorMode) {
  const isDark = mode === "dark";

  return createTheme({
  palette: {
    mode,
    primary: {
      main: isDark ? "#f4f4f0" : "#111111",
      light: isDark ? "#ffffff" : "#3f3f3f",
      dark: isDark ? "#d8d8d2" : "#000000",
      contrastText: isDark ? "#111111" : "#ffffff",
    },
    secondary: {
      main: isDark ? "#9a9a92" : "#6f6f6f",
      light: isDark ? "#c7c7bf" : "#9a9a9a",
      dark: isDark ? "#686861" : "#303030",
      contrastText: "#ffffff",
    },
    background: {
      default: isDark ? "#151513" : "#f7f7f5",
      paper: isDark ? "#1e1e1b" : "#ffffff",
    },
    text: {
      primary: isDark ? "#f4f4f0" : "#1f1f1f",
      secondary: isDark ? "#a8a8a0" : "#6a6a6a",
    },
    divider: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: "var(--font-geist-sans), Arial, sans-serif",
    h1: {
      fontWeight: 760,
      letterSpacing: "-0.05em",
    },
    h2: {
      fontWeight: 800,
      letterSpacing: "-0.05em",
    },
    button: {
      fontWeight: 650,
      letterSpacing: "-0.01em",
      textTransform: "none",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          boxShadow: "none",
          minHeight: 34,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)"}`,
          boxShadow: isDark ? "0 1px 2px rgba(0, 0, 0, 0.24)" : "0 1px 2px rgba(0, 0, 0, 0.04)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderColor: isDark ? "rgba(255, 255, 255, 0.14)" : "rgba(0, 0, 0, 0.12)",
        },
      },
    },
  },
  });
}
