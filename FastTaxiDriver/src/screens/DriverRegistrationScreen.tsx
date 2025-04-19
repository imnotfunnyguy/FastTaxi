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
  Modal,
  ActivityIndicator,
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { API_ENDPOINTS } from "../config/config";
import styles from "./DriverRegistrationScreen.styles";

const DriverRegistrationScreen = ({ navigate }: { navigate: (screen: string) => void }) => {
  const { t } = useTranslation();

  // Driver Information State
  const [driverId, setDriverId] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [driverIdPhotoUri, setDriverIdPhotoUri] = useState<string | null>(null);

  // Loading State
  const [isLoading, setIsLoading] = useState(false);

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

    setIsLoading(true); // Show loading spinner

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

      const response = await axios.post(API_ENDPOINTS.DRIVER_REGISTER, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        const driverInfo = { driverId, name, phoneNumber, driverIdPhotoUri };
        await saveDriverInfoToStorage(driverInfo); // Save to storage
        Alert.alert("Success", "Driver registered successfully!");
        setIsLoading(false); // Hide loading spinner
        navigate("Home"); // Redirect to Home screen
      } else {
        Alert.alert("Error", "Failed to register driver.");
        setIsLoading(false); // Hide loading spinner
      }
    } catch (error) {
      console.error("Error registering driver:", error);
      Alert.alert("Error", "An error occurred during registration.");
      setIsLoading(false); // Hide loading spinner
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("driver_registration")}</Text>
        <Image
          source={{ uri: "https://via.placeholder.com/150x50?text=FAST+TAXI" }}
          style={styles.logo}
        />
      </View>
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
      <Button title={t("register")} onPress={handleRegister} />

      {/* Loading Modal */}
      <Modal visible={isLoading} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>{t("registering")}</Text>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default DriverRegistrationScreen;