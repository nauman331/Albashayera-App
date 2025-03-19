import React, { Suspense, lazy, useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Text } from "react-native";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Lazy Load Screens
const Auth = lazy(() => import("./src/screens/Auth"));
const Login = lazy(() => import("./src/screens/Login"));
const Register = lazy(() => import("./src/screens/Register"));
const Otp = lazy(() => import("./src/screens/Otp"));
const Home = lazy(() => import("./src/screens/Home"));
const Profile = lazy(() => import("./src/screens/Profile"));

export type RootStackParamList = {
  Auth: undefined;
  Login: undefined;
  Register: undefined;
  Otp: { email: string };
  Home: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator();

const App = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      const storedToken = await AsyncStorage.getItem("@token");
      setToken(storedToken);
    };
    fetchToken();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {token ? <AuthenticatedTabs /> : <UnauthenticatedTabs />}
      </NavigationContainer>
      <Toast />
    </SafeAreaProvider>
  );
};

// Tabs for Unauthenticated Users (No Bottom Navigation & No Headers)
const UnauthenticatedTabs = () => (
  <Tab.Navigator screenOptions={{ headerShown: false }}>
    <Tab.Screen
      name="Auth"
      component={LazyWrapper(Auth)}
      options={{ tabBarStyle: { display: "none" } }}
    />
    <Tab.Screen
      name="Login"
      component={LazyWrapper(Login)}
      options={{ tabBarStyle: { display: "none" } }}
    />
    <Tab.Screen
      name="Register"
      component={LazyWrapper(Register)}
      options={{ tabBarStyle: { display: "none" } }}
    />
    <Tab.Screen
      name="Otp"
      component={LazyWrapper(Otp)}
      options={{ tabBarStyle: { display: "none" } }}
    />
  </Tab.Navigator>
);

// Tabs for Authenticated Users (Bottom Navigation Visible)
const AuthenticatedTabs = () => (
  <Tab.Navigator>
    <Tab.Screen name="Home" component={LazyWrapper(Home)} />
    <Tab.Screen name="Profile" component={LazyWrapper(Profile)} />
  </Tab.Navigator>
);

// Function to wrap lazy-loaded components with Suspense
function LazyWrapper(Component: React.ComponentType<any>) {
  return (props: any) => (
    <Suspense fallback={<Text>Loading...</Text>}>
      <Component {...props} />
    </Suspense>
  );
}

export default App;


