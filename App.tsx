import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Suspense, lazy } from 'react';
const Auth = lazy(() => import('./src/screens/Auth'));
const Login = lazy(() => import('./src/screens/Login'));
const Register = lazy(() => import('./src/screens/Register'));
const Home = lazy(() => import('./src/screens/Home'));
const Profile = lazy(() => import('./src/screens/Profile'));
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text } from 'react-native';
const App = () => {
  const Stack = createNativeStackNavigator();
  return (


    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName='Auth'
          screenLayout={({ children }) => (
            <Suspense fallback={<Text>Loading...</Text>}>{children}</Suspense>
          )}>

          {/* Auth Pages */}

          <Stack.Screen
            options={{ headerShown: false }}
            name='Auth' component={Auth} />
          <Stack.Screen
            options={{ headerShown: false }}
            name='Login' component={Login} />
          <Stack.Screen
            options={{ headerShown: false }}
            name='Register' component={Register} />

          {/* Authenticated Pages */}

          <Stack.Screen name='Home' component={Home} />
          <Stack.Screen name='Profile' component={Profile} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  )
}

export default App