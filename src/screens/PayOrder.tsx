import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from "react-native";
import { Asset, launchImageLibrary } from "react-native-image-picker";
import Toast from "react-native-toast-message";
import { backendURL, cloudinaryURL, UPLOAD_PRESET } from "../utils/exports";
import { getToken } from "../utils/asyncStorage";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import toast from "react-native-toast-message"

const PayOrder: React.FC = ({ route }: any) => {
    const { invoiceNumber, pendingAmount } = route.params;
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [proof, setProof] = useState<string | null>(null);
    const [uploading, setUploading] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)
    const [token, setToken] = useState<string | null>(null);
    useEffect(() => {
        const fetchToken = async () => {
            const tokeninner = await getToken();
            setToken(tokeninner);
        };
        fetchToken();
    }, []);

    const pickFile = () => {
        launchImageLibrary({ mediaType: "photo", includeBase64: false }, (response) => {
            if (response.didCancel) return;
            if (response.assets) {
                uploadToCloudinary(response.assets[0]);
            }
        });
    };


    const uploadToCloudinary = async (file: Asset) => {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", { uri: file.uri, type: file.type, name: file.fileName });
        formData.append("upload_preset", UPLOAD_PRESET);

        try {
            const res = await fetch(cloudinaryURL, {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            setProof(data.secure_url);
            Toast.show({ type: "success", text1: "Proof uploaded successfully!" });
        } catch (error) {
            Toast.show({ type: "error", text1: "Upload failed" });
        } finally {
            setUploading(false);
        }
    };

    const submitDeposit = async () => {
        if (!proof) {
            Toast.show({ type: "error", text1: "Please upload a valid proof" });
            return;
        }
        const authorizationToken = `Bearer ${token}`;
        try {
            setLoading(true);
            const response = await fetch(
                `${backendURL}/purchase-invoice/upload-slip/${invoiceNumber}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: authorizationToken,
                    },
                    body: JSON.stringify({ invSlip: proof }),
                }
            );
            const res_data = await response.json();
            if (response.ok) {
                Toast.show({ type: "success", text1: "Deposit submitted successfully!" });
                setProof(null);
                navigation.navigate("Wallet");
            } else {
                Toast.show({ type: "error", text1: "Error:", text2: res_data.message || "Proof Uploaded Successfull" });
            }
        } catch (error) {
            Toast.show({ type: "error", text1: "Failed to submit deposit" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Pay Pending Amount</Text>
            <View style={styles.bankDetailsCard}>
                <View style={styles.bankHeader}>
                    <Icon name="bank" size={26} color="#010153" />
                    <Text style={styles.bankTitle}>Bank Details</Text>
                </View>
                <View style={styles.bankRow}>
                    <Icon name="account" size={20} color="#555" />
                    <Text style={styles.label}>Customer Name:</Text>
                    <Text style={styles.value}>AL BASHAYERA AUTO USED TRADING AND AUCTIONS LLC SP</Text>
                </View>
                <View style={styles.bankRow}>
                    <Icon name="numeric" size={20} color="#555" />
                    <Text style={styles.label}>Account Number:</Text>
                    <Text style={styles.value}>1015877418001</Text>
                </View>
                <View style={styles.bankRow}>
                    <Icon name="credit-card-outline" size={20} color="#555" />
                    <Text style={styles.label}>IBAN:</Text>
                    <Text style={styles.value}>AE210260001015877418001</Text>
                </View>
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.inputIcon}>AED</Text>
                <Text
                    style={styles.input}
                >{pendingAmount} is your pending amount.</Text>
            </View>
            {proof ? (
                <Image source={{ uri: proof }} style={styles.proofImage} />
            ) : (
                <TouchableOpacity style={styles.uploadBox} onPress={pickFile} disabled={uploading}>
                    {uploading ? <ActivityIndicator color="#010153" /> : <Icon name="cloud-upload" size={40} color="#010153" />}
                    <Text style={styles.uploadText}>{uploading ? "Uploading..." : "Upload Proof"}</Text>
                </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.submitButton} onPress={submitDeposit} disabled={loading}>
                <Text style={styles.submitButtonText}>{loading ? "Submitting..." : "Submit Deposit"}</Text>
            </TouchableOpacity>
            <Toast />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#F9FAFC",
        alignItems: "center",
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        color: "#333",
    },
    bankDetailsCard: {
        width: "100%",
        padding: 15,
        backgroundColor: "#fff",
        borderRadius: 12,
        shadowColor: "gray",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
        marginBottom: 20,
    },
    bankHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    bankTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#010153",
        marginLeft: 8,
    },
    bankRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#555",
        marginLeft: 5,
    },
    value: {
        fontSize: 10,
        color: "#333",
        marginLeft: 10,
        flexShrink: 1,
    },
    icon: {
        marginBottom: 10,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        backgroundColor: "#fff",
        borderRadius: 8,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: "#ddd",
        marginBottom: 15,
    },
    inputIcon: {
        marginRight: 10,
        borderRightWidth: 2,
        paddingRight: 10,
        borderRightColor: "gray"
    },
    input: {
        flex: 1,
        paddingVertical: 12,
    },
    uploadBox: {
        width: "100%",
        height: 120,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
        marginBottom: 15,
    },
    uploadText: {
        color: "#010153",
        marginTop: 5,
    },
    proofImage: {
        width: 120,
        height: 120,
        borderRadius: 8,
        marginBottom: 15,
    },
    submitButton: {
        backgroundColor: "#010153",
        padding: 14,
        borderRadius: 8,
        alignItems: "center",
        width: "100%",
        marginTop: 15,
    },
    submitButtonText: {
        color: "white",
        fontSize: 16,
    },
});

export default PayOrder;
