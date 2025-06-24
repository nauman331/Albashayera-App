import React, { useEffect, useState } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { View, TouchableOpacity, Text, StyleSheet, Image } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import CustomDrawerContent from "../CustomDrawerContent";
import Dashboard from "../../screens/Dashboard";
import Wallet from "../../screens/Wallet";
import Orders from "../../screens/Orders";
import Profile from "../../screens/Profile";
import Auctions from "../../screens/Auctions";
import AuctionVehicles from "../../screens/AuctionVehicles";
import BuyNowVehicles from "../../screens/BuyNowVehicles";
import WithDraw from "../../screens/WithDraw";
import Deposit from "../../screens/Deposit";
import NotificationScreen from "../../screens/Notifications";
import OrderDetails from "../../screens/OrderDetails";
import PayOrder from "../../screens/PayOrder";
import ContactScreen from "../../screens/ContactScreen"
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../../App";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import CarDetailsScreen from "../../screens/CarDetailsScreen";
import { navigate } from "../../utils/navigationRef";
import { getToken } from "../../utils/asyncStorage";
import Login from "../../screens/Login";
import Register from "../../screens/Register";
import Auth from "../../screens/Auth";
import Forgot from "../../screens/Forgot";
import Otp from "../../screens/Otp";

const Drawer = createDrawerNavigator();

// Wrapper Component for Each Screen
const ScreenWrapper = ({ children, token }: { children: React.ReactNode, token: string | null }) => (
  <View style={styles.container}>
    <View style={styles.screenContent}>{children}</View>
    {token && <CustomBottomBar />}
  </View>
);


const CustomBottomBar = () => {
  const navigation = useNavigation<DrawerNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.bottomBar}>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Dashboard")}>
        <Icon name="dashboard" size={28} color="white" />
        <Text style={styles.text}>Dashboard</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("AuctionVehicles", { selectedAuctionProp: "" })}>
        <Icon name="directions-car" size={28} color="white" />
        <Text style={styles.text}>Vehicles</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Wallet")}>
        <Icon name="account-balance-wallet" size={28} color="white" />
        <Text style={styles.text}>Wallet</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Profile")}>
        <Icon name="person" size={28} color="white" />
        <Text style={styles.text}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

// Helper hook
const useIsAuthenticated = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  useEffect(() => {
    getToken().then(token => setIsAuthenticated(!!token));
  }, []);
  return isAuthenticated;
};

// Guarded screen wrapper
function withAuthGuard(Component: React.ComponentType<any>) {
  return (props: any) => {
    const isAuthenticated = useIsAuthenticated();
    const navigation = useNavigation<DrawerNavigationProp<RootStackParamList>>();
    useEffect(() => {
      if (!isAuthenticated) {
        navigation.navigate("Login");
      }
    }, [isAuthenticated]);
    if (!isAuthenticated) return null;
    return <Component {...props} />;
  };
}

// Wrapper for Profile screen to handle setToken and auth check
const ProfileScreenWrapper = (props: any) => {
  const navigation = useNavigation<DrawerNavigationProp<RootStackParamList>>();
  const { setToken, token } = props;
  useEffect(() => {
    if (!token) {
      navigation.navigate("Login");
    }
  }, [token]);
  if (!token) return null;
  return (
    <ScreenWrapper token={token}>
      <Profile {...props} setToken={setToken} />
    </ScreenWrapper>
  );
};

