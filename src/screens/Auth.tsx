import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import logo from '../assets/images/Logo.png';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
};

type AuthScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const Auth = () => {
  const navigation = useNavigation<AuthScreenNavigationProp>();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {/* Middle Section: Welcome, Logo, and Description */}
      <View style={styles.middleContainer}>
        <Text style={styles.topText}>{t("welcome")}</Text>
        <Image source={logo} style={styles.logo} />
        <Text style={styles.description}>{t("auctions_simple")}</Text>
      </View>

      {/* Bottom Section: Button & Register */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.buttonText}>{t("login")}</Text>
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>{t("dont_have_account")}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}> {t("register")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Auth;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 30,
  },
  middleContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#555',
    paddingHorizontal: 20,
  },
  bottomContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    width: '90%',
    backgroundColor: '#010153',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
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
});
// No changes needed here for App Store compliance.
