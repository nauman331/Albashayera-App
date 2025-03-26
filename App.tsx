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
import { navigate } from "./src/utils/navigationRef";


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
  AuctionEvents: undefined
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
      sound.play(() => sound.release())
    });
  };

  const notifyBidders = (message: string) => {
    playSound();
    Alert.alert(message);
  };


  useEffect(() => {
    const handleToast = (response: any) => {
      AsyncStorage.getItem("userdata").then((user) => {
        const userdata = user ? JSON.parse(user) : null;
        if (userdata?.id === response?.user) {
          Alert.alert("Error", response.message);
        }
      });
    };

    const handlePriceColorChange = async (response: any) => {
      console.log("Price color response:", response);
      if (!response.isOk) {
        handleToast(response);
        return;
      }
      notifyBidders(response.message);
      await AsyncStorage.setItem("currentCarColor", JSON.stringify(response));

    };


    const handleAuctionOpened = async (response: any) => {
      console.log(response);
      if (!response.isOk) {
        handleToast(response);
        return;
      }
      notifyBidders(response.message);
      await AsyncStorage.setItem("currentBidData", JSON.stringify(response));
    };

    const handleBidPlaced = async (response: any) => {
      console.log(response);
      if (!response.isOk) {
        handleToast(response);
        return;
      }

      const user = await AsyncStorage.getItem("userdata");
      const userdata = user ? JSON.parse(user) : null;

      if (userdata.id === response.id) {
        notifyBidders(response.message);
      } else if (
        response.previousBidders?.length &&
        userdata.id === response.previousBidders[response.previousBidders.length - 1]
      ) {
        notifyBidders(response.outBidMessage);
      }

      await AsyncStorage.setItem("currentBidData", JSON.stringify(response));
    };

    const handleAuctionStatusChanged = async (response: any) => {
      console.log(response);
      if (!response.isOk) {
        handleToast(response);
        return;
      }

      const user = await AsyncStorage.getItem("userdata");
      const userdata = user ? JSON.parse(user) : null;

      if (userdata.id === response.userId) {
        notifyBidders(response.winnerMessage);
      } else {
        notifyBidders(response.message);
      }

      await AsyncStorage.removeItem("currentBidData");

      if (response.nextCar && response.nextCar._id) {
        navigate("CarDetails", { carId: response.nextCar._id });
      } else {
        navigate("AuctionVehicles");
      }
    };

    const handleNotifyBidders = async (response: any) => {
      console.log(response);
      if (!response.isOk) {
        handleToast(response);
        return;
      }
      notifyBidders(response.message);
      await AsyncStorage.removeItem("currentBidData");

      if (response.nextCar && response.nextCar._id) {
        navigate("CarDetails", { carId: response.nextCar._id });
      } else {
        navigate("AuctionVehicles");
      }
    };

    socketService.on("auctionOpened", handleAuctionOpened);
    socketService.on("bidPlaced", handleBidPlaced);
    socketService.on("auctionStatusChanged", handleAuctionStatusChanged);
    socketService.on("notifyBidders", handleNotifyBidders);
    socketService.on("colorChanged", handlePriceColorChange);
    socketService.on("connect", () => console.log("Socket connected"));
    socketService.on("disconnect", () => console.log("Socket disconnected"));

    return () => {
      socketService.off("auctionOpened", handleAuctionOpened);
      socketService.off("bidPlaced", handleBidPlaced);
      socketService.off("auctionStatusChanged", handleAuctionStatusChanged);
      socketService.off("notifyBidders", handleNotifyBidders);
      socketService.off("colorChanged", handlePriceColorChange);
    };
  }, [navigate]);

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