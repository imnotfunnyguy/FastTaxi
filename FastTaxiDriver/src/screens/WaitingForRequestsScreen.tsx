import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  FlatList,
  TouchableOpacity,
  Modal,
  Button,
} from "react-native";
import { io } from "socket.io-client";
import { API_BASE_URL } from "../config/config";
import axios from "axios";

const WaitingForRequestsScreen = ({ route, navigate }: { route: any; navigate: (screen: string, params?: any) => void }) => {
  interface RideRequest {
    id: string;
    pickupLocation: string;
    destinationLocation: string;
    requiredPoints: number;
    remarks: string;
    requestedCarTypes: string[];
  }

  const { driverId } = route.params;
  const [rideRequests, setRideRequests] = useState<RideRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<RideRequest | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [driverPoints, setDriverPoints] = useState<number | null>(null);

  useEffect(() => {
    const socket = io(API_BASE_URL);

    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("rideRequest", (data: RideRequest) => {
      setRideRequests((prevRequests) => [...prevRequests, data]);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Fetch driver points and ride requests from the server
  const fetchDriverData = async () => {
    try {
      const driverResponse = await axios.get(`${API_BASE_URL}/driver/points`, {
        params: { driverId: driverId }, // Replace with actual driver ID
      });
      setDriverPoints(driverResponse.data.points);

      const rideRequestsResponse = await axios.get(`${API_BASE_URL}/rideRequests`, {
        params: { driverId: driverId }, // Replace with actual driver ID
      });
      setRideRequests(rideRequestsResponse.data);
    } catch (error) {
      console.error("Error fetching driver data:", error);
      Alert.alert("Error", "Failed to fetch driver data.");
    }
  };

  useEffect(() => {
    fetchDriverData();
    const interval = setInterval(fetchDriverData, 5000); // Auto-refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleRequestPress = (request: RideRequest) => {
    setSelectedRequest(request);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setSelectedRequest(null);
    setIsModalVisible(false);
  };

  const handleAcceptRequest = async () => {
    if (!selectedRequest) return;

    try {
      const response = await axios.post(`${API_BASE_URL}/rideRequests/accept`, {
        rideRequestId: selectedRequest.id,
        driverId: driverId, // Replace with actual driver ID
      });

      if (response.status === 200) {
        Alert.alert("Success", "Ride request accepted!");
        setIsModalVisible(false);
        navigate("RideAccepted", {
                  rideRequest: selectedRequest,
                  pointsDeducted: selectedRequest.requiredPoints,
                });
      } else {
        Alert.alert("Error", "Failed to accept the ride request.");
      }
    } catch (error) {
      console.error("Error accepting ride request:", error);
      Alert.alert("Error", "An error occurred while accepting the ride request.");
    }
  };

  const handleGoOffline = () => {
    Alert.alert("Offline", "You are now offline.");
    navigate("Home");
  };

  return (
    <View style={styles.container}>
      {/* Function Bar */}
      <View style={styles.functionBar}>
        <Text style={styles.pointsText}>
          Points: {driverPoints !== null ? driverPoints : "Loading..."}
        </Text>
        <Button title="Offline" onPress={handleGoOffline} />
        <Button title="Refresh" onPress={fetchDriverData} />
      </View>

      <Text style={styles.title}>Waiting for Ride Requests...</Text>
      <FlatList
        data={rideRequests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.requestItem}
            onPress={() => handleRequestPress(item)}
          >
            <Text style={styles.requestText}>
              Pickup: {item.pickupLocation}
            </Text>
            <Text style={styles.requestText}>
              Destination: {item.destinationLocation}
            </Text>
            <Text style={styles.requestText}>
              Required Points: {item.requiredPoints}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Modal for Additional Details */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedRequest && (
              <>
                <Text style={styles.modalTitle}>Ride Request Details</Text>
                <Text style={styles.modalText}>
                  Pickup: {selectedRequest.pickupLocation}
                </Text>
                <Text style={styles.modalText}>
                  Destination: {selectedRequest.destinationLocation}
                </Text>
                <Text style={styles.modalText}>
                  Required Points: {selectedRequest.requiredPoints}
                </Text>
                <Text style={styles.modalText}>
                  Remarks: {selectedRequest.remarks || "None"}
                </Text>
                <Text style={styles.modalText}>
                  Requested Car Types:{" "}
                  {selectedRequest.requestedCarTypes.join(", ")}
                </Text>
                <Button title="Accept" onPress={handleAcceptRequest} />
                <Button title="Close" onPress={closeModal} />
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 40, // Add padding to push content lower
  },
  functionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 20, // Add margin to separate from the top
  },
  pointsText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 16,
    textAlign: "center",
  },
  requestItem: {
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    backgroundColor: "#f9f9f9",
  },
  requestText: {
    fontSize: 16,
    marginBottom: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 8,
  },
});

export default WaitingForRequestsScreen;