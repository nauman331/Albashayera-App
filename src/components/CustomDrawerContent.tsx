import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { useNavigationState } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getToken, removeToken } from "../utils/asyncStorage";

interface CustomDrawerContentProps {
  navigation: any;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
}

const CustomDrawerContent: React.FC<CustomDrawerContentProps> = ({ navigation, setToken }) => {
  const [vehiclesExpanded, setVehiclesExpanded] = useState(false);
  const [auctionsExpanded, setAuctionsExpanded] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isModalVisible, setModalVisible] = useState(false);

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

  const currentRoute = useNavigationState((state) => {
    if (!state || !state.routes || state.index === undefined) return null;
    return state.routes[state.index]?.name;
  });

  const handleLogout = async () => {
    try {
      await removeToken();
      setToken(null)
      setModalVisible(false);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Profile Section */}
      {
        user ? (
          <View style={styles.profileSection}>
            <Image
              source={{ uri: user.avatarImage }}
              style={styles.profileImage}
            />
            <View>
              <Text style={styles.profileName}>{user.firstName} {user.lastName}</Text>
              <Text style={styles.profileEmail}>{user.email}</Text>
            </View>
          </View>

        ) : (
          <Text style={styles.profileName}>Loading...</Text>
        )}

      <DrawerContentScrollView>
        {/* Menu Items */}
        {menuItems.map((item, index) => {
          if (item.isExpandable) {
            return (
              <View key={index}>
                <TouchableOpacity
                  style={[styles.menuItem, currentRoute === item.route && styles.activeMenuItem]}
                  onPress={() => {
                    if (item.label === "Vehicles") {
                      setVehiclesExpanded(!vehiclesExpanded);
                    } else if (item.label === "Auctions") {
                      setAuctionsExpanded(!auctionsExpanded);
                    }
                  }}
                >
                  <View
                    style={[styles.activeIndicator, currentRoute === item.route && styles.activeIndicatorActive]}
                  />
                  <Icon
                    name={item.icon}
                    size={20}
                    color={currentRoute === item.route ? "#010153" : "#000"}
                  />
                  <Text
                    style={[styles.menuText, currentRoute === item.route && styles.activeMenuText]}
                  >
                    {item.label}
                  </Text>
                  <Icon name={vehiclesExpanded || auctionsExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={15} color="#000" />
                </TouchableOpacity>

                {/* Submenu Items */}
                {item.label === "Vehicles" && vehiclesExpanded && (
                  <View style={styles.subMenu}>
                    <TouchableOpacity
                      style={styles.subMenuItem}
                      onPress={() => navigation.navigate("AuctionVehicles")}
                    >
                      <Text style={styles.subMenuText}>Auction Vehicles</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.subMenuItem}
                      onPress={() => navigation.navigate("BuyNowVehicles")}
                    >
                      <Text style={styles.subMenuText}>Buy Now Vehicles</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {item.label === "Auctions" && auctionsExpanded && (
                  <View style={styles.subMenu}>
                    <TouchableOpacity
                      style={styles.subMenuItem}
                      onPress={() => navigation.navigate("AuctionEvents")}
                    >
                      <Text style={styles.subMenuText}>Auctions Events</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.subMenuItem}
                      onPress={() => navigation.navigate("LiveAuction")}
                    >
                      <Text style={styles.subMenuText}>Live Auction</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          } else {
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  currentRoute === item.route && styles.activeMenuItem,
                ]}
                onPress={() => navigation.navigate(item.route)}
              >
                <View
                  style={[
                    styles.activeIndicator,
                    currentRoute === item.route && styles.activeIndicatorActive,
                  ]}
                />
                <Icon
                  name={item.icon}
                  size={20}
                  color={currentRoute === item.route ? "#010153" : "#000"}
                />
                <Text
                  style={[styles.menuText, currentRoute === item.route && styles.activeMenuText]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }
        })}
      </DrawerContentScrollView>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Profile")}>
          <Icon name="person" size={20} color="#000" />
          <Text style={styles.menuText}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("ContactUs")}>
          <Icon name="phone" size={20} color="#000" />
          <Text style={styles.menuText}>Contact Us</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => setModalVisible(true)}>
          <Icon name="exit-to-app" size={20} color="#000" />
          <Text style={styles.menuText}>Logout</Text>
        </TouchableOpacity>
      </View>
      <Modal visible={isModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirm Logout</Text>
            <Text style={styles.modalMessage}>Are you sure you want to logout?</Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.confirmButton} onPress={handleLogout}>
                <Text style={styles.confirmText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>


    </View>
  );
};

// Menu Items Array
const menuItems = [
  { route: "Dashboard", label: "Dashboard", icon: "dashboard" },
  { route: "Orders", label: "Orders", icon: "receipt" },
  { route: "Wallet", label: "Wallet", icon: "account-balance-wallet" },
  { route: "Vehicles", label: "Vehicles", icon: "directions-car", isExpandable: true },
  { route: "Auctions", label: "Auctions", icon: "gavel", isExpandable: true },
];

const styles = StyleSheet.create({
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#010153",
    paddingVertical: 15,
    height: 150,
    width: "100%",
    paddingHorizontal: 20,
    flexWrap: "wrap",
    gap: 10
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#fff",
    marginRight: 15,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  profileEmail: {
    fontSize: 13,
    color: "#f8f8f8",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    position: "relative",
  },
  menuText: {
    fontSize: 15,
    marginLeft: 15,
    flex: 1,
    color: "#333",
  },
  activeMenuItem: {
    backgroundColor: "#E5E5FF",
  },
  activeMenuText: {
    color: "#010153",
    fontWeight: "bold",
  },
  activeIndicator: {
    position: "absolute",
    left: 0,
    width: 5,
    height: 45,
    backgroundColor: "transparent",
  },
  activeIndicatorActive: {
    backgroundColor: "#010153",
  },
  subMenu: {
    paddingLeft: 40,
    backgroundColor: "#f5f5f5",
    flex: 1,
    gap: 5
  },
  subMenuItem: {
    paddingVertical: 10,
  },
  subMenuText: {
    fontSize: 14,
    color: "#666",
  },
  bottomSection: {
    paddingVertical: 15,
    borderTopWidth: 1,
    borderColor: "#ccc",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Dark background overlay
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%", // Responsive width
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // Shadow for Android
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  modalMessage: {
    fontSize: 16,
    color: "#666",
    marginVertical: 10,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    marginTop: 15,
  },
  cancelButton: {
    backgroundColor: "#ddd",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginRight: 10,
  },
  cancelText: {
    fontSize: 16,
    color: "#333",
  },
  confirmButton: {
    backgroundColor: "#D9534F",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  confirmText: {
    fontSize: 16,
    color: "#fff",
  },
});

export default CustomDrawerContent;
