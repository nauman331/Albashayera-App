import { StyleSheet, View } from 'react-native';
import React, { useState } from 'react';
import Form from '../components/Form';
import { backendURL } from '../utils/exports';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useTranslation } from 'react-i18next';

const Register = () => {
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Otp'>>();
  const { t } = useTranslation();
  const handleRegister = async (formData: Record<string, string>) => {

    try {
      setLoading(true);
      const response = await fetch(`${backendURL}/user/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role: "buyer" }),
      });

      const res_data = await response.json();
      if (response.ok) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: res_data.message,
        });

        navigation.navigate('Otp', { email: formData.email });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: res_data?.errors?.[0]?.msg || res_data?.message || 'Unknown error occurred',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Error while registering a user',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Form
        fields={[
          { name: 'firstName', placeholder: t("first_name"), type: 'default' },
          { name: 'lastName', placeholder: t("last_name"), type: 'default' },
          { name: 'email', placeholder: t("email"), type: 'email-address' },
          { name: 'phone', placeholder: t("phone"), type: 'phone-pad' },
          { name: 'address', placeholder: t("address"), type: 'default' },
          { name: 'password', placeholder: t("password"), secureTextEntry: true },
        ]}
        buttonLabel={t("register")}
        onSubmit={handleRegister}
        loading={loading}
      />
    </View>
  );
};

export default Register;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
});
