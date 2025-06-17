import { StyleSheet, View } from 'react-native';
import React, { useState } from 'react';
import Form from '../components/Form';
import { backendURL } from '../utils/exports';
import Toast from 'react-native-toast-message';
import { saveToken } from "../utils/asyncStorage"

const Login = ({ setToken }: { setToken: React.Dispatch<React.SetStateAction<string | null>> }) => {
  const [loading, setLoading] = useState(false);

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
        await saveToken(res_data.token)
        setToken(res_data.token);
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
    paddingHorizontal: 20,
    backgroundColor: '#f8f9fa',
    width: "100%"
  },
});
