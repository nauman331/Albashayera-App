// import {
//     StyleSheet,
//     Text,
//     View,
//     ActivityIndicator,
//     ScrollView,
//     TouchableOpacity,
// } from 'react-native';
// import React, { useEffect, useState } from 'react';
// import { backendURL } from '../utils/exports';
// import { getToken } from '../utils/asyncStorage';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import { Card } from 'react-native-paper';

// interface Order {
//     carAmount: number;
//     createdAt: string | Date;
//     invNumber: number;
//     paidAmount: number;
//     pendingAmount: number;
//     paymentStatus: boolean;
//     statusText: string;
//     totalAmount: number;
//     vat: number;
//     walletDeduction: number;
//     carId: {
//         vin: string;
//         listingTitle: string;
//     };
//     userId: {
//         firstName: string;
//         lastName: string;
//         _id: string;
//     };
// }

// const OrderDetails = ({ route, navigation }: any) => {
//     const { orderId } = route.params;
//     const [loading, setLoading] = useState<boolean>(true);
//     const [invoice, setInvoice] = useState<Order | null>(null);

//     const getInvoice = async (tokenValue: string) => {
//         try {
//             setLoading(true);
//             const response = await fetch(`${backendURL}/purchase-invoice/get-invoice/${orderId}`, {
//                 method: 'GET',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     Authorization: `Bearer ${tokenValue}`,
//                 },
//             });
//             const resData = await response.json();
//             if (response.ok) {
//                 setInvoice(resData);
//             } else {
//                 console.error(resData.message);
//             }
//         } catch (error) {
//             console.error('Error fetching invoice', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         const fetchTokenAndInvoice = async () => {
//             const tokenInner = await getToken();
//             if (tokenInner) {
//                 getInvoice(tokenInner);
//             }
//         };
//         fetchTokenAndInvoice();
//     }, [orderId]);

//     const getStatusIcon = () => {
//         switch (invoice?.statusText.toLowerCase()) {
//             case 'approved':
//                 return <Icon name="check-circle" size={50} color="green" />;
//             case 'payment pending':
//                 return <Icon name="hourglass-empty" size={50} color="orange" />;
//             case 'rejected':
//                 return <Icon name="cancel" size={50} color="red" />;
//             default:
//                 return <Icon name="info" size={50} color="gray" />;
//         }
//     };

//     if (loading)
//         return (
//             <View style={styles.loader}>
//                 <ActivityIndicator size="large" color="blue" />
//             </View>
//         );

//     return (
//         <ScrollView contentContainerStyle={styles.container}>
//             <View style={styles.invoiceWrapper}>
//                 <Card style={styles.card}>
//                     {/* Invoice Header */}
//                     <View style={styles.invoiceHeader}>
//                         <View>{getStatusIcon()}</View>
//                         {!invoice?.paymentStatus && (
//                             <TouchableOpacity
//                                 style={styles.payButton}
//                                 onPress={() => navigation.navigate('PaymentScreen', { orderId })}
//                             >
//                                 <Text style={styles.payButtonText}>Pay Pending Amount</Text>
//                             </TouchableOpacity>
//                         )}
//                     </View>

//                     {/* Invoice Title */}
//                     <Text style={styles.invoiceTitle}>INVOICE</Text>
//                     <Text style={styles.invoiceInfo}>Invoice No: {invoice?.invNumber} | Date: {invoice?.createdAt ? new Date(invoice.createdAt).toDateString() : 'N/A'}</Text>

//                     <View style={styles.divider} />

//                     {/* Customer Info */}
//                     <View style={styles.section}>
//                         <Text style={styles.label}>Customer:</Text>
//                         <Text style={styles.text}>{invoice?.userId?.firstName} {invoice?.userId?.lastName}</Text>
//                     </View>

//                     {/* Vehicle Info */}
//                     <View style={styles.section}>
//                         <Text style={styles.label}>Vehicle:</Text>
//                         <Text style={styles.text}>{invoice?.carId?.listingTitle}</Text>
//                         <Text style={styles.label}>VIN:</Text>
//                         <Text style={styles.text}>{invoice?.carId?.vin}</Text>
//                     </View>

//                     <View style={styles.divider} />

//                     {/* Amounts */}
//                     <View style={styles.amountSection}>
//                         <Text style={styles.label}>Wallet Deduction:</Text>
//                         <Text style={styles.amount}>{invoice?.walletDeduction} AED</Text>

//                         <Text style={styles.label}>Pending Amount:</Text>
//                         <Text style={styles.amount}>{invoice?.pendingAmount} AED</Text>

//                         <Text style={styles.label}>VAT (5%):</Text>
//                         <Text style={styles.amount}>{invoice?.vat} AED</Text>

//                         <Text style={styles.label}>Car Price:</Text>
//                         <Text style={styles.amount}>{invoice?.carAmount} AED</Text>

//                         <View style={styles.divider} />

//                         <Text style={styles.totalAmount}>Total: {invoice?.totalAmount} AED</Text>
//                     </View>
//                 </Card>
//             </View>
//         </ScrollView>
//     );
// };

