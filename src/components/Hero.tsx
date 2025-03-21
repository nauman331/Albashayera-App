import React, { useState } from "react";
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  Pressable,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const { width, height } = Dimensions.get("window");

const Hero = () => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <ImageBackground
      source={{
        uri: "https://images.unsplash.com/photo-1601929862217-f1bf94503333?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bHV4dXJ5JTIwY2FyfGVufDB8fDB8fHww",
      }}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Drive Your Dream, Own the Road</Text>
          <Text style={styles.subtitle}>
            Exclusive car auctions at unbeatable prices. Find your perfect car now!
          </Text>
          <TouchableOpacity style={styles.filterButton} onPress={() => setModalVisible(true)}>
            <Icon name="filter-list" size={24} color="white" />
            <Text style={styles.filterText}>Filter Cars</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal for Filters */}
      <Modal animationType="fade" transparent={true} visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Filter By</Text>
            <Pressable style={styles.option}>
              <Icon name="directions-car" size={22} color="#ff4500" />
              <Text style={styles.optionText}>Make</Text>
            </Pressable>
            <Pressable style={styles.option}>
              <Icon name="local-offer" size={22} color="#ff4500" />
              <Text style={styles.optionText}>Model</Text>
            </Pressable>
            <Pressable style={styles.option}>
              <Icon name="attach-money" size={22} color="#ff4500" />
              <Text style={styles.optionText}>Price</Text>
            </Pressable>

            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    width: "100%",
    height: height * 0.55,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: "85%",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: 18,
    color: "#ddd",
    textAlign: "center",
    marginVertical: 15,
    lineHeight: 26,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ff4500",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  filterText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 22,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  optionText: {
    fontSize: 18,
    marginLeft: 12,
    color: "#333",
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#ff4500",
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  closeText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
});

export default Hero;