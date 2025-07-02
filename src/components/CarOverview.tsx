import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useTranslation } from 'react-i18next';

const CarOverview = ({ car }: any) => {
  const { t } = useTranslation();
  const carDetails = [
    { label: t("make"), value: car.carMake?.vehicleMake || t("no_vehicle_make"), icon: "car" },
    { label: t("damage"), value: car.damage?.vehicleDamage || t("no_vehicle_damage"), icon: "car-wrench" },
    { label: t("start_code"), value: car.startCode || t("no_start_code"), icon: "key" },
    { label: t("mileage"), value: car.mileage || t("no_mileage"), icon: "speedometer" },
    { label: t("fuel_type"), value: car.fuelType?.vehicleFuelTypes || t("no_fuel_type"), icon: "gas-station" },
    { label: t("year"), value: car.year?.vehicleYear || t("n_a"), icon: "calendar" },
    { label: t("transmission"), value: car.transmission?.vehicleTransimission || t("no_transmission"), icon: "engine" },
    { label: t("drive_type"), value: car.driveType?.driveType || t("n_a"), icon: "car" },
    { label: t("car_type"), value: car.carType?.vehicleType || t("no_car_type"), icon: "car-estate" },
    { label: t("engine_size"), value: car.engineSize?.vehicleEngineSize || t("no_engine_size"), icon: "engine-outline" },
    { label: t("doors"), value: car.noOfDoors?.vehicleDoor || t("no_doors"), icon: "door" },
    { label: t("cylinders"), value: car.cylinders?.vehicleCylinders || t("n_a"), icon: "circle-outline" },
    { label: t("color"), value: car.color || t("no_color"), icon: "palette" },
    { label: t("vin"), value: car.vin || t("no_vin"), icon: "barcode" },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{t("car_overview")}</Text>
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
