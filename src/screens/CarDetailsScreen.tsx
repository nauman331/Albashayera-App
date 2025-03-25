import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions, TouchableOpacity, TextInput } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { Image } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { backendURL } from '../utils/exports';
import CarOverview from '../components/CarOverview';
import FeatureCategory from '../components/FeatureCategory';

type CarDetailsScreenProps = {
    route: RouteProp<{ params: { carId: string } }, 'params'>;
};

const { width } = Dimensions.get('window');

const CarDetailsScreen: React.FC<CarDetailsScreenProps> = ({ route }) => {
    const { carId } = route.params;
    const [car, setCar] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [bid, setBid] = useState(0)
    const [featuresData, setFeaturesData] = useState<{ category: string; features: string[] }[]>([]);



    const getCarDetails = async () => {
        try {
            setLoading(true)
            const response = await fetch(`${backendURL}/car/${carId}`);
            const res_data = await response.json();

            if (!response.ok) {
                throw new Error(res_data.message || 'Failed to fetch car details');
            }

            setCar(res_data.car);

            if (res_data.currentBid) {
                console.warn("store bid");
            }

            setFeaturesData(
                Object.keys(res_data.car?.features || {}).map((key) => ({
                    category: key,
                    features: res_data.car?.features[key] || [],
                }))
            );

        } catch (error: any) {
            setError(error.message || "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getCarDetails();
    }, [carId]);

    if (loading || !car)
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="blue" />
            </View>
        );

    if (error)
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );


    const increaseBid = () => {
        if (car) setBid(bid + car.bidMargin);
    };
    const decreaseBid = () => {
        if (car) setBid(bid - car.bidMargin);
    };

    const currentBidData = {
        carId: car?._id || "",
        bidAmount: "",
        auctionStatus: true,
    }
    const socket = true;
    const token = ""
    const currentCarColor = {
        color: "green",
        carId: car?._id || ""
    }

    const handlePlaceBid = () => {
        if (socket && token && car?._id) {
            const data = {
                carId: car._id,
                token,
                bidAmount: bid,
            };
            // socket.emit("placeBid", data);
            setBid(Number(currentBidData?.bidAmount) || 0);
        } else {
            console.log("Socket not connected or invalid data");
        }
    };





    return (
        <ScrollView style={styles.container}>

            {/* Car top section */}

            {car?.carImages?.length > 0 && (
                <Carousel
                    loop
                    width={width}
                    height={200}
                    autoPlay={true}
                    data={car?.carImages}
                    scrollAnimationDuration={1000}
                    renderItem={({ item }) => (
                        <Image source={{ uri: item as string }} style={{ width: '90%', height: '100%', borderRadius: 10 }} />
                    )}
                />
            )}

            <Text style={styles.title}>{car?.listingTitle || "Unknown Car"}</Text>
            {
                car.sellingType === "auction" ?
                    <View style={styles.modellot}>
                        <Text style={styles.modellottext}>Lot No. {car.lotNo} | Model: {car.carModal || "No Model"}</Text>
                    </View>
                    :
                    <View style={styles.modellot}>
                        <Text style={styles.modellottext}> VIN. {car.vin} | Model: {car.carModal || "No Model"}</Text>
                    </View>
            }

            <Text style={styles.modellotbottomtext}>
                {car.mileage || "No Mileage"}
                <Text style={styles.dot}> • </Text>
                {car.fuelType?.vehicleFuelTypes || "No Fuel Type"}
                <Text style={styles.dot}> • </Text>
                {car.transmission?.vehicleTransimission || "No Transmission"}
            </Text>

            {/* Price */}

            <View style={styles.currentBidContainer}>
                {car.sellingType === "auction" ? (
                    <>
                        <Text style={styles.bidHeading}>Current Bid</Text>
                        <View
                            style={[
                                styles.bidAmountContainer,
                                { backgroundColor: currentCarColor?.carId === car._id && currentCarColor.color === "green" ? "#ccffcc" : "#ffcccc" },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.bidAmount,
                                    { color: currentCarColor?.carId === car._id && currentCarColor.color === "green" ? "#006400" : "#b30000" },
                                ]}
                            >
                                AED{" "}
                                {currentBidData?.carId === car._id && currentBidData?.bidAmount
                                    ? currentBidData?.bidAmount
                                    : car?.startingBid}
                            </Text>
                        </View>

                        <Text style={styles.startingPrice}>
                            Bid Starting Price: {car.startingBid || "N/A"} AED
                        </Text>
                    </>
                ) : (
                    <>
                        <Text style={styles.discountedText}>Discounted Price</Text>
                        <Text style={styles.discountedPrice}>
                            AED {car.discountedPrice ? car.discountedPrice : car.price || "N/A"}
                        </Text>
                        {car.discountedPrice && (
                            <Text style={styles.originalPrice}>
                                Original Price: {car.price || "N/A"} AED
                            </Text>
                        )}
                    </>
                )}
            </View>

            {/* Controls */}

            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 10 }}>
                <TouchableOpacity
                    style={{ backgroundColor: "#ddd", paddingVertical: 8, paddingHorizontal: 16, borderRadius: 5, marginHorizontal: 5 }}
                    onPress={decreaseBid}
                >
                    <Text style={{ fontSize: 20, fontWeight: "bold" }}>-</Text>
                </TouchableOpacity>

                <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#ccc", paddingHorizontal: 10, borderRadius: 5 }}>
                    <Text style={{ fontSize: 16, marginRight: 5 }}>AED</Text>
                    <TextInput
                        style={{ width: 60, fontSize: 16, textAlign: "center" }}
                        keyboardType="numeric"
                        value={bid.toString()}
                        onChangeText={(text) => setBid(parseFloat(text) || 0)}
                    />
                </View>

                <TouchableOpacity
                    style={{ backgroundColor: "#ddd", paddingVertical: 8, paddingHorizontal: 16, borderRadius: 5, marginHorizontal: 5 }}
                    onPress={increaseBid}
                >
                    <Text style={{ fontSize: 20, fontWeight: "bold" }}>+</Text>
                </TouchableOpacity>

                {currentBidData?.auctionStatus && currentBidData?.carId === car._id ? (
                    <TouchableOpacity
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            paddingVertical: 10,
                            paddingHorizontal: 15,
                            borderRadius: 5,
                            marginLeft: 10,
                            backgroundColor: "#405FF2",
                        }}
                        onPress={handlePlaceBid}
                    >
                        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
                            Place Bid
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            paddingVertical: 10,
                            paddingHorizontal: 15,
                            borderRadius: 5,
                            marginLeft: 10,
                            backgroundColor: "grey",
                            opacity: 0.6,
                        }}
                    >
                        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>Place Bid</Text>
                    </View>
                )}
            </View>

            {/* Car Overview */}
            <CarOverview car={car} />

            {/* Features */}

            <View style={{ marginTop: 20 }}>
                {Array.isArray(featuresData) && featuresData.length > 0 && (
                    <>
                        {featuresData.some(data => data.features?.length > 0) && (
                            <>
                                <Text style={{ fontSize: 30, fontWeight: "bold" }}>Features</Text>
                                <View>
                                    {featuresData.map((data, index) => (
                                        <FeatureCategory
                                            title={data.category}
                                            key={index}
                                            features={data.features}
                                        />
                                    ))}
                                </View>
                            </>
                        )}

                    </>
                )}
            </View>

            {/* Description */}

            {
                car.description &&
                <>
                    <View style={{ borderBottomColor: '#ccc', borderBottomWidth: 1, marginVertical: 10 }} />
                    <View style={{ marginVertical: 20 }}>
                        <Text style={{ fontSize: 20, fontWeight: "bold" }}>Description</Text>
                        <Text>{car.description || ""}</Text>
                    </View>
                </>
            }

            {/* Location */}
            {
                (car.friendlyLocation || car.mapLocation) &&
                <>
                    <View style={{ borderBottomColor: '#ccc', borderBottomWidth: 1, marginVertical: 10 }} />
                    <View style={{ marginBottom: 100, marginTop: 20 }}>
                        <Text style={{ fontSize: 20, fontWeight: "bold" }}>Location</Text>
                        <Text>
                            {car.friendlyLocation || car.mapLocation || ""}
                        </Text>
                    </View>
                </>
            }
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20 },
    carImage: { width: '100%', height: 200, borderRadius: 10 },
    title: { fontSize: 30, fontWeight: 'bold', marginTop: 10 },
    description: { fontSize: 16, marginTop: 5 },
    price: { fontSize: 18, fontWeight: 'bold', color: 'green', marginTop: 10 },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { fontSize: 18, color: 'red' },
    modellot: { flexDirection: "row" },
    modellottext: { fontSize: 15, fontWeight: "bold" },
    modellotbottomtext: {
        marginTop: 10,
        fontSize: 16,
        color: "#333",
    },
    dot: {
        color: "#aaa",
        fontSize: 14,
        marginHorizontal: 10,
    },
    currentBidContainer: {
        marginBottom: 16,
    },
    bidHeading: {
        fontSize: 18,
        fontWeight: "bold",
        marginTop: 10,
    },
    bidAmountContainer: {
        padding: 5,
        borderRadius: 10,
        marginTop: 10,
        width: "100%",
    },
    bidAmount: {
        fontSize: 40,
        fontWeight: "bold",
        textAlign: "center"
    },
    startingPrice: {
        marginTop: 10,
        fontSize: 16,
        color: "#555",
    },
    discountedText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#555",
    },
    discountedPrice: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#000",
        marginVertical: 5,
    },
    originalPrice: {
        fontSize: 16,
        textDecorationLine: "line-through",
        color: "#888"
    },
});

export default CarDetailsScreen;
