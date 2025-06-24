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
  Linking,
  ActivityIndicator
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Asset, launchImageLibrary } from "react-native-image-picker";
import { getToken, removeToken, removeData } from "../utils/asyncStorage";
import Toast from "react-native-toast-message";
import { cloudinaryURL, backendURL, UPLOAD_PRESET } from "../utils/exports";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { requestMediaPermissions } from "../utils/permissions";


type ProfileProps = {
  setToken: (token: string | null) => void;
};

const Profile: React.FC<ProfileProps> = ({ setToken }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [proof, setProof] = useState<string | undefined>(undefined);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

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

  const pickFile = async () => {
    const granted = await requestMediaPermissions();
    if (!granted) {
      Toast.show({ type: "error", text1: "Permission denied" });
      return;
    }
    launchImageLibrary({ mediaType: "photo", includeBase64: false }, (response) => {
      if (response.didCancel) return;
      if (response.assets) {
        uploadToCloudinary(response.assets[0]);
      }
    });
  };

  const uploadToCloudinary = async (file: Asset) => {
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
    }
  };

  const updateProfile = async () => {
    try {
      const token = await getToken();
      if (!token) {
        Toast.show({ type: "error", text1: "Not Authenticated" });;
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
        Toast.show({ type: "success", text1: "Profile Updated successfully!" });
        setModalVisible(false);
      } else {
        Toast.show({ type: "error", text1: "Update Failed", text2: result.message });
      }
    } catch (error) {
      Toast.show({ type: "error", text1: "Error while Updating Profile" });
      console.error("Error updating profile:", error);
    }
  };

  const handleLogout = async () => {
    await removeToken();
    await removeData();
    setToken(null);
    navigation.reset({
      index: 0,
      routes: [{ name: "AuctionVehicles" }],
    });
  };

  const handleDeleteProfile = async () => {
    if (!deletePassword) {
      Toast.show({ type: "error", text1: "Password required" });
      return;
    }
    setDeleteLoading(true);
    try {
      // 1. Verify password
      const verifyRes = await fetch(`${backendURL}/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, password: deletePassword }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        Toast.show({ type: "error", text1: "Verification Failed", text2: verifyData.message });
        setDeleteLoading(false);
        return;
      }
      // 2. Delete user
      const token = await getToken();
      const deleteRes = await fetch(`${backendURL}/user`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!deleteRes.ok) {
        const deleteData = await deleteRes.json();
        Toast.show({ type: "error", text1: "Delete Failed", text2: deleteData.message });
        setDeleteLoading(false);
        return;
      }
      await removeToken();
      await removeData();
      setToken(null);
      setDeleteModalVisible(false);
      Toast.show({ type: "success", text1: "Account deleted successfully" });
      navigation.reset({
        index: 0,
        routes: [{ name: "AuctionVehicles" }],
      });
    } catch (error) {
      Toast.show({ type: "error", text1: "Error", text2: "Something went wrong" });
    } finally {
      setDeleteLoading(false);
      setDeletePassword("");
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
      <Text style={styles.socialheading}>Our Social Media</Text>

      <View style={styles.socialCard}>
        <TouchableOpacity style={styles.socialItem} onPress={() => Linking.openURL("https://www.tiktok.com/@albashayeraautoauction?_t=ZS-8u3T6j55U8X&_r=1")}>
          <FontAwesome name="music" size={24} color="#010153" />
          <Text style={styles.socialText}>TikTok</Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color="#888" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialItem} onPress={() => Linking.openURL("facebook.com/share/1DXXBfLc9f/?mibextid=wwXIfr")}>
          <FontAwesome name="facebook" size={24} color="#1877F2" />
          <Text style={styles.socialText}>Facebook</Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color="#888" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialItem} onPress={() => Linking.openURL("https://www.instagram.com/albashayeraautoauction?igsh=ODZjODYwOTJzZmwx&utm_source=qr")}>
          <FontAwesome name="instagram" size={24} color="#C13584" />
          <Text style={styles.socialText}>Instagram</Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color="#888" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialItem} onPress={() => Linking.openURL("mailto:Info@abaautoauctions.com")}>
          <MaterialCommunityIcons name="email" size={24} color="#EA4335" />
          <Text style={styles.socialText}>Email</Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color="#888" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialItem} onPress={() => Linking.openURL("tel:+971 509496511")}>
          <FontAwesome name="phone" size={24} color="#34A853" />
          <Text style={styles.socialText}>Phone</Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color="#888" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialItem} onPress={() => Linking.openURL("https://www.google.com/maps/search/?api=1&query=Al+bashayera+Auto+Auction")}>
          <MaterialCommunityIcons name="map-marker" size={24} color="#FF5722" />
          <Text style={styles.socialText}>Address</Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color="#888" />
        </TouchableOpacity>
      </View>

      {/* Delete Profile Button */}
      <TouchableOpacity
        style={styles.deleteProfileButton}
        onPress={() => setDeleteModalVisible(true)}
      >
        <Text style={styles.deleteProfileText}>Delete My Profile</Text>
      </TouchableOpacity>

      {/* Delete Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalContainer}>
            <Text style={styles.modalTitle}>Confirm Deletion</Text>
            <Text style={{ marginBottom: 10, color: "#333" }}>
              Please enter your password to confirm account deletion.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={deletePassword}
              onChangeText={setDeletePassword}
              editable={!deleteLoading}
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: "#d32f2f" }]}
                onPress={handleDeleteProfile}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveText}>Delete</Text>
                )}
              </TouchableOpacity>
              <Pressable
                style={styles.cancelButton}
                onPress={() => {
                  setDeleteModalVisible(false);
                  setDeletePassword("");
                }}
                disabled={deleteLoading}
              >
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
  socialheading: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 20
  },
  socialCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    width: "100%",
    marginBottom: 70,
    elevation: 5,
  },

  socialItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },

  socialText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
    color: "#333",
    fontWeight: "500",
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

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
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
  deleteProfileButton: {
    backgroundColor: "#d32f2f",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 70,
    alignSelf: "center",
    width: "100%",
  },
  deleteProfileText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 1,
  },
  deleteModalContainer: {
    backgroundColor: "#fff",
    width: "90%",
    padding: 20,
    borderRadius: 15,
    elevation: 10,
    alignItems: "center",
  },
});
