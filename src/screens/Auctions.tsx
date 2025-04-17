import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Image, ActivityIndicator } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
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
interface Car {
  _id: string;
}


const AuctionCard: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [currentCar, setCurrentCar] = useState<Car | null>(null);
  const [timers, setTimers] = useState<{ [key: string]: Timer }>({});
  const [loading, setLoading] = useState<boolean>(false);

  const getAllAuctions = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${backendURL}/auction`);
      const res_data: Auction[] = await response.json();
      if (response.ok) {
        setAuctions(res_data);
      } else {
        console.error(res_data);
      }
    } catch (error) {
      console.error("Error fetching auctions", error);
    } finally {
      setLoading(false)
    }
  };

  const getCurrentCar = async () => {
    try {
      setLoading(true)
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
    } finally {
      setLoading(false)
    }
  };

  useFocusEffect(
    useCallback(() => {
      getAllAuctions();
      getCurrentCar();
    }, [])
  );
  

  const handleJoin = (auctionTitle: string) => {
    if (currentCar) {
      navigation.navigate('CarDetails', { carId: currentCar._id })
    } else {
      navigation.navigate("AuctionVehicles", { selectedAuctionProp: auctionTitle })
    };
  }

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

  if(loading) {
    return <ActivityIndicator size="large" color="blue" style={styles.loader} />
  }

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
              <View style={{ borderBottomColor: '#ccc', borderBottomWidth: 1, marginVertical: 10 }} />
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
                onPress={() => handleJoin(item.auctionTitle)}
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
              <View style={{ borderBottomColor: '#ccc', borderBottomWidth: 1, marginVertical: 10 }} />

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
                onPress={() => handleJoin(item.auctionTitle)}
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
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  card: { backgroundColor: "#fff", padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 2 },
  cardHeader: { marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  cardDate: { fontSize: 14, color: "gray" },
  countdownContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  detailsContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 },
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
