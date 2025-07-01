import { StyleSheet, TextInput, TouchableOpacity, Text, View, Image, KeyboardTypeOptions, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import React, { useState } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import PhoneInput from 'react-native-phone-number-input';
import logo from "../assets/images/Logo.png";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

interface FormProps {
  fields: { name: string; placeholder: string; secureTextEntry?: boolean; type?: KeyboardTypeOptions; }[];
  buttonLabel: string;
  loading: boolean;
  onSubmit: (formData: Record<string, string>) => void;
}


const Form: React.FC<FormProps> = ({ fields, buttonLabel, onSubmit, loading }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation();
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back Arrow */}
        <TouchableOpacity
          style={{ alignSelf: 'flex-start', marginBottom: 10 }}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={28} color="#010153" />
        </TouchableOpacity>
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
                placeholder={t("phone")}
                onChangeFormattedText={(text) => {
                  setPhoneNumber(text);
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
        {
          buttonLabel === t("login") &&
          <View style={{ width: '100%', alignItems: 'flex-end' }}>
            <TouchableOpacity onPress={() => navigation.navigate('Forgot')}>
              <Text style={styles.forgotLink}> {t("forgot_password")} ?</Text>
            </TouchableOpacity>
          </View>
        }
        {/* Submit Button */}
        <TouchableOpacity style={styles.button} onPress={() => onSubmit({ ...formData, contact: phoneNumber })}>
          <Text style={styles.buttonText}>{loading ? t("submitting") : buttonLabel}</Text>
        </TouchableOpacity>

        {
          buttonLabel === t("login") && (
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>{t("dont_have_account")}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLink}>{t("register")}</Text>
              </TouchableOpacity>
            </View>
          )}
        {
          buttonLabel === t("register") && (
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>{t("already_have_account")}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.registerLink}>{t("login")}</Text>
              </TouchableOpacity>
            </View>
          )}

      </ScrollView>
    </KeyboardAvoidingView>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
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
    backgroundColor: '#010153',
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
    color: '#010153',
  },
  forgotLink: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#010153',
    marginVertical: 10,
    alignSelf: "flex-end",
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
