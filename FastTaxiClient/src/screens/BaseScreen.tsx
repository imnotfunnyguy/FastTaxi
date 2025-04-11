import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Geolocation from "react-native-geolocation-service";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { PermissionsAndroid, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import i18n from "../i18n"; // Import i18n instance
import { GOOGLE_MAPS_API_KEY } from "@env";
import { API_ENDPOINTS } from "../config/config"; // Import the API endpoints

const BaseScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [destination, setDestination] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [isPickupAutocompleteActive, setIsPickupAutocompleteActive] = useState(false); // Track if Pickup Location is in autocomplete mode
  
  const { t } = useTranslation(); // Access the translation function

  // Function to toggle language
  const toggleLanguage = () => {
    const newLanguage = i18n.language === "en" ? "zh" : "en"; // Switch between English and Chinese
    i18n.changeLanguage(newLanguage);
  };
  
  // Load saved data on app start
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedName = await AsyncStorage.getItem("name");
        const savedPhoneNumber = await AsyncStorage.getItem("phoneNumber");
        const savedPickupLocation = await AsyncStorage.getItem("pickupLocation");
        const savedDestination = await AsyncStorage.getItem("destination");
        const savedAdditionalDetails = await AsyncStorage.getItem("additionalDetails");

        if (savedName) setName(savedName);
        if (savedPhoneNumber) setPhoneNumber(savedPhoneNumber);
        if (savedPickupLocation) setPickupLocation(savedPickupLocation);
        if (savedDestination) setDestination(savedDestination);
        if (savedAdditionalDetails) setAdditionalDetails(savedAdditionalDetails);
      } catch (error) {
        console.error("Failed to load data", error);
      }
    };

    loadData();
  }, []);

  // Save data to AsyncStorage
  const saveData = async () => {
    try {
      await AsyncStorage.setItem("name", name);
      await AsyncStorage.setItem("phoneNumber", phoneNumber);
      await AsyncStorage.setItem("pickupLocation", pickupLocation);
      await AsyncStorage.setItem("destination", destination);
      await AsyncStorage.setItem("additionalDetails", additionalDetails);
      Alert.alert("Success", "Your details have been saved!");
    } catch (error) {
      console.error("Failed to save data", error);
      Alert.alert("Error", "Failed to save your details.");
    }
  };

  // Fetch current location and convert to address
interface FetchCurrentLocationProps {
    setLocation: (location: string) => void;
}

const fetchCurrentLocation = async ({ setLocation }: FetchCurrentLocationProps): Promise<void> => {
    try {
        if (Platform.OS === "android") {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: "Location Permission",
                    message: "We need access to your location to provide pickup and destination services.",
                    buttonNeutral: "Ask Me Later",
                    buttonNegative: "Cancel",
                    buttonPositive: "OK",
                }
            );

            if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                Alert.alert("Permission Denied", "Location permission is required.");
                return;
            }
        }

        Geolocation.getCurrentPosition(
            async (position: Geolocation.GeoPosition) => {
                const { latitude, longitude } = position.coords;

                try {
                    // Use Google Maps Geocoding API to convert coordinates to an address
                    const response = await fetch(
                        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
                    );
                    const data: {
                        results: { formatted_address: string }[];
                    } = await response.json();

                    if (data.results && data.results.length > 0) {
                        // Use the first result's formatted address
                        setLocation(data.results[0].formatted_address);
                    } else {
                        // If no address is found, use the coordinates as the location
                        setLocation(`Lat: ${latitude}, Lng: ${longitude}`);
                    }
                } catch (error) {
                    console.error("Failed to fetch address from Google Geocoding API", error);
                    // Fallback to coordinates if the API call fails
                    setLocation(`Lat: ${latitude}, Lng: ${longitude}`);
                }
            },
            (error: Geolocation.GeoError) => {
                Alert.alert("Error", "Failed to fetch current location.");
                console.error(error);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    } catch (error) {
        console.error("Failed to request location permission", error);
    }
};

