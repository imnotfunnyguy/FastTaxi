import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Modal,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
import { API_ENDPOINTS } from "../config/config";
import { useTranslation } from "react-i18next";
import { launchImageLibrary } from "react-native-image-picker";
import styles from "./DriverRegistrationScreen.styles"; // Import the styles

const DriverRegistrationScreen = ({ navigation }: any) => {
  const { t, i18n } = useTranslation();

  // Function to toggle language
  const toggleLanguage = () => {
    const newLanguage = i18n.language === "en" ? "zh" : "en"; // Switch between English and Chinese
    i18n.changeLanguage(newLanguage);
  };

  // Driver Information State
  const [driverId, setDriverId] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [driverIdPhotoUri, setDriverIdPhotoUri] = useState<string | null>(null);

  // Car Information State
  const [cars, setCars] = useState<any[]>([]);
  const [selectedCarIndex, setSelectedCarIndex] = useState<number | null>(null);
  const [licensePlate, setLicensePlate] = useState("");
  const [color, setColor] = useState("red");
  const [carType, setCarType] = useState("4 seats");

  // State to track if driver is already registered
  const [isRegistered, setIsRegistered] = useState(false);

  // Modal State
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Load Driver Information from Storage
  useEffect(() => {
    const loadDriverInfo = async () => {
      try {
        const storedDriverInfo = await AsyncStorage.getItem("driverInfo");
        if (storedDriverInfo) {
          const parsedDriverInfo = JSON.parse(storedDriverInfo);
          setDriverId(parsedDriverInfo.driverId);
          setName(parsedDriverInfo.name);
          setPhoneNumber(parsedDriverInfo.phoneNumber);
          setDriverIdPhotoUri(parsedDriverInfo.driverIdPhotoUri);
          setCars(parsedDriverInfo.cars || []);
          setIsRegistered(true); // Mark as registered
        }
      } catch (error) {
        console.error("Error loading driver info from storage:", error);
      }
    };

    loadDriverInfo();
  }, []);

  // Save Driver Information to Storage
  const saveDriverInfoToStorage = async (driverInfo: any) => {
    try {
      await AsyncStorage.setItem("driverInfo", JSON.stringify(driverInfo));
    } catch (error) {
      console.error("Error saving driver info to storage:", error);
    }
  };

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

  // Handle Form Submission for Registration
  const handleRegister = async () => {
    if (!driverId || !name || !phoneNumber || !driverIdPhotoUri) {
      Alert.alert("Error", "Driver ID, Name, Phone Number, and Driver ID Photo are mandatory.");
      return;
    }

    if (cars.length === 0) {
      Alert.alert("Error", "At least one car must be added.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("driverId", driverId);
      formData.append("name", name);
      formData.append("phoneNumber", phoneNumber);
      formData.append("driverIdPhoto", {
        uri: driverIdPhotoUri,
        type: "image/jpeg",
        name: `${driverId}_id_photo.jpg`,
      });
      formData.append("cars", JSON.stringify(cars));

      const response = await axios.post(API_ENDPOINTS.DRIVER_REGISTER, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        const driverInfo = { driverId, name, driverIdPhotoUri, cars };
        await saveDriverInfoToStorage(driverInfo); // Save to storage
        Alert.alert("Success", "Driver registered successfully!");
        setIsRegistered(true); // Mark as registered
      } else {
        Alert.alert("Error", "Failed to register driver.");
      }
    } catch (error) {
      console.error("Error registering driver:", error);
      Alert.alert("Error", "An error occurred during registration.");
    }
  };

  // Function to handle adding a car
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
    setIsModalVisible(false); // Close the modal
  };

  // Function to remove a car
  const handleRemoveCar = (index: number) => {
    const updatedCars = cars.filter((_, i) => i !== index);
    setCars(updatedCars);
  };

  // Handle Go Online
  const handleGoOnline = () => {
    navigation.navigate("WaitingForRequestsScreen");
  };

  // Function to clear form and logged-in details
  const clearForm = async () => {
    setDriverId("");
    setName("");
    setPhoneNumber("");
    setDriverIdPhotoUri(null);
    setCars([]);
    setIsRegistered(false);
    await AsyncStorage.removeItem("driverInfo");
    Alert.alert(t("success"), t("form_cleared"));
  };

  // Add logo and buttons to the navigation bar
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Image
          source={{ uri: "https://via.placeholder.com/150x50?text=FAST+TAXI" }}
          style={styles.logo}
        />
      ),
      headerRight: () => (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={toggleLanguage} style={styles.languageButton}>
            <Text style={styles.languageButtonText}>
              {i18n.language === "en" ? "中文" : "EN"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={clearForm} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>{t("clear")}</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, i18n.language]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{t("driver_registration")}</Text>

      {isRegistered ? (
        <>
          {/* Display Registered Driver Information */}
          <Text style={styles.sectionTitle}>{t("driver_information")}</Text>
          <Text>{t("driver_id")}: {driverId}</Text>
          <Text>{t("name")}: {name}</Text>
          <Text>{t("phone_number")}: {phoneNumber}</Text>
          {driverIdPhotoUri && <Image source={{ uri: driverIdPhotoUri }} style={styles.photoPreview} />}
          <View style={styles.carInfoHeader}>
            <Text style={styles.sectionTitle}>{t("car_information")}</Text>
            <TouchableOpacity onPress={() => setIsModalVisible(true)} style={styles.addButton}>
              <Text style={styles.addButtonText}>{t("add")}</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={cars}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                onPress={() => setSelectedCarIndex(index)} // Update selectedCarIndex
                style={[
                  styles.carItem,
                  selectedCarIndex === index && styles.selectedCarItem, // Highlight selected item
                ]}
              >
                <Text>{`${item.licensePlate} - ${item.color} - ${item.carType}`}</Text>
                <TouchableOpacity onPress={() => handleRemoveCar(index)} style={styles.removeButton}>
                  <Text style={styles.removeButtonText}>{t("remove")}</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />
          <Button title={t("go_online")} onPress={handleGoOnline} />
        </>
      ) : (
        <>
          {/* Display Blank Registration Fields */}
          {/* Driver Information */}
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
          <TextInput
            style={styles.input}
            placeholder={t("phone_number")}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
          <TouchableOpacity style={styles.photoButton} onPress={handleSelectDriverIdPhoto}>
            <Text style={styles.photoButtonText}>
              {driverIdPhotoUri ? t("change_driver_id_photo") : t("add_driver_id_photo")}
            </Text>
          </TouchableOpacity>
          {driverIdPhotoUri && <Image source={{ uri: driverIdPhotoUri }} style={styles.photoPreview} />}
          {/* Car Information */}
          <View style={styles.carInfoHeader}>
            <Text style={styles.sectionTitle}>{t("car_information")}</Text>
            <TouchableOpacity onPress={() => setIsModalVisible(true)} style={styles.addButton}>
              <Text style={styles.addButtonText}>{t("add")}</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={cars}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item, index }) => (
              <View style={styles.carItem}>
                <Text>{`${item.licensePlate} - ${item.color} - ${item.carType}`}</Text>
                <TouchableOpacity onPress={() => handleRemoveCar(index)} style={styles.removeButton}>
                  <Text style={styles.removeButtonText}>{t("remove")}</Text>
                </TouchableOpacity>
              </View>
            )}
          />

          {/* Add Car Modal */}
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
          <Button title={t("register")} onPress={handleRegister} />
        </>
      )}
    </ScrollView>
  );
};

export default DriverRegistrationScreen;