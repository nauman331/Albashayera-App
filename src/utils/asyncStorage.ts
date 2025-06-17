import AsyncStorage from "@react-native-async-storage/async-storage";

// Save token to AsyncStorage
export const saveToken = async (token: string) => {
  try {
    await AsyncStorage.setItem("@token", token);
  } catch (error) {
    console.error("Error saving token:", error);
  }
};

// Retrieve token from AsyncStorage
export const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem("@token");
    return token ? token : null;
  } catch (error) {
    console.error("Error retrieving token:", error);
    return null;
  }
};

// Remove token from AsyncStorage (Logout)
export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem("@token");
  } catch (error) {
    console.error("Error removing token:", error);
  }
};

export const removeData = async () => {
  try {
    await AsyncStorage.removeItem("@userdata");
  } catch (error) {
    console.error("Error removing data:", error);
  }
};
