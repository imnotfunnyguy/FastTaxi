import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { I18nextProvider } from "react-i18next";
import i18n from "./src/i18n";
import HomeScreen from "./src/screens/HomeScreen"; // New HomeScreen
import RideRequestcreen from "./src/screens/RideRequestScreen"; // Renamed BaseScreen
import RequestDetailScreen from "./src/screens/RequestDetailScreen";
import RideHistoryScreen from "./src/screens/RideHistoryScreen";

const App = () => {
  const [currentScreen, setCurrentScreen] = useState("HomeScreen"); // Default to HomeScreen
  const [screenParams, setScreenParams] = useState<any>(null); // State for passing parameters

  const navigate = (screen: string, params?: any) => {
    setCurrentScreen(screen);
    setScreenParams(params || null);
  };

  return (
    <I18nextProvider i18n={i18n}>
      <View style={styles.container}>
        {currentScreen === "HomeScreen" && (
          <HomeScreen navigate={navigate} />
        )}
        {currentScreen === "RideRequestcreen" && (
          <RideRequestcreen navigate={navigate} />
        )}
        {currentScreen === "RequestDetailScreen" && (
          <RequestDetailScreen navigate={navigate} route={{ params: screenParams }} />
        )}
        {currentScreen === "RideHistoryScreen" && (
          <RideHistoryScreen navigate={navigate} route={{ params: screenParams }} />
        )}
      </View>
    </I18nextProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;