import { StyleSheet, TextInput, TouchableOpacity, Text, View, Image, KeyboardTypeOptions } from 'react-native';
import React, { useState } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import PhoneInput from 'react-native-phone-number-input';
import logo from "../assets/images/Logo.png";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface FormProps {
  fields: { name: string; placeholder: string; secureTextEntry?: boolean; type?: KeyboardTypeOptions; }[];
  buttonLabel: string;
  onSubmit: (formData: Record<string, string>) => void;
}

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
};

type AuthScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const Form: React.FC<FormProps> = ({ fields, buttonLabel, onSubmit }) => {
  const navigation = useNavigation<AuthScreenNavigationProp>();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [passwordVisible, setPasswordVisible] = useState<Record<string, boolean>>({});
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const phoneInputRef = React.useRef<PhoneInput>(null);

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (fieldName: string) => {
    setPasswordVisible((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image source={logo} style={styles.logo} />

      {/* Dynamic Inputs */}
      {fields.map((field) => (
        <View key={field.name} style={styles.inputContainer}>
          {field.name === 'phone' ? (
              <PhoneInput
              ref={phoneInputRef}
              defaultValue={phoneNumber}
              defaultCode="AE"
              layout="second"
              onChangeFormattedText={(text) => {
                setPhoneNumber(text);
                handleChange(field.name, text);
              }}
              containerStyle={{
                width: '100%',
                backgroundColor: 'transparent',
                borderRadius: 12,
                height: 50,
              }}
              textContainerStyle={{
                borderRadius: 12,
                height: 50,
                alignItems: 'center',
              }}
              textInputStyle={{
                fontSize: 16,
                color: 'black',
                height: 50,
              }} 
            />
            
          ) : (
            <TextInput
              keyboardType={field.secureTextEntry ? 'default' : field.type}
              style={styles.input}
              placeholder={field.placeholder}
              secureTextEntry={field.secureTextEntry && !passwordVisible[field.name]}
              onChangeText={(value) => handleChange(field.name, value)}
              placeholderTextColor="#888"
            />
          )}


          {field.secureTextEntry && (
            <TouchableOpacity onPress={() => togglePasswordVisibility(field.name)} style={styles.eyeIcon}>
              <Icon name={passwordVisible[field.name] ? "eye-off-outline" : "eye-outline"} size={22} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      ))}

      {/* Submit Button */}
      <TouchableOpacity style={styles.button} onPress={() => onSubmit({ ...formData, phone: phoneNumber })}>
        <Text style={styles.buttonText}>{buttonLabel}</Text>
      </TouchableOpacity>

      {
        buttonLabel === "Login" ? (
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}> Register</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.registerLink}> Login</Text>
            </TouchableOpacity>
          </View>
        )
      }
    </View>
  );
};

export default Form;

const styles = StyleSheet.create({
  container: {
    width: '90%',
    alignSelf: 'center',
    alignItems: 'center',
    paddingTop: 30,
  },
  logo: {
    width: 180,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 20,
  },



  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 15,
    marginBottom: 12,
    position: 'relative',
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  registerContainer: {
    flexDirection: 'row',
    marginTop: 15,
    marginBottom: 20,
  },
  registerText: {
    fontSize: 16,
    color: '#555',
  },
  registerLink: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
