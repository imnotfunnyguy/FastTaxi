import React from "react";
import { View, Text, StyleSheet, ActivityIndicator, Button, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { API_ENDPOINTS } from "../config/config"; // Import the API endpoints

const WaitingResponseScreen = ({ route }) => {
  const navigation = useNavigation();

  // Extract client details from route params
  const { clientName, clientPhone } = route.params;

  // Function to handle cancel request
  const handleCancelRequest = () => {
    Alert.alert(
      "Cancel Ride Request",
      "Are you sure you want to cancel the ride request?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            try {
              // Send cancel request to the server
              const response = await fetch(API_ENDPOINTS.CANCEL_RIDE, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  clientName, // Include client name
                  clientPhone, // Include client phone number
                }),
              });

              if (!response.ok) {
                throw new Error("Failed to cancel the ride request.");
              }

              // Navigate back to the previous screen
              Alert.alert("Success", "Ride request has been canceled.");
              navigation.goBack();
            } catch (error) {
              console.error("Failed to cancel ride request:", error);
              Alert.alert("Error", "Failed to cancel the ride request. Please try again.");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Waiting for a driver to accept your request...</Text>
      <ActivityIndicator size="large" color="#0000ff" />
      {/* Cancel Request Button */}
      <Button title="Cancel Request" onPress={handleCancelRequest} color="#ff0000" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  text: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: "center",
  },
});

export default WaitingResponseScreen;