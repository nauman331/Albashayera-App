import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import UnauthenticatedTabs from "./src/components/navigations/UnauthenticatedTabs";
import DrawerNavigator from "./src/components/navigations/DrawerNavigator";
import { backendURL } from "./src/utils/exports";

const App = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem("@token")
      .then((storedToken) => {
        if (storedToken) setToken(storedToken);
      })
      .catch(console.error);
  }, []);
  

  const getUserData = async () => {
    if (!token) return; 
  
    try {
      const response = await fetch(`${backendURL}/user/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      const res_data = await response.json();
      if (response.ok) {
        await AsyncStorage.setItem("@userdata", JSON.stringify(res_data));
      } else {
        console.warn(res_data.message || "Error in getting user data");
      }
    } catch (error) {
      console.error("Network error fetching user data:", error);
    }
  };
  

  useEffect(() => {
    if (token) {
      getUserData();
    }
  }, [token]);

  return (
    <SafeAreaProvider>
      <NavigationContainer>{token ? <DrawerNavigator setToken={setToken} /> : <UnauthenticatedTabs setToken={setToken} />}</NavigationContainer>
      <Toast />
    </SafeAreaProvider>
  );
};

export default App;
