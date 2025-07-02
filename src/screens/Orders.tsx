import React, { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { backendURL } from "../utils/exports";
import { getToken } from "../utils/asyncStorage";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";


interface Order {
  invNumber: string;
  statusText: string;
  carId: any;
  id: string;
  image: string;
  name: string;
  vin: string;
  paymentStatus: "payment pending" | "approved" | "rejected";
  totalAmount: string;
}

const OrdersScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [token, setToken] = useState<string | null>(null);
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState<boolean>(false)
  const { t } = useTranslation();

  useEffect(() => {
    const fetchToken = async () => {
      const tokeninner = await getToken();
      setToken(tokeninner)
    }
    fetchToken()
  }, [])


  const getInvoices = async () => {
    const authorizationToken = `Bearer ${token}`;
    try {
      setLoading(true);
      const response = await fetch(`${backendURL}/purchase-invoice/get-inoivces`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authorizationToken,
        },
      });
      const res_data = await response.json();
      if (response.ok) {
        setOrders(res_data);
      } else {
        console.error(res_data.message);
      }
    } catch (error) {
      console.error('Error in getting invoices', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getInvoices();  // Fetch invoices when the screen comes into focus
    }, [token])  // Refetch only when the token changes
  );

  const handleOrderClick = (id: string) => {
    navigation.navigate("OrderDetails", { orderId: id })
  };

  const statusIcons: { [key in Order["paymentStatus"]]: string } = {
    "payment pending": "schedule",
    "approved": "check-circle",
    "rejected": "cancel",
  };

  const statusStyleMapping: { [key in Order["paymentStatus"]]: any } = {
    "payment pending": styles.pending,
    approved: styles.approved,
    rejected: styles.rejected,
  };

  const statusTextStyleMapping: { [key in Order["paymentStatus"]]: any } = {
    "payment pending": styles.pendingText,
    approved: styles.approvedText,
    rejected: styles.rejectedText,
  };




  const renderItem = ({ item }: { item: Order }) => {

    const status = item.statusText as Order["paymentStatus"];

    return (
      <TouchableOpacity style={styles.orderCard} onPress={() => handleOrderClick(item?.invNumber)}>
        <Image source={{ uri: item?.carId?.carImages[0] || "" }} style={styles.image} />
        <View style={{ borderBottomColor: '#ccc', borderBottomWidth: 1, marginVertical: 10 }} />
        <View style={styles.detailsContainer}>
          <Text style={styles.carName}>{item?.carId?.listingTitle || t("unknown_vehicle") || "Unknown Vehicle"}</Text>
          <Text style={styles.carVin}>{t("vin")}{item?.carId?.vin || ""}</Text>
          <Text style={styles.amount}>{t("total")}: {item.totalAmount || 0} AED</Text>
        </View>
        <View
          style={[
            styles.statusBar,
            statusStyleMapping[status] || { backgroundColor: "gray" }
          ]}
        >
          <Icon
            name={statusIcons[status] || "help-outline"}
            size={18}
            color={statusTextStyleMapping[status]?.color || "black"}
          />
          <Text
            style={[
              styles.statusText,
              statusTextStyleMapping[status] || { color: "black" }
            ]}
          >
            {item?.statusText?.charAt(0).toUpperCase() + item?.statusText?.slice(1) || t("n_a") || "N/A"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{t("orders")}</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#010153" />
      ) : orders.length < 1 ? (
        <View style={styles.notfound}>
          <Text style={styles.notfoundText}>{t("no_orders_found")}</Text>
          <Image source={require("../assets/images/orders.png")} style={styles.carImage} />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 20,
    marginBottom: 50,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  list: {
    paddingBottom: 10,
  },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "gray",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
    padding: 10,
  },
  image: {
    width: "100%",
    height: 150,
    borderRadius: 10,
  },
  detailsContainer: {
    padding: 15,
  },
  carName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#444",
    marginBottom: 5,
  },
  carVin: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  amount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  statusBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    justifyContent: "center",
    marginBottom: 10
  },
  pending: {
    backgroundColor: "#FDEBD0",
  },
  approved: {
    backgroundColor: "#D4EFDF",
  },
  rejected: {
    backgroundColor: "#FADBD8",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "left", // Ensure text is aligned properly
    overflow: "visible",
  },
  pendingText: {
    color: "#F39C12",
  },
  approvedText: {
    color: "#27AE60",
  },
  rejectedText: {
    color: "#E74C3C",
  },
  notfound: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40
  },
  notfoundText: {
    fontWeight: "bold",
    fontSize: 30,
    marginBottom: 30
  },
  carImage: { width: "100%", height: 180, resizeMode: "cover" },
});

export default OrdersScreen;