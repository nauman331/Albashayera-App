import React, { Suspense, lazy, useEffect, useState } from "react";
import { NavigationContainer, DrawerActions } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import Toast from "react-native-toast-message";
import "react-native-gesture-handler";

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
const Wallet = lazy(() => import("./src/screens/Wallet"));
const Orders = lazy(() => import("./src/screens/Orders"));
const Dashboard = lazy(() => import("./src/screens/Dashboard"));

export type RootStackParamList = {
  Auth: undefined;
  Login: undefined;
  Register: undefined;
  Otp: { email: string };
  Forgot: undefined;
  Home: undefined;
  Profile: undefined;
  Vehicles: undefined;
  Auctions: undefined;
  Wallet: undefined;
  Orders: undefined;
  Dashboard: undefined;
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
        {token ? <DrawerNavigator /> : <UnauthenticatedTabs setToken={setToken} />}
      </NavigationContainer>
      <Toast />
    </SafeAreaProvider>
  );
};

// Unauthenticated Users (No Drawer, No Bottom Navigation)
const UnauthenticatedTabs = ({ setToken }: { setToken: React.Dispatch<React.SetStateAction<string | null>> }) => (
  <Tab.Navigator initialRouteName="Auth" screenOptions={{ headerShown: false, tabBarStyle: { display: "none" } }}>
    <Tab.Screen name="Auth" component={LazyWrapper(Auth)} />
    <Tab.Screen
      name="Login"
      children={(props) => (
        <Suspense fallback={<Text>Loading...</Text>}>
          <Login {...props} setToken={setToken} />
        </Suspense>
      )}
    />
    <Tab.Screen name="Register" component={LazyWrapper(Register)} />
    <Tab.Screen name="Otp" component={LazyWrapper(Otp)} />
    <Tab.Screen name="Forgot" component={LazyWrapper(Forgot)} />
  </Tab.Navigator>
);

// Authenticated Users - Drawer Navigator
const DrawerNavigator = () => (
  <Drawer.Navigator
    drawerContent={(props) => <CustomDrawerContent {...props} />}
    screenOptions={{ headerShown: false }}
  >
    <Drawer.Screen name="Main" component={AuthenticatedTabs} />
  </Drawer.Navigator>
);

// Tabs for Authenticated Users (With Drawer)
const AuthenticatedTabs = ({ navigation }: any) => (
  <Tab.Navigator
    screenOptions={{
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())} style={{ marginLeft: 15 }}>
          <Icon name="menu" size={30} color="black" />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity style={{ marginRight: 15 }}>
          <Icon name="notifications" size={30} color="black" />
        </TouchableOpacity>
      ),
    }}
    initialRouteName="Home"
  >
    <Tab.Screen name="Home" component={LazyWrapper(Home)} options={{ tabBarIcon: ({ color }) => <Icon name="home" size={24} color={color} /> }} />
    <Tab.Screen name="Profile" component={LazyWrapper(Profile)} options={{ tabBarIcon: ({ color }) => <Icon name="person" size={24} color={color} /> }} />
    <Tab.Screen name="Vehicles" component={LazyWrapper(Vehicles)} options={{ tabBarIcon: ({ color }) => <Icon name="directions-car" size={24} color={color} /> }} />
    <Tab.Screen name="Auctions" component={LazyWrapper(Auctions)} options={{ tabBarIcon: ({ color }) => <Icon name="gavel" size={24} color={color} /> }} />
  </Tab.Navigator>
);

// Custom Drawer Content
const CustomDrawerContent = ({ navigation }: any) => {

  const handleLogout = async () => {
    await AsyncStorage.removeItem("@token");
    navigation.replace("Auth");
  };

  return (
    <View style={styles.drawerContainer}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Image source={{ uri: "https://via.placeholder.com/80" }} style={styles.profileImage} />
        <Text style={styles.username}>username</Text>
      </View>

      {/* Drawer Items */}
      <DrawerItem icon="home" text="Home" onPress={() => navigation.navigate("Home")} />
      <DrawerItem icon="person" text="Profile" onPress={() => navigation.navigate("Profile")} />
      <DrawerItem icon="account-balance-wallet" text="Wallet" onPress={() => navigation.navigate("Wallet")} />
      <DrawerItem icon="shopping-cart" text="Orders" onPress={() => navigation.navigate("Orders")} />

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="exit-to-app" size={24} color="red" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

// Drawer Item Component
const DrawerItem = ({ icon, text, onPress }: { icon: string; text: string; onPress: () => void }) => (
  <TouchableOpacity style={styles.drawerItem} onPress={onPress}>
    <Icon name={icon} size={24} color="black" />
    <Text style={styles.drawerText}>{text}</Text>
  </TouchableOpacity>
);

// Lazy Loading Wrapper
const LazyWrapper = (Component: React.FC) => (props: any) => (
  <Suspense fallback={<Text>Loading...</Text>}>
    <Component {...props} />
  </Suspense>
);

// Styles
const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    paddingVertical: 20,
  },
  profileSection: {
    backgroundColor: "#007AFF",
    alignItems: "center",
    paddingVertical: 30,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  username: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },
  drawerText: {
    fontSize: 16,
    marginLeft: 15,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginTop: "auto",
  },
  logoutText: {
    fontSize: 16,
    color: "red",
    marginLeft: 15,
  },
});

export default App;
