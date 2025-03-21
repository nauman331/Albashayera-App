import React, { useState } from "react";
import { TouchableOpacity, Text, StyleSheet, View, Image } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const DrawerItem = ({ icon, text, onPress }: { icon: string; text: string; onPress: () => void }) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <TouchableOpacity
      style={[styles.drawerItem, isPressed && styles.pressed]}
      onPress={onPress}
      activeOpacity={0.7}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
    >
      <Icon name={icon} size={24} color="#fff" />
      <Text style={styles.drawerText}>{text}</Text>
    </TouchableOpacity>
  );
};

const Sidebar = () => {
  return (
    <View style={styles.container}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Image source={{ uri: "https://via.placeholder.com/80" }} style={styles.profileImage} />
        <Text style={styles.username}>Username</Text>
      </View>

      {/* Menu Items */}
      <DrawerItem icon="home" text="Dashboard" onPress={() => {}} />
      <DrawerItem icon="account-balance-wallet" text="Wallet" onPress={() => {}} />
      <DrawerItem icon="shopping-cart" text="Orders" onPress={() => {}} />

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={() => {}}>
        <Icon name="logout" size={20} color="#d32f2f" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  profileSection: {
    backgroundColor: "#010153",
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#fff",
  },
  username: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 18,
    backgroundColor: "#010153",
    borderRadius: 18,
    marginVertical: 6,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  pressed: {
    backgroundColor: "#020272",
  },
  drawerText: {
    fontSize: 16,
    marginLeft: 15,
    color: "#fff",
    fontWeight: "600",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    marginTop: 20,
    borderRadius: 12,
    backgroundColor: "#ffebeb",
  },
  logoutText: {
    fontSize: 16,
    marginLeft: 10,
    color: "#d32f2f",
    fontWeight: "600",
  },
});

export default DrawerItem;
