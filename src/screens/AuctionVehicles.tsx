import { StyleSheet, Text, View, FlatList, Image, Pressable, Modal, TextInput, ScrollView, ActivityIndicator } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import useFetchCarsAndCategories from "../hooks/useFetchCarsAndCategories";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import fuel from "../assets/images/fuel.png";
import speedometer from "../assets/images/speedometer.png";
import gearbox from "../assets/images/gearbox.png";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import DropDownPicker from 'react-native-dropdown-picker';
import SortByDropdown from "../components/SortByDropdown";
import { backendURL } from "../utils/exports";
import Toast from 'react-native-toast-message';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";



const AuctionVehicles: React.FC = ({ route }: any) => {
  const selectedAuctionProp = route.params?.selectedAuctionProp || "";
  const { cars, loading, error, categoriesData, refetch } = useFetchCarsAndCategories();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [isFilterVisible, setFilterVisible] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false)
  const [auctionTitle, setAuctionTitle] = useState("");
  const [responseCars, setResponseCars] = useState([] as any);
  const [openCarMake, setOpenCarMake] = useState(false);
  const [openDriveType, setOpenDriveType] = useState(false);
  const [openYearMin, setOpenYearMin] = useState(false);
  const [openYearMax, setOpenYearMax] = useState(false);
  const [openCylinders, setOpenCylinders] = useState(false);
  const [openDoors, setOpenDoors] = useState(false);


  const [filters, setFilters] = useState<{
    minPrice: string | number;
    maxPrice: string | number;
    carMake: string;
    yearMin: string;
    yearMax: string;
    driveType: string;
    doors: string;
    cylinders: string;
  }>({
    minPrice: 1,
    maxPrice: 10000,
    carMake: "",
    yearMin: "",
    yearMax: "",
    driveType: "",
    doors: "",
    cylinders: "",
  });
  const toggleFilterModal = () => setFilterVisible(!isFilterVisible);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  useEffect(() => {
    if (auctionTitle) {
      setResponseCars(
        cars?.filter((car) =>
          car.auctionLot?.auctionTitle
            ?.toLowerCase()
            .includes(auctionTitle?.toLowerCase())
        ) || []
      );
    } else {
      setResponseCars(cars);
    }
  }, [auctionTitle, cars,]);


  const filteredCars = Array.isArray(responseCars)
    ? responseCars.filter(item =>
      !item.isSold &&
      item.sellingType === "auction" &&
      item.auctionLot && item.auctionLot.statusText !== "Compeleted"
      && item.auctionLot?.auctionTitle
        ?.toLowerCase()
        .includes(auctionTitle?.toLowerCase())
    )
    : [];


  const applyFilters = async () => {
    try {
      setFilterLoading(true);
      const response = await fetch(`${backendURL}/car/filter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filters),
      });

      const result = await response.json();
      if (result.success && result.data.length > 0) {
        const filteredCars = result.data.sort((a: any, b: any) => Number(a.lotNo) - Number(b.lotNo));
        setResponseCars(filteredCars);
      } else {
        setResponseCars([]);
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Error in applying filters' });
    } finally {
      setFilterLoading(false);
      setFilterVisible(false);
    }
  };


  const generateOptions = (key: any, labelKey: any) =>
    categoriesData?.[key]?.map((item: any) => ({
      label: item[labelKey],
      value: item._id,
    })) || [];


  const handleFilterChange = (selectedAuction: any) => {
    setAuctionTitle(selectedAuction);
  };

  useEffect(() => {
    if (selectedAuctionProp) {
      setAuctionTitle(selectedAuctionProp)
    }
  }, [selectedAuctionProp])


  if (loading)
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  if (error) {
    return <Text style={styles.errorText}>Error: {error}</Text>;
  }



  return (
    <View style={styles.container}>
      <Text style={styles.title}>Auction Vehicles</Text>

      {/* Filters Section */}
      <View style={styles.filterSection}>
        <View style={styles.leftFilter}>
          <SortByDropdown
            onChange={handleFilterChange}
            preselected={auctionTitle}
            backendURL={backendURL}
          />
        </View>

        <Pressable onPress={toggleFilterModal} style={styles.rightFilter}>
          <Text style={{ fontSize: 15, color: "#010153" }}>Filters </Text>
          <FontAwesome6
            name="arrow-right-arrow-left"
            size={15}
            color="#010153"
            style={{ transform: [{ rotate: "90deg" }] }}
          />
        </Pressable>
      </View>

      {/* Full-Screen Filter Modal */}
      <Modal visible={isFilterVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Pressable style={styles.closeButton} onPress={() => setFilterVisible(false)}>
              {/* Replace FontAwesome6 xmark with MaterialIcons close */}
              <MaterialIcons name="close" size={28} color="#555" />
            </Pressable>
            <ScrollView>
              <Text style={styles.modalTitle}>Filter Cars</Text>

              {/* Prices */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholderTextColor="black"
                  placeholder="Min Price"
                  keyboardType="numeric"
                  value={filters.minPrice !== undefined ? String(filters.minPrice) : ""}
                  onChangeText={(value) =>
                    setFilters({ ...filters, minPrice: value ? Number(value) : 0 })
                  }
                />
                <TextInput
                  style={styles.input}
                  placeholderTextColor="black"
                  placeholder="Max Price"
                  keyboardType="numeric"
                  value={filters.maxPrice !== undefined ? String(filters.maxPrice) : ""}
                  onChangeText={(value) =>
                    setFilters({ ...filters, maxPrice: value ? Number(value) : 0 })
                  }
                />
              </View>

              {/* Car Make */}
              <DropDownPicker
                open={openCarMake}
                value={filters.carMake}
                items={[
                  { label: 'Select Car Make', value: '' },
                  ...generateOptions("vehicle-make", "vehicleMake")
                ]}
                setOpen={setOpenCarMake}
                setValue={(callback) => {
                  const value = callback(filters.carMake);
                  setFilters({ ...filters, carMake: value });
                }}
                setItems={() => { }}
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
              />

              {/* Drive Type */}
              <DropDownPicker
                open={openDriveType}
                value={filters.driveType}
                items={[
                  { label: 'Select Drive Type', value: '' },
                  ...generateOptions("drive-type", "driveType")
                ]}
                setOpen={setOpenDriveType}
                setValue={(callback) => {
                  const value = callback(filters.driveType);
                  setFilters({ ...filters, driveType: value });
                }}
                setItems={() => { }}
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
              />

              {/* Year Range */}
              <View style={styles.inputContainer}>
                <View style={{ width: "45%" }}>
                  <DropDownPicker
                    open={openYearMin}
                    value={filters.yearMin}
                    items={[
                      { label: 'Min Year', value: '' },
                      ...generateOptions("vehicle-year", "vehicleYear")
                    ]}
                    setOpen={setOpenYearMin}
                    setValue={(callback) => {
                      const value = callback(filters.yearMin);
                      setFilters({ ...filters, yearMin: value });
                    }}
                    setItems={() => { }}
                    style={styles.dropdown}
                    dropDownContainerStyle={styles.dropdownContainer}
                  />
                </View>

                <View style={{ width: "45%" }}>
                  <DropDownPicker
                    open={openYearMax}
                    value={filters.yearMax}
                    items={[
                      { label: 'Max Year', value: '' },
                      ...generateOptions("vehicle-year", "vehicleYear")
                    ]}
                    setOpen={setOpenYearMax}
                    setValue={(callback) => {
                      const value = callback(filters.yearMax);
                      setFilters({ ...filters, yearMax: value });
                    }}
                    setItems={() => { }}
                    style={styles.dropdown}
                    dropDownContainerStyle={styles.dropdownContainer}
                  />
                </View>
              </View>

              {/* Cylinders */}
              <DropDownPicker
                open={openCylinders}
                value={filters.cylinders}
                items={[
                  { label: 'Select Cylinders', value: '' },
                  ...generateOptions("vehicle-cylinder", "vehicleCylinders")
                ]}
                setOpen={setOpenCylinders}
                setValue={(callback) => {
                  const value = callback(filters.cylinders);
                  setFilters({ ...filters, cylinders: value });
                }}
                setItems={() => { }}
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
              />

              {/* Doors */}
              <DropDownPicker
                open={openDoors}
                value={filters.doors}
                items={[
                  { label: 'Select Car Doors', value: '' },
                  ...generateOptions("vehicle-door", "vehicleDoor")
                ]}
                setOpen={setOpenDoors}
                setValue={(callback) => {
                  const value = callback(filters.doors);
                  setFilters({ ...filters, doors: value });
                }}
                setItems={() => { }}
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
              />

              {/* Buttons */}
              <View style={styles.buttonContainer}>
                <Pressable
                  onPress={() => {
                    setFilters({
                      minPrice: "",
                      maxPrice: "",
                      carMake: "",
                      yearMin: "",
                      yearMax: "",
                      driveType: "",
                      doors: "",
                      cylinders: "",
                    });
                    setResponseCars(cars);
                    setFilterVisible(false);
                  }}
                  style={styles.clearButton}
                >
                  <Text style={styles.buttonText}>Clear All Filters</Text>
                </Pressable>

                <Pressable onPress={applyFilters} style={styles.applyButton}>
                  <Text style={styles.buttonText}>
                    {filterLoading ? "Applying Filters..." : "Apply Selected Filters"}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Display Cars */}
      {filteredCars.length === 0 ? (
        <View style={styles.notfound}>
          <Text style={styles.notfoundText}>No Cars Found</Text>
          <Image source={require("../assets/images/towing.png")} style={styles.carImage} />
        </View>
      ) : (

        <FlatList
          data={filteredCars}
          keyExtractor={(item) => item?._id?.toString() ?? Math.random().toString()}
          renderItem={({ item }) => (
            <Pressable onPress={() => navigation.navigate('CarDetails', { carId: item._id })}>
              <View style={styles.card}>
                <Pressable onPress={() => navigation.navigate('CarDetails', { carId: item._id })}>
                  {item?.carImages.length > 0 ? (
                    <Image source={{ uri: item.carImages?.[0] }} style={styles.carImage} />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Text style={styles.placeholderText}>No Image</Text>
                    </View>
                  )}
                </Pressable>

                <View style={styles.cardContent}>
                  <Text style={styles.carName}>{item?.listingTitle || "Unknown Car"}</Text>
                  {
                    item?.description &&
                    <Text style={styles.description}>{item.description || ""}</Text>
                  }
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
                    <Pressable onPress={() => navigation.navigate('CarDetails', { carId: item._id })}>
                      <Text style={styles.viewDetails}>View Details <FontAwesome6 name="arrow-up-right-from-square" /></Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </Pressable>
          )}
        />

      )}
    </View>
  );
};

export default AuctionVehicles;


const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 20, backgroundColor: "#F5F5F5", flex: 1 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  errorText: { textAlign: "center", marginTop: 20, fontSize: 16, color: "red" },
  noCarsText: { textAlign: "center", fontSize: 16, color: "#666", marginTop: 10 },
  filterSection: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20
  },
  leftFilter: { width: "60%" },
  rightFilter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "30%",
    borderWidth: 2,
    height: 40,
    borderColor: "#010153",
    borderRadius: 100,
    paddingHorizontal: 10
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
  modalContent: { backgroundColor: "#fff", padding: 20, borderRadius: 10, },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 20 },
  inputContainer: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between"
  },
  input: {
    borderWidth: 1,
    borderColor: "black",
    color: "black",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    width: "45%"
  },
  checkboxTitle: { fontSize: 16, fontWeight: "bold", marginTop: 10, },
  checkboxContainer: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
  buttonContainer: { marginTop: 10, gap: 10 },
  clearButton: {
    padding: 10,
    borderWidth: 2,
    backgroundColor: "red",
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center"
  },
  applyButton: {
    padding: 10, backgroundColor: "#010153", borderRadius: 100, alignItems: "center",
    justifyContent: "center"
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  pickerContainer: {
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 5,
    overflow: 'hidden',
    marginVertical: 5,
  },
  picker: {
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 5,
    color: 'black',
    paddingHorizontal: 10,
    marginVertical: 5,
  },
  pickerItem: {
    color: 'black',
  },
  checkboxText: {
    color: 'black',
    marginLeft: 8,
  },
  pickerContainerYear: {
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 5,
    overflow: 'hidden',
    marginVertical: 5,
    width: "45%"
  },
  notfound: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40
  },
  notfoundText: {
    fontWeight: "bold",
    fontSize: 30,
    marginBottom: 30
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    padding: 5,
  },

  dropdown: {
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 5,
    marginVertical: 5,
    zIndex: 99, // required for layering
  },
  dropdownContainer: {
    borderColor: 'black',
    borderWidth: 1,
    zIndex: 1000,
  }


});
