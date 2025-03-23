import { StyleSheet, Text, View, FlatList, Image, Pressable, Modal, TextInput, ScrollView } from "react-native";
import React, { useState } from "react";
import useFetchCarsAndCategories from "../hooks/useFetchCarsAndCategories";
import { useNavigation } from "@react-navigation/native";
import fuel from "../assets/images/fuel.png";
import speedometer from "../assets/images/speedometer.png";
import gearbox from "../assets/images/gearbox.png";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import { Picker } from "@react-native-picker/picker";
import CheckBox from "@react-native-community/checkbox";

const AuctionVehicles: React.FC = () => {
  const { cars, loading, error } = useFetchCarsAndCategories();
  const navigation = useNavigation();

  const [isFilterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    selectedMake: "All",
    minYear: "",
    maxYear: "",
    selectedDriveType: "All",
    selectedDoors: "All",
    selectedCylinder: "All",
    selectedFuelTypes: [] as string[],
    selectedTransmissions: [] as string[],
  });


  const toggleFilterModal = () => setFilterVisible(!isFilterVisible);

  if (loading) return <Text style={styles.loadingText}>Loading...</Text>;
  if (error) return <Text style={styles.errorText}>Error: {error}</Text>;

  const filteredCars = Array.isArray(cars)
    ? cars.filter(item =>
      !item.isSold &&
      item.sellingType === "auction" &&
      !(!item.auctionLot || item.auctionLot.statusText === "Compeleted")
    )
    : [];



  const handleCheckboxToggle = (type: keyof typeof filters, value: string) => {
    setFilters((prev) => {
      if (!Array.isArray(prev[type])) return prev; // Ensure it's an array before modifying

      const updatedList = prev[type].includes(value)
        ? (prev[type] as string[]).filter((item) => item !== value)
        : [...(prev[type] as string[]), value];

      return { ...prev, [type]: updatedList };
    });
  };


  const applyFilters = async () => {
    try {
      const queryParams = new URLSearchParams(filters as any).toString();
      const response = await fetch(`https://your-api.com/get-cars?${queryParams}`);
      const data = await response.json();
      console.log("Filtered Cars:", data);
    } catch (error) {
      console.error("Error fetching cars:", error);
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Auction Vehicles</Text>

      {/* Filters Section */}
      <View style={styles.filterSection}>
        <View style={styles.leftFilter}>
          <Text>Select Auction</Text>
        </View>

        <Pressable onPress={toggleFilterModal} style={styles.rightFilter}>
          <Text style={{ fontSize: 20, color: "#010153" }}>Filters </Text>
          <FontAwesome6
            name="arrow-right-arrow-left"
            size={20}
            color="#010153"
            style={{ transform: [{ rotate: "90deg" }] }}
          />
        </Pressable>
      </View>

      {/* Full-Screen Filter Modal */}
      <Modal visible={isFilterVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Filter Cars</Text>

              <TextInput style={styles.input} placeholder="Min Price" keyboardType="numeric" value={filters.minPrice} onChangeText={(value) => setFilters({ ...filters, minPrice: value })} />
              <TextInput style={styles.input} placeholder="Max Price" keyboardType="numeric" value={filters.maxPrice} onChangeText={(value) => setFilters({ ...filters, maxPrice: value })} />

              <Picker selectedValue={filters.selectedMake} onValueChange={(value) => setFilters({ ...filters, selectedMake: value })}>
                <Picker.Item label="Select Car Make" value="" />
                <Picker.Item label="Toyota" value="Toyota" />
                <Picker.Item label="Honda" value="Honda" />
              </Picker>

              <Picker selectedValue={filters.minYear} onValueChange={(value) => setFilters({ ...filters, minYear: value })}>
                <Picker.Item label="Min Year" value="" />
                <Picker.Item label="2010" value="2010" />
                <Picker.Item label="2015" value="2015" />
              </Picker>

              <Picker selectedValue={filters.maxYear} onValueChange={(value) => setFilters({ ...filters, maxYear: value })}>
                <Picker.Item label="Max Year" value="" />
                <Picker.Item label="2020" value="2020" />
                <Picker.Item label="2023" value="2023" />
              </Picker>

              <Text style={styles.checkboxTitle}>Fuel Type</Text>
              {["Petrol", "Diesel", "Electric"].map((type) => (
                <View key={type} style={styles.checkboxContainer}>
                  <CheckBox value={filters.selectedFuelTypes.includes(type)} onValueChange={() => handleCheckboxToggle("selectedFuelTypes", type)} />
                  <Text>{type}</Text>
                </View>
              ))}

              <Text style={styles.checkboxTitle}>Transmission</Text>
              {["Automatic", "Manual"].map((type) => (
                <View key={type} style={styles.checkboxContainer}>
                  <CheckBox value={filters.selectedTransmissions.includes(type)} onValueChange={() => handleCheckboxToggle("selectedTransmissions", type)} />
                  <Text>{type}</Text>
                </View>
              ))}

              <View style={styles.buttonContainer}>
                <Pressable
                  onPress={() => {
                    setFilters({
                      minPrice: "",
                      maxPrice: "",
                      selectedMake: "All",
                      minYear: "",
                      maxYear: "",
                      selectedDriveType: "All",
                      selectedDoors: "All",
                      selectedCylinder: "All",
                      selectedFuelTypes: [] as string[],
                      selectedTransmissions: [] as string[],
                    });
                    setFilterVisible(false);
                  }}
                  style={styles.clearButton}
                >
                  <Text style={styles.buttonText}>Clear</Text>
                </Pressable>


                <Pressable onPress={applyFilters} style={styles.applyButton}>
                  <Text style={styles.buttonText}>Apply</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Display Cars */}
      {filteredCars.length === 0 ? (
        <Text style={styles.noCarsText}>No Available Cars</Text>
      ) : (
        <FlatList
          data={filteredCars}
          keyExtractor={(item) => item?._id?.toString() ?? Math.random().toString()}
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
                <View style={{ borderBottomColor: '#ccc', borderBottomWidth: 1, marginVertical: 10 }} />
                <View style={styles.detailsRow}>
                  <View style={styles.detailItem}>
                    <Image source={speedometer} />
                    <Text style={styles.detailText}>{item?.mileage ?? "N/A"} MI</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Image source={fuel} />
                    <Text style={styles.detailText}>{item?.fuelType?.vehicleFuelTypes || "Unknown"}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Image source={gearbox} />
                    <Text style={styles.detailText}>{item?.transmission?.vehicleTransimission || "N/A"}</Text>
                  </View>
                </View>
                <View style={{ borderBottomColor: '#ccc', borderBottomWidth: 1, marginVertical: 10 }} />
                <View style={styles.footer}>
                  <Text style={styles.price}>AED {item.startingBid || "N/A"}</Text>
                  <Pressable>
                    <Text style={styles.viewDetails}>View Details <FontAwesome6 name="arrow-up-right-from-square" /></Text>
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
  container: { padding: 25, backgroundColor: "#F5F5F5", flex: 1 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  loadingText: { textAlign: "center", marginTop: 20, fontSize: 16 },
  errorText: { textAlign: "center", marginTop: 20, fontSize: 16, color: "red" },
  noCarsText: { textAlign: "center", fontSize: 16, color: "#666", marginTop: 10 },
  filterSection: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 20
  },
  leftFilter: { backgroundColor: "red" },
  rightFilter: {
    flexDirection: "row",
    borderWidth: 2,
    paddingVertical: 10,
    borderColor: "#010153",
    borderRadius: 100,
    paddingHorizontal: 20
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 55,
    elevation: 3,
    shadowColor: "#aaa",
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
  price: { fontSize: 20, fontWeight: "bold" },
  viewDetails: { fontSize: 14, color: "#007BFF", fontWeight: "600" },

  filterButton: { flexDirection: "row", alignItems: "center", padding: 10, backgroundColor: "#ddd", borderRadius: 5 },
  modalOverlay: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { backgroundColor: "#fff", padding: 20, borderRadius: 10 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 10, borderRadius: 5 },
  checkboxTitle: { fontSize: 16, fontWeight: "bold", marginTop: 10 },
  checkboxContainer: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
  buttonContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  clearButton: { padding: 10, backgroundColor: "red", borderRadius: 5 },
  applyButton: { padding: 10, backgroundColor: "green", borderRadius: 5 },
  buttonText: { color: "#fff", fontWeight: "bold" }
});                
