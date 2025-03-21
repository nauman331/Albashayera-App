import React from "react";
import { View, TouchableOpacity, StyleSheet, Platform, GestureResponderEvent } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialIcons";
import Home from "../../screens/Home";
import Profile from "../../screens/Profile";
import Vehicles from "../../screens/Vehicles";
import Auctions from "../../screens/Auctions";
import Dashboard from "../../screens/Dashboard";

const Tab = createBottomTabNavigator();

type TabBarButtonProps = {
  children: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
};

const AuthenticatedTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: styles.tabBar,
      tabBarActiveTintColor: "#010153",
      tabBarInactiveTintColor: "#aaa", 
    }}
  >
    <Tab.Screen
      name="Home"
      component={Home}
      options={{
        tabBarIcon: ({ color }) => <Icon name="home" size={26} color={color} />,
      }}
    />
    <Tab.Screen
      name="Vehicles"
      component={Vehicles}
      options={{
        tabBarIcon: ({ color }) => <Icon name="dashboard" size={26} color={color} />,
      }}
    />
    <Tab.Screen
      name="Auctions"
      component={Auctions}
      options={{
        tabBarIcon: ({ color }) => <Icon name="gavel" size={26} color={color} />,
      }}
    />
    <Tab.Screen
      name="Profile"
      component={Profile}
      options={{
        tabBarIcon: ({ color }) => <Icon name="person" size={26} color={color} />,
      }}
    />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    bottom: 0,
    left: 20,
    right: 20,
    elevation: 8,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: 65,
    shadowColor: "#000",
    shadowOpacity: 0.9,
    shadowRadius: 60,
    borderWidth: 0,
    paddingBottom: Platform.OS === "android" ? 8 : 20,
  },
  buttonInner: {
    justifyContent: "center",
    alignItems: "center",
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#010153",
  },
});

export default AuthenticatedTabs;
