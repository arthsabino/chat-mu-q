"use client";

import { isServer } from "@/util/common";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Theme = "light" | "dark";

interface ThemeContext {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContext | null>(null);
const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (isServer()) return "light";
    return (localStorage.getItem("theme") as Theme) || "light";
  });

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const provideValue = useMemo<ThemeContext>(
    () => ({ theme, setTheme }),
    [theme, setTheme]
  );
  return (
    <ThemeContext.Provider value={provideValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw Error("useTheme must be used within a ThemeProvider");
  return context;
}

export default ThemeProvider;
