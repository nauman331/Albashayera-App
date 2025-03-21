import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const DrawerItem = ({ icon, text, onPress }: { icon: string; text: string; onPress: () => void }) => (
  <TouchableOpacity style={styles.drawerItem} onPress={onPress}>
    <Icon name={icon} size={24} color="black" />
    <Text style={styles.drawerText}>{text}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  drawerItem: { flexDirection: "row", alignItems: "center", padding: 15 },
  drawerText: { fontSize: 16, marginLeft: 15 },
});

export default DrawerItem;
