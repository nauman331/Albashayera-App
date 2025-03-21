import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import DrawerItem from "./DrawerItem";
import { removeToken } from "../utils/asyncStorage";

const CustomDrawerContent = ({ navigation, setToken }: any) => {
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
        <Image source={{ uri: "https://via.placeholder.com/80" }} style={styles.profileImage} />
        <Text style={styles.username}>username</Text>
      </View>

      {/* Use jumpTo instead of navigate to ensure it works properly */}
      <DrawerItem icon="home" text="Dashboard" onPress={() => navigation.jumpTo("Dashboard")} />
      <DrawerItem icon="account-balance-wallet" text="Wallet" onPress={() => navigation.jumpTo("Wallet")} />
      <DrawerItem icon="shopping-cart" text="Orders" onPress={() => navigation.jumpTo("Orders")} />

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="exit-to-app" size={24} color="red" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  drawerContainer: { flex: 1, backgroundColor: "#f4f4f4", paddingVertical: 20 },
  profileSection: { backgroundColor: "#007AFF", alignItems: "center", paddingVertical: 30 },
  profileImage: { width: 80, height: 80, borderRadius: 40 },
  username: { color: "white", fontSize: 18, fontWeight: "bold", marginTop: 10 },
  logoutButton: { flexDirection: "row", alignItems: "center", padding: 15, marginTop: "auto" },
  logoutText: { fontSize: 16, color: "red", marginLeft: 15 },
});

export default CustomDrawerContent;
