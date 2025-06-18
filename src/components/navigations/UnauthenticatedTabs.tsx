import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import LazyWrapper from "../LazyWrapper";
import AuctionVehicles from "../../screens/AuctionVehicles";
import BuyNowVehicles from "../../screens/BuyNowVehicles";
import CarDetailsScreen from "../../screens/CarDetailsScreen";
import Auctions from "../../screens/Auctions";
import Auth from "../../screens/Auth";
import Login from "../../screens/Login";
import Register from "../../screens/Register";
import Otp from "../../screens/Otp";
import Forgot from "../../screens/Forgot";

type UnauthenticatedTabParamList = {
  AuctionVehicles: undefined;
  BuyNowVehicles: undefined;
  CarDetails: { carId: string };
  AuctionEvents: undefined;
  Auth: undefined;
  Login: undefined;
  Register: undefined;
  Otp: undefined;
  Forgot: undefined;
};

const Tab = createBottomTabNavigator<UnauthenticatedTabParamList>();

const UnauthenticatedTabs = ({ setToken }: { setToken: React.Dispatch<React.SetStateAction<string | null>> }) => (
  <Tab.Navigator initialRouteName="AuctionVehicles" screenOptions={{ headerShown: false, tabBarStyle: { display: "none" } }}>
    <Tab.Screen name="AuctionVehicles" component={LazyWrapper(AuctionVehicles)} />
    <Tab.Screen name="BuyNowVehicles" component={LazyWrapper(BuyNowVehicles)} />
    <Tab.Screen name="CarDetails" children={(props) => <CarDetailsScreen {...props} />} />
    <Tab.Screen name="AuctionEvents" component={LazyWrapper(Auctions)} />
    {/* Auth screens below, only navigated to explicitly */}
    <Tab.Screen name="Auth" component={LazyWrapper(Auth)} />
    <Tab.Screen name="Login" children={(props) => <Login {...props} setToken={setToken} />} />
    <Tab.Screen name="Register" component={LazyWrapper(Register)} />
    <Tab.Screen name="Otp" component={LazyWrapper(Otp)} />
    <Tab.Screen name="Forgot" component={LazyWrapper(Forgot)} />
  </Tab.Navigator>
);

export default UnauthenticatedTabs;
// No changes needed here unless you have missing imports or typos in screen names.
