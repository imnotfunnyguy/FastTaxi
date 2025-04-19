import React from "react";
import { View, Text, StyleSheet, ActivityIndicator, Button, Alert } from "react-native";
import { useTranslation } from "react-i18next"; // Import translation hook
import { API_ENDPOINTS } from "../config/config"; // Import the API endpoints

const RequestDetailScreen = ({ route, navigate }: { route: any; navigate: (screen: string, params?: any) => void }) => {
  const { t } = useTranslation(); // Use translation hook

  // Extract client details from route params
  const { clientName, clientPhone } = route.params;

  // Function to handle cancel request
  const handleCancelRequest = () => {
    Alert.alert(
      t("cancel_ride_request"), // Translated title
      t("cancel_ride_request_confirmation"), // Translated confirmation message
      [
        { text: t("no"), style: "cancel" },
        {
          text: t("yes"),
          onPress: async () => {
            try {
              // Send cancel request to the server
              const response = await fetch(API_ENDPOINTS.RIDE_REQUESTS_CANCEL, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  clientName, // Include client name
                  clientPhone, // Include client phone number
                }),
              });

              if (!response.ok) {
                throw new Error(t("cancel_ride_request_failed"));
              }

              // Navigate back to the previous screen
              Alert.alert(t("success"), t("ride_request_canceled"));
              navigate("HomeScreen");
            } catch (error) {
              console.error("Failed to cancel ride request:", error);
              Alert.alert(t("error"), t("cancel_ride_request_failed_retry"));
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerText}>{t("request_details")}</Text>
      </View>

      {/* Main Content */}
      <Text style={styles.text}>{t("waiting_for_driver")}</Text>
      <ActivityIndicator size="large" color="#0000ff" />
      {/* Cancel Request Button */}
      <Button title={t("cancel_request")} onPress={handleCancelRequest} color="#ff0000" />
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
  banner: {
    width: "100%",
    backgroundColor: "#007bff",
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  bannerText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  text: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: "center",
  },
});

export default RequestDetailScreen;