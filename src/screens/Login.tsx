import { StyleSheet, View } from 'react-native';
import React from 'react';
import Form from '../components/Form';

const Login = () => {
  const handleLogin = (formData: Record<string, string>) => {
    console.log('Login Data:', formData);
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