const requestRide = async () => {
    // Validate mandatory fields
    if (!name || !phoneNumber || !pickupLocation || !destination) {
      Alert.alert("Error", "Please fill in all mandatory fields.");
      return;
    }
  
    try {
      // Save the current data in the background
      await saveData();
      console.log(API_ENDPOINTS.REQUEST_RIDE);
      // Send the request to the server
      const response = await fetch(API_ENDPOINTS.REQUEST_RIDE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          phoneNumber,
          pickupLocation,
          destination,
          additionalDetails,
        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to request ride. Please try again." + response.statusText);
      }
  
      // Navigate to the Waiting Response Screen
      Alert.alert("Loading", "Ride request sent! Waiting for a driver...");
      navigation.navigate("WaitingResponseScreen", {
        clientName: name, // Pass the name to the WaitingResponseScreen
        clientPhone: phoneNumber, // Pass the phone number to the WaitingResponseScreen
      });
    } catch (error) {
      console.error("Failed to request ride", error);
      Alert.alert("Error", "Failed to request ride. Please try again." );
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* FAST TAXI Logo */}
        <Image
          source={{ uri: "https://via.placeholder.com/150x50?text=FAST+TAXI" }} // Replace with your actual logo URL
          style={styles.logo}
        />

        {/* Language Toggle Button */}
        <TouchableOpacity style={styles.languageButton} onPress={toggleLanguage}>
          <Text style={styles.languageButtonText}>
            {i18n.language === "en" ? t("switch_to_chinese") : t("switch_to_english")}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>{t("name")}</Text>
        <TextInput
          style={styles.input}
          placeholder={t("enter_name")}
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>{t("phone_number")}</Text>
        <TextInput
          style={styles.input}
          placeholder={t("enter_phone_number")}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>{t("pickup_location")}</Text>
        {isPickupAutocompleteActive ? (
        <GooglePlacesAutocomplete
            placeholder={t("search_for_pickup_location")}
            fetchDetails={true}
            onPress={(data, details = null) => {
            if (details) {
                setPickupLocation(details.formatted_address);
            } else if (data) {
                setPickupLocation(data.description);
            }
            //setIsPickupAutocompleteActive(true); // Switch back to text box after selection
            }}
            query={{
            key: GOOGLE_MAPS_API_KEY, // Replace with your actual API key
            language: "en",
            }}
            styles={{
            textInput: styles.input,
            }}
            textInputProps={{
            value: pickupLocation, // Bind the text box value to the pickupLocation state
            onChangeText: (text) => setPickupLocation(text), // Update the state when the user types
            }}
        />
        ) : (
            <TextInput
            style={styles.input}
            placeholder={t("enter_pickup_location")}
            value={pickupLocation}
            editable={false} // Prevent manual editing
            />
        )}
        <Button
        title={isPickupAutocompleteActive ? t("use_current_location") : t("search_location")} // Default to "Use Current Location"
        onPress={() => {
            if (!isPickupAutocompleteActive) {
            setIsPickupAutocompleteActive(true); // Switch back to text box
            } else {
            fetchCurrentLocation({ setLocation: setPickupLocation });
            setIsPickupAutocompleteActive(false);
            }
            console.log(isPickupAutocompleteActive);
        }}
        />

        <Text style={styles.label}>{t("destination")}</Text>
        <GooglePlacesAutocomplete
          placeholder={t("search_for_destination")}
          fetchDetails={true}
          onPress={(data, details = null) => {
            if (details) {
              setDestination(details.formatted_address);
            } else if (data) {
              setDestination(data.description);
            }
          }}
          query={{
            key: GOOGLE_MAPS_API_KEY, // Replace with your actual API key
            language: "en",
          }}
          styles={{
            textInput: styles.input,
          }}
        />

        <Text style={styles.label}>{t("additional_details")}</Text>
        <TextInput
          style={styles.input}
          placeholder={t("enter_additional_details")}
          value={additionalDetails}
          onChangeText={setAdditionalDetails}
          multiline
        />

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
  languageButton: {
    alignSelf: "flex-end",
    marginBottom: 16,
    padding: 8,
    backgroundColor: "#007bff",
    borderRadius: 4,
  },
  languageButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default BaseScreen;