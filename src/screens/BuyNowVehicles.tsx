import { StyleSheet, Text, View, FlatList } from "react-native";
import React from "react";
import useFetchCarsAndCategories from "../hooks/useFetchCarsAndCategories";

const BuyNowVehicles: React.FC = () => {
  const { cars, loading, error } = useFetchCarsAndCategories();

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error}</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Buy Now Vehicles</Text>
      <FlatList
        data={cars}
        keyExtractor={(item) => item.id}
        renderItem={({ item }: any) => (
          <View style={styles.card}>
            <Text style={styles.carName}>{item.name} - {item.model} ({item.year})</Text>
            <Text>Price: ${item.price}</Text>
            <Text>Mileage: {item.mileage} km</Text>
            <Text>Fuel Type: {item.fuelType}</Text>
            <Text>Transmission: {item.transmission}</Text>
            <Text>Location: {item.location}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default BuyNowVehicles;

const styles = StyleSheet.create({
  container: { padding: 10 },
  title: { fontSize: 20, fontWeight: "bold" },
  card: {
    backgroundColor: "#fff",
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    elevation: 2,
  },
  carName: { fontSize: 16, fontWeight: "bold" },
});
