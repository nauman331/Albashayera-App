import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Image } from "react-native";
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

  const formatLocalDateTime = (isoString: string): string => {
    try {
      if (!isoString) return "Invalid Date";

      const cleanISOString = isoString.replace(/:(\d{3})Z/, ".$1Z");

      const dateTime = new Date(cleanISOString);

      if (isNaN(dateTime.getTime())) return "Invalid Date";

      return dateTime.toLocaleDateString() + " " + dateTime.toLocaleTimeString();
    } catch (error) {
      return "Invalid Date";
    }
  };



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
      <Text style={styles.header}>Live Events</Text>
      {auctions.filter((auction) => auction.statusText === "Ongoing").length === 0 ? (
        <View style={styles.notfound}>
                  <Text style={styles.notfoundText}>No Ongoing Events Available</Text>
                  <Image source={require("../assets/images/vintage.png")} style={styles.carImage} />
                </View>
      ) : (
        <FlatList
          data={auctions.filter((auction) => auction.statusText === "Ongoing")}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.auctionTitle || "N/A"}</Text>
                <Text style={styles.cardDate}>{formatLocalDateTime(item.auctionDate)}</Text>
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
                  <Icon name="directions-car" size={16} /> Total Cars {item.totalVehicles || 0}
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
      )}
  
    <View style={{ borderBottomColor: '#ccc', borderBottomWidth: 1, marginVertical: 10 }} />
      <Text style={styles.header}>Upcoming Auctions</Text>
      {auctions.filter((auction) => auction.statusText === "Pending").length === 0 ? (
        <View style={styles.notfound}>
                  <Text style={styles.notfoundText}>No Upcoming Events Available</Text>
                  <Image source={require("../assets/images/towing.png")} style={styles.carImage} />
                </View>
      ) : (
        <FlatList
          data={auctions.filter((auction) => auction.statusText === "Pending")}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.auctionTitle || "N/A"}</Text>
                <Text style={styles.cardDate}>{formatLocalDateTime(item.auctionDate)}</Text>
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
                  <Icon name="directions-car" size={16} /> Total Cars {item.totalVehicles || 0}
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
      )}
    </View>
  );
  
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  card: { backgroundColor: "#fff", padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 2 },
  cardHeader: { marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: "bold" },
  cardDate: { fontSize: 14, color: "gray" },
  countdownContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  detailsContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  viewButton: { backgroundColor: "#010153", padding: 8, borderRadius: 5 },
  viewButtonText: { color: "#fff", fontSize: 12 },
  noEventsText: {
    fontSize: 16,
    textAlign: "center",
    color: "gray",
    marginVertical: 10,
  },
  notfound: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40
  },
  notfoundText: {
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 30,
    color: "#aaa"
  },
  carImage: { width: "100%", height: 180, resizeMode: "cover", marginBottom: 30 },
});

export default AuctionCard;
