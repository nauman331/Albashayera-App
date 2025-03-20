import React, { Suspense, lazy, useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Text } from "react-native";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Icon } from "react-native-vector-icons/Icon";
import 'react-native-gesture-handler';
import { createDrawerNavigator } from "@react-navigation/drawer";

// Lazy Load Screens
const Auth = lazy(() => import("./src/screens/Auth"));
const Login = lazy(() => import("./src/screens/Login"));
const Register = lazy(() => import("./src/screens/Register"));
const Otp = lazy(() => import("./src/screens/Otp"));
const Forgot = lazy(() => import("./src/screens/Forgot"));
const Home = lazy(() => import("./src/screens/Home"));
const Profile = lazy(() => import("./src/screens/Profile"));
const Vehicles = lazy(() => import("./src/screens/Vehicles"));
const Auctions = lazy(() => import("./src/screens/Auctions"));
const Dashboard = lazy(() => import("./src/screens/Dashboard"));
const Wallet = lazy(() => import("./src/screens/Wallet"));
const Orders = lazy(() => import("./src/screens/Orders"));

export type RootStackParamList = {
  Auth: undefined;
  Login: undefined;
  Register: undefined;
  Otp: { email: string };
  Forgot: undefined;
  Home: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

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
        {token ? <AuthenticatedTabs /> : <UnauthenticatedTabs setToken={setToken} />}
      </NavigationContainer>
      <Toast />
    </SafeAreaProvider>
  );
};

// Tabs for Unauthenticated Users (No Bottom Navigation & No Headers)
const UnauthenticatedTabs = ({ setToken }: { setToken: React.Dispatch<React.SetStateAction<string | null>> }) => (
  <Tab.Navigator initialRouteName="Auth" screenOptions={{ headerShown: false, tabBarStyle: { display: "none" } }}>
    <Tab.Screen
      name="Auth"
      component={LazyWrapper(Auth)}
    />
    <Tab.Screen
      name="Login"
      children={(props) => (
        <Suspense fallback={<Text>Loading...</Text>}>
          <Login {...props} setToken={setToken} />
        </Suspense>
      )}
    />
    <Tab.Screen
      name="Register"
      component={LazyWrapper(Register)}
    />
    <Tab.Screen
      name="Otp"
      component={LazyWrapper(Otp)}
    />
    <Tab.Screen
      name="Forgot"
      component={LazyWrapper(Forgot)}
    />
  </Tab.Navigator>
);

// Tabs for Authenticated Users (Bottom Navigation Visible)
const AuthenticatedTabs = () => (
  <>
    <Tab.Navigator
      screenOptions={{
        headerLeft: () => (
          <Icon name="menu" size={30} />
        ),
        headerRight: () => (
          <Icon name="bell" size={30} />
        )
      }}
      initialRouteName="Home">
      <Tab.Screen name="Home" component={LazyWrapper(Home)} />
      <Tab.Screen name="Profile" component={LazyWrapper(Profile)} />
      <Tab.Screen name="Vehicles" component={LazyWrapper(Vehicles)} />
      <Tab.Screen name="Auctions" component={LazyWrapper(Auctions)} />
    </Tab.Navigator>
    <Drawer.Navigator>
      <Drawer.Screen name="Dashboard" component={Dashboard} />
      <Drawer.Screen name="Wallet" component={Wallet} />
      <Drawer.Screen name="Orders" component={Orders} />
    </Drawer.Navigator>
  </>
);

// Function to wrap lazy-loaded components with Suspense
function LazyWrapper(Component: React.ComponentType<any>) {
  return function WrappedComponent(props: any) {
    return (
      <Suspense fallback={<Text>Loading...</Text>}>
        <Component {...props} />
      </Suspense>
    );
  };
}

export default App;
