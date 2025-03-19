import { StyleSheet, View } from 'react-native';
import React, { useState } from 'react';
import Form from '../components/Form';
import { backendURL } from '../utils/exports';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Home'>>();

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
          await AsyncStorage.setItem("@token", res_data.token);
          navigation.navigate("Home");
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
          { name: 'email', placeholder: 'Email', type: 'email-address' },
          { name: 'password', placeholder: 'Password', secureTextEntry: true },
        ]}
        buttonLabel="Login"
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#f8f9fa',
  },
});
