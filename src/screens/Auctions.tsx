import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { backendURL } from "../utils/exports";
import { RootStackParamList } from "../../App";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';


interface Auction {
  id: string;
  auctionTitle: string;
  auctionDate: string;
  auctionTime: string;
  location: { auctionLocation: string };
  totalVehicles: number;
  statusText: string;
}

const AuctionCard: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'AuctionEvents'>>();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [timers, setTimers] = useState<{ days: number; hours: number; minutes: number; seconds: number }[]>([]);

  const getAllAuctions = async () => {
    try {
      const response = await fetch(`${backendURL}/auction`, {
        method: "GET",
      });

      const res_data = await response.json();
      if (response.ok) {
        setAuctions(res_data);
      } else {
        console.error(res_data.message);
      }
    } catch (error) {
      console.error("Error fetching auctions", error);
    }
  };

  useEffect(() => {
    getAllAuctions();
  }, []);

  const calculateTimeLeft = (date: string, time: string) => {
    const auctionDateTime = new Date(`${date} ${time}`);
    const now = new Date();
    const difference = auctionDateTime.getTime() - now.getTime();

    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / (1000 * 60)) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(
        auctions.map((auction) =>
          calculateTimeLeft(
            new Date(auction.auctionDate).toISOString().split("T")[0],
            auction.auctionTime
          )
        )
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [auctions]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Upcoming Auctions</Text>
      <FlatList
        data={auctions.filter((auction) => auction.statusText === "Pending")}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.auctionTitle || "N/A"}</Text>
              <Text style={styles.cardDate}>{item.auctionDate} at {item.auctionTime || "N/A"}</Text>
            </View>
            <View style={styles.countdownContainer}>
              {timers[index] ? (
                <>
                  <Text>{timers[index].days}d</Text>
                  <Text>{timers[index].hours}h</Text>
                  <Text>{timers[index].minutes}m</Text>
                  <Text>{timers[index].seconds}s</Text>
                </>
              ) : (
                <Text>Started</Text>
              )}
            </View>
            <View style={styles.detailsContainer}>
              <Text>
                <Icon name="location-on" size={16} /> {item.location?.auctionLocation || "N/A"}
              </Text>
              <Text>
                <Icon name="directions-car" size={16} /> No of Cars {item.totalVehicles || 0}
              </Text>
              <TouchableOpacity
                style={styles.viewButton}
                onPress={() => navigation.navigate("AuctionEvents")}
              >
                <Text style={styles.viewButtonText}>View All</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  card: { backgroundColor: "#fff", padding: 15, borderRadius: 10, marginBottom: 10, elevation: 3 },
  cardHeader: { marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: "bold" },
  cardDate: { fontSize: 14, color: "gray" },
  countdownContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  detailsContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  viewButton: { backgroundColor: "#050b20", padding: 8, borderRadius: 5 },
  viewButtonText: { color: "#fff", fontSize: 12 },
});

export default AuctionCard;
