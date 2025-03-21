import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import DrawerItem from "./DrawerItem";
import { removeToken, getToken } from "../utils/asyncStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CustomDrawerContent = ({ navigation, setToken }: any) => {
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const fetchUserData = async () => {
      const token = await getToken();
      if (token) {
        const userDataString = await AsyncStorage.getItem("@userdata"); // Get data as string
        if (userDataString) {
          const userData = JSON.parse(userDataString); // Parse JSON
          setUser(userData);
        }
      }
    };

    fetchUserData();
  }, []);



  const handleLogout = async () => {
    try {
      await removeToken();
      setToken(null);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <View style={styles.drawerContainer}>
      <View style={styles.profileSection}>
        {user ? (
          <>
            <Image source={{ uri: user.avatarImage }} style={styles.profileImage} />
            <Text style={styles.username}>{user.firstName} {user.lastName}</Text>
          </>
        ) : (
          <Text style={styles.username}>Loading...</Text> // Prevents crash if user is null
        )}
      </View>


      <View style={styles.menuContainer}>
        <DrawerItem icon="home" text="Home" onPress={() => navigation.jumpTo("Home")} />
        <DrawerItem icon="dashboard" text="Dashboard" onPress={() => navigation.jumpTo("Dashboard")} />
        <DrawerItem icon="account-balance-wallet" text="Wallet" onPress={() => navigation.jumpTo("Wallet")} />
        <DrawerItem icon="shopping-cart" text="Orders" onPress={() => navigation.jumpTo("Orders")} />
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="exit-to-app" size={24} color="#D9534F" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  profileSection: {
    backgroundColor: "#010153",
    alignItems: "center",
    paddingVertical: 40,
    borderRadius: 10,
    marginBottom: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "white",
  },
  username: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
  },
  menuContainer: {
    flex: 1,
    marginTop: 10,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#F8D7DA",
    marginBottom: 20,
  },
  logoutText: {
    fontSize: 16,
    color: "#D9534F",
    marginLeft: 10,
    fontWeight: "600",
  },
});

export default CustomDrawerContent;
