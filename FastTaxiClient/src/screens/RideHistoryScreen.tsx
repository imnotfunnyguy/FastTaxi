import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  Modal,
  TouchableOpacity,
  Button,
  TextInput,
} from "react-native";
import { API_BASE_URL } from "../config/config";

const RideHistoryScreen = ({ route, navigate }: { route: any; navigate: (screen: string, params?: any) => void }) => {
  const [phoneNumber, setPhoneNumber] = useState<string | null>(route.params?.phoneNumber || null); // State for phone number
  const [rideHistory, setRideHistory] = useState<any[]>([]); // State to store ride history
  const [loading, setLoading] = useState<boolean>(false); // State to manage loading
  const [selectedRide, setSelectedRide] = useState<any | null>(null); // State for selected ride
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false); // State for modal visibility

  const fetchRideHistory = async () => {
    if (!phoneNumber) {
      Alert.alert("Error", "Phone number is required to fetch ride history.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/rideHistory?phoneNumber=${phoneNumber}`);
      if (!response.ok) {
        throw new Error("Failed to fetch ride history.");
      }
      const data = await response.json();
      setRideHistory(data); // Update ride history state
    } catch (error) {
      console.error("Error fetching ride history:", error);
      Alert.alert("Error", "Failed to fetch ride history. Please try again.");
    } finally {
      setLoading(false); // Stop loading spinner
    }
  };

  useEffect(() => {
    if (phoneNumber) {
      fetchRideHistory();
    }
  }, [phoneNumber]);

  const handleItemPress = (ride: any) => {
    setSelectedRide(ride); // Set the selected ride
    setIsModalVisible(true); // Show the modal
  };

  const closeModal = () => {
    setSelectedRide(null); // Clear the selected ride
    setIsModalVisible(false); // Hide the modal
  };

  const handlePhoneNumberSubmit = () => {
    if (!phoneNumber || phoneNumber.trim() === "") {
      Alert.alert("Error", "Please enter a valid phone number.");
      return;
    }
    fetchRideHistory();
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <View style={styles.backButtonContainer}>
        <Button title="Back" onPress={() => navigate("HomeScreen")} />
      </View>

      {!phoneNumber ? (
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Enter Phone Number:</Text>
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={phoneNumber || ""}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
          <Button title="Submit" onPress={handlePhoneNumberSubmit} />
        </View>
      ) : (
        <>
          <Text style={styles.phoneNumber}>Phone Number: {phoneNumber}</Text>
          <Text style={styles.title}>Ride History</Text>
          {loading ? (
            <Text style={styles.loadingText}>Loading...</Text>
          ) : rideHistory.length > 0 ? (
            <FlatList
              data={rideHistory}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.historyItem}
                  onPress={() => handleItemPress(item)} // Handle item click
                >
                  <Text style={styles.historyText}>Date: {item.date}</Text>
                  <Text style={styles.historyText}>Pickup: {item.pickupLocation}</Text>
                  <Text style={styles.historyText}>Destination: {item.destination}</Text>
                </TouchableOpacity>
              )}
            />
          ) : (
            <Text style={styles.noHistoryText}>No ride history available.</Text>
          )}

          {/* Modal for Ride Details */}
          <Modal
            visible={isModalVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={closeModal}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                {selectedRide && (
                  <>
                    <Text style={styles.modalTitle}>Ride Details</Text>
                    <Text style={styles.modalText}>Date: {selectedRide.date}</Text>
                    <Text style={styles.modalText}>Pickup: {selectedRide.pickupLocation}</Text>
                    <Text style={styles.modalText}>Destination: {selectedRide.destination}</Text>
                    <Text style={styles.modalText}>Driver ID: {selectedRide.driver.driverId}</Text>
                    <Text style={styles.modalText}>Driver Phone: {selectedRide.driver.phoneNumber}</Text>
                    <Text style={styles.modalText}>License Plate: {selectedRide.driver.licensePlate}</Text>
                    <Text style={styles.modalText}>Car Color: {selectedRide.driver.color}</Text>
                    <Text style={styles.modalText}>Car Type: {selectedRide.driver.carType}</Text>
                    <Button title="Close" onPress={closeModal} />
                  </>
                )}
              </View>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  backButtonContainer: {
    position: "absolute",
    top: 50,
    left: 20,
  },
  inputContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    width: "80%",
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  phoneNumber: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  loadingText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  noHistoryText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
    color: "#888",
  },
  historyItem: {
    padding: 16,
    marginBottom: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  historyText: {
    fontSize: 16,
    marginBottom: 4,
    color: "#555",
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
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 8,
  },
});

export default RideHistoryScreen;