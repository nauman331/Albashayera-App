import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions, TouchableOpacity, TextInput, Animated, Alert } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { Image } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { backendURL } from '../utils/exports';
import CarOverview from '../components/CarOverview';
import FeatureCategory from '../components/FeatureCategory';
import VimeoPlayer from '../components/VimeoPlayer';
import socketService from '../utils/socket';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';


type CarDetailsScreenProps = {
    route: RouteProp<{ params: { carId: string } }, 'params'>;
};

interface BidData {
    carId: string;
    bidAmount: number;
    auctionStatus: boolean;
    currentBid: number;
}

interface CarColor {
    carId: string;
    color: string;
}

const { width } = Dimensions.get('window');

const CarDetailsScreen: React.FC<CarDetailsScreenProps> = ({ route }) => {
    const { carId } = route.params;
    const [car, setCar] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [buyLoading, setBuyLoading] = useState(false)
    const [error, setError] = useState('');
    const [bid, setBid] = useState(0);
    const [currentBalance, setCurrentBalance] = useState(0)
    const [currentBidData, setCurrentBidData] = useState<BidData | null>(null);
    const [currentCarColor, setCurrentCarColor] = useState<CarColor | null>(null);
    const [vimeoLive, setVimeoLive] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [featuresData, setFeaturesData] = useState<{ category: string; features: string[] }[]>([]);
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0.4)).current;


    const handlePlaceBid = () => {
        if (socketService.isConnected && token && car?._id) {
            if (!bid || isNaN(Number(bid))) {
                Toast.show({
                    type: "error",
                    text1: "Invalid bid amount"
                });
                return;
            }

            const data = {
                carId: car._id,
                token,
                bidAmount: Number(bid),
            };

            if (Number(bid) <= Number(currentBidData?.bidAmount || currentBidData?.currentBid || car.startingBid)) {
                Toast.show({
                    type: "error",
                    text1: "Error:",
                    text2: "Bid amount should be greater than the current bid"
                })
                return;
            }

            socketService.emit("placeBid", data);
            setBid(Number(currentBidData?.bidAmount) || Number(currentBidData?.currentBid) || Number(bid));
        } else {
            Toast.show({
                type: "error",
                text1: "Error:",
                text2: "Socket not connected or invalid data"
            }
            );
        }
    };


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
                await AsyncStorage.setItem("currentBidData", JSON.stringify(res_data.currentBid));
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

    const purchaseCar = async () => {
        const authorizationToken = `Bearer ${token}`;
        try {
            setBuyLoading(true);
            const response = await fetch(`${backendURL}/car/purchase/${carId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: authorizationToken,
                },
            });
            const res_data = await response.json();
            if (response.ok) {
                Toast.show({
                    type: "success",
                    text1: "Success",
                    text2: res_data.message
                })
                await getCarDetails();
            } else {
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: res_data.message
                })
            }
        } catch (error) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Error while buying"
            })
        } finally {
            setBuyLoading(false);
        }
    };


    useEffect(() => {
        const fetchToken = async () => {
            try {
                const storedToken = await AsyncStorage.getItem("@token");
                if (storedToken) {
                    setToken(storedToken);
                    socketService.connect(storedToken);
                }
            } catch (error) {
                console.error("Error retrieving token:", error);
            }
        };
        fetchToken();
    }, []);

    useEffect(() => {
        const fetchBidData = async () => {
            try {
                const storedBidData = await AsyncStorage.getItem("currentBidData");
                const storedColorData = await AsyncStorage.getItem("currentCarColor");
                if (storedBidData) {
                    setCurrentBidData(JSON.parse(storedBidData));
                }
                if (storedColorData) {
                    setCurrentCarColor(JSON.parse(storedColorData));
                }
            } catch (error) {
                console.error("Error retrieving token:", error);
            }
        }
        fetchBidData();
    }, [handlePlaceBid])


    useEffect(() => {
        getCarDetails();
    }, [carId]);

    useEffect(() => {
        const scaleAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(scaleAnim, { toValue: 1.1, duration: 800, useNativeDriver: true }),
                Animated.timing(scaleAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            ])
        );

        const glowAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
                Animated.timing(glowAnim, { toValue: 0.4, duration: 800, useNativeDriver: true }),
            ])
        );

        scaleAnimation.start();
        glowAnimation.start();

        return () => {
            scaleAnimation.stop();
            glowAnimation.stop();
        };
    }, []);


    const getDeposits = useCallback(async () => {
        const authorizationToken = `Bearer ${token}`;
        try {
            setLoading(true);
            const response = await fetch(`${backendURL}/wallet`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: authorizationToken,
                },
            });
            const res_data = await response.json();
            if (response.ok) {
                setCurrentBalance(res_data.currentAmount);
            } else {
                console.error(res_data.message);
            }
        } catch (error) {
            console.error("Error in getting deposits:", error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            getDeposits();
        }
    }, [token, getDeposits]);


    const openLive = () => {
        if (currentBalance < 1) {
            Toast.show({
                type: "error",
                text1: "Error:",
                text2: "Live can't be opened due to empty wallet"
            })
        } else {
            setVimeoLive(!vimeoLive);
        }
    };
    useEffect(() => {
        if (car) {
            setBid(car.startingBid);
        }
    }, [car]);


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



    return (
        <ScrollView style={styles.container}>

            {/* Car top section */}
            {
                vimeoLive && <VimeoPlayer />
            }
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

            {
                !car.isSold ?
                    <>
                        {/* Price */}
                        <View style={styles.currentBidContainer}>
                            {car.sellingType === "auction" ? (
                                <>
                                    <Text style={styles.bidHeading}>Current Bid</Text>
                                    <View
                                        style={[
                                            styles.bidAmountContainer,
                                            { backgroundColor: currentCarColor?.carId === car._id && currentCarColor?.color === "green" ? "#ccffcc" : "#ffcccc" },
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.bidAmount,
                                                { color: currentCarColor?.carId === car._id && currentCarColor?.color === "green" ? "#006400" : "#b30000" },
                                            ]}
                                        >
                                            AED{" "}
                                            {currentBidData?.carId === car._id && (currentBidData?.bidAmount || currentBidData?.currentBid) ?
                                                currentBidData?.bidAmount || currentBidData?.currentBid
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
                        {
                            car.sellingType === "auction" ?
                                <>
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
                                                onChangeText={(text) => setBid(Number(text) || 0)}
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
                                    {/* LIVE BUTTON */}
                                    <TouchableOpacity onPress={openLive} activeOpacity={0.8}>
                                        <Animated.View
                                            style={[
                                                styles.liveButton,
                                                { transform: [{ scale: scaleAnim }], shadowOpacity: glowAnim },
                                            ]}
                                        >
                                            <Text style={styles.liveText}>VIEW LIVE AUCTION</Text>
                                        </Animated.View>
                                    </TouchableOpacity>
                                </>
                                :
                                <TouchableOpacity onPress={purchaseCar} style={styles.purchaseCar} disabled={buyLoading}>
                                    <Text style={styles.purchaseText}>{buyLoading ? "Placing Order..." : "Purchase This Car"}</Text>
                                </TouchableOpacity>
                        }
                    </>
                    :
                    <View style={styles.soldContainer}>
                        <Text style={styles.soldText}>Car has been already Sold</Text>
                    </View>
            }


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
    liveButton: {
        backgroundColor: "#22C55E",
        paddingVertical: 12,
        paddingHorizontal: 26,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: "#16A34A",
        shadowColor: "#22C55E",
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 0 },
        elevation: 10,
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 20
    },
    liveText: {
        color: "#FFFFFF",
        fontWeight: "bold",
        fontSize: 16,
        letterSpacing: 1,
        textTransform: "uppercase",
    },
    purchaseCar: {
        width: "100%",
        height: 50,
        backgroundColor: "#010153",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10
    },
    purchaseText: {
        color: "white"
    },
    soldContainer: {
        width: "100%",
        borderWidth: 2,
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        marginTop: 20
    },
    soldText: {
        fontWeight: "bold",
        fontSize: 15
    }
});

export default CarDetailsScreen;
