import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import { API_ENDPOINTS, URL_ENDPOINTS } from "../config/config";

const HomeScreen = ({ navigate }: { navigate: (screen: string, params?: any) => void }) => {
  const { t, i18n } = useTranslation(); // Use i18next for translations
  const [hasRequestData, setHasRequestData] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null); // State for phone number

  useEffect(() => {
    const checkRequestData = async () => {
      try {
        const requestData = await AsyncStorage.getItem("clientRequestData");
        setHasRequestData(!!requestData); // Set to true if data exists
        
        // Fetch phone number from AsyncStorage
        const storedPhoneNumber = await AsyncStorage.getItem("phoneNumber");
        setPhoneNumber(storedPhoneNumber);
      } catch (error) {
        console.error("Error checking request data:", error);
      }
    };

    checkRequestData();
  }, []);

  const toggleLocale = () => {
    const newLocale = i18n.language === "en" ? "zh" : "en"; // Toggle between English and Spanish
    i18n.changeLanguage(newLocale); // Change the language
  };

  return (
    <View style={styles.container}>
      {/* Locale Switch Button */}
      <View style={styles.localeButtonContainer}>
        <Button title={t("toggle_language")} onPress={toggleLocale} />
      </View>

      {/* Fast Taxi Logo */}
      <Image
        source={{ uri: URL_ENDPOINTS.PLACEHOLDER}} // Replace with actual logo URL
        style={styles.logo}
      />
      <Text style={styles.title}>{t("welcome_message")}</Text>
        {hasRequestData ? (
            <>
            <Text style={styles.title}>{t("pending_request")}</Text>
            <Button
                title={t("view_request_details")}
                onPress={() => navigate("RequestDetailScreen")}
            />
            </>
        ) : null }
        <Button
            title={t("view_history")}
            onPress={() => navigate("RideHistoryScreen", { phoneNumber })} // Pass phone number
        />
        <Button
            title={t("make_request")}
            onPress={() => navigate("RideRequestScreen")} // Navigate to RideRequestScreen
        />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: "center",
  },
  localeButtonContainer: {
    position: "absolute",
    top: 50,
    left: 16,
  },
  logo: {
    width: 150,
    height: 50,
    resizeMode: "contain",
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
});

export default HomeScreen;