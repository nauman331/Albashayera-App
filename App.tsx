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
import Sound from "react-native-sound";
import { navigate, navigationRef } from "./src/utils/navigationRef";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import EventBus from "./src/utils/EventBus";

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
  AuctionVehicles: { selectedAuctionProp: string };
  PayOrder: { invoiceNumber: string, pendingAmount: string | number };
  OrderDetails: { orderId: string };
  BuyNowVehicles: undefined;
  CarDetails: { carId: string };
  AuctionEvents: undefined;
  Withdraw: { balance: string | number };
  Deposit: undefined;
  Forgot: undefined;
  Notifications: undefined;
};

interface user {
  id: string,
}

const App = () => {
  const [token, setToken] = useState<string | null>(null);
  const [userdata, setUserdata] = useState<user | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false)

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
  }, [token]);

  const getUserData = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true)
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
        setUserdata(res_data);
      } else {
        console.warn(res_data.message || "Error retrieving user data");
      }
    } catch (error) {
      console.error("Network error fetching user data:", error);
    } finally {
      setLoading(false)
    }
  }, [token]);

  useEffect(() => {
    if (token) getUserData();
  }, [token, getUserData]);

  const playSound = () => {
    Sound.setCategory("Playback");

    const sound = new Sound(require("./src/assets/notification.wav"), (error) => {
      if (error) {
        console.error("Failed to load the sound:", error);
        return;
      }
      sound.play(() => sound.release());
    });
  };


  const notifyBidders = (message: string) => {
    playSound();
    Toast.show({
      type: "success",
      text1: "Pay Attention",
      text2: message
    })
  };


  useEffect(() => {
    const handleToast = (response: any) => {
      AsyncStorage.getItem("userdata").then((user) => {
        const userdata = user ? JSON.parse(user) : null;
        if (userdata?.id === response?.user) {
          Toast.show({
            type: "error",
            text1: response.message
          })
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

      let carId: string | undefined;
      let currentRouteName: string | undefined;

      if (navigationRef.isReady()) {
        const currentRoute = navigationRef.getCurrentRoute();

        if (currentRoute) {
          currentRouteName = currentRoute.name;
          const params = currentRoute.params;

          if (params && typeof params === "object" && "carId" in params) {
            carId = (params as { carId?: string }).carId;
          }
        }
      }

      if (currentRouteName === "CarDetails" && carId === response.carId) {
        setTimeout(() => {
          navigate("CarDetails", { carId: response.carId });
        }, 300);
      }

    };


    const handleAuctionOpened = async (response: any) => {
      console.log(response);
      if (!response.isOk) {
        handleToast(response);
        return;
      }
      notifyBidders(response.message);
      await AsyncStorage.setItem("currentBidData", JSON.stringify(response));
      let carId: string | undefined;
      let currentRouteName: string | undefined;

      if (navigationRef.isReady()) {
        const currentRoute = navigationRef.getCurrentRoute();

        if (currentRoute) {
          currentRouteName = currentRoute.name;
          const params = currentRoute.params;

          if (params && typeof params === "object" && "carId" in params) {
            carId = (params as { carId?: string }).carId;
          }
        }
      }

      if (currentRouteName === "CarDetails" && carId === response.carId) {
        setTimeout(() => {
          navigate("CarDetails", { carId: response.carId });
        }, 300);
      }
    };

    const handleBidPlaced = async (response: any) => {
      console.log(response);
      if (!response.isOk) {
        handleToast(response);
        return;
      }
      await AsyncStorage.setItem("currentBidData", JSON.stringify(response));
      if (userdata?.id === response?.id) {
        notifyBidders(response.message);
      } else if (
        userdata &&
        response.previousBidders?.length > 0 &&
        userdata.id === response.previousBidders[response.previousBidders.length - 1]
      ) {
        notifyBidders(response.outBidMessage);
      }
    };

    const handleAuctionStatusChanged = async (response: any) => {
      console.log(response);
      if (!response.isOk) {
        handleToast(response);
        return;
      }
      if (userdata?.id === response?.userId) {
        notifyBidders(response.winnerMessage);
      } else {
        notifyBidders(response.message);
      }
      await AsyncStorage.removeItem("currentBidData");
      EventBus.emit("resetBidData");

      let carId: string | undefined;
      let currentRouteName: string | undefined;

      if (navigationRef.isReady()) {
        const currentRoute = navigationRef.getCurrentRoute();

        if (currentRoute) {
          currentRouteName = currentRoute.name;
          const params = currentRoute.params;

          if (params && typeof params === "object" && "carId" in params) {
            carId = (params as { carId?: string }).carId;
          }
        }
      }

      if (currentRouteName === "CarDetails" && carId === response.carId) {
        setTimeout(() => {
          if (response.nextCar && response.nextCar._id) {
            navigate("CarDetails", { carId: response.nextCar._id });
          } else {
            navigate("AuctionVehicles");
          }
        }, 300);
      }
    };

    const handleNotifyBidders = async (response: any) => {
      console.log(response);

      if (!response.isOk) {
        handleToast(response);
        return;
      }

      await AsyncStorage.removeItem("currentBidData");
      EventBus.emit("resetBidData");
      notifyBidders(response.message);

      let carId: string | undefined;
      let currentRouteName: string | undefined;

      if (navigationRef.isReady()) {
        const currentRoute = navigationRef.getCurrentRoute();

        if (currentRoute) {
          currentRouteName = currentRoute.name;
          const params = currentRoute.params;

          if (params && typeof params === "object" && "carId" in params) {
            carId = (params as { carId?: string }).carId;
          }
        }
      }

      if (currentRouteName === "CarDetails" && carId === response.carId) {
        setTimeout(() => {
          if (response.nextCar && response.nextCar._id) {
            navigate("CarDetails", { carId: response.nextCar._id });
          } else {
            navigate("AuctionVehicles");
          }
        }, 300);
      }
    };

    socketService.on("auctionOpened", handleAuctionOpened);
    socketService.on("bidPlaced", handleBidPlaced);
    socketService.on("auctionStatusChanged", handleAuctionStatusChanged);
    socketService.on("notifybidders", handleNotifyBidders);
    socketService.on("colorChanged", handlePriceColorChange);
    socketService.on("connect", () => console.log("Socket connected"));
    socketService.on("disconnect", () => console.log("Socket disconnected"));

    return () => {
      socketService.off("auctionOpened", handleAuctionOpened);
      socketService.off("bidPlaced", handleBidPlaced);
      socketService.off("auctionStatusChanged", handleAuctionStatusChanged);
      socketService.off("notifybidders", handleNotifyBidders);
      socketService.off("colorChanged", handlePriceColorChange);
    };
  }, [navigate, userdata]);

  if (!isConnected) {
    return <NoInternetScreen />;
  }

  if (loading)
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
        <DrawerNavigator
          setToken={setToken}
          token={token}
          initialRouteName={token ? "Dashboard" : "AuctionVehicles"}
        />
      </NavigationContainer>
      <Toast />
    </SafeAreaProvider>
  );
};

export default App;

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "#fff" },
});