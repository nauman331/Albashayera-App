import { backendURL } from '../utils/exports';
import { getToken } from '../utils/asyncStorage';
import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useFocusEffect } from '@react-navigation/native';

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
const InvoiceSlip = ({ route, navigation }: any) => {
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

  useFocusEffect(
    useCallback(() => {
      const fetchTokenAndInvoice = async () => {
        const tokenInner = await getToken();
        if (tokenInner) {
          getInvoice(tokenInner);
        }
      };
      fetchTokenAndInvoice();
    }, [orderId])
  );

  if (loading)
    return (
      <ActivityIndicator size="large" color="blue" />
    );
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={20} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.orderId}>#{invoice?.invNumber}</Text>
      </View>

      <View style={styles.paymentContainer}>
        <View style={styles.paymentIcons}>
          <View style={styles.iconWrapper}>
            <View style={[styles.iconContainer, invoice?.statusText === 'rejected' ? styles.iconContainerLarge : styles.iconCenterFaded]}>
              <Icon name="x-circle" size={invoice?.statusText === 'rejected' ? 28 : 20} color="#DC2626" />
            </View>
            <Text style={invoice?.statusText === 'rejected' ? styles.iconTextP : styles.iconText}>Rejected</Text>
          </View>

          <View style={[styles.iconWrapper, invoice?.statusText === 'payment pending' ? styles.iconCenter : styles.iconCenterFaded]}>
            <View style={[styles.iconContainer, invoice?.statusText === 'payment pending' ? styles.iconContainerLarge : styles.iconCenterFaded]}>
              <Icon name="clock" size={invoice?.statusText === 'payment pending' ? 28 : 20} color="#FBBF24" />
            </View>
            <Text style={invoice?.statusText === 'payment pending' ? styles.iconTextP : styles.iconText}>Pending</Text>
          </View>

          <View style={styles.iconWrapper}>
            <View style={[styles.iconContainer, invoice?.statusText === 'approved' ? styles.iconContainerLarge : styles.iconCenterFaded]}>
              <Icon name="check-circle" size={invoice?.statusText === 'approved' ? 28 : 20} color="#22C55E" />
            </View>
            <Text style={invoice?.statusText === 'approved' ? styles.iconTextP : styles.iconText}>Completed</Text>
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
            <Text style={styles.label}>CUSTOMER</Text>
            <Text style={styles.value}>{invoice?.userId?.firstName} {invoice?.userId?.lastName}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>DUE ON</Text>
            <Text style={styles.value}>{invoice?.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : 'N/A'}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>VEHICLE NAME</Text>
            <Text style={styles.value}>{invoice?.carId?.listingTitle}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>VEHICLE VIN</Text>
            <Text style={styles.value}>{invoice?.carId?.vin}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.detailsButton}>
          <Text style={styles.detailsText}>PPRICE DETAILS</Text>
          <Icon name="plus" size={14} color="#777" />
        </TouchableOpacity>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>WALLET DEDUCTION</Text>
            <Text style={styles.value}>{invoice?.walletDeduction} AED</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>PENDING AMOUNT</Text>
            <Text style={styles.value}>{invoice?.pendingAmount} AED</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>VAT (5%)</Text>
            <Text style={styles.value}>{invoice?.vat} AED</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>CAR PRICE</Text>
            <Text style={styles.value}>{invoice?.carAmount} AED</Text>
          </View>
        </View>
        <Text style={styles.totalAmount}>Total: {invoice?.totalAmount} AED</Text>
        {
          invoice?.paymentStatus ?
            <TouchableOpacity style={styles.payButton1}>
              <Icon name="check-circle" size={20} color="#fff" />
            </TouchableOpacity>
            :
            <TouchableOpacity
              onPress={() => navigation.navigate("PayOrder", { invoiceNumber: invoice?.invNumber, pendingAmount: invoice?.pendingAmount })}
              style={styles.payButton}>
              <Text style={styles.payButtonText}>PAY NOW</Text>
            </TouchableOpacity>
        }
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#E8F0FF',
    marginBottom: 70
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
    justifyContent: 'center', // Center icons
    alignItems: 'center',
    width: '100%',
    position: 'relative',
    marginBottom: 30
  },
  iconWrapper: {
    alignItems: 'center',
    flex: 1, // Spread icons evenly
  },
  iconContainer: {
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 30,
  },
  iconContainerLarge: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 40,
    marginBottom: 5,
  },
  iconText: {
    color: '#FFF',
    fontSize: 12,
  },
  iconTextP: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  iconCenter: {
    alignSelf: 'center', // Center active icon properly
    zIndex: 2,
  },

  iconCenterFaded: {
    opacity: 0.6,
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
  payButton1: {
    backgroundColor: '#22C55E',
    padding: 10,
    borderRadius: 100,
    alignItems: 'center',
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