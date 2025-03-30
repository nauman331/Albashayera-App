import {
    StyleSheet,
    Text,
    View,
    ActivityIndicator,
    ScrollView,
    TouchableOpacity,
    PermissionsAndroid,
    Platform
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { backendURL } from '../utils/exports';
import { getToken } from '../utils/asyncStorage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Toast from 'react-native-toast-message';
import Share from 'react-native-share';

interface Order {
    carAmount: number;
    createdAt: string | Date;
    invNumber: number;
    paidAmount: number;
    pendingAmount: number;
    paymentStatus: boolean;
    statusText: string;
    totalAmount: number;
    vat: number;
    walletDeduction: number;
    carId: {
        vin: string;
        listingTitle: string;
    };
    userId: {
        name: string;
        email: string;
    };
}

const OrderDetails = ({ route }: any) => {
    const { orderId } = route.params;
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [invoice, setInvoice] = useState<Order | null>(null);
    const [downloading, setDownloading] = useState<boolean>(false);

    useEffect(() => {
        const fetchTokenAndInvoice = async () => {
            const tokenInner = await getToken();
            setToken(tokenInner);
            if (tokenInner) {
                getInvoice(tokenInner);
            }
        };
        fetchTokenAndInvoice();
    }, []);

    const getInvoice = async (tokenValue: string) => {
        try {
            setLoading(true);
            const response = await fetch(`${backendURL}/purchase-invoice/get-invoice/${orderId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${tokenValue}`,
                },
            });
            const resData = await response.json();
            if (response.ok) {
                setInvoice(resData);
            } else {
                console.error(resData.message);
            }
        } catch (error) {
            console.error('Error fetching invoice', error);
        } finally {
            setLoading(false);
        }
    };

    const requestStoragePermission = async () => {
        if (Platform.OS === 'android') {
            if (Platform.Version >= 33) {
                // Android 13+ (No permission needed for saving)
                return true;
            } else if (Platform.Version >= 30) {
                const granted = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                ]);
                return (
                    granted['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED &&
                    granted['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED
                );
            } else {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            }
        }
        return true; // iOS doesn’t need this permission
    };

    const generatePDF = async (invoice: any) => {
        if (!invoice) return;

        const hasPermission = await requestStoragePermission();
        if (!hasPermission) {
            Toast.show({ type: 'error', text1: 'Please grant storage permissions' });
            return;
        }

        try {
            const htmlContent = `
                 <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Receipt</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #222;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }
        .mobile {
            width: 350px;
            border-radius: 30px;
            padding: 15px;
            
            text-align: center;
        }
        .receipt {
            background-color: #fff;
            padding: 15px;
            border-radius: 10px;
        }
        .header {
            text-align: center;
        }
        .header img {
            width: 40px;
        }
        .success {
            color: #010153;
            font-size: 18px;
            font-weight: bold;
        }
        .tick {
            width: 50px;
            height: 50px;
            background-color: #010153;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0 auto 10px;
        }
        .tick::after {
            content: "✓";
            font-size: 30px;
            color: white;
            font-weight: bold;
        }
        .details {
            text-align: left;
            margin-top: 10px;
        }
        .amount {
            font-size: 22px;
            font-weight: bold;
            color: #010153;
        }
    </style>
</head>
<body>
    <div class="mobile">
        <div class="receipt">
            <div class="header">
                <div class="tick"></div>
                   <p class="success">Transaction Successful</p>
                <p>Money has been sent to</p>
            </div>
            <div class="details">
                <p><strong>Date:</strong> 04 March 2021 - 12:23 PM</p>
                <p><strong>Sent to:</strong> Sikandar Ali</p>
                <p><strong>CNIC:</strong> XXXX-XXXXXXXX-X</p>
                <p><strong>Mobile No:</strong> 0345 XXXXXXXX</p>
                <p><strong>Sent by:</strong> Hussain</p>
                <p><strong>Mobile No:</strong> 0301 XXXXXXXX</p>
                <p><strong>Amount:</strong> Rs. 1,000.00</p>
                <p><strong>Fee / Charge:</strong> Rs. 30.17</p>
                <p class="amount">Total Amount: Rs. 1,000.00</p>
            </div>
        </div>
    </div>
</body>
</html>
            `;

            const options = {
                html: htmlContent,
                fileName: `invoice_${invoice.invNumber}`,
                directory: 'Documents',
            };
            const file = await RNHTMLtoPDF.convert(options);

            if (file.filePath) {
                // Share file for all Android versions and iOS
                await Share.open({ url: `file://${file.filePath}` });

                Toast.show({ type: 'success', text1: 'Receipt generated!', text2: 'Sharing file...' });
            }
        } catch (error) {
            console.error('PDF Generation Error:', error);
            Toast.show({ type: 'error', text1: 'Failed to generate receipt' });
        }
    };



    if (loading)
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="blue" />
            </View>
        );

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Order Details</Text>
            {invoice && (
                <View>
                    <Text style={styles.label}>Invoice Number: {invoice.invNumber}</Text>
                    <Text style={styles.label}>Date: {new Date(invoice.createdAt).toDateString()}</Text>
                    <Text style={styles.section}>Car: {invoice.carId.listingTitle} - {invoice.carId.vin}</Text>
                    <Text style={styles.section}>User: {invoice.userId.name} ({invoice.userId.email})</Text>
                    <Text style={styles.section}>Total: AED {invoice.totalAmount}</Text>
                    <Text>Paid: AED {invoice.paidAmount}</Text>
                    <Text>Pending: AED {invoice.pendingAmount}</Text>
                </View>
            )}
            <TouchableOpacity style={styles.downloadButton} onPress={generatePDF} disabled={downloading}>
                <Icon name="download" size={24} color="white" />
                <Text style={styles.buttonText}>{downloading ? "Downloading..." : "Download Receipt"}</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

export default OrderDetails;

const styles = StyleSheet.create({
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    container: { padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    label: { fontSize: 16, fontWeight: '600' },
    section: { fontSize: 18, fontWeight: 'bold', marginTop: 10 },
    downloadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'blue',
        padding: 10,
        borderRadius: 8,
        marginTop: 20,
        justifyContent: 'center',
    },
    buttonText: { color: 'white', fontSize: 16, marginLeft: 8 },
});