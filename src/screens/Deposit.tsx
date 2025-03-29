import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from "react-native";
import { Asset, launchImageLibrary } from "react-native-image-picker";
import Toast from "react-native-toast-message";
import { backendURL, cloudinaryURL, UPLOAD_PRESET } from "../utils/exports";
import { getToken } from "../utils/asyncStorage";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const DepositPage: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [amount, setAmount] = useState("");
    const [proof, setProof] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const fetchToken = async () => {
            const tokeninner = await getToken();
            setToken(tokeninner);
        };
        fetchToken();
    }, []);

    const pickFile = () => {
        launchImageLibrary({ mediaType: "mixed", includeBase64: false }, (response) => {
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
        if (!amount || !proof) {
            Toast.show({ type: "error", text1: "Please enter an amount and upload proof" });
            return;
        }
        try {
            const res = await fetch(`${backendURL}/wallet/deposit`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    amount,
                    inv: proof,
                }),
            });
            const res_data = await res.json();
            if (res.ok) {
                Toast.show({ type: "success", text1: "Deposit submitted successfully!" });
                setAmount("");
                setProof(null);
                navigation.navigate("Wallet");
            } else {
                Toast.show({ type: "error", text1: "Error:", text2: res_data.message });
            }
        } catch (error) {
            Toast.show({ type: "error", text1: "Failed to submit deposit" });
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Deposit Funds</Text>
            <View style={styles.bankDetails}>
                <Icon name="bank" size={24} color="#007BFF" style={styles.icon} />
                <Text style={styles.bankText}>Bank Name: ABC Bank</Text>
                <Text style={styles.bankText}>Account Number: 1234567890</Text>
                <Text style={styles.bankText}>IFSC: ABCD0123456</Text>
            </View>
            <View style={styles.inputContainer}>
                <Icon name="currency-usd" size={24} color="#555" style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder="Enter Deposit Amount"
                    value={amount}
                    onChangeText={setAmount}
                />
            </View>
            {proof ? (
                <Image source={{ uri: proof }} style={styles.proofImage} />
            ) : (
                <TouchableOpacity style={styles.uploadBox} onPress={pickFile} disabled={uploading}>
                    {uploading ? <ActivityIndicator color="#007BFF" /> : <Icon name="cloud-upload" size={40} color="#007BFF" />}
                    <Text style={styles.uploadText}>{uploading ? "Uploading..." : "Upload Proof"}</Text>
                </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.submitButton} onPress={submitDeposit}>
                <Text style={styles.submitButtonText}>Submit Deposit</Text>
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
    bankDetails: {
        width: "100%",
        padding: 15,
        backgroundColor: "#fff",
        borderRadius: 12,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        marginBottom: 20,
        alignItems: "center",
    },
    bankText: {
        fontSize: 16,
        color: "#555",
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
        color: "#007BFF",
        marginTop: 5,
    },
    proofImage: {
        width: 120,
        height: 120,
        borderRadius: 8,
        marginBottom: 15,
    },
    submitButton: {
        backgroundColor: "#28a745",
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

export default DepositPage;
