import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";

const DriverSelectCarScreen = ({ route, navigate }: { route: any; navigate: (screen: string, params?: any) => void }) => {
  const { t } = useTranslation();
  const [cars, setCars] = useState<any[]>([]);
  const [licensePlate, setLicensePlate] = useState("");
  const [color, setColor] = useState("red");
  const [carType, setCarType] = useState("4 seats");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [driverId, setDriverId] = useState<string | null>(null);
  const [selectedCarIndex, setSelectedCarIndex] = useState<number | null>(null); // Track selected car index

  useEffect(() => {
    const loadCars = async () => {
      try {
        const storedDriverInfo = await AsyncStorage.getItem("driverInfo");
        if (storedDriverInfo) {
          const parsedDriverInfo = JSON.parse(storedDriverInfo);
          setCars(parsedDriverInfo.cars || []);
          setDriverId(parsedDriverInfo.driverId); // Load driverId from storage
        }
      } catch (error) {
        console.error("Error loading cars from storage:", error);
      }
    };

    loadCars();
  }, []);

  const handleAddCar = () => {
    if (!licensePlate) {
      Alert.alert(t("error"), t("error_license_plate_required"));
      return;
    }

    const newCar = { licensePlate, color, carType };
    setCars([...cars, newCar]);
    setLicensePlate("");
    setColor("red");
    setCarType("4 seats");
    setIsModalVisible(false);
  };

  const handleRemoveCar = (index: number) => {
    const updatedCars = cars.filter((_, i) => i !== index);
    setCars(updatedCars);
    if (selectedCarIndex === index) {
      setSelectedCarIndex(null); // Deselect car if it was removed
    }
  };

  const handleGoOnline = () => {
    if (selectedCarIndex === null) {
      Alert.alert(t("error"), t("error_select_car"));
      return;
    }

    if (!driverId) {
      Alert.alert(t("error"), t("error_driver_id_missing"));
      return;
    }

    const selectedCar = cars[selectedCarIndex];
    navigate("WaitingForRequests", { driverId, selectedCar });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("select_car")}</Text>
      <FlatList
        data={cars}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[
              styles.carItem,
              selectedCarIndex === index && styles.selectedCarItem, // Highlight selected car
            ]}
            onPress={() => setSelectedCarIndex(index)} // Select car on press
          >
            <Text>{`${item.licensePlate} - ${item.color} - ${item.carType}`}</Text>
          </TouchableOpacity>
        )}
      />
      <Button title={t("add_car")} onPress={() => setIsModalVisible(true)} />
      <Button
        title={t("go_online")}
        onPress={handleGoOnline}
        disabled={selectedCarIndex === null} // Disable button if no car is selected
      />

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.sectionTitle}>{t("add_car")}</Text>
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
            <Button title={t("add_car")} onPress={handleAddCar} />
            <Button title={t("cancel")} onPress={() => setIsModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  carItem: {
    padding: 15,
    marginVertical: 5,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
  },
  selectedCarItem: {
    backgroundColor: "#d0f0c0", // Highlight color for selected car
    borderColor: "#4caf50",
    borderWidth: 2,
  },
  removeButton: {
    backgroundColor: "red",
    padding: 5,
    borderRadius: 5,
    marginTop: 5,
  },
  removeButtonText: {
    color: "white",
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
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  picker: {
    marginBottom: 10,
  },
});

export default DriverSelectCarScreen;