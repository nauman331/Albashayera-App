import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions, TouchableOpacity, TextInput, Animated } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { Image } from 'react-native';
import { RouteProp, useFocusEffect } from '@react-navigation/native';
import { backendURL } from '../utils/exports';
import CarOverview from '../components/CarOverview';
import FeatureCategory from '../components/FeatureCategory';
import VimeoPlayer from '../components/VimeoPlayer';
import socketService from '../utils/socket';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import PurchaseModal from '../components/PurchaseModal';
import EventBus from '../utils/EventBus';
import { useTranslation } from 'react-i18next';

type UnauthenticatedTabParamList = {
    CarDetails: { carId: string };
};

type CarDetailsScreenProps = {
    route: RouteProp<UnauthenticatedTabParamList, "CarDetails">;
    navigation: any; // or the correct navigation type if you have it
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

const CarDetailsScreen: React.FC<CarDetailsScreenProps> = ({ route, navigation }) => {
    const { carId } = route.params;
    const { t } = useTranslation();
    const [car, setCar] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [buyLoading, setBuyLoading] = useState(false)
    const [error, setError] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [bid, setBid] = useState(0);
    const [currentBalance, setCurrentBalance] = useState(0)
    const [currentBidData, setCurrentBidData] = useState<BidData | null>(null);
    const [currentCarColor, setCurrentCarColor] = useState<CarColor | null>(null);
    const [vimeoLive, setVimeoLive] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [featuresData, setFeaturesData] = useState<{ category: string; features: string[] }[]>([]);


    const handlePlaceBid = () => {
        if (!token) {
            Toast.show({
                type: "error",
                text1: t("login_required"),
                text2: t("please_login_to_place_bid")
            });
            navigation.navigate("Login");
            return;
        }

        if (currentBalance < 1000) {
            Toast.show({
                type: "error",
                text1: t("not_enough_balance"),
                text2: t("min_balance_required")
            });
            return;
        }

        if (socketService.isConnected && token && car?._id) {
            if (!bid || isNaN(Number(bid))) {
                Toast.show({
                    type: "error",
                    text1: t("invalid_bid_amount")
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
                    text1: t("error"),
                    text2: t("bid_amount_greater_than_current")
                })
                return;
            }

            socketService.emit("placeBid", data);
            setBid(Number(currentBidData?.bidAmount) || Number(currentBidData?.currentBid) || Number(bid));
        } else {
            Toast.show({
                type: "error",
                text1: t("error"),
                text2: t("Socket_not_connected_or_invalid_data")
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
        if (!token) {
            Toast.show({
                type: "error",
                text1: t("login_required"),
                text2: t("Please_login_to_purchase")
            });
            navigation.navigate("Login");
            return;
        }

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
                    text1: t("success"),
                    text2: res_data.message
                })
                await getCarDetails();
                setIsModalVisible(false)
            } else {
                Toast.show({
                    type: "error",
                    text1: t("error"),
                    text2: res_data.message
                })
            }
        } catch (error) {
            Toast.show({
                type: "error",
                text1: t("error"),
                text2: t("error_while_buying")
            })
        } finally {
            setBuyLoading(false);
        }
    };
    const cancelPurchase = () => {
        setIsModalVisible(false);
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
        const resetListener = () => {
            setCurrentBidData(null);
        };

        EventBus.on("resetBidData", resetListener);

        return () => {
            EventBus.off("resetBidData", resetListener);
        };
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


    useFocusEffect(
        useCallback(() => {
            // Fetch car details and deposits when the screen is focused
            if (carId) {
                getCarDetails(); // Refetch car details
            }
            if (token) {
                getDeposits(); // Refetch wallet details
            }
        }, [carId, token]) // Dependency on carId and token
    );

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
                text1: t("error"),
                text2: t("Live_cannot_be_opened_due_to_empty_wallet")
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
            {
                isModalVisible &&
                <PurchaseModal
                    isVisible={isModalVisible}
                    onConfirm={purchaseCar}
                    onCancel={cancelPurchase}
                    loading={buyLoading}
                />
            }
            {/* Car top section */}
            {
                vimeoLive && <VimeoPlayer />
            }
            {car?.carImages?.length > 0 && !isModalVisible && (

                <Carousel
                    loop
                    width={width}
                    height={200}
                    autoPlay={true}
                    data={car?.carImages.slice(0, 10)}
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
                        <Text style={styles.modellottext}>{t("lot_no")} {car.lotNo} | {t("model")} {car.carModal || "No Model"}</Text>
                    </View>
                    :
                    <View style={styles.modellot}>
                        <Text style={styles.modellottext}> {t("vin")} {car.vin} | {t("model")} {car.carModal || "No Model"}</Text>
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
                                    <Text style={styles.bidHeading}>{t("current_bid")}</Text>
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
                                        {t("bid_starting_price")} {car.startingBid || "N/A"} AED
                                    </Text>
                                </>
                            ) : (
                                <>
                                    <Text style={styles.discountedText}>{t("discounted_price")}</Text>
                                    <Text style={styles.discountedPrice}>
                                        AED {car.discountedPrice ? car.discountedPrice : car.price || "N/A"}
                                    </Text>
                                    {car.discountedPrice && (
                                        <Text style={styles.originalPrice}>
                                            {t("original_price")} {car.price || "N/A"} AED
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
                                                style={{ width: 60, height: 40, fontSize: 16, textAlign: "center" }}
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
                                                    {t("place_bid")}
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
                                                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>{t("place_bid")}</Text>
                                            </View>
                                        )}

                                    </View>
                                    {/* LIVE BUTTON */}
                                    {currentBidData?.auctionStatus && currentBidData?.carId === car._id && (
                                        <TouchableOpacity style={styles.liveButton} onPress={openLive}>
                                            <Text style={styles.liveText}>{vimeoLive ? t("close_live") : t("view_live")}</Text>
                                        </TouchableOpacity>
                                    )}
                                </>
                                :
                                <TouchableOpacity onPress={() => setIsModalVisible(true)} style={styles.purchaseCar} disabled={buyLoading}>
                                    <Text style={styles.purchaseText}>{buyLoading ? t("Placing_Order") : t("purchase_this_car")}</Text>
                                </TouchableOpacity>
                        }
                    </>
                    :
                    <View style={styles.soldContainer}>
                        <Text style={styles.soldText}>{t("car_already_sold")}</Text>
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
                                <Text style={{ fontSize: 30, fontWeight: "bold" }}>{t("features")}</Text>
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
                        <Text style={{ fontSize: 20, fontWeight: "bold" }}>{t("description")}</Text>
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
                        <Text style={{ fontSize: 20, fontWeight: "bold" }}>{t("location")}</Text>
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
        backgroundColor: "green",
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
