import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import DriverRegistrationScreen from "../screens/DriverRegistrationScreen";
import WaitingForRequestsScreen from "../screens/WaitingForRequestsScreen";

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="DriverRegistrationScreen">
        <Stack.Screen
          name="DriverRegistrationScreen"
          component={DriverRegistrationScreen}
          options={{ title: "Driver Registration" }}
        />
        <Stack.Screen
          name="WaitingForRequestsScreen"
          component={WaitingForRequestsScreen}
          options={{ title: "Waiting for Requests" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;