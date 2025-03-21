import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialIcons";
import LazyWrapper from "../LazyWrapper";
import Home from "../../screens/Home";
import Profile from "../../screens/Profile";
import Vehicles from "../../screens/Vehicles";
import Auctions from "../../screens/Auctions";

const Tab = createBottomTabNavigator();

const AuthenticatedTabs = () => (
    <Tab.Navigator
        screenOptions={{
            headerShown: false,
        }}
        initialRouteName="Home"
    >
        <Tab.Screen name="Home" component={LazyWrapper(Home)} options={{ tabBarIcon: ({ color }) => <Icon name="home" size={24} color={color} /> }} />
        <Tab.Screen name="Profile" component={LazyWrapper(Profile)} options={{ tabBarIcon: ({ color }) => <Icon name="person" size={24} color={color} /> }} />
        <Tab.Screen name="Vehicles" component={LazyWrapper(Vehicles)} options={{ tabBarIcon: ({ color }) => <Icon name="directions-car" size={24} color={color} /> }} />
        <Tab.Screen name="Auctions" component={LazyWrapper(Auctions)} options={{ tabBarIcon: ({ color }) => <Icon name="gavel" size={24} color={color} /> }} />
    </Tab.Navigator>
);

export default AuthenticatedTabs;
Tab.Navigator