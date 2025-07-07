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
  I18nManager,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LineChart } from "react-native-chart-kit";
import { backendURL } from "../utils/exports";
import { getToken } from "../utils/asyncStorage";
import { RootStackParamList } from "../../App";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../context/LanguageContext";

interface DashboardData {
  purchase: number;
  totalSpent: number;
  periodicData: { month: number; paidAmount: number }[];
}

const Dashboard: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentCar, setCurrentCar] = useState<string | null>(null);
  const { t } = useTranslation();
  const { direction } = useLanguage();
  const isRTL = I18nManager.isRTL || direction === "rtl";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const [dashboardRes, carRes] = await Promise.all([
          fetch(`${backendURL}/dashboard/buyer`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${backendURL}/auction/active-car`),
        ]);

        const dashboardData = await dashboardRes.json();
        const carData = await carRes.json();

        if (dashboardRes.ok) setData(dashboardData);
        if (carRes.ok) setCurrentCar(carData._id);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleJoin = () => {
    if (currentCar) {
      navigation.navigate('CarDetails', { carId: currentCar });
    } else {
      navigation.navigate('AuctionVehicles', { selectedAuctionProp: "" });
    }
  };

  const formatNumber = (num: number) =>
    num >= 1e6 ? (num / 1e6).toFixed(1) + "M" :
      num >= 1e3 ? (num / 1e3).toFixed(1) + "K" : num;

  const chartData = useMemo(() => {
    const values = new Array(12).fill(0);
    data?.periodicData?.forEach(({ month, paidAmount }) => {
      if (month >= 1 && month <= 12) values[month - 1] = paidAmount;
    });

    return {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      datasets: [{ data: values, color: (opacity = 1) => `rgba(64, 95, 242, ${opacity})` }],
    };
  }, [data]);

  return (
    <ScrollView style={[styles.container, isRTL && styles.rtl]}>
      <Text style={[styles.header, isRTL && styles.textRTL]}>{t("dashboard")}</Text>

      <View style={styles.statsContainer}>
        <View style={styles.card}>
          <Icon name="cart-outline" size={30} color="#010153" style={styles.icon} />
          <Text style={styles.cardTitle}>{t("orders")}</Text>
          <Text style={styles.cardValue}>{data?.purchase || 0}</Text>
        </View>
        <View style={styles.card}>
          <Icon name="bank-transfer" size={25} color="#010153" style={styles.icon} />
          <Text style={styles.cardTitle}>{t("total_spent")}</Text>
          <Text style={styles.cardValue}>{`AED ${formatNumber(data?.totalSpent || 0)}`}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.bannerContainer} onPress={handleJoin}>
        <ImageBackground
          source={require("../assets/images/dashcar.png")}
          style={styles.bannerImage}
          imageStyle={{ borderRadius: 10 }}
        >
          <View style={[styles.bannerOverlay, isRTL && { gap: 100 }]}>
            <Text style={[styles.bannerText, isRTL && styles.textRTL]}>
              {t("join_live_auction_now")}
            </Text>
            <Icon name={isRTL ? "arrow-left" : "arrow-right"} size={24} color="#fff" />
          </View>
        </ImageBackground>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#010153" style={styles.loader} />
      ) : (
        <View style={{ marginBottom: 110 }}>
          <View style={styles.chartContainer}>
            <Text style={[styles.chartTitle, isRTL && styles.textRTL]}>
              {t("spending_trend")}
            </Text>
            <LineChart
              data={chartData}
              width={Dimensions.get("window").width - 40}
              height={220}
              chartConfig={{
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                propsForLabels: { fontSize: 8 },
              }}
              bezier
              style={styles.chartStyle}
            />
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", padding: 20 },
  rtl: { flexDirection: "column" },
  header: { fontSize: 22, fontWeight: "bold", margin: 5, textAlign: "left" },
  textRTL: { textAlign: "left" },
  statsContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 30 },
  card: { flex: 1, backgroundColor: "#fff", padding: 20, borderRadius: 10, alignItems: "center", marginHorizontal: 5 },
  icon: { marginBottom: 5, backgroundColor: "#e9f2ff", padding: 10, borderRadius: 100 },
  cardTitle: { fontSize: 14, color: "gray", textAlign: "center" },
  cardValue: { fontSize: 20, fontWeight: "bold", color: "#000", textAlign: "center" },
  bannerContainer: { marginVertical: 20 },
  bannerImage: { height: 150 },
  bannerOverlay: { flexDirection: "row", alignItems: "center", padding: 20, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 10 },
  bannerText: { color: "#fff", fontSize: 18, fontWeight: "bold", flex: 1, textAlign: "left" },
  chartContainer: { backgroundColor: "#fff", borderRadius: 10, marginTop: 10 },
  chartTitle: { fontSize: 12, fontWeight: "bold", margin: 20, textAlign: "left" },
  chartStyle: { borderRadius: 10 },
  loader: { marginVertical: 20, alignSelf: "center" },
});

export default Dashboard;