import { StyleSheet, View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import Form from '../components/Form'
import { getToken } from '../utils/asyncStorage'
import { backendURL } from '../utils/exports'
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import Toast from 'react-native-toast-message'

const WithDraw = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Wallet'>>();
    const [loading, setLoading] = useState<boolean>(false);
    const [token, setToken] = useState<string | null>(null)

    useEffect(() => {
        const fetchToken = async () => {
            const tokeninner = await getToken();
            setToken(tokeninner)
        }
        fetchToken()
    }, [])

    const handleWithdraw = async (formData: Record<string, string>) => {

        const authorizationToken = `Bearer ${token}`;
        try {
            setLoading(true)
            const response = await fetch(`${backendURL}/wallet/create-withdraw-request`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: authorizationToken,
                },
                body: JSON.stringify(formData),
            });

            const res_data = await response.json();

            if (response.ok) {
                Toast.show({
                    type: "success",
                    text1: "Withdrawal request submitted"
                })
                navigation.navigate("Wallet");
            } else {
                Toast.show({
                    type: "error",
                    text1: "Error:",
                    text2: res_data.message
                })
            }
        } catch (error) {
            Toast.show({
                type: "error",
                text1: "Error while sending request"
            })
        } finally {
            setLoading(false)
        }
    };

    return (
        <View style={styles.container}>
             <Text style={styles.header}>Withdraw Funds</Text>
            <Form
                fields={[
                    { name: 'accountHolderName', placeholder: 'Account Holder Name', type: 'default' },
                    { name: 'accountNumber', placeholder: 'Account/IBAN Number', type: 'default' },
                    { name: 'bankName', placeholder: 'Bank Name', type: 'default' },
                    { name: 'amount', placeholder: 'Amount', type: 'phone-pad' },
                ]}
                buttonLabel="Withdraw"
                onSubmit={handleWithdraw}
                loading={loading}
            />
        </View>
    )
}

export default WithDraw

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        backgroundColor: '#f8f9fa',
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        color: "#333",
    },
})