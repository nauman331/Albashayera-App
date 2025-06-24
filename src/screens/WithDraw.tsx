import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableWithoutFeedback,
    Keyboard
} from 'react-native';
import Form from '../components/Form';
import { getToken } from '../utils/asyncStorage';
import { backendURL } from '../utils/exports';
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import Toast from 'react-native-toast-message';

const WithDraw = ({ route }: any) => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Wallet'>>();
    const balance = route?.params?.balance || "";
    const [loading, setLoading] = useState<boolean>(false);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const fetchToken = async () => {
            const tokeninner = await getToken();
            setToken(tokeninner);
        };
        fetchToken();
    }, []);

    const handleWithdraw = async (formData: Record<string, string>) => {
        if (parseFloat(formData.amount) > parseFloat(balance)) {
            Toast.show({
                type: "error",
                text1: "Error:",
                text2: "You can't withdraw more than your balance"
            });
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`${backendURL}/wallet/create-withdraw-request`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const res_data = await response.json();

            if (response.ok) {
                Toast.show({
                    type: "success",
                    text1: "Withdrawal request submitted"
                });
                navigation.navigate("Wallet");
            } else {
                Toast.show({
                    type: "error",
                    text1: "Error:",
                    text2: res_data.message
                });
            }
        } catch (error) {
            Toast.show({
                type: "error",
                text1: "Error while sending request"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.centeredContent}>
                        <Text style={styles.header}>Withdraw Funds</Text>
                        <Form
                            fields={[
                                { name: 'accountHolderName', placeholder: 'Account Holder Name', type: 'default' },
                                { name: 'accountNumber', placeholder: 'Account/IBAN Number', type: 'default' },
                                { name: 'bankName', placeholder: 'Bank Name', type: 'default' },
                                { name: 'amount', placeholder: `Balance - ${balance}`, type: 'numeric' },
                            ]}
                            buttonLabel="Withdraw"
                            onSubmit={handleWithdraw}
                            loading={loading}
                        />
                    </View>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

export default WithDraw;

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        paddingTop: 20,
        paddingBottom: 40,
        minHeight: '100%',
    },
    centeredContent: {
        width: '100%',
        justifyContent: 'center',
        flex: 1,
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        color: "#333",
    },
});
