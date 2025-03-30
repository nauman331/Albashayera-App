import {
    StyleSheet,
    Text,
    View,
    ActivityIndicator,
    ScrollView,
    TouchableOpacity,
    Image
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { backendURL } from '../utils/exports';
import { getToken } from '../utils/asyncStorage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Card } from 'react-native-paper';

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
        firstName: string;
        lastName: string;
        _id: string
    };
}

const OrderDetails = ({ route }: any) => {
    const { orderId } = route.params;
    const [loading, setLoading] = useState<boolean>(true);
    const [invoice, setInvoice] = useState<Order | null>(null);



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

    useEffect(() => {
        const fetchTokenAndInvoice = async () => {
            const tokenInner = await getToken();
            if (tokenInner) {
                getInvoice(tokenInner);
            }
        };
        fetchTokenAndInvoice();
    }, []);



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
                <View style={styles.container}>
                    <Card style={styles.card}>
                        <View style={styles.iconContainer}>
                            <Icon name="check-circle" size={40} color="#010153" />
                        </View>
                        <Text style={styles.title}>{invoice.statusText.toUpperCase()}</Text>

                        <Text style={styles.label}>Date:</Text>
                        <Text style={styles.text}>{new Date(invoice.createdAt).toDateString()}</Text>

                        <Text style={styles.label}>Invoice No:</Text>
                        <Text style={styles.text}>{invoice.invNumber}</Text>

                        <Text style={styles.label}>Customer Name:</Text>
                        <Text style={styles.text}>{invoice.userId?.firstName} {invoice.userId?.lastName}</Text>

                        <Text style={styles.label}>User ID:</Text>
                        <Text style={styles.text}>{invoice.userId?._id}</Text>

                        <Text style={styles.label}>Vehicle Name:</Text>
                        <Text style={styles.text}>{invoice.carId?.listingTitle}</Text>

                        <Text style={styles.label}>Vehicle VIN:</Text>
                        <Text style={styles.text}>{invoice.carId?.vin}</Text>

                        <Text style={styles.label}>Wallet Deduction:</Text>
                        <Text style={styles.text}>{invoice.walletDeduction} AED</Text>

                        <Text style={styles.label}>Pending Amount:</Text>
                        <Text style={styles.text}>{invoice.pendingAmount} AED</Text>

                        <Text style={styles.label}>VAT(5%):</Text>
                        <Text style={styles.text}>{invoice.vat} AED</Text>
                        
                        <Text style={styles.label}>Car Price:</Text>
                        <Text style={styles.text}>{invoice.carAmount} AED</Text>

                        <Text style={styles.totalAmount}>Total Amount: {invoice.totalAmount} AED</Text>
                    </Card>
                </View>
            )}
        </ScrollView>
    );
};

export default OrderDetails;

const styles = StyleSheet.create({
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    container: { padding: 10, marginBottom: 100 },
    section: { fontSize: 18, fontWeight: 'bold', marginTop: 10 },
    buttonText: { color: 'white', fontSize: 16, marginLeft: 8 },
    card: {
        width: 300,
        padding: 20,
        borderRadius: 10,
        backgroundColor: '#fff',
        elevation: 5,
        alignItems: 'center',
    },
    iconContainer: {
        alignItems: 'center',
    },
    icon: {
        width: 40,
        height: 40,
        tintColor: '#010153',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#010153',
        marginBottom: 20,
        textAlign: "center"
    },
    text: {
        fontSize: 14,
        color: '#333',
        marginBottom: 5,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
        marginTop: 5
    },
    totalAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#010153',
        marginTop: 10,
    },
});