import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useRouter } from "expo-router";
import { getCustomerProfile, updateCustomerProfile } from "../api";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

type ProfileData = {
  id: number;
  customerName: string;
  age: number;
  phoneNumber: string;
  email: string;
  username: string;
  createdAt: string;
};

const ProfileScreen = () => {
  const [profile, setProfile] = useState<ProfileData>({
    id: 0,
    customerName: "",
    age: 0,
    phoneNumber: "",
    email: "",
    username: "",
    createdAt: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isAgeFocused, setIsAgeFocused] = useState(false);
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getCustomerProfile();
        console.log("Dữ liệu hồ sơ:", data);
        setProfile(data);
      } catch (error: any) {
        console.error("Lỗi tải hồ sơ:", error.response?.data);
        alert(`Lỗi: ${error.response?.data || "Không thể tải hồ sơ"}`);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    try {
      const updatedFields = {
        name: profile.customerName,
        phone: profile.phoneNumber,
        age: profile.age,
      };
      console.log("Gửi dữ liệu cập nhật:", updatedFields);
      const response = await updateCustomerProfile(updatedFields);
      console.log("Phản hồi từ updateCustomerProfile:", response);
      // Cập nhật trạng thái với dữ liệu từ server
      if (typeof response === "object") {
        setProfile({
          id: response.id || profile.id,
          customerName: response.customerName || profile.customerName,
          age: response.age || profile.age,
          phoneNumber: response.phoneNumber || profile.phoneNumber,
          email: response.email || profile.email,
          username: response.username || profile.username,
          createdAt: response.createdAt || profile.createdAt,
        });
      }
      setIsEditing(false);
      alert("Cập nhật hồ sơ thành công");
    } catch (error: any) {
      console.error("Lỗi cập nhật hồ sơ:", error.response?.data);
      alert(`Lỗi: ${error.response?.data || "Cập nhật hồ sơ thất bại"}`);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
    setIsNameFocused(false);
    setIsAgeFocused(false);
    setIsPhoneFocused(false);
  };

  // Hàm định dạng ngày
  const formatDate = (isoString: string) => {
    if (!isoString) return "Chưa cập nhật";
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  return (
    <LinearGradient colors={["#e0f7fa", "#b2ebf2"]} style={styles.container}>
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Pressable style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </Pressable>

          <View style={styles.avatarContainer}>
            <Ionicons
              name="person-circle-outline"
              size={120}
              color={"#1877af"}
              style={styles.avatar}
            />
            <Text style={styles.title}>Hồ sơ của bạn</Text>
          </View>

          <View style={styles.card}>
            {isEditing ? (
              <>
                <Text style={styles.label}>Họ tên</Text>
                <TextInput
                  style={[styles.input, isNameFocused && styles.inputFocused]}
                  value={profile.customerName}
                  onChangeText={(text) =>
                    setProfile({ ...profile, customerName: text })
                  }
                  placeholder="Họ tên"
                  onFocus={() => setIsNameFocused(true)}
                  onBlur={() => setIsNameFocused(false)}
                />

                <Text style={[styles.label, { marginTop: 20 }]}>Tuổi</Text>
                <TextInput
                  style={[styles.input, isAgeFocused && styles.inputFocused]}
                  value={profile.age.toString()}
                  onChangeText={(text) =>
                    setProfile({ ...profile, age: parseInt(text) || 0 })
                  }
                  placeholder="Tuổi"
                  keyboardType="numeric"
                  onFocus={() => setIsAgeFocused(true)}
                  onBlur={() => setIsAgeFocused(false)}
                />

                <Text style={[styles.label, { marginTop: 20 }]}>
                  Số điện thoại
                </Text>
                <TextInput
                  style={[styles.input, isPhoneFocused && styles.inputFocused]}
                  value={profile.phoneNumber}
                  onChangeText={(text) =>
                    setProfile({ ...profile, phoneNumber: text })
                  }
                  placeholder="Số điện thoại"
                  keyboardType="phone-pad"
                  onFocus={() => setIsPhoneFocused(true)}
                  onBlur={() => setIsPhoneFocused(false)}
                />

                <View style={styles.buttonContainer}>
                  <Pressable
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => setIsEditing(false)}
                  >
                    <Text style={styles.buttonText}>Hủy</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.button, styles.saveButton]}
                    onPress={handleUpdate}
                  >
                    <Text style={styles.buttonText}>Lưu</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <View style={styles.infoRow}>
                  <View style={styles.infoLabelContainer}>
                    <Ionicons
                      name="dice-outline"
                      size={20}
                      color="#555"
                      style={styles.icon}
                    />
                    <Text style={styles.infoLabel}>ID:</Text>
                  </View>
                  <Text style={styles.infoValue}>
                    {profile.id || "Chưa cập nhật"}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <View style={styles.infoLabelContainer}>
                    <Ionicons
                      name="person"
                      size={20}
                      color="#555"
                      style={styles.icon}
                    />
                    <Text style={styles.infoLabel}>Họ tên:</Text>
                  </View>
                  <Text style={styles.infoValue}>
                    {profile.customerName || "Chưa cập nhật"}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <View style={styles.infoLabelContainer}>
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color="#555"
                      style={styles.icon}
                    />
                    <Text style={styles.infoLabel}>Tuổi:</Text>
                  </View>
                  <Text style={styles.infoValue}>
                    {profile.age || "Chưa cập nhật"}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <View style={styles.infoLabelContainer}>
                    <Ionicons
                      name="call-outline"
                      size={20}
                      color="#555"
                      style={styles.icon}
                    />
                    <Text style={styles.infoLabel}>Số điện thoại:</Text>
                  </View>
                  <Text style={styles.infoValue}>
                    {profile.phoneNumber || "Chưa cập nhật"}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <View style={styles.infoLabelContainer}>
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color="#555"
                      style={styles.icon}
                    />
                    <Text style={styles.infoLabel}>Email:</Text>
                  </View>
                  <Text style={styles.infoValue}>
                    {profile.email || "Chưa cập nhật"}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <View style={styles.infoLabelContainer}>
                    <Ionicons
                      name="person-outline"
                      size={20}
                      color="#555"
                      style={styles.icon}
                    />
                    <Text style={styles.infoLabel}>Tên đăng nhập:</Text>
                  </View>
                  <Text style={styles.infoValue}>
                    {profile.username || "Chưa cập nhật"}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <View style={styles.infoLabelContainer}>
                    <Ionicons
                      name="time-outline"
                      size={20}
                      color="#555"
                      style={styles.icon}
                    />
                    <Text style={styles.infoLabel}>Ngày tạo:</Text>
                  </View>
                  <Text style={styles.infoValue}>
                    {formatDate(profile.createdAt)}
                  </Text>
                </View>

                <View style={styles.buttonContainer}>
                  <Pressable
                    style={[styles.button, styles.editButton]}
                    onPress={() => setIsEditing(true)}
                  >
                    <Text style={styles.buttonText}>Chỉnh sửa</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.button, styles.changePasswordButton]}
                    onPress={() => router.push("/change-password")}
                  >
                    <Text style={styles.buttonText}>Đổi mật khẩu</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 30,
  },
  backButton: {
    position: "absolute",
    top: 65,
    left: 20,
    zIndex: 1,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 7,
    elevation: 3,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    borderRadius: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1877af",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 25,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    width: "90%",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    alignItems: "center",
  },
  infoLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
    marginLeft: 8,
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
    flex: 1,
    textAlign: "right",
  },
  icon: {
    marginRight: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#f9f9f9",
  },
  inputFocused: {
    borderColor: "#00bcd4",
    backgroundColor: "#fff",
  },
  buttonContainer: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },
  editButton: {
    backgroundColor: "#00bcd4",
  },
  changePasswordButton: {
    backgroundColor: "#ff6f61",
  },
  saveButton: {
    backgroundColor: "#b12323",
  },
  cancelButton: {
    backgroundColor: "#a8abb0",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ProfileScreen;
