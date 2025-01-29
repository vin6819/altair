// App.js
import React, { useState, useEffect } from 'react';
import { Platform, View, TextInput, Button, Text, Image, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

import * as Location from 'expo-location';



const App = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [qrCodeImageUrl, setQrCodeImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
      async function getCurrentLocation() {

        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
      }

      getCurrentLocation();
    }, []);
let loc = {}
let text = 'Waiting...';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
      loc = location['coords'];
    text = JSON.stringify(location);
    console.log(text);
  }

 const handleLogin = async () => {
   setLoading(true);
   console.log(email,password)
   try {
       console.log(typeof loc)
       console.log(loc['latitude'], loc['longitude']);
       let lat = loc['latitude'];
       let lng = loc['longitude'];
const response=await axios.post(`http://192.168.31.241:8000/api/login/?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`);
     Alert.alert('Success', response.data.message);
     setQrCodeImageUrl(response.data.qrCodeImageUrl);
   } catch (error) {
     Alert.alert('Error', error.response?.data?.message || 'Something went wrong');
   }
   setLoading(false);
 };
 return (
    <View style={styles.container}>
      <Text style={styles.heading}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Roll No."
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title={loading ? 'Loading...' : 'Login'} onPress={handleLogin} disabled={loading} />

      {qrCodeImageUrl ? (
        <Image source={{ uri: qrCodeImageUrl }} style={styles.qrCodeImage} />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  qrCodeImage: {
    width: 200,
    height: 200,
    marginTop: 20,
    alignSelf: 'center',
  },
});

export default App;