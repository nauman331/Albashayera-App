import React from "react";
import { View, Text, StyleSheet, Button, Image } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { useTranslation } from "react-i18next";

const NoInternetScreen = () => {
    const { t } = useTranslation();
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
            <Text style={styles.text}>{t("no_internet_connection") || "No Internet Connection"}</Text>
            <Text style={styles.subText}>{t("please_check_connection") || "Please check your connection and try again."}</Text>
            <Button title={t("retry") || "Retry"} onPress={checkConnection} />
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
