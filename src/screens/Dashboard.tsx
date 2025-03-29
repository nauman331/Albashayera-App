import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { BarChart, LineChart } from "react-native-chart-kit";
import { backendURL } from "../utils/exports";
import { getToken } from "../utils/asyncStorage";
import { RootStackParamList } from "../../App";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";

interface PeriodicData {
  month: number;
  paidAmount: number;
}

interface DashboardData {
  purchase: number;
  totalSpent: number;
  periodicData: PeriodicData[];
}

interface Car {
  _id: string;
}

const Dashboard: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const screenWidth = Dimensions.get("window").width;
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentCar, setCurrentCar] = useState<Car | null>(null);

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

        const res_data: DashboardData = await response.json();
        if (response.ok) {
          setData(res_data);
        } else {
          console.error("API Error:", res_data);
        }
      } catch (error) {
        console.error("Network Error:", error);
      } finally {
        setLoading(false);
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
          } else {
            console.log(res_data.message || "Failed to fetch the current car.");
          }
        } catch (error) {
          console.log("Error in getting the current car:", error);
        }
      };
    

    fetchData();
    getCurrentCar()
  }, []);

  const handleJoin = () => {
    if (currentCar) {
      navigation.navigate('CarDetails', { carId: currentCar._id })
    } else {
      navigation.navigate("AuctionVehicles",  { selectedAuctionProp: "" })
    };
  }

  const purchaseCount = data?.purchase || 0;
  const totalSpent = data?.totalSpent || 0;

  const chartData = useMemo(() => {
    const labels = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const values = new Array(12).fill(0);

    data?.periodicData?.forEach(({ month, paidAmount }) => {
      if (month >= 1 && month <= 12) {
        values[month - 1] = paidAmount;
      }
    });

    return {
      labels,
      datasets: [
        {
          data: values,
          color: (opacity = 1) => `rgba(64, 95, 242, ${opacity})`,
        },
      ],
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

      <TouchableOpacity style={styles.bannerContainer} onPress={handleJoin}>
        <ImageBackground 
          source={{ uri: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1583&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" }}
          style={styles.bannerImage}
          imageStyle={{ borderRadius: 10 }}
        >
          <View style={styles.bannerOverlay}>
            <Text style={styles.bannerText}>Join Live Auction Now</Text>
            <Icon name="arrow-right" size={24} color="#fff" />
          </View>
        </ImageBackground>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#405FF2" style={styles.loader} />
      ) : (
        
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Spending Trend (Line Chart)</Text>
            <LineChart
              data={chartData}
              width={screenWidth - 40}
              height={220}
              chartConfig={{
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                propsForLabels: {
                  fontSize: 8,
                },
              }}
              bezier
              style={styles.chartStyle}
            />
            <View style={{ borderBottomColor: '#f8f9fa', borderBottomWidth: 10, marginVertical: 10 }} />
      <View style={{marginBottom: 100}}>
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Spending Distribution (Bar Chart)</Text>
            <BarChart
                data={chartData}
                width={screenWidth - 50}
                height={220}
                chartConfig={{
                  backgroundGradientFrom: "#fff",
                  backgroundGradientTo: "#fff",
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  propsForLabels: {
                    fontSize: 8,
                  },
                }}
                style={styles.chartStyle} yAxisLabel={""} yAxisSuffix={""}            />
          </View>
          <View style={{ borderBottomColor: '#f8f9fa', borderBottomWidth: 10, marginVertical: 10 }} />
      
        </View>
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
  card: { flex: 1, backgroundColor: "#fff", padding: 20, borderRadius: 10, alignItems: "center", marginHorizontal: 5 },
  icon: { marginBottom: 5 },
  cardTitle: { fontSize: 14, color: "gray" },
  cardValue: { fontSize: 20, fontWeight: "bold", color: "#000", textAlign: "center" },
  bannerContainer: { marginVertical: 20 },
  bannerImage: { height: 150 },
  bannerOverlay: { flexDirection: "row", alignItems: "center", padding: 20, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 10,
   },
  bannerText: { color: "#fff", fontSize: 18, fontWeight: "bold", flex: 1 },
  chartContainer: { backgroundColor: "#fff", borderRadius: 10, marginTop: 10 },
  chartTitle: { fontSize: 12, fontWeight: "bold", margin: 20 },
  chartStyle: { borderRadius: 10 },
  loader: { marginVertical: 20, alignSelf: "center" },
});

export default Dashboard;