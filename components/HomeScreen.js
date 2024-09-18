// components/HomeScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const HomeScreen = ({ route }) => {
  const [busLocations, setBusLocations] = useState({
    Shurma: { latitude: 22.468345, longitude: 91.970927 },
    Padma: { latitude: 22.364549, longitude: 91.821107 },
    Matamuhuri: { latitude: 22.336224, longitude: 91.823455 },
  });
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [heading, setHeading] = useState(0);
  const mapViewRef = useRef(null);

  const { selectedBus } = route.params || {};

  useEffect(() => {
    const startWatchingLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        return;
      }

      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (location) => {
          setUserLocation(location.coords);
        }
      );

      await Location.watchHeadingAsync((headingData) => {
        setHeading(headingData.trueHeading);
      });
    };

    startWatchingLocation();
    setLoading(false);
  }, []);

  useEffect(() => {
    if (selectedBus && mapViewRef.current && busLocations[selectedBus]) {
      const busLocation = busLocations[selectedBus];
      mapViewRef.current.animateToRegion({
        latitude: busLocation.latitude,
        longitude: busLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [selectedBus, busLocations]);

  const getUserLocation = () => {
    if (userLocation) {
      mapViewRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    } else {
      alert('User location not available');
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <MapView
          style={styles.map}
          ref={mapViewRef}
          initialRegion={{
            latitude: userLocation ? userLocation.latitude : 22.335351479700915,
            longitude: userLocation ? userLocation.longitude : 91.82630854206182,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
        >
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
});

export default HomeScreen;
