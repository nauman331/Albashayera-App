import { StyleSheet, View } from 'react-native';
import React, { useState } from 'react';
import Form from '../components/Form';
import { backendURL } from '../utils/exports';
import Toast from 'react-native-toast-message';
import { saveToken } from "../utils/asyncStorage"
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useTranslation } from 'react-i18next';

const Login = ({ setToken }: { setToken: React.Dispatch<React.SetStateAction<string | null>> }) => {
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation();
  const handleLogin = async (formData: Record<string, string>) => {
    try {
      setLoading(true)
      const response = await fetch(`${backendURL}/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const res_data = await response.json();
      if (response.ok) {
        Toast.show({
          type: "success",
          text1: 'Welcome',
          text2: 'User logged In successfully 👋'
        });
        setToken(res_data.token);
        await saveToken(res_data.token)
        navigation.reset({
          index: 0,
          routes: [{ name: "Dashboard" }],
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: res_data.message
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Error while logging In"
      });
    } finally {
      setLoading(false)
    }

  };

  return (
    <View style={styles.container}>
      <Form
        fields={[
          { name: 'email', placeholder: t("email"), type: 'email-address' },
          { name: 'password', placeholder: t("password"), secureTextEntry: true },
        ]}
        buttonLabel={t("login")}
        onSubmit={handleLogin}
        loading={loading}
      />
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    width: "100%",
    backgroundColor: '#fff',
  },
});
