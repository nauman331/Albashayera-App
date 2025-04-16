import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { backendURL } from "../utils/exports";
import { getToken } from "../utils/asyncStorage";

interface Notification {
  _id: string;
  title: string;
  message: string;
  time: string;
  readStatus: boolean;
}

const NotificationScreen: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  useEffect(() => {
    const fetchToken = async () => {
      const tokeninner = await getToken();
      setToken(tokeninner);
    };
    fetchToken();
  }, []);

  useEffect(() => {
    if (token) {
      getNotifications();
    }
  }, [token]);

  const getNotifications = async () => {
    const authorizationToken = `Bearer ${token}`;
    try {
      setNotificationsLoading(true);
      const response = await fetch(`${backendURL}/notification`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: authorizationToken,
        },
      });
      const res_data = await response.json();
      if (response.ok) {
        setNotifications(res_data);
      }
    } catch (error) {
      console.error("Error while getting notifications", error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    const authorizationToken = `Bearer ${token}`;
    try {
      const response = await fetch(`${backendURL}/notification`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: authorizationToken,
        },
        body: JSON.stringify({ notificationId }),
      });
      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification._id === notificationId
              ? { ...notification, readStatus: true }
              : notification
          )
        );
      } else {
        console.error("Failed to mark notification as read");
      }
    } catch (error) {
      console.error("Error while marking notification as read", error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setModalVisible(true);
    if (!notification.readStatus) {
      markNotificationAsRead(notification._id);
    }
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationCard, item.readStatus && styles.readNotification]}
      onPress={() => handleNotificationClick(item)}
    >
      <View style={styles.iconContainer}>
        <Icon name={item.readStatus ? "bell-outline" : "bell-ring"} size={24} color={item.readStatus ? "#888" : "#010153"} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, item.readStatus && styles.readTitle]}>Notification</Text>
        <Text style={styles.message}>{item.message.slice(0,30)}...</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Notifications</Text>
      {notificationsLoading ? (
        <ActivityIndicator size="large" color="#010153" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          style={{ marginBottom: 70 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Image
                source={require("../assets/images/notification.png")} 
                style={styles.emptyImage}
                resizeMode="contain"
              />
              <Text style={styles.emptyText}>No notifications available</Text>
            </View>
          }
        />
      )}

      {/* Modal for viewing notification details */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedNotification?.title}</Text>
            <Text style={styles.modalMessage}>{selectedNotification?.message}</Text>
            <Text style={styles.modalTime}>{selectedNotification?.time}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
    textAlign: "center"
  },
  notificationCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: "center",
    elevation: 3,
    shadowColor: "gray",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  readNotification: {
    backgroundColor: "#e8e8e8",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  modalTime: {
    fontSize: 14,
    color: "gray",
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: "#010153",
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  readTitle: {
    color: "#666",
  },
  message: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
  },
  time: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
});

export default NotificationScreen;