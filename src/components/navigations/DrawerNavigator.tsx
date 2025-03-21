import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import CustomDrawerContent from "../CustomDrawerContent";
import AuthenticatedTabs from "./AuthenticatedTabs";
import Dashboard from "../../screens/Dashboard";
import Wallet from "../../screens/Wallet";
import Orders from "../../screens/Orders";

const Drawer = createDrawerNavigator();

const DrawerNavigator = ({ setToken }: { setToken: React.Dispatch<React.SetStateAction<string | null>> }) => (
  <Drawer.Navigator
    drawerContent={(props) => <CustomDrawerContent {...props} setToken={setToken} />}
  >
    <Drawer.Screen name="HomeTabs" component={AuthenticatedTabs} />
    <Drawer.Screen name="Dashboard" component={Dashboard} />
    <Drawer.Screen name="Wallet" component={Wallet} />
    <Drawer.Screen name="Orders" component={Orders} />
  </Drawer.Navigator>
);

export default DrawerNavigator;
