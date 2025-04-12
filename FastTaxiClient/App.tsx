import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { I18nextProvider } from "react-i18next";
import i18n from "./src/i18n";
import BaseScreen from "./src/screens/BaseScreen";
import WaitingResponseScreen from "./src/screens/WaitingResponseScreen";
import HistoryScreen from "./src/screens/HistoryScreen"; 

const Stack = createStackNavigator();

const App = () => {
  return (
    <I18nextProvider i18n={i18n}> {/* Wrap the app with I18nextProvider */}
      <NavigationContainer>
        <Stack.Navigator initialRouteName="BaseScreen">
          <Stack.Screen
            name="BaseScreen"
            component={BaseScreen}
            options={{ title: "Fast Taxi" }}
          />
          <Stack.Screen
            name="WaitingResponseScreen"
            component={WaitingResponseScreen}
            options={{ title: "Waiting for Driver" }}
          />
          <Stack.Screen
          name="HistoryScreen"
          component={HistoryScreen}
          options={{ title: "Ride History" }}
        />
        </Stack.Navigator>
      </NavigationContainer>
    </I18nextProvider>
  );
};

export default App;