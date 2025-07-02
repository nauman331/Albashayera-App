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
import { useTranslation } from "react-i18next";

const WithDraw = ({ route }: any) => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Wallet'>>();
    const balance = route?.params?.balance || "";
    const [loading, setLoading] = useState<boolean>(false);
    const [token, setToken] = useState<string | null>(null);
    const { t } = useTranslation();

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
                text1: t("error") + ":",
                text2: t("withdraw_more_than_balance") || "You can't withdraw more than your balance"
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
                    text1: t("withdrawal_request_submitted") || "Withdrawal request submitted"
                });
                navigation.navigate("Wallet");
            } else {
                Toast.show({
                    type: "error",
                    text1: t("error") + ":",
                    text2: res_data.message
                });
            }
        } catch (error) {
            Toast.show({
                type: "error",
                text1: t("error_while_sending_request") || "Error while sending request"
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
                        <Text style={styles.header}>{t("withdraw_funds")}</Text>
                        <Form
                            fields={[
                                { name: 'accountHolderName', placeholder: t("account_holder_name"), type: 'default' },
                                { name: 'accountNumber', placeholder: t("account_number"), type: 'default' },
                                { name: 'bankName', placeholder: t("bank_name"), type: 'default' },
                                { name: 'amount', placeholder: `${t("balance")} - ${balance}`, type: 'numeric' },
                            ]}
                            buttonLabel={t("withdraw")}
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
