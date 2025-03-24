import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import Toast from "react-native-toast-message";
import UnauthenticatedTabs from "./src/components/navigations/UnauthenticatedTabs";
import DrawerNavigator from "./src/components/navigations/DrawerNavigator";
import { backendURL } from "./src/utils/exports";
import NoInternetScreen from "./src/screens/NoInternetScreen"; 

export type RootStackParamList = {
  Auth: undefined;
  Login: undefined;
  Register: undefined;
  Otp: { email: string };
  Dashboard: undefined;
  Orders: undefined;
  Wallet: undefined;
  Profile: undefined;
  Auctions: undefined;
  AuctionVehicles: undefined;
  BuyNowVehicles: undefined;
};

const App = () => {
  const [token, setToken] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean | null>(true);

  useEffect(() => {
    // Check internet connection
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

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

  if (!isConnected) {
    return <NoInternetScreen />;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {token ? <DrawerNavigator setToken={setToken} /> : <UnauthenticatedTabs setToken={setToken} />}
      </NavigationContainer>
      <Toast />
    </SafeAreaProvider>
  );
};

export default App;
