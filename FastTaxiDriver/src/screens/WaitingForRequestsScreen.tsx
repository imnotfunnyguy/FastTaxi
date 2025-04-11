import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { io } from "socket.io-client";
import { API_BASE_URL } from "../config/config";

const WaitingForRequestsScreen = () => {
  interface RideRequest {
    pickupLocation: string;
    destinationLocation: string;
  }

  const [rideRequest, setRideRequest] = useState<RideRequest | null>(null);

  useEffect(() => {
    const socket = io(API_BASE_URL);

    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("rideRequest", (data) => {
      setRideRequest(data);
      Alert.alert("New Ride Request", `Pickup: ${data.pickupLocation}, Destination: ${data.destinationLocation}`);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Waiting for Ride Requests...</Text>
      {rideRequest && (
        <View style={styles.requestContainer}>
          <Text>Pickup: {rideRequest.pickupLocation}</Text>
          <Text>Destination: {rideRequest.destinationLocation}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  requestContainer: {
    marginTop: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
  },
});

export default WaitingForRequestsScreen;