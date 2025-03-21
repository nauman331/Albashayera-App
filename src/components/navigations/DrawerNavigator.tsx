import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import CustomDrawerContent from "../CustomDrawerContent";
import AuthenticatedTabs from "./AuthenticatedTabs";
import Dashboard from "../../screens/Dashboard";
import Wallet from "../../screens/Wallet";
import Orders from "../../screens/Orders";
import { TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";


const Drawer = createDrawerNavigator();

const DrawerNavigator = ({ setToken }: { setToken: React.Dispatch<React.SetStateAction<string | null>> }) => (
  <Drawer.Navigator
  screenOptions={{
    headerRight: () => (
      <TouchableOpacity style={{ marginRight: 15 }}>
        <Icon name="notifications" size={30} color="black" />
      </TouchableOpacity>
    ),
  }}
    drawerContent={(props) => <CustomDrawerContent {...props} setToken={setToken} />}
  >
    <Drawer.Screen name="Home" component={AuthenticatedTabs} />
    <Drawer.Screen name="Dashboard" component={Dashboard} />
    <Drawer.Screen name="Wallet" component={Wallet} />
    <Drawer.Screen name="Orders" component={Orders} />
  </Drawer.Navigator>
);

export default DrawerNavigator;
