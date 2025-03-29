import React, { useEffect, useState, useMemo } from "react";
import { 
  View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, ActivityIndicator 
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LineChart } from "react-native-chart-kit";
import { backendURL } from "../utils/exports";
import { getToken } from "../utils/asyncStorage";

const Dashboard = () => {
  const screenWidth = Dimensions.get("window").width;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        
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
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const purchaseCount = data?.purchase || 0;
  const totalSpent = data?.totalSpent || 0;

  const chartData = useMemo(() => {
    const defaultLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const defaultValues = new Array(12).fill(0);
    
    data?.periodicData?.forEach(({ month, paidAmount }) => {
      if (month >= 1 && month <= 12) {
        defaultValues[month - 1] = paidAmount;
      }
    });

    return {
      labels: defaultLabels,
      datasets: [{
        data: defaultValues,
        color: (opacity = 1) => `rgba(64, 95, 242, ${opacity})`,
        strokeWidth: 3,
      }],
    };
  }, [data]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Dashboard</Text>
      <Text style={styles.subHeader}>Whole Progress of Spendings</Text>

      <View style={styles.statsContainer}>
        <View style={styles.card}>
          <Icon name="cart-outline" size={30} color="#405FF2" style={styles.icon} />
          <Text style={styles.cardTitle}>Purchases</Text>
          <Text style={styles.cardValue}>{purchaseCount}</Text>
        </View>
        <View style={styles.card}>
          <Icon name="currency-usd" size={30} color="#405FF2" style={styles.icon} />
          <Text style={styles.cardTitle}>Total Spent</Text>
          <Text style={styles.cardValue}>AED {totalSpent.toLocaleString()}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.bannerContainer} onPress={() => console.log("Navigate to Live Auction")}>        
        <View style={styles.bannerOverlay}>
          <Text style={styles.bannerText}>Join Live Auction Now</Text>
          <Icon name="arrow-right" size={24} color="#fff" style={styles.bannerIcon} />
        </View>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#405FF2" style={styles.loader} />
      ) : (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Spending Trend</Text>
          <LineChart
            data={chartData}
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
  bannerContainer: { backgroundColor: "#405FF2", borderRadius: 10, marginVertical: 20 },
  bannerOverlay: { flexDirection: "row", alignItems: "center", padding: 20 },
  bannerText: { color: "#fff", fontSize: 18, fontWeight: "bold", marginRight: 10 },
  bannerIcon: { marginLeft: 5 },
  chartContainer: { backgroundColor: "#fff", padding: 20, borderRadius: 10, marginTop: 10 },
  chartTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  chartStyle: { borderRadius: 10 },
  loader: { marginVertical: 20, alignSelf: "center" },
});

export default Dashboard;
