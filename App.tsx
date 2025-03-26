import React, { useEffect, useState, useCallback } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import Toast from "react-native-toast-message";
import UnauthenticatedTabs from "./src/components/navigations/UnauthenticatedTabs";
import DrawerNavigator from "./src/components/navigations/DrawerNavigator";
import { backendURL } from "./src/utils/exports";
import NoInternetScreen from "./src/screens/NoInternetScreen";
import socketService from "./src/utils/socket";
import { Alert } from "react-native";
import Sound from "react-native-sound";

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
  CarDetails: { carId: string };
};

const App = () => {
  const [token, setToken] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("@token");
        if (storedToken) {
          setToken(storedToken);
          socketService.connect(storedToken);
        }
      } catch (error) {
        console.error("Error retrieving token:", error);
      }
    };
    fetchToken();
  }, []);

  const getUserData = useCallback(async () => {
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
        console.warn(res_data.message || "Error retrieving user data");
      }
    } catch (error) {
      console.error("Network error fetching user data:", error);
    }
  }, [token]);

  useEffect(() => {
    if (token) getUserData();
  }, [token, getUserData]);

  const playSound = () => {
    const sound = new Sound(require("./src/assets/notification.wav"), Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        Alert.alert("Failed to load the sound");
        return;
      }
      sound.play();
    });
  };

  const notifyBidders = (message: string) => {
    playSound();
    Alert.alert(message);
  };

  useEffect(() => {
    const handleAuctionOpened = (response: any) => {
      console.log(response);
      if (!response.isOk) {
        Alert.alert(response.message);
        return;
      }
      
      notifyBidders(response.message);
    };

    const handleBidPlaced = (response: any) => {
      console.log(response);
      if (!response.isOk) {
        Alert.alert(response.message);
        return;
      }
      notifyBidders(response.message);
    };

    const handleAuctionStatusChanged = (response: any) => {
      console.log(response);
      if (!response.isOk) {
        Alert.alert(response.message);
        return;
      }
      notifyBidders(response.message);
    };

    const handleNotifyBidders = (response: any) => {
      console.log(response);
      if (!response.isOk) {
        Alert.alert(response.message);
        return;
      }
      notifyBidders(response.message);
    };

    socketService.on("auctionOpened", handleAuctionOpened);
    socketService.on("bidPlaced", handleBidPlaced);
    socketService.on("auctionStatusChanged", handleAuctionStatusChanged);
    socketService.on("notifyBidders", handleNotifyBidders);
    socketService.on("connect", () => console.log("Socket connected"));
    socketService.on("disconnect", () => console.log("Socket disconnected"));

    return () => {
      socketService.off("auctionOpened", handleAuctionOpened);
      socketService.off("bidPlaced", handleBidPlaced);
      socketService.off("auctionStatusChanged", handleAuctionStatusChanged);
      socketService.off("notifyBidders", handleNotifyBidders);
    };
  }, []);

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