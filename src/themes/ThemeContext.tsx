import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
} from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Themes } from "./themes";

import type { Theme1Colors } from "./theme1/Colors";
import type { Theme1Icons } from "./theme1/Icons";
import type { Theme1Images } from "./theme1/Images";
import type { Theme2Colors } from "./theme2/Colors";
import type { Theme2Icons } from "./theme2/Icons";
import type { Theme2Images } from "./theme2/Images";
import type { Theme3Colors } from "./theme3/Colors";
import type { Theme3Icons } from "./theme3/Icons";
import type { Theme3Images } from "./theme3/Images";
type ThemeKey = "theme1" | "theme2" | "theme3";
type MergedColors = Theme1Colors & Theme2Colors & Theme3Colors;
type MergedIcons = Theme1Icons & Theme2Icons & Theme3Icons;
type MergedImages = Theme1Images & Theme2Images & Theme3Images;

interface ThemeContextType {
  theme: {
    colors: MergedColors;
    icons: MergedIcons;
    images: MergedImages;
  };
  isDarkMode: boolean;
  themeKey: ThemeKey;
  toggleThemeMode: () => void;
  switchThemeKey: (key: ThemeKey) => void;
}
export const ThemeContext = createContext<ThemeContextType | null>(null);
export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemScheme = useColorScheme();
  const [themeKey, setThemeKey] = useState<ThemeKey>("theme1");
  const [isDarkMode, setIsDarkMode] = useState(systemScheme === "dark");
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    async function loadStoredTheme() {
      const storedKey = (await AsyncStorage.getItem("themeKey")) as ThemeKey;
      const storedMode = await AsyncStorage.getItem("themeMode");
      if (storedKey && Themes[storedKey]) setThemeKey(storedKey);
      if (storedMode) setIsDarkMode(storedMode === "dark");
      else setIsDarkMode(systemScheme === "dark");
      setIsReady(true);
    }
    loadStoredTheme();
  }, [systemScheme]);
  const toggleThemeMode = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    await AsyncStorage.setItem("themeMode", newMode ? "dark" : "light");
  };
  const switchThemeKey = async (key: ThemeKey) => {
    setThemeKey(key);
    await AsyncStorage.setItem("themeKey", key);
  };
  const theme = useMemo(
    () => ({
      colors: (isDarkMode
        ? Themes[themeKey].DarkColors
        : Themes[themeKey].colors) as MergedColors,
      icons: Themes[themeKey].icons as MergedIcons,
      images: Themes[themeKey].images as MergedImages,
    }),
    [isDarkMode, themeKey]
  );
  if (!isReady) return null;
  return (
    <ThemeContext.Provider
      value={{ theme, isDarkMode, themeKey, toggleThemeMode, switchThemeKey }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
