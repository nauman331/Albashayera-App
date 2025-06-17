import React from "react";
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


const Drawer = createDrawerNavigator();

const CarDetailsScreenWrapper = (props: any) => (
  <ScreenWrapper>
    <CarDetailsScreen {...props} />
  </ScreenWrapper>
);
const AuctionWrapper = (props: any) => (
  <ScreenWrapper>
    <AuctionVehicles {...props} />
  </ScreenWrapper>
);
const OrderDetailsWrapper = (props: any) => (
  <ScreenWrapper>
    <OrderDetails {...props} />
  </ScreenWrapper>
);
const PayOrderWrapper = (props: any) => (
  <ScreenWrapper>
    <PayOrder {...props} />
  </ScreenWrapper>
);
const WithdrawWrapper = (props: any) => (
  <ScreenWrapper>
    <WithDraw {...props} />
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
    drawerContent={(props) => <CustomDrawerContent {...props} setToken={setToken} />}
  >
    <Drawer.Screen name="Dashboard" component={() => <ScreenWrapper><Dashboard /></ScreenWrapper>} />
    <Drawer.Screen name="Orders" component={() => <ScreenWrapper><Orders /></ScreenWrapper>} />
    <Drawer.Screen name="Wallet" component={() => <ScreenWrapper><Wallet /></ScreenWrapper>} />
    <Drawer.Screen name="Profile" component={() => <ScreenWrapper><Profile setToken={setToken} /></ScreenWrapper>} />
    <Drawer.Screen name="Notifications" component={() => <ScreenWrapper><NotificationScreen /></ScreenWrapper>} />
    <Drawer.Screen name="Deposit" component={() => <ScreenWrapper><Deposit /></ScreenWrapper>} />
    <Drawer.Screen name="AuctionEvents" component={() => <ScreenWrapper><Auctions /></ScreenWrapper>} />
    <Drawer.Screen name="ContactUs" component={() => <ScreenWrapper><ContactScreen /></ScreenWrapper>} />
    <Drawer.Screen name="BuyNowVehicles" component={() => <ScreenWrapper><BuyNowVehicles /></ScreenWrapper>} />
    <Drawer.Screen name="Withdraw" component={WithdrawWrapper} />
    <Drawer.Screen name="CarDetails" component={CarDetailsScreenWrapper} />
    <Drawer.Screen name="AuctionVehicles" component={AuctionWrapper} />
    <Drawer.Screen name="OrderDetails" component={OrderDetailsWrapper} />
    <Drawer.Screen name="PayOrder" component={PayOrderWrapper} />
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
