import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import { useNavigationState, useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getToken, removeToken } from "../utils/asyncStorage";
import { backendURL } from "../utils/exports";
import { useLanguage } from "../context/LanguageContext";
import { useTranslation } from "react-i18next";

interface CustomDrawerContentProps {
  navigation: any;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
}

interface Car {
  _id: string;
}

const CustomDrawerContent: React.FC<CustomDrawerContentProps & { token: string | null }> = ({ navigation, setToken, token }) => {
  const [currentCar, setCurrentCar] = useState<Car | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const isAuthenticated = !!token;
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const isRTL = language === "ar";

  useEffect(() => {
    const fetchUserData = async () => {
      const token = await getToken();
      if (token) {
        const userDataString = await AsyncStorage.getItem("@userdata");
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          setUser(userData);
        }
      } else {
        setUser(null);
      }
    };
    fetchUserData();
  }, [isAuthenticated]);

  const currentRoute = useNavigationState((state) => {
    if (!state || !state.routes || state.index === undefined) return null;
    return state.routes[state.index]?.name;
  });

  const handleLogout = async () => {
    try {
      await removeToken();
      setToken(null);
      setModalVisible(false);
      navigation.reset({
        index: 0,
        routes: [{ name: "AuctionVehicles" }],
      });
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const getCurrentCar = async () => {
    try {
      const response = await fetch(`${backendURL}/auction/active-car`, {
        method: "GET",
      });
      const res_data = await response.json();
      if (response.ok) {
        setCurrentCar(res_data);
      }
    } catch (error) {
      // ignore
    }
  };

  useEffect(() => {
    getCurrentCar();
  }, []);

  const handleJoin = () => {
    if (currentCar) {
      navigation.navigate('CarDetails', { carId: currentCar._id })
    } else {
      navigation.navigate("AuctionVehicles")
    };
  };

  // Only show these menu items if authenticated
  const protectedMenuItems = [
    { route: "Dashboard", label: t("dashboard"), icon: "dashboard" },
    { route: "Orders", label: t("orders"), icon: "receipt" },
    { route: "Wallet", label: t("wallet"), icon: "account-balance-wallet" },
  ];

  // Always show these menu items
  const publicMenuItems = [
    { route: "AuctionVehicles", label: t("auction_vehicles"), icon: "directions-car" },
    { route: "BuyNowVehicles", label: t("buy_now_vehicles"), icon: "directions-car" },
    { route: "AuctionEvents", label: t("auction_events"), icon: "gavel" },
    { route: "ContactUs", label: t("contact_us"), icon: "phone" },
  ];

  return (
    <View style={{ flex: 1 }}>
      {/* Profile Section */}
      {isAuthenticated && user ? (
        <View style={styles.profileSection}>
          <Image
            source={{ uri: user.avatarImage }}
            style={styles.profileImage}
          />
          <View>
            <Text style={styles.profileName}>{user.firstName} {user.lastName}</Text>
            <Text style={styles.profileEmail}>{user.email.length > 20 ? `${user.email.slice(0, 20)}...` : user.email}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.profileSection}>
          <Icon name="person" size={40} color="#fff" />
          <Text style={styles.profileName}>Guest</Text>
        </View>
      )}

      <DrawerContentScrollView>
        {/* Protected Menu Items */}
        {isAuthenticated && protectedMenuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.menuItem, currentRoute === item.route && styles.activeMenuItem]}
            onPress={() => navigation.navigate(item.route)}
          >
            <View style={[styles.activeIndicator, currentRoute === item.route && styles.activeIndicatorActive]} />
            <Icon name={item.icon} size={20} color={currentRoute === item.route ? "#010153" : "#000"} />
            <Text style={[styles.menuText, currentRoute === item.route && styles.activeMenuText]}>{item.label}</Text>
          </TouchableOpacity>
        ))}

        {/* Public Menu Items */}
        {publicMenuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.menuItem, currentRoute === item.route && styles.activeMenuItem]}
            onPress={() => navigation.navigate(item.route)}
          >
            <View style={[styles.activeIndicator, currentRoute === item.route && styles.activeIndicatorActive]} />
            <Icon name={item.icon} size={20} color={currentRoute === item.route ? "#010153" : "#000"} />
            <Text style={[styles.menuText, currentRoute === item.route && styles.activeMenuText]}>{item.label}</Text>
          </TouchableOpacity>
        ))}

        {/* Live Auction (always visible) */}
        <TouchableOpacity
          style={[styles.menuItem, currentRoute === "CarDetails" && styles.activeMenuItem]}
          onPress={handleJoin}
        >
          <View style={[styles.activeIndicator, currentRoute === "CarDetails" && styles.activeIndicatorActive]} />
          <Icon name="live-tv" size={20} color={currentRoute === "CarDetails" ? "#010153" : "#000"} />
          <Text style={[styles.menuText, currentRoute === "CarDetails" && styles.activeMenuText]}>
            {t("live_auction")}
          </Text>
        </TouchableOpacity>

        {/* Language Switcher */}
        <View style={{ marginTop: 30, paddingHorizontal: 20 }}>
          <Text
            style={{
              fontWeight: "bold",
              marginBottom: 10,
              textAlign: isRTL ? "right" : "left",
            }}
          >
            {t("language") || "Language"}
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: language === "en" ? "#010153" : "#fff",
              padding: 10,
              borderRadius: 8,
              marginBottom: 5,
              borderWidth: 1,
              borderColor: "#010153",
            }}
            onPress={() => setLanguage("en")}
          >
            <Text
              style={{
                color: language === "en" ? "#fff" : "#010153",
                textAlign: isRTL ? "right" : "left",
              }}
            >
              English
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: language === "ar" ? "#010153" : "#fff",
              padding: 10,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#010153",
            }}
            onPress={() => setLanguage("ar")}
          >
            <Text
              style={{
                color: language === "ar" ? "#fff" : "#010153",
                textAlign: isRTL ? "right" : "left",
              }}
            >
              العربية
            </Text>
          </TouchableOpacity>
        </View>
      </DrawerContentScrollView>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {isAuthenticated ? (
          <>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Profile")}>
              <Icon name="person" size={20} color="#000" />
              <Text style={styles.menuText}>{t("profile")}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => setModalVisible(true)}>
              <Icon name="exit-to-app" size={20} color="#000" />
              <Text style={styles.menuText}>{t("logout")}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Login")}>
            <Icon name="login" size={20} color="#000" />
            <Text style={styles.menuText}>{t("login")}</Text>
          </TouchableOpacity>
        )}
      </View>
      <Modal visible={isModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{t("confirm_deletion") || "Confirm Logout"}</Text>
            <Text style={styles.modalMessage}>{t("are_you_sure_logout") || "Are you sure you want to logout?"}</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>{t("cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={handleLogout}>
                <Text style={styles.confirmText}>{t("logout")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#010153",
    padding: 15,
    height: 150,
    width: "100%",
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
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