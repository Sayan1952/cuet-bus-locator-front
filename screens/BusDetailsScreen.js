// screens/BusDetailsScreen.js
import React from 'react';
import { View, Text, Button, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const BusDetailsScreen = () => {
  const navigation = useNavigation();
  
  // Static bus data
  const buses = [
    { id: 'Shurma', name: 'Shurma' },
    { id: 'Padma', name: 'Padma' },
    { id: 'Matamuhuri', name: 'Matamuhuri' },
  ];

  const renderBusItem = ({ item }) => (
    <View style={styles.busItem}>
      <Text style={styles.busName}>{item.name}</Text>
      <Button
        title="Find"
        onPress={() => navigation.navigate('Home', { selectedBus: item.id })}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={buses}
        keyExtractor={(item) => item.id}
        renderItem={renderBusItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  busItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    marginVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  busName: {
    fontSize: 18,
  },
});

export default BusDetailsScreen;
