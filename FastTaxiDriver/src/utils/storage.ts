import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Save data to AsyncStorage
 * @param key The key to store the data under
 * @param value The value to store
 */
export const saveToStorage = async (key: string, value: any): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error(`Error saving data to storage for key "${key}":`, error);
  }
};

/**
 * Retrieve data from AsyncStorage
 * @param key The key to retrieve the data from
 * @returns The parsed value or null if not found
 */
export const getFromStorage = async (key: string): Promise<any> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error(`Error retrieving data from storage for key "${key}":`, error);
    return null;
  }
};

/**
 * Remove data from AsyncStorage
 * @param key The key to remove the data from
 */
export const removeFromStorage = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing data from storage for key "${key}":`, error);
  }
};