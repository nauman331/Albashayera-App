import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Asset, launchImageLibrary } from "react-native-image-picker";
import { getToken } from "../utils/asyncStorage";
import Toast from "react-native-toast-message";
import { cloudinaryURL, backendURL, UPLOAD_PRESET } from "../utils/exports";

const Profile = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [proof, setProof] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = await getToken();
      if (token) {
        const userDataString = await AsyncStorage.getItem("@userdata");
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          setUser(userData);
          setFirstName(userData.firstName || "");
          setLastName(userData.lastName || "");
          setEmail(userData.email || "");
          setContact(userData.contact || "");
          setAddress(userData.address || "");
          setProof(userData.avatarImage || undefined);
        }
      }
    };
    fetchUserData();
  }, []);

  const pickFile = () => {
    launchImageLibrary({ mediaType: "photo", includeBase64: false }, (response) => {
      if (response.didCancel) return;
      if (response.assets) {
        uploadToCloudinary(response.assets[0]);
      }
    });
  };

  const uploadToCloudinary = async (file: Asset) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", { uri: file.uri, type: file.type, name: file.fileName });
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      const res = await fetch(cloudinaryURL, { method: "POST", body: formData });
      const data = await res.json();
      setProof(data.secure_url);
      Toast.show({ type: "success", text1: "Proof uploaded successfully!" });
    } catch (error) {
      Toast.show({ type: "error", text1: "Upload failed" });
    } finally {
      setUploading(false);
    }
  };

  const updateProfile = async () => {
    try {
      const token = await getToken();
      if (!token) {
        console.error("No token found");
        return;
      }
      const updatedUser = { firstName, lastName, email, contact, address, avatarImage: proof };
      const response = await fetch(`${backendURL}/user/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(updatedUser),
      });
      const result = await response.json();
      if (response.ok) {
        setUser((prevUser: any) => ({ ...prevUser, ...updatedUser }));
        await AsyncStorage.setItem("@userdata", JSON.stringify({ ...user, ...updatedUser }));
        setModalVisible(false);
      } else {
        console.error("Update failed:", result.message);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return user ? (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.profileCard}>
        <Image source={{ uri: proof ?? undefined }} style={styles.avatar} />
        <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.contact}>{user.contact}</Text>
        <Text style={styles.address}>{user.address}</Text>

        <TouchableOpacity style={styles.editButton} onPress={() => setModalVisible(true)}>
          <Icon name="edit" size={20} color="#fff" />
          <Text style={styles.editText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={pickFile}>
              <Image source={{ uri: proof ?? undefined }} style={styles.avatar} />
              <Icon name="photo-camera" size={25} color="#fff" style={styles.cameraIcon} />
            </TouchableOpacity>
            <TextInput style={styles.input} placeholder="First Name" value={firstName} onChangeText={setFirstName} />
            <TextInput style={styles.input} placeholder="Last Name" value={lastName} onChangeText={setLastName} />
            <TextInput style={styles.input} placeholder="Email" value={email} keyboardType="email-address" onChangeText={setEmail} />
            <TextInput style={styles.input} placeholder="Contact" value={contact} onChangeText={setContact} />
            <TextInput style={styles.input} placeholder="Address" value={address} onChangeText={setAddress} />
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.saveButton} onPress={updateProfile}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
              <Pressable style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  ) : (
    <Text>Loading....</Text>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  profileCard: {
    backgroundColor: "#fff",
    width: "100%",
    alignItems: "center",
    padding: 20,
    borderRadius: 15,
    elevation: 5,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  modalAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    alignSelf: "center",
  },
  cameraIcon: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 15,
    padding: 5,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  email: {
    fontSize: 16,
    color: "#666",
  },
  contact: {
    fontSize: 14,
    color: "#888",
    marginTop: 8,
    textAlign: "center",
  },
  address: {
    fontSize: 14,
    color: "#555",
    marginTop: 8,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#010153",
    padding: 10,
    borderRadius: 20,
    marginTop: 15,
  },
  editText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 5,
  },

  // ✨ MODAL STYLES ✨
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  },
  modalContainer: {
    backgroundColor: "#fff",
    width: "90%",
    padding: 20,
    borderRadius: 15,
    elevation: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },

  input: {
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingVertical: 8,
    fontSize: 16,
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: "#010153",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#ddd",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  cancelText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "bold",
  },
});
