import {
    StyleSheet,
    Text,
    View,
    ActivityIndicator,
    ScrollView,
    TouchableOpacity,
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
        _id: string;
    };
}

const OrderDetails = ({ route, navigation }: any) => {
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
    }, [orderId]);

    const getStatusIcon = () => {
        switch (invoice?.statusText.toLowerCase()) {
            case 'approved':
                return <Icon name="check-circle" size={50} color="green" />;
            case 'payment pending':
                return <Icon name="hourglass-empty" size={50} color="orange" />;
            case 'rejected':
                return <Icon name="cancel" size={50} color="red" />;
            default:
                return <Icon name="info" size={50} color="gray" />;
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
            <View style={styles.invoiceWrapper}>
                <Card style={styles.card}>
                    {/* Invoice Header */}
                    <View style={styles.invoiceHeader}>
                        <View>{getStatusIcon()}</View>
                        {!invoice?.paymentStatus && (
                            <TouchableOpacity
                                style={styles.payButton}
                                onPress={() => navigation.navigate('PaymentScreen', { orderId })}
                            >
                                <Text style={styles.payButtonText}>Pay Pending Amount</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Invoice Title */}
                    <Text style={styles.invoiceTitle}>INVOICE</Text>
                    <Text style={styles.invoiceInfo}>Invoice No: {invoice?.invNumber} | Date: {invoice?.createdAt ? new Date(invoice.createdAt).toDateString() : 'N/A'}</Text>

                    <View style={styles.divider} />

                    {/* Customer Info */}
                    <View style={styles.section}>
                        <Text style={styles.label}>Customer:</Text>
                        <Text style={styles.text}>{invoice?.userId?.firstName} {invoice?.userId?.lastName}</Text>
                    </View>

                    {/* Vehicle Info */}
                    <View style={styles.section}>
                        <Text style={styles.label}>Vehicle:</Text>
                        <Text style={styles.text}>{invoice?.carId?.listingTitle}</Text>
                        <Text style={styles.label}>VIN:</Text>
                        <Text style={styles.text}>{invoice?.carId?.vin}</Text>
                    </View>

                    <View style={styles.divider} />

                    {/* Amounts */}
                    <View style={styles.amountSection}>
                        <Text style={styles.label}>Wallet Deduction:</Text>
                        <Text style={styles.amount}>{invoice?.walletDeduction} AED</Text>

                        <Text style={styles.label}>Pending Amount:</Text>
                        <Text style={styles.amount}>{invoice?.pendingAmount} AED</Text>

                        <Text style={styles.label}>VAT (5%):</Text>
                        <Text style={styles.amount}>{invoice?.vat} AED</Text>

                        <Text style={styles.label}>Car Price:</Text>
                        <Text style={styles.amount}>{invoice?.carAmount} AED</Text>

                        <View style={styles.divider} />

                        <Text style={styles.totalAmount}>Total: {invoice?.totalAmount} AED</Text>
                    </View>
                </Card>
            </View>
        </ScrollView>
    );
};

export default OrderDetails;

const styles = StyleSheet.create({
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    container: { padding: 10, alignItems: 'center', backgroundColor: '#FAF9F6' },
    invoiceWrapper: { width: '100%', alignItems: 'center', padding: 20, borderWidth: 1, borderColor: '#ddd', borderRadius: 5, backgroundColor: '#fff', marginBottom: 100 },
    card: { width: '95%', padding: 20, elevation: 3, borderRadius: 5, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 5 },
    invoiceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    invoiceTitle: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginVertical: 5 },
    invoiceInfo: { fontSize: 14, textAlign: 'center', color: '#666' },
    section: { marginBottom: 10 },
    divider: { width: '100%', height: 1, backgroundColor: '#ccc', marginVertical: 10 },
    label: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    text: { fontSize: 14, color: '#555' },
    amountSection: { padding: 10, backgroundColor: '#f7f7f7', borderRadius: 5 },
    amount: { fontSize: 14, fontWeight: 'bold', color: '#333' },
    totalAmount: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginTop: 10 },
    payButton: { backgroundColor: '#ff5733', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 5 },
    payButtonText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
});
