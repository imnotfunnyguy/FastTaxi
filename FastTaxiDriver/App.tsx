import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { I18nextProvider } from "react-i18next";
import i18n from "./src/i18n";
import HomeScreen from "./src/screens/HomeScreen";
import DriverRegistrationScreen from "./src/screens/DriverRegistrationScreen";
import DriverSelectCarScreen from "./src/screens/DriverSelectCarScreen";
import WaitingForRequestsScreen from "./src/screens/WaitingForRequestsScreen";
import RideAcceptedScreen from "./src/screens/RideAcceptedScreen"; // Import the new screen

const App = () => {
  const [currentScreen, setCurrentScreen] = useState("Home");
  const [screenParams, setScreenParams] = useState<any>(null);

  const navigate = (screen: string, params?: any) => {
    setCurrentScreen(screen);
    setScreenParams(params || null);
  };

  return (
    <I18nextProvider i18n={i18n}>
      <View style={{ flex: 1 }}>
        {currentScreen === "Home" && (
          <HomeScreen navigate={navigate} />
        )}
        {currentScreen === "DriverRegistration" && (
          <DriverRegistrationScreen navigate={navigate} />
        )}
        {currentScreen === "DriverSelectCar" && (
          <DriverSelectCarScreen navigate={navigate} route={{ params: screenParams }} />
        )}
        {currentScreen === "WaitingForRequests" && (
          <WaitingForRequestsScreen navigate={navigate} route={{ params: screenParams }}/>
        )}
        {currentScreen === "RideAccepted" && (
          <RideAcceptedScreen navigate={navigate} route={{ params: screenParams }} />
        )}
      </View>
    </I18nextProvider>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});

export default App;