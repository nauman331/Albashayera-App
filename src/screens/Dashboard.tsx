import React, { useEffect, useState } from "react";
import { 
  View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, ActivityIndicator 
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LineChart, BarChart, PieChart } from "react-native-chart-kit";
import { backendURL } from "../utils/exports";
import { getToken } from "../utils/asyncStorage";

const Dashboard = () => {
  const screenWidth = Dimensions.get("window").width;
  const [data, setData] = useState<{
    purchase: number;
    totalSpent: number;
    periodicData: { paidAmount: number; year: number; month: number }[];
  } | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const tokenInner = await getToken();
        setToken(tokenInner);
      } catch (error) {
        console.error("Error fetching token:", error);
      }
    };
    fetchToken();
  }, []);

  useEffect(() => {
    if (token) {
      getData();
    }
  }, [token]);

  const getData = async () => {
    if (!token) return;
    
    setDataLoading(true);
    try {
      const response = await fetch(`${backendURL}/dashboard/buyer`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const res_data = await response.json();
      if (response.ok) {
        setData(res_data);
      } else {
        console.error("API Error:", res_data.message);
      }
    } catch (error) {
      console.error("Network Error:", error);
    } finally {
      setDataLoading(false);
    }
  };

  const purchaseCount = data?.purchase || 0;
  const totalSpent = data?.totalSpent || 0;
  const periodicData = data?.periodicData || [];

  // Extracting months and amounts for the chart
  const labels = periodicData.map((entry) => `M${entry.month}`);
  const values = periodicData.map((entry) => entry.paidAmount);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>Dashboard</Text>
      <Text style={styles.subHeader}>Whole Progress of Spendings</Text>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <View style={styles.card}>
          <Icon name="cart-outline" size={30} color="#007bff" style={styles.icon} />
          <Text style={styles.cardTitle}>Purchases</Text>
          <Text style={styles.cardValue}>{purchaseCount}</Text>
        </View>
        <View style={styles.card}>
          <Icon name="currency-usd" size={30} color="#007bff" style={styles.icon} />
          <Text style={styles.cardTitle}>Total Spent</Text>
          <Text style={styles.cardValue}>AED {totalSpent.toLocaleString()}</Text>
        </View>
      </View>

      {/* Live Auction Banner */}
      <TouchableOpacity style={styles.bannerContainer} onPress={() => console.log("Navigate to Live Auction")}>
        <View style={styles.bannerOverlay}>
          <Text style={styles.bannerText}>Join Live Auction Now</Text>
          <Icon name="arrow-right" size={24} color="#fff" style={styles.bannerIcon} />
        </View>
        <View style={styles.bannerBackground} />
      </TouchableOpacity>

      {/* Loading Indicator */}
      {dataLoading && <ActivityIndicator size="large" color="#007bff" style={styles.loader} />}

      {/* Charts Section */}
      {!dataLoading && (
        <>
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Spending Trend</Text>
            <LineChart
              data={{
                labels: labels.length ? labels : ["Jan", "Feb", "Mar"],
                datasets: [{ data: values.length ? values : [0, 0, 0] }],
              }}
              width={screenWidth - 40}
              height={220}
              chartConfig={{
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                strokeWidth: 2,
              }}
              bezier
              style={styles.chartStyle}
            />
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", padding: 20 },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 5 },
  subHeader: { fontSize: 14, color: "gray", marginBottom: 20 },
  statsContainer: { flexDirection: "row", justifyContent: "space-between" },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    marginHorizontal: 5,
  },
  icon: { marginBottom: 5 },
  cardTitle: { fontSize: 14, color: "gray" },
  cardValue: { fontSize: 20, fontWeight: "bold", color: "#000" },
  bannerContainer: {
    backgroundColor: "#007bff",
    borderRadius: 10,
    marginVertical: 20,
    overflow: "hidden",
    position: "relative",
  },
  bannerOverlay: { position: "absolute", top: 20, left: 20, flexDirection: "row", alignItems: "center" },
  bannerText: { color: "#fff", fontSize: 18, fontWeight: "bold", marginRight: 10 },
  bannerIcon: { marginLeft: 5 },
  bannerBackground: { height: 150, backgroundColor: "rgba(0, 123, 255, 0.3)" },
  chartContainer: { backgroundColor: "#fff", padding: 20, borderRadius: 10, marginTop: 10 },
  chartTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  chartStyle: { borderRadius: 10 },
  loader: { marginVertical: 20, alignSelf: "center" },
});

export default Dashboard;
