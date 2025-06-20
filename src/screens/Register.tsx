import { StyleSheet, View } from 'react-native';
import React, { useState } from 'react';
import Form from '../components/Form';
import { backendURL } from '../utils/exports';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

const Register = () => {
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Otp'>>();

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
          { name: 'firstName', placeholder: 'First Name', type: 'default' },
          { name: 'lastName', placeholder: 'Last Name', type: 'default' },
          { name: 'email', placeholder: 'Email', type: 'email-address' },
          { name: 'phone', placeholder: 'Phone', type: 'phone-pad' },
          { name: 'address', placeholder: 'Address', type: 'default' },
          { name: 'password', placeholder: 'Password', secureTextEntry: true },
        ]}
        buttonLabel="Register"
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
