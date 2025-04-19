import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
  FlatList,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
} from "react-native";
import { useTranslation } from "react-i18next";
import { API_ENDPOINTS, URL_ENDPOINTS, GOOGLE_API_KEY } from "../config/config"; // Import the API endpoints and Google API key
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete"; // Import Google Places Autocomplete

const RideRequestScreen = ({ navigate }: { navigate: (screen: string, params?: any) => void }) => {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [destination, setDestination] = useState("");
  const [carType, setCarType] = useState("");
  const [remark, setRemark] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [availableDrivers, setAvailableDrivers] = useState(0);
  const [messages, setMessages] = useState([]); // State for the list of messages

  const { t, i18n } = useTranslation(); // Use translation hook to get the current language

  // Function to fetch data from the server
  const fetchServerData = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.AVAILABLE_DRIVERS, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch data from the server.");
      }

      const data = await response.json();
      setAvailableDrivers(data.availableDrivers || 0); // Update available drivers
      setMessages(data.messages || []); // Update the list of messages
    } catch (error) {
      console.error("Error fetching data from the server:", error);
      Alert.alert("Error", "Failed to fetch data from the server. Please try again.");
    }
  };

  // Periodically fetch data from the server
  useEffect(() => {
    fetchServerData(); // Fetch data when the screen loads
    const interval = setInterval(fetchServerData, 10000); // Fetch data every 10 seconds
    return () => clearInterval(interval); // Clear interval on component unmount
  }, []);

  const requestRide = async () => {
    if (!name || !phoneNumber || !pickupLocation || !destination || !carType) {
      Alert.alert(t("error"), t("fill_mandatory_fields")); // Use translations for error messages
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("phoneNumber", phoneNumber);
      formData.append("pickupLocation", pickupLocation);
      formData.append("destination", destination);
      formData.append("carType", carType);
      formData.append("remark", remark);
      formData.append("additionalDetails", additionalDetails);

      const response = await fetch(API_ENDPOINTS.RIDE_REQUESTS_REQUEST, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to request ride. Please try again.");
      }

      // Save request details to AsyncStorage
      const requestDetails = {
        name,
        phoneNumber,
        pickupLocation,
        destination,
        carType,
        remark,
        additionalDetails,
      };

      await AsyncStorage.setItem("clientRequestData", JSON.stringify(requestDetails));

      Alert.alert(t("loading"), t("ride_request_sent"));
      navigate("RequestDetailScreen", {
        clientName: name,
        clientPhone: phoneNumber,
      });
    } catch (error) {
      console.error("Failed to request ride", error);
      Alert.alert(t("error"), t("ride_request_failed"));
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* FAST TAXI Logo */}
        <Image
          source={{ uri: URL_ENDPOINTS.PLACEHOLDER }}
          style={styles.logo}
        />

        {/* Scrolling Message List */}
        <View style={styles.messageBar}>
          <FlatList
            data={messages}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <Text style={styles.messageText}>{item}</Text>
            )}
          />
        </View>

        {/* Available Drivers */}
        <Text style={styles.availableDrivers}>
          {t("available_drivers")}: {availableDrivers}
        </Text>

        {/* Phone Number */}
        <Text style={styles.label}>{t("phone_number")}</Text>
        <TextInput
          style={styles.input}
          placeholder={t("enter_phone_number")}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />

        {/* Name */}
        <Text style={styles.label}>{t("name")}</Text>
        <TextInput
          style={styles.input}
          placeholder={t("enter_name")}
          value={name}
          onChangeText={setName}
        />

        {/* Pickup Location */}
        <Text style={styles.label}>{t("pickup_location")}</Text>
        <GooglePlacesAutocomplete
          placeholder={t("enter_pickup_location")}
          onPress={(data, details = null) => {
            setPickupLocation(data.description); // Set the selected pickup location
          }}
          query={{
            key: GOOGLE_API_KEY,
            language: i18n.language, // Dynamically set the language based on the app's current language
          }}
          styles={{
            textInput: styles.input,
          }}
          fetchDetails={true} // Fetch additional details for the selected location
          onFail={(error) => console.error("Google Places Error:", error)} // Handle errors
        />

        {/* Destination */}
        <Text style={styles.label}>{t("destination")}</Text>
        <GooglePlacesAutocomplete
          placeholder={t("enter_destination")}
          onPress={(data, details = null) => {
            setDestination(data.description); // Set the selected destination
          }}
          query={{
            key: GOOGLE_API_KEY,
            language: i18n.language, // Dynamically set the language based on the app's current language
          }}
          styles={{
            textInput: styles.input,
          }}
          fetchDetails={true} // Fetch additional details for the selected location
          onFail={(error) => console.error("Google Places Error:", error)} // Handle errors
        />

        {/* Car Type */}
        <Text style={styles.label}>{t("car_type")}</Text>
        <TextInput
          style={styles.input}
          placeholder={t("enter_car_type")}
          value={carType}
          onChangeText={setCarType}
        />

        {/* Remark */}
        <Text style={styles.label}>{t("remark")}</Text>
        <TextInput
          style={styles.input}
          placeholder={t("enter_remark")}
          value={remark}
          onChangeText={setRemark}
          multiline
        />

        {/* Additional Details */}
        <Text style={styles.label}>{t("additional_details")}</Text>
        <TextInput
          style={styles.input}
          placeholder={t("enter_additional_details")}
          value={additionalDetails}
          onChangeText={setAdditionalDetails}
          multiline
        />

        {/* Request Ride Button */}
        <Button title={t("request_ride")} onPress={requestRide} />
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  logo: {
    width: "100%",
    height: 50,
    resizeMode: "contain",
    marginBottom: 16,
  },
  messageBar: {
    backgroundColor: "#f8d7da",
    padding: 10,
    borderRadius: 4,
    marginBottom: 16,
    maxHeight: 100, // Limit the height of the message bar
  },
  messageText: {
    color: "#721c24",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  availableDrivers: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "green",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
});

export default RideRequestScreen;