import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Form from '../components/Form';

const Register = () => {
  const handleRegister = (formData: Record<string, string>) => {
    console.log('Register Data:', formData);
  };

  return (
    <View style={styles.container}>
      <Form
        fields={[
          { name: 'firstName', placeholder: 'First Name', type: 'default' },
          { name: 'lastName', placeholder: 'Last Name', type: 'default' },
          { name: 'email', placeholder: 'Email', type: 'email-address' },
          { name: 'phone', placeholder: 'Phone', type: 'phone-pad' }, // Keep this as a phone type
          { name: 'address', placeholder: 'Address', type: 'default' },
          { name: 'password', placeholder: 'Password', secureTextEntry: true },
        ]}
        buttonLabel="Register"
        onSubmit={handleRegister}
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
    backgroundColor: '#f8f9fa',
  },
});
