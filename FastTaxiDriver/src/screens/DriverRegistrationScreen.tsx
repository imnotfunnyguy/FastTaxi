import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, TouchableOpacity, ScrollView, FlatList } from "react-native";
import { Picker } from "@react-native-picker/picker"; // Import Picker
import axios from "axios";
import { API_ENDPOINTS } from "../config/config";
import { useTranslation } from "react-i18next";
import { launchImageLibrary } from "react-native-image-picker";

const DriverRegistrationScreen = ({ navigation }: any) => {
  const { t } = useTranslation();

  // Driver Information State
  const [driverId, setDriverId] = useState("");
  const [name, setName] = useState("");
  const [driverIdPhotoUri, setDriverIdPhotoUri] = useState<string | null>(null);

  // Car Information State
  const [cars, setCars] = useState<any[]>([]); // List of cars
  const [selectedCarIndex, setSelectedCarIndex] = useState<number | null>(null); // Index of the selected car
  const [licensePlate, setLicensePlate] = useState("");
  const [color, setColor] = useState("red"); // Default color is "red"
  const [carType, setCarType] = useState("4 seats"); // Default car type is "4 seats"

  // Handle Driver ID Photo Selection
  const handleSelectDriverIdPhoto = () => {
    launchImageLibrary(
      {
        mediaType: "photo",
        maxWidth: 500,
        maxHeight: 500,
        quality: 0.8,
      },
      (response) => {
        if (response.didCancel) {
          console.log("User cancelled image picker");
        } else if (response.errorCode) {
          console.error("ImagePicker Error: ", response.errorMessage);
          Alert.alert("Error", "Failed to select image. Please try again.");
        } else if (response.assets && response.assets.length > 0) {
          const selectedPhoto = response.assets[0];
          setDriverIdPhotoUri(selectedPhoto.uri || null);
        }
      }
    );
  };

  // Add or Update Car
  const handleAddOrUpdateCar = () => {
    if (!licensePlate || !color || !carType) {
      Alert.alert("Error", "License Plate, Color, and Car Type are mandatory.");
      return;
    }

    const newCar = { licensePlate, color, carType };

    if (selectedCarIndex !== null) {
      // Update existing car
      const updatedCars = [...cars];
      updatedCars[selectedCarIndex] = newCar;
      setCars(updatedCars);
      Alert.alert("Success", "Car details updated!");
    } else {
      // Add new car
      setCars([...cars, newCar]);
      Alert.alert("Success", "Car added!");
    }

    // Clear inputs
    setLicensePlate("");
    setColor("red"); // Reset to default color
    setCarType("4 seats"); // Reset to default car type
    setSelectedCarIndex(null);
  };

  // Select Car
  const handleSelectCar = (index: number) => {
    const car = cars[index];
    setLicensePlate(car.licensePlate);
    setColor(car.color);
    setCarType(car.carType);
    setSelectedCarIndex(index);
  };

  // Remove Car
  const handleRemoveCar = (index: number) => {
    const updatedCars = cars.filter((_, i) => i !== index);
    setCars(updatedCars);
    Alert.alert("Success", "Car removed!");
  };

  // Handle Form Submission
  const handleRegister = async () => {
    // Validate Driver Information
    if (!driverId || !name || !driverIdPhotoUri) {
      Alert.alert("Error", "Driver ID, Name, and Driver ID Photo are mandatory.");
      return;
    }

    // Validate Car Information
    if (cars.length === 0) {
      Alert.alert("Error", "At least one car must be added.");
      return;
    }

    try {
      const formData = new FormData();
      // Driver Information
      formData.append("driverId", driverId);
      formData.append("name", name);
      formData.append("driverIdPhoto", {
        uri: driverIdPhotoUri,
        type: "image/jpeg",
        name: `${driverId}_id_photo.jpg`,
      });

      // Car Information
      formData.append("cars", JSON.stringify(cars)); // Send cars as a JSON string

      console.log("Form Data:", formData);

      const response = await axios.post(API_ENDPOINTS.DRIVER_REGISTER, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        Alert.alert("Success", "Driver registered successfully!");
        navigation.navigate("WaitingForRequestsScreen");
      } else {
        Alert.alert("Error", "Failed to register driver.");
      }
    } catch (error) {
      console.error("Error registering driver:", error);
      Alert.alert("Error", "An error occurred during registration.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{t("driver_registration")}</Text>

      {/* Driver Information Section */}
      <Text style={styles.sectionTitle}>{t("driver_information")}</Text>
      <TextInput
        style={styles.input}
        placeholder={t("driver_id")}
        value={driverId}
        onChangeText={setDriverId}
      />
      <TextInput
        style={styles.input}
        placeholder={t("name")}
        value={name}
        onChangeText={setName}
      />
      <TouchableOpacity style={styles.photoButton} onPress={handleSelectDriverIdPhoto}>
        <Text style={styles.photoButtonText}>
          {driverIdPhotoUri ? t("change_driver_id_photo") : t("add_driver_id_photo")}
        </Text>
      </TouchableOpacity>
      {driverIdPhotoUri && <Image source={{ uri: driverIdPhotoUri }} style={styles.photoPreview} />}

      {/* Car Information Section */}
      <Text style={styles.sectionTitle}>{t("car_information")}</Text>
      <FlatList
        data={cars}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={[styles.carItem, selectedCarIndex === index && styles.selectedCar]}>
            <Text>{`${item.licensePlate} - ${item.color} - ${item.carType}`}</Text>
            <View style={styles.carActions}>
              <Button title={t("edit")} onPress={() => handleSelectCar(index)} />
              <Button title={t("remove")} onPress={() => handleRemoveCar(index)} />
            </View>
          </View>
        )}
      />
      <TextInput
        style={styles.input}
        placeholder={t("license_plate")}
        value={licensePlate}
        onChangeText={setLicensePlate}
      />
      <Text style={styles.label}>{t("color")}</Text>
      <Picker
        selectedValue={color}
        onValueChange={(itemValue) => setColor(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Red" value="red" />
        <Picker.Item label="Green" value="green" />
        <Picker.Item label="Blue" value="blue" />
      </Picker>
      <Text style={styles.label}>{t("car_type")}</Text>
      <Picker
        selectedValue={carType}
        onValueChange={(itemValue) => setCarType(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="4 Seats" value="4 seats" />
        <Picker.Item label="5 Seats" value="5 seats" />
        <Picker.Item label="4 Seat Comfort" value="4 seat comfort" />
      </Picker>
      <Button title={selectedCarIndex !== null ? t("update_car") : t("add_car")} onPress={handleAddOrUpdateCar} />

      <Button title={t("register")} onPress={handleRegister} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginBottom: 16,
    borderRadius: 4,
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 16,
  },
  photoButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 4,
    marginBottom: 16,
  },
  photoButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  photoPreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: "center",
    marginBottom: 16,
  },
  carItem: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    marginBottom: 8,
  },
  selectedCar: {
    borderColor: "#007bff",
    backgroundColor: "#e6f7ff",
  },
  carActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
});

export default DriverRegistrationScreen;