import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import CustomDrawerContent from "../CustomDrawerContent";
import Dashboard from "../../screens/Dashboard";
import Wallet from "../../screens/Wallet";
import Orders from "../../screens/Orders";
import Profile from "../../screens/Profile";
import Auctions from "../../screens/Auctions";
import AuctionVehicles from "../../screens/AuctionVehicles";
import BuyNowVehicles from "../../screens/BuyNowVehicles";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../../App";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import CarDetailsScreen from "../../screens/CarDetailsScreen";

const Drawer = createDrawerNavigator();

const CarDetailsScreenWrapper = (props: any) => (
  <ScreenWrapper>
    <CarDetailsScreen {...props} />
  </ScreenWrapper>
);


const CustomBottomBar = () => {
  const navigation = useNavigation<DrawerNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.bottomBar}>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Dashboard")}>
        <Icon name="dashboard" size={28} color="white" />
        <Text style={styles.text}>Dashboard</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("AuctionVehicles")}>
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

// Wrapper Component for Each Screen
const ScreenWrapper = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.container}>
    <View style={styles.screenContent}>{children}</View>
    <CustomBottomBar />
  </View>
);

// Drawer Navigator with Custom Bottom Bar
const DrawerNavigator = ({ setToken }: { setToken: React.Dispatch<React.SetStateAction<string | null>> }) => (
  <Drawer.Navigator
    screenOptions={{
      headerTitle: () => <Text>ABA Auctions</Text>,
      headerRight: () => (
        <TouchableOpacity style={{ marginRight: 15 }}>
          <Icon name="notifications" size={30} color="#010153" />
        </TouchableOpacity>
      ),
      drawerStyle: { height: "100%" }, // Ensures it doesn't overlay bottom bar
      drawerContentStyle: { paddingBottom: 60 }, // Leaves space for bottom bar
    }}
    drawerContent={(props) => <CustomDrawerContent {...props} setToken={setToken} />}
  >
    <Drawer.Screen name="Dashboard" component={() => <ScreenWrapper><Dashboard /></ScreenWrapper>} />
    <Drawer.Screen name="Orders" component={() => <ScreenWrapper><Orders /></ScreenWrapper>} />
    <Drawer.Screen name="Wallet" component={() => <ScreenWrapper><Wallet /></ScreenWrapper>} />
    <Drawer.Screen name="Profile" component={() => <ScreenWrapper><Profile /></ScreenWrapper>} />
    <Drawer.Screen name="Auctions" component={() => <ScreenWrapper><Auctions /></ScreenWrapper>} />
    <Drawer.Screen name="CarDetails" component={CarDetailsScreenWrapper} />
    <Drawer.Screen name="AuctionVehicles" component={() => <ScreenWrapper><AuctionVehicles /></ScreenWrapper>} />
    <Drawer.Screen name="BuyNowVehicles" component={() => <ScreenWrapper><BuyNowVehicles /></ScreenWrapper>} />
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
