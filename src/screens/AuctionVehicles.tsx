import { StyleSheet, Text, View, FlatList, Image, Pressable } from "react-native";
import React from "react";
import useFetchCarsAndCategories from "../hooks/useFetchCarsAndCategories";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const AuctionVehicles: React.FC = () => {
  const { cars, loading, error } = useFetchCarsAndCategories();
  const navigation = useNavigation();

  if (loading) return <Text style={styles.loadingText}>Loading...</Text>;
  if (error) return <Text style={styles.errorText}>Error: {error}</Text>;

  const filteredCars = Array.isArray(cars)
    ? cars.filter(item =>
        !item.isSold &&
        !(item.sellingType === "auction" && (!item.auctionLot || item.auctionLot.statusText === "Compeleted"))
      )
    : [];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Auction Vehicles</Text>

      {filteredCars.length === 0 ? (
        <Text style={styles.noCarsText}>No Available Cars</Text>
      ) : (
        <FlatList
          data={filteredCars}
          keyExtractor={(item) => item?.id?.toString() ?? Math.random().toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {item?.carImages.length > 0 ? (
                <Image source={{ uri: item.carImages?.[0] }} style={styles.carImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.placeholderText}>No Image</Text>
                </View>
              )}

              <View style={styles.cardContent}>
                <Text style={styles.carName}>{item?.listingTitle || "Unknown Car"}</Text>
                <Text style={styles.description}>{item.description || "No Description"}</Text>
                <View style={{ borderBottomColor: 'gray', borderBottomWidth: 1, marginVertical: 10 }} />
                <View style={styles.detailsRow}>
                  <View style={styles.detailItem}>
                    <Icon name="road-variant" size={18} color="#444" />
                    <Text style={styles.detailText}>{item?.mileage ?? "N/A"} MI</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Icon name="gas-station" size={18} color="#444" />
                    <Text style={styles.detailText}>{item?.fuelType?.vehicleFuelTypes || "Unknown"}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Icon name="car-shift-pattern" size={18} color="#444" />
                    <Text style={styles.detailText}>{item?.transmission?.vehicleTransimission || "N/A"}</Text>
                  </View>
                </View>
                <View style={{ borderBottomColor: 'gray', borderBottomWidth: 1, marginVertical: 10 }} />
                <View style={styles.footer}>
                  <Text style={styles.price}>AED {item.startingBid || "N/A"}</Text>
                  <Pressable>
                    <Text style={styles.viewDetails}>View Details →</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default AuctionVehicles;

const styles = StyleSheet.create({
  container: { padding: 15, backgroundColor: "#F5F5F5", flex: 1 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  loadingText: { textAlign: "center", marginTop: 20, fontSize: 16 },
  errorText: { textAlign: "center", marginTop: 20, fontSize: 16, color: "red" },
  noCarsText: { textAlign: "center", fontSize: 16, color: "#666", marginTop: 10 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  carImage: { width: "100%", height: 180, resizeMode: "cover" },
  imagePlaceholder: {
    width: "100%",
    height: 180,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: { fontSize: 14, color: "#666" },

  cardContent: { padding: 20 },
  carName: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  description: { fontSize: 14, color: "#666", marginBottom: 8 },

  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  detailItem: {
    alignItems: "center",
    gap: 5,
  },
  detailText: { fontSize: 14, color: "#444" },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: { fontSize: 16, fontWeight: "bold" },
  viewDetails: { fontSize: 14, color: "#007BFF", fontWeight: "600" },
});
