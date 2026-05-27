"use client";

import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import Button from "@mui/material/Button";
import { useColorMode } from "@/app/providers";

export function ThemeModeToggle() {
  const { mode, toggleMode } = useColorMode();
  const isDark = mode === "dark";

  return (
    <Button
      variant="outlined"
      size="small"
      onClick={toggleMode}
      startIcon={isDark ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {isDark ? "Light" : "Dark"}
    </Button>
  );
}
