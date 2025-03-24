import React from "react";
import { View, Text, StyleSheet, Button, Image } from "react-native";
import NetInfo from "@react-native-community/netinfo";

const NoInternetScreen = () => {
    const checkConnection = () => {
        NetInfo.fetch().then((state) => {
            if (state.isConnected) {
                console.log("Connected to the internet!");
            } else {
                console.log("Still offline");
            }
        });
    };

    return (
        <View style={styles.container}>
            <Image source={require("../assets/images/signal-searching.png")} style={styles.carImage} />
            <Text style={styles.text}>No Internet Connection</Text>
            <Text style={styles.subText}>Please check your connection and try again.</Text>
            <Button title="Retry" onPress={checkConnection} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        padding: 20,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    text: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#010153",
    },
    subText: {
        fontSize: 16,
        color: "#010153",
        marginVertical: 10,
    },
    carImage: { width: "100%", height: 180, resizeMode: "cover" },
});

export default NoInternetScreen;
