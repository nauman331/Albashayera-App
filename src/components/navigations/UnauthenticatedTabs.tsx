import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import LazyWrapper from "../LazyWrapper";
import Auth from "../../screens/Auth";
import Login from "../../screens/Login";
import Register from "../../screens/Register";
import Otp from "../../screens/Otp";
import Forgot from "../../screens/Forgot";

const Tab = createBottomTabNavigator();

const UnauthenticatedTabs = ({ setToken }: { setToken: React.Dispatch<React.SetStateAction<string | null>> }) => (
  <Tab.Navigator initialRouteName="Auth" screenOptions={{ headerShown: false, tabBarStyle: { display: "none" } }}>
    <Tab.Screen name="Auth" component={LazyWrapper(Auth)} />
    <Tab.Screen name="Login" children={(props) => <Login {...props} setToken={setToken} />} />
    <Tab.Screen name="Register" component={LazyWrapper(Register)} />
    <Tab.Screen name="Otp" component={LazyWrapper(Otp)} />
    <Tab.Screen name="Forgot" component={LazyWrapper(Forgot)} />
  </Tab.Navigator>
);

export default UnauthenticatedTabs;
