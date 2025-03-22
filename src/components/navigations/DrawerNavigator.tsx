import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import CustomDrawerContent from "../CustomDrawerContent";
import AuthenticatedTabs from "./AuthenticatedTabs";
import Dashboard from "../../screens/Dashboard";
import Wallet from "../../screens/Wallet";
import Orders from "../../screens/Orders";
import { Text, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";


const Drawer = createDrawerNavigator();

const DrawerNavigator = ({ setToken }: { setToken: React.Dispatch<React.SetStateAction<string | null>> }) => (
  <Drawer.Navigator
    screenOptions={{
      headerTitle: () => <Text>ABA Auctions</Text>,
      headerTitleAlign: "center",
      headerRight: () => (
        <TouchableOpacity style={{ marginRight: 15 }}>
          <Icon name="notifications" size={30} color="#010153" />
        </TouchableOpacity>
      ),
      headerLeftContainerStyle: { paddingLeft: 15 },
      headerRightContainerStyle: { paddingRight: 15 },
      headerTitleStyle: { flex: 1, textAlign: "center" },
      headerShadowVisible: true,
      headerTintColor: "#010153",
    }}
    drawerContent={(props) => <CustomDrawerContent {...props} setToken={setToken} />}
  >
    <Drawer.Screen name="BottomTabs" component={AuthenticatedTabs} />
    <Drawer.Screen name="Dashboard" component={Dashboard} />
    <Drawer.Screen name="Wallet" component={Wallet} />
    <Drawer.Screen name="Orders" component={Orders} />
  </Drawer.Navigator>
);

export default DrawerNavigator;
