import React, { useEffect } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store, persistor } from "./src/redux/store";
import { PersistGate } from "redux-persist/integration/react";
import AppNavigator from "./src/AppNavigator";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { SoundProvider } from "./src/audio/SoundContext";
import { ThemeProvider } from "./src/themes/ThemeContext";
import { Provider as PaperProvider } from "react-native-paper";
import { ActivityIndicator } from "react-native";
import "./src/i18n";
import { NavigationContainer } from "@react-navigation/native";
import AuthChecker from "./src/components/AuthChecker";
import { navigationRef } from "./src/components/navigationRef";
SplashScreen.preventAutoHideAsync();
import { LogBox } from "react-native";

LogBox.ignoreLogs(["ForwardRef: Support for defaultProps will be removed"]);

export default function App() {
  const [fontsLoaded] = useFonts({
    "Nunito-Black": require("./assets/fonts/Nunito-Black.ttf"),
    "Nunito-BlackItalic": require("./assets/fonts/Nunito-BlackItalic.ttf"),
    "Nunito-Bold": require("./assets/fonts/Nunito-Bold.ttf"),
    "Nunito-BoldItalic": require("./assets/fonts/Nunito-BoldItalic.ttf"),
    "Nunito-ExtraBold": require("./assets/fonts/Nunito-ExtraBold.ttf"),
    "Nunito-ExtraBoldItalic": require("./assets/fonts/Nunito-ExtraBoldItalic.ttf"),
    "Nunito-ExtraLight": require("./assets/fonts/Nunito-ExtraLight.ttf"),
    "Nunito-ExtraLightItalic": require("./assets/fonts/Nunito-ExtraLightItalic.ttf"),
    "Nunito-Italic": require("./assets/fonts/Nunito-Italic.ttf"),
    "Nunito-Light": require("./assets/fonts/Nunito-Light.ttf"),
    "Nunito-LightItalic": require("./assets/fonts/Nunito-LightItalic.ttf"),
    "Nunito-Medium": require("./assets/fonts/Nunito-Medium.ttf"),
    "Nunito-MediumItalic": require("./assets/fonts/Nunito-MediumItalic.ttf"),
    "Nunito-Regular": require("./assets/fonts/Nunito-Regular.ttf"),
    "Nunito-SemiBold": require("./assets/fonts/Nunito-SemiBold.ttf"),
    "Nunito-SemiBoldItalic": require("./assets/fonts/Nunito-SemiBoldItalic.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <PersistGate
        loading={<ActivityIndicator size="large" />}
        persistor={persistor}
      >
        <ThemeProvider>
          <PaperProvider>
            <SoundProvider>
              <NavigationContainer ref={navigationRef}>
                <AuthChecker />
                <AppNavigator />
              </NavigationContainer>
            </SoundProvider>
          </PaperProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}
