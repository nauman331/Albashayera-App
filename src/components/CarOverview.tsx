import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const CarOverview = ({ car }: any) => {
  const carDetails = [
    { label: "Make", value: car.carMake?.vehicleMake || "No Vehicle Make", icon: "car" },
    { label: "Damage", value: car.damage?.vehicleDamage || "No Vehicle Damage", icon: "car-wrench" },
    { label: "Start Code", value: car.startCode || "No Start Code", icon: "key" },
    { label: "Mileage", value: car.mileage || "No Mileage", icon: "speedometer" },
    { label: "Fuel Type", value: car.fuelType?.vehicleFuelTypes || "No Fuel Type", icon: "gas-station" },
    { label: "Year", value: car.year?.vehicleYear || "N/A", icon: "calendar" },
    { label: "Transmission", value: car.transmission?.vehicleTransimission || "No Transmission", icon: "engine" },
    { label: "Drive Type", value: car.driveType?.driveType || "N/A", icon: "car" },
    { label: "Car Type", value: car.carType?.vehicleType || "No Car Type", icon: "car-estate" },
    { label: "Engine Size", value: car.engineSize?.vehicleEngineSize || "No Engine Size", icon: "engine-outline" },
    { label: "Doors", value: car.noOfDoors?.vehicleDoor || "No Doors", icon: "door" },
    { label: "Cylinders", value: car.cylinders?.vehicleCylinders || "N/A", icon: "circle-outline" },
    { label: "Color", value: car.color || "No Color", icon: "palette" },
    { label: "VIN", value: car.vin || "No VIN", icon: "barcode" },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Car Overview</Text>
      <FlatList
        data={carDetails}
        nestedScrollEnabled={true}
        keyExtractor={(item) => item.label}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.texts}>
              <Icon name={item.icon} size={20} style={styles.icon} />
              <Text style={styles.label}>{item.label}</Text>
            </View>
            <Text style={styles.value}>{item.value}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f9fbfc",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e1e1e1",
    marginTop: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#050b20",
    marginBottom: 10,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e1e1",
  },
  texts: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 10,
    color: "#050b20",
  },
  label: {
    fontSize: 14,
    color: "#050b20",
  },
  value: {
    fontSize: 14,
    fontWeight: "500",
    color: "#050b20",
  },
});

export default CarOverview;
