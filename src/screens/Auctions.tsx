import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Image } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { backendURL } from "../utils/exports";
import { RootStackParamList } from "../../App";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

interface Auction {
  _id: string;
  auctionTitle: string;
  auctionDate: string;
  auctionTime: string;
  location?: { auctionLocation?: string };
  totalVehicles: number;
  statusText: string;
}

interface Timer {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const AuctionCard: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [timers, setTimers] = useState<{ [key: string]: Timer }>({});

  const getAllAuctions = async () => {
    try {
      const response = await fetch(`${backendURL}/auction`);
      const res_data: Auction[] = await response.json();
      if (response.ok) {
        setAuctions(res_data);
      } else {
        console.error(res_data);
      }
    } catch (error) {
      console.error("Error fetching auctions", error);
    }
  };

  useEffect(() => {
    getAllAuctions();
  }, []);

  const calculateTimeLeft = (auctionDate: string, auctionTime: string): Timer => {
    try {
      const match = auctionTime.match(/(\d+):(\d+) (\w{2})/);
      if (!match) {
        console.error("Invalid auctionTime format:", auctionTime);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      const [_, hours, minutes, period] = match;
      let parsedHours = parseInt(hours, 10);
      const parsedMinutes = parseInt(minutes, 10);

      if (period.toLowerCase() === "pm" && parsedHours !== 12) parsedHours += 12;
      if (period.toLowerCase() === "am" && parsedHours === 12) parsedHours = 0;

      const auctionDateTime = new Date(auctionDate);
      auctionDateTime.setHours(parsedHours, parsedMinutes, 0);

      const now = new Date();
      const difference = auctionDateTime.getTime() - now.getTime();

      return difference > 0
        ? {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / (1000 * 60)) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        }
        : { days: 0, hours: 0, minutes: 0, seconds: 0 };
    } catch (error) {
      console.error("Error calculating time left", error);
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
  };

  useEffect(() => {
    const updateTimers = () => {
      const newTimers: { [key: string]: Timer } = {};

      auctions.forEach((auction) => {
        newTimers[auction._id] = calculateTimeLeft(auction.auctionDate, auction.auctionTime);
      });

      setTimers(newTimers);
    };

    updateTimers(); // Initial update

    const interval = setInterval(updateTimers, 1000);
    return () => clearInterval(interval);
  }, [auctions]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Live Events</Text>
      {auctions.some((auction) => auction.statusText === "Ongoing") ? (
        <FlatList
          data={auctions.filter((auction) => auction.statusText === "Ongoing")}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.auctionTitle || "N/A"}</Text>
              </View>
              <View style={styles.countdownContainer}>
                <Text>{timers[item._id]?.days}d</Text>
                <Text>{timers[item._id]?.hours}h</Text>
                <Text>{timers[item._id]?.minutes}m</Text>
                <Text>{timers[item._id]?.seconds}s</Text>
              </View>
              <View style={styles.detailsContainer}>
                <Text>
                  <Icon name="location-on" size={16} /> {item.location?.auctionLocation || "N/A"}
                </Text>
                <Text>
                  <Icon name="directions-car" size={16} /> Total Cars {item.totalVehicles || 0}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.viewButton}
                onPress={() => navigation.navigate("AuctionVehicles", { selectedAuctionProp: item.auctionTitle })}
              >
                <Text style={styles.viewButtonText}>Join Auction</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      ) : (
        <View style={styles.notfound}>
          <Text style={styles.notfoundText}>No Ongoing Events Available</Text>
          <Image source={require("../assets/images/vintage.png")} style={styles.carImage} />
        </View>
      )}

      <Text style={styles.header}>Upcoming Auctions</Text>
      {auctions.some((auction) => auction.statusText === "Pending") ? (
        <FlatList
          data={auctions.filter((auction) => auction.statusText === "Pending")}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.auctionTitle || "N/A"}</Text>
              </View>
              <View style={styles.countdownContainer}>
                <Text>{timers[item._id]?.days}d</Text>
                <Text>{timers[item._id]?.hours}h</Text>
                <Text>{timers[item._id]?.minutes}m</Text>
                <Text>{timers[item._id]?.seconds}s</Text>
              </View>
              <View style={styles.detailsContainer}>
                <Text>
                  <Icon name="location-on" size={16} /> {item.location?.auctionLocation || "N/A"}
                </Text>
                <Text>
                  <Icon name="directions-car" size={16} /> Total Cars {item.totalVehicles || 0}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.viewButton}
                onPress={() => navigation.navigate("AuctionVehicles", { selectedAuctionProp: item.auctionTitle })}
              >
                <Text style={styles.viewButtonText}>View All Cars</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      ) : (
        <View style={styles.notfound}>
          <Text style={styles.notfoundText}>No Upcoming Events Available</Text>
          <Image source={require("../assets/images/towing.png")} style={styles.carImage} />
        </View>
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
  viewButton: {
    backgroundColor: "#010153",
    padding: 12,
    borderRadius: 5,
    marginTop: 15,
    alignItems: "center",
    justifyContent: "center"
  },
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
