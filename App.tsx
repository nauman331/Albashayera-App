import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import UnauthenticatedTabs from "./src/components/navigations/UnauthenticatedTabs";
import DrawerNavigator from "./src/components/navigations/DrawerNavigator";

const App = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem("@token").then(setToken).catch(console.error);
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>{token ? <DrawerNavigator setToken={setToken} /> : <UnauthenticatedTabs setToken={setToken} />}</NavigationContainer>
      <Toast />
    </SafeAreaProvider>
  );
};

export default App;
