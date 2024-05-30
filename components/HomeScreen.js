// components/HomeScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Button, Image, TouchableOpacity } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';


const HomeScreen = () => {
  const [busLocations, setBusLocations] = useState({});
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [heading, setHeading] = useState(0);
  const [checkMyLocationPressed, setCheckMyLocationPressed] = useState(false);


  useEffect(() => {
    const fetchBusLocations = async () => {
      try {
        const response = await fetch('http://192.168.0.116:3000/location');
        const data = await response.json();
        setBusLocations(data);
        setLoading(false);
      } catch (error) {
        setErrorMsg('Error fetching bus location');
        setLoading(false);
      }
    };

    fetchBusLocations();
    const interval = setInterval(fetchBusLocations, 5000); // Update every 5 seconds
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

  // const getBusLocation = async () => {
  //   try {
  //     const response = await fetch('http://192.168.0.116:3000/location'); // Replace YOUR_LOCAL_IP with your actual IP
  //     const data = await response.json();
  //     console.log('Bus location:', data);
  //     setBusLocations(data);

  //     // Animate and zoom to bus location
  //     mapViewRef.current.animateToRegion({
  //       latitude: data.latitude,
  //       longitude: data.longitude,
  //       latitudeDelta: 0.005,
  //       longitudeDelta: 0.005,
  //     });
  //   } catch (error) {
  //     console.error('Error fetching bus location:', error);
  //     setErrorMsg('Error fetching bus location');
  //   }
  // };

     const mapViewRef = React.useRef(null);


  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <MapView style={styles.map}
        ref={mapViewRef}
        initialRegion={{
            latitude: userLocation ? userLocation.latitude : 22.335351479700915,
            longitude: userLocation ? userLocation.longitude : 91.82630854206182,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}>
          {Object.keys(busLocations).map((key) => (
            <Marker
              key={key}
              coordinate={busLocations[key]}
              anchor={{ x: 0.5, y: 1 }}
            >
              <Text style={styles.busName}>{key}</Text>
              <Image source={require('../assets/icons8-bus-48.png')} style={styles.busIcon} />
            </Marker>
          ))}
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
        <TouchableOpacity style={styles.fab} onPress={getUserLocation}>
        <View style={styles.innerFab}>
          <View style={styles.circle} />
        </View>
      </TouchableOpacity>
        
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
    height: '100%',
    marginTop: 10,
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

   busName: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
    marginBottom: 2,
  },
  calloutContainer: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    elevation: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: '#4285F4',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },

  innerFab: {
  width: 52,
  height: 52,
  borderRadius: 26,
  backgroundColor: '#fff',
  justifyContent: 'center',
  alignItems: 'center',
  },

  circle: {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: '#4285F4',
  },

  busIcon: {
  height: 25,
  width: 25,
  resizeMode: 'contain',
  },

  busFab: {
  bottom: 170, // Adjust the position for the bus floating button
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
