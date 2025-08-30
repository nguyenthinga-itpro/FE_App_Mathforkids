import {
  setTheme,
  setMode,
  setLanguage,
  setVolume,
} from "../redux/settingsSlice";

export const applySettings = ({
  theme,
  mode,
  language,
  volume,
  switchThemeKey,
  toggleThemeMode,
  isDarkMode,
  setVolume: setAppVolume,
  i18n,
  dispatch,
}) => {
  const themeKey =
    theme === 1
      ? "theme1"
      : theme === 2
      ? "theme2"
      : theme === 3
      ? "theme3"
      : "theme1";
  switchThemeKey(themeKey);

  if ((mode === "dark") !== isDarkMode) toggleThemeMode();

  if (language && i18n.language !== language) {
    i18n.changeLanguage(language);
  }

  if (typeof volume === "number") {
    setAppVolume(volume / 100);
  }

  //Đồng bộ Redux global settings
  if (dispatch) {
    if (theme) dispatch(setTheme(theme));
    if (mode) dispatch(setMode(mode));
    if (language) dispatch(setLanguage(language));
    if (typeof volume === "number") dispatch(setVolume(volume));
  }
};
