import React from "react";
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

interface Order {
  id: string;
  image: string;
  name: string;
  vin: string;
  paymentStatus: "pending" | "approved" | "rejected";
  totalAmount: string;
}

const orders: Order[] = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1583&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    name: "Toyota Corolla",
    vin: "1HGBH41JXMN109186",
    paymentStatus: "pending",
    totalAmount: "$22,000",
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1583&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    name: "Honda Civic",
    vin: "2HGCM82633A123456",
    paymentStatus: "approved",
    totalAmount: "$25,000",
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1583&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    name: "BMW 3 Series",
    vin: "WBA8B9C55HK866541",
    paymentStatus: "rejected",
    totalAmount: "$50,000",
  },
];

const OrdersScreen: React.FC = () => {
  const handleOrderClick = (id: string) => {
    console.log(`Navigating to details page for order: ${id}`);
  };

  const statusIcons: { [key in Order["paymentStatus"]]: string } = {
    pending: "schedule",
    approved: "check-circle",
    rejected: "cancel",
  };

  const statusStyleMapping: { [key in Order["paymentStatus"]]: any } = {
    pending: styles.pending,
    approved: styles.approved,
    rejected: styles.rejected,
  };

  const statusTextStyleMapping: { [key in Order["paymentStatus"]]: any } = {
    pending: styles.pendingText,
    approved: styles.approvedText,
    rejected: styles.rejectedText,
  };

  const renderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity style={styles.orderCard} onPress={() => handleOrderClick(item.id)}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.detailsContainer}>
        <Text style={styles.carName}>{item.name}</Text>
        <Text style={styles.carVin}>VIN: {item.vin}</Text>
        <Text style={styles.amount}>Total: {item.totalAmount}</Text>
      </View>
      <View style={[styles.statusBar, statusStyleMapping[item.paymentStatus]]}>
        <Icon name={statusIcons[item.paymentStatus]} size={18} style={statusTextStyleMapping[item.paymentStatus]} />
        <Text style={[styles.statusText, statusTextStyleMapping[item.paymentStatus]]}> {item.paymentStatus}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Car Orders</Text>
      <FlatList data={orders} keyExtractor={(item) => item.id} renderItem={renderItem} contentContainerStyle={styles.list} />
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
    textTransform: "lowercase",
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
});

export default OrdersScreen;