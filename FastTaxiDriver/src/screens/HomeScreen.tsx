import React, { useEffect, useState } from "react";
import { View, Text, Button, Alert, StyleSheet, Image, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import axios from "axios"; // Import axios for API calls
import { API_BASE_URL } from "../config/config"; // Replace with your actual API base URL

const HomeScreen = ({ navigate }: { navigate: (screen: string, params?: object) => void }) => {
  const [driverDetails, setDriverDetails] = useState<any>(null);
  const [driverPoints, setDriverPoints] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const { t, i18n } = useTranslation();

  // Load driver details from AsyncStorage
  useEffect(() => {
    const loadDriverDetails = async () => {
      try {
        const storedDetails = await AsyncStorage.getItem("driverInfo");
        if (storedDetails) {
          setDriverDetails(JSON.parse(storedDetails));
        }
      } catch (error) {
        console.error("Error loading driver details:", error);
      }
    };

    loadDriverDetails();
  }, []);

  // Fetch driver points from the server
  useEffect(() => {
    const fetchDriverPoints = async () => {
      if (driverDetails) {
        try {
          const response = await axios.get(`${API_BASE_URL}/driver/details`, {
            params: { driverId: driverDetails.driverId },
          });
  
          // Update state with server response
          setDriverPoints(response.data.points);
          setLastUpdated(response.data.lastPointActivity?.timestamp || null);
  
          // Optionally, update driver details if needed
          setDriverDetails((prevDetails: any) => ({
            ...prevDetails,
            status: response.data.status, // Update status from server
          }));
        } catch (error) {
          console.error("Error fetching driver points:", error);
        }
      }
    };
  
    fetchDriverPoints();
  }, [driverDetails]);

  // Clear driver details from AsyncStorage
  const clearLoginDetails = async () => {
    try {
      await AsyncStorage.removeItem("driverInfo");
      setDriverDetails(null);
      setDriverPoints(null);
      setLastUpdated(null);
      Alert.alert(t("success"), t("login_details_cleared"));
    } catch (error) {
      console.error("Error clearing login details:", error);
    }
  };

  // Toggle language between English and Chinese
  const toggleLanguage = () => {
    const newLanguage = i18n.language === "zh" ? "en" : "zh";
    i18n.changeLanguage(newLanguage);
  };

  return (
    <View style={styles.screen}>
      {/* Language Button */}
      <TouchableOpacity onPress={toggleLanguage} style={styles.languageButton}>
        <Text style={styles.languageButtonText}>
          {i18n.language === "en" ? t("chinese") : t("english")}
        </Text>
      </TouchableOpacity>

      {driverDetails ? (
        <>
          <Text style={styles.title}>{t("welcome")}, {driverDetails.name}!</Text>
          <Text>{t("driver_id")}: {driverDetails.driverId}</Text>
          <Text>{t("name")}: {driverDetails.name}</Text>
          <Text>{t("phone_number")}: {driverDetails.phoneNumber}</Text>
          {driverDetails.driverIdPhotoUri && (
            <Image
              source={{ uri: driverDetails.driverIdPhotoUri }}
              style={styles.photoPreview}
            />
          )}
          {driverPoints !== null && (
            <>
              <Text>{t("driver_points")}: {driverPoints}</Text>
              <Text>{t("last_updated")}: {lastUpdated}</Text>
            </>
          )}
          <Button
            title={t("go_online")}
            onPress={() => navigate("DriverSelectCar", { driverId: driverDetails.driverId })}
          />
          <Button title={t("clear_login_details")} onPress={clearLoginDetails} />
        </>
      ) : (
        <>
          <Text style={styles.title}>{t("welcome_message")}</Text>
          <Button title={t("driver_registration")} onPress={() => navigate("DriverRegistration")} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  photoPreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: "center",
    marginBottom: 16,
  },
  languageButton: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "#ddd",
    padding: 10,
    borderRadius: 5,
  },
  languageButtonText: {
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default HomeScreen;