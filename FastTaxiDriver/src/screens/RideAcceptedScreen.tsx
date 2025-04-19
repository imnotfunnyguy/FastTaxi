import React from "react";
import { View, Text, StyleSheet, Button, Alert } from "react-native";
import axios from "axios";
import { API_BASE_URL } from "../config/config";

const RideAcceptedScreen = ({ route, navigate }: { route: any; navigate: (screen: string, params?: any) => void }) => {
  const { rideRequest, pointsDeducted } = route.params;

  const handleCompleteRide = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/rideRequests/complete`, {
        rideRequestId: rideRequest.id,
        driverId: "123", // Replace with the actual driver ID
      });

      if (response.status === 200) {
        Alert.alert("Success", "Ride completed successfully!");
        navigate("WaitingForRequests", { driverId: "123" }); // Pass driverId back to WaitingForRequestsScreen
      } else {
        Alert.alert("Error", "Failed to complete the ride.");
      }
    } catch (error) {
      console.error("Error completing ride:", error);
      Alert.alert("Error", "An error occurred while completing the ride.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ride Accepted</Text>
      <Text style={styles.text}>Pickup: {rideRequest.pickupLocation}</Text>
      <Text style={styles.text}>Destination: {rideRequest.destinationLocation}</Text>
      <Text style={styles.text}>Required Points: {rideRequest.requiredPoints}</Text>
      <Text style={styles.text}>Points Deducted: {pointsDeducted}</Text>
      <Text style={styles.text}>Remarks: {rideRequest.remarks || "None"}</Text>
      <Text style={styles.text}>
        Requested Car Types: {rideRequest.requestedCarTypes.join(", ")}
      </Text>
      <Button title="Complete Ride" onPress={handleCompleteRide} />
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
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    marginBottom: 8,
  },
});

export default RideAcceptedScreen;