// export default OrderDetails;

// const styles = StyleSheet.create({
//     loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//     container: { padding: 10, alignItems: 'center', backgroundColor: '#FAF9F6' },
//     invoiceWrapper: { width: '100%', alignItems: 'center', padding: 20, borderWidth: 1, borderColor: '#ddd', borderRadius: 5, backgroundColor: '#fff', marginBottom: 100 },
//     card: { width: '95%', padding: 20, elevation: 3, borderRadius: 5, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 5 },
//     invoiceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
//     invoiceTitle: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginVertical: 5 },
//     invoiceInfo: { fontSize: 14, textAlign: 'center', color: '#666' },
//     section: { marginBottom: 10 },
//     divider: { width: '100%', height: 1, backgroundColor: '#ccc', marginVertical: 10 },
//     label: { fontSize: 16, fontWeight: 'bold', color: '#333' },
//     text: { fontSize: 14, color: '#555' },
//     amountSection: { padding: 10, backgroundColor: '#f7f7f7', borderRadius: 5 },
//     amount: { fontSize: 14, fontWeight: 'bold', color: '#333' },
//     totalAmount: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginTop: 10 },
//     payButton: { backgroundColor: '#ff5733', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 5 },
//     payButtonText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
// });



import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const InvoiceSlip = () => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Icon name="arrow-left" size={20} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.orderId}>#RF-232-258-299</Text>
      </View>
      
      {/* Payment Section */}
      <View style={styles.paymentContainer}>
        <View style={styles.paymentIcons}>
          <View style={[styles.iconWrapper, styles.iconLeft]}>
            <View style={[styles.iconContainer, { opacity: 0.6 }]}>
              <Icon name="x-circle" size={20} color="#DC2626" />
            </View>
            <Text style={styles.iconText}>Rejected</Text>
          </View>
          <View style={[styles.iconWrapper, styles.iconCenter]}>
            <View style={styles.iconContainerLarge}>
              <Icon name="clock" size={28} color="#FBBF24" />
            </View>
            <Text style={styles.iconTextP}>Pending</Text>
          </View>
          <View style={[styles.iconWrapper, styles.iconRight]}>
            <View style={[styles.iconContainer, { opacity: 0.6 }]}>
              <Icon name="check-circle" size={20} color="#22C55E" />
            </View>
            <Text style={styles.iconText}>Completed</Text>
          </View>
        </View>
      </View>
      
      {/* Invoice Box */}
      <View style={styles.invoiceBox}>
        <View style={styles.invoiceHeader}>
          <Text style={styles.invoiceText}>INVOICE</Text>
        </View>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>ORDER #</Text>
            <Text style={styles.value}>RF-232-258-299</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>DUE ON</Text>
            <Text style={styles.value}>Jul 21, 2015</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Rx</Text>
            <Text style={styles.value}>02</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>MEDICATIONS</Text>
            <Text style={styles.value}>18</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.detailsButton}>
          <Text style={styles.detailsText}>DETAILS</Text>
          <Icon name="plus" size={14} color="#777" />
        </TouchableOpacity>
        <Text style={styles.totalAmount}>$145.00</Text>
        <TouchableOpacity style={styles.payButton}>
          <Text style={styles.payButtonText}>PAY NOW</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: '#E8F0FF',
  },
  header: {
    backgroundColor: '#3B82F6',
    paddingVertical: 15,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20,
  },
  orderId: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  paymentContainer: {
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    alignItems: 'center',
    width: '100%',
    position: 'relative',
  },
  paymentIcons: {
    flexDirection: 'row',
   marginBottom: 20,
    justifyContent: 'space-between',
    width: '90%',
    position: 'relative',
  },
  iconWrapper: {
    alignItems: 'center',
  },
  iconLeft: {
    position: 'absolute',
    left: 10,
    bottom: 0,
  },
  iconCenter: {
    zIndex: 2,
  },
  iconRight: {
    position: 'absolute',
    right: 10,
    bottom: 0,
  },
  iconContainer: {
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 30,
    marginBottom: 5,
  },
  iconContainerLarge: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 40,
    marginBottom: 5,
    marginLeft: "50%"
  },
  iconText: {
    color: '#FFF',
    fontSize: 12,
  },
  iconTextP: {
    color: '#FFF',
    fontSize: 12,
    marginLeft: "50%"
  },
  invoiceBox: {
    backgroundColor: '#FFF',
    width: '90%',
    padding: 20,
    borderRadius: 10,
    marginTop: -20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    alignItems: 'center',
    overflow: 'visible',
  },
  invoiceHeader: {
    backgroundColor: '#F8F9FB',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 15,
    marginBottom: 10,
  },
  invoiceText: {
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  column: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: '#777',
  },
  value: {
    fontWeight: 'bold',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailsText: {
    fontSize: 12,
    color: '#777',
    marginRight: 5,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  payButton: {
    backgroundColor: '#22C55E',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    width: '50%',
    position: 'absolute',
    bottom: -20,
    alignSelf: 'center',
  },
  payButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default InvoiceSlip;