// Drawer Navigator with Custom Bottom Bar
const DrawerNavigator = ({ setToken, token, initialRouteName = "Dashboard" }: { setToken: React.Dispatch<React.SetStateAction<string | null>>, token: string | null, initialRouteName?: string }) => (
  <Drawer.Navigator
    initialRouteName={initialRouteName}
    backBehavior="history"
    screenOptions={{
      headerTitle: () => (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            source={require("../../assets/images/Logo.png")}
            style={{ width: 40, resizeMode: "contain" }}
          />
        </View>
      ),
      headerTitleAlign: "center",
      headerRight: () => (
        <TouchableOpacity style={{ marginRight: 15, }} onPress={() => navigate("Notifications")}>
          <Icon name="notifications" size={30} color="#010153" />
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: "red",
              position: "absolute",
              top: 5,
              right: 5,
            }}
          />
        </TouchableOpacity>
      ),
    }}
    drawerContent={(props) => <CustomDrawerContent {...props} setToken={setToken} token={token} />}
  >
    {/* Protected screens */}
    <Drawer.Screen
      name="Dashboard"
      component={(props: React.JSX.IntrinsicAttributes) => {
        if (!token) {
          // @ts-ignore
          props.navigation.navigate("Login");
          return null;
        }
        return <ScreenWrapper token={token}><Dashboard {...props} /></ScreenWrapper>;
      }}
    />
    <Drawer.Screen
      name="Orders"
      component={(props: React.JSX.IntrinsicAttributes) => {
        if (!token) {
          // @ts-ignore
          props.navigation.navigate("Login");
          return null;
        }
        return <ScreenWrapper token={token}><Orders {...props} /></ScreenWrapper>;
      }}
    />
    <Drawer.Screen
      name="Wallet"
      component={(props: React.JSX.IntrinsicAttributes) => {
        if (!token) {
          // @ts-ignore
          props.navigation.navigate("Login");
          return null;
        }
        return <ScreenWrapper token={token}><Wallet {...props} /></ScreenWrapper>;
      }}
    />
    <Drawer.Screen
      name="Profile"
      children={(props) => <ProfileScreenWrapper {...props} setToken={setToken} token={token} />}
    />
    <Drawer.Screen
      name="Deposit"
      component={(props: React.JSX.IntrinsicAttributes) => {
        if (!token) {
          // @ts-ignore
          props.navigation.navigate("Login");
          return null;
        }
        return <ScreenWrapper token={token}><Deposit {...props} /></ScreenWrapper>;
      }}
    />
    <Drawer.Screen name="Withdraw"
      component={(props: React.JSX.IntrinsicAttributes) => {
        if (!token) {
          // @ts-ignore
          props.navigation.navigate("Login");
          return null;
        }
        return <ScreenWrapper token={token}><WithDraw {...props} /></ScreenWrapper>;
      }} />
    <Drawer.Screen name="OrderDetails"
      component={(props: React.JSX.IntrinsicAttributes) => {
        if (!token) {
          // @ts-ignore
          props.navigation.navigate("Login");
          return null;
        }
        return <ScreenWrapper token={token}><OrderDetails {...props} /></ScreenWrapper>;
      }} />
    <Drawer.Screen name="PayOrder" component={withAuthGuard((props) => <ScreenWrapper token={token}><PayOrder {...props} /></ScreenWrapper>)} />
    {/* Public screens */}
    <Drawer.Screen name="Notifications" component={() => <ScreenWrapper token={token}><NotificationScreen /></ScreenWrapper>} />
    <Drawer.Screen name="AuctionEvents" component={() => <ScreenWrapper token={token}><Auctions /></ScreenWrapper>} />
    <Drawer.Screen name="ContactUs" component={() => <ScreenWrapper token={token}><ContactScreen /></ScreenWrapper>} />
    <Drawer.Screen name="BuyNowVehicles" component={() => <ScreenWrapper token={token}><BuyNowVehicles /></ScreenWrapper>} />
    <Drawer.Screen name="CarDetails" component={(props: any) => <ScreenWrapper token={token}><CarDetailsScreen {...props} /></ScreenWrapper>} />
    <Drawer.Screen name="AuctionVehicles" component={(props: any) => <ScreenWrapper token={token}><AuctionVehicles {...props} /></ScreenWrapper>} />
    {/* Add Login, Register, Auth as hidden screens */}
    <Drawer.Screen
      name="Login"
      options={{ drawerLabel: () => null, title: undefined, drawerIcon: () => null, drawerItemStyle: { height: 0 } }}
      children={(props) => <Login {...props} setToken={setToken} />}
    />
    <Drawer.Screen
      name="Register"
      options={{ drawerLabel: () => null, title: undefined, drawerIcon: () => null, drawerItemStyle: { height: 0 } }}
      component={Register}
    />
    <Drawer.Screen
      name="Auth"
      options={{ drawerLabel: () => null, title: undefined, drawerIcon: () => null, drawerItemStyle: { height: 0 } }}
      component={Auth}
    />
    <Drawer.Screen
      name="Forgot"
      options={{ drawerLabel: () => null, title: undefined, drawerIcon: () => null, drawerItemStyle: { height: 0 } }}
      component={Forgot}
    />
    <Drawer.Screen
      name="Otp"
      options={{ drawerLabel: () => null, title: undefined, drawerIcon: () => null, drawerItemStyle: { height: 0 } }}
      component={Otp}
    />
  </Drawer.Navigator>
);

export default DrawerNavigator;

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  screenContent: {
    flex: 1, // Ensures the screen takes the full space above the bottom bar
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#010153",
    paddingVertical: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: "100%",
    position: "absolute",
    bottom: 0,
    zIndex: 1, // Ensures it stays below the drawer
    elevation: 1,
  },
  button: {
    alignItems: "center",
  },
  text: {
    color: "white",
    fontSize: 12,
    marginTop: 4,
  },
});
