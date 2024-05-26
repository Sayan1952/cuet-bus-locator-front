// components/HomeScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Button } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const HomeScreen = () => {
  const [busLocation, setBusLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [heading, setHeading] = useState(0);

  useEffect(() => {
    const fetchBusLocation = async () => {
      try {
        const response = await fetch('http://192.168.0.116:3000/location');
        const data = await response.json();
        setBusLocation(data);
        setLoading(false);
      } catch (error) {
        setErrorMsg('Error fetching bus location');
        setLoading(false);
      }
    };

    fetchBusLocation();
    const interval = setInterval(fetchBusLocation, 5000); // Update every 5 seconds
    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

useEffect(() => {
    const startWatchingLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }

        await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 1000, // Update every second
            distanceInterval: 1, // Update every meter
          },
          (location) => {
            setUserLocation(location.coords);
            // Automatically zoom to the user's location when it's updated
            mapViewRef.current.animateToRegion({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            });
          }
        );

        await Location.watchHeadingAsync((headingData) => {
          setHeading(headingData.trueHeading);
        });
      } catch (error) {
        console.error('Error watching location:', error);
        setErrorMsg('Error watching location');
      }
    };

    startWatchingLocation();
  }, []);

  const getUserLocation = () => {
    if (userLocation) {
      // Animate and zoom to user's location
      mapViewRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.005, // Smaller delta for more zoom
        longitudeDelta: 0.005, // Smaller delta for more zoom
      });
    } else {
      setErrorMsg('User location is not available');
    }
  };

  const getBusLocation = async () => {
    try {
      const response = await fetch('http://192.168.0.116:3000/location'); // Replace YOUR_LOCAL_IP with your actual IP
      const data = await response.json();
      console.log('Bus location:', data);
      setBusLocation(data);

      // Animate and zoom to bus location
      mapViewRef.current.animateToRegion({
        latitude: data.latitude,
        longitude: data.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    } catch (error) {
      console.error('Error fetching bus location:', error);
      setErrorMsg('Error fetching bus location');
    }
  };

     const mapViewRef = React.useRef(null);


  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <MapView style={styles.map}
        ref={mapViewRef}>
          {busLocation && (
            <Marker
              coordinate={{
                latitude: busLocation.latitude,
                longitude: busLocation.longitude,
                latitudeDelta: 0.00922,
                longitudeDelta: 0.00421,
              }}
              title={"Bus Location"}
            />
          )}
          {userLocation && (
            <Marker
              coordinate={{
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
              }}
              title={"My Location"}
            >
              <View style={styles.customMarker}>
                <View style={[styles.dot, { transform: [{ rotate: `${heading}deg` }] }]}>
                  <View style={styles.arrow} />
                </View>
              </View>
            </Marker>
          )}
        </MapView>
      )}
      <View style={styles.buttonContainer}>
        <Button title="Check My Location" onPress={getUserLocation} />
        <Button title="Locate Bus" onPress={getBusLocation} />
      </View>
      {errorMsg && <Text style={styles.text}>{errorMsg}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    width: '100%',
    height: '80%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  customMarker: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    borderWidth: 5,
    borderColor: 'rgba(255,255,255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },  
   
  arrow: {
    position: 'absolute',
    top: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderBottomWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#007AFF',
  },
  text: {
    margin: 16,
    fontSize: 16,
    color: 'red',
  },
});

export default HomeScreen;
