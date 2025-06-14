import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Keyboard,
  TouchableOpacity,
  Pressable,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { changePasswordCustomer } from "../api";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-toast-message"; // Thêm import Toast

const ChangePasswordScreen = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isOldPasswordFocused, setIsOldPasswordFocused] = useState(false);
  const [isNewPasswordFocused, setIsNewPasswordFocused] = useState(false);
  const [oldPasswordError, setOldPasswordError] = useState<string | null>(null);
  const [newPasswordError, setNewPasswordError] = useState<string | null>(null);
  const [changePasswordError, setChangePasswordError] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChangePassword = async () => {
    // Reset các lỗi trước khi kiểm tra
    setOldPasswordError(null);
    setNewPasswordError(null);
    setChangePasswordError(null);

    // Kiểm tra ô input trống
    let hasError = false;
    if (!oldPassword.trim()) {
      setOldPasswordError("Vui lòng nhập mật khẩu cũ");
      hasError = true;
    }
    if (!newPassword.trim()) {
      setNewPasswordError("Vui lòng nhập mật khẩu mới");
      hasError = true;
    }

    if (hasError) return;

    // Kiểm tra độ dài mật khẩu mới
    if (newPassword.length < 8) {
      setNewPasswordError("Mật khẩu mới phải có ít nhất 8 ký tự");
      return;
    }

    // Gọi API thay đổi mật khẩu
    try {
      setIsLoading(true); // Bắt đầu loading
      await changePasswordCustomer({ oldPassword, newPassword });
      // Hiển thị toast trước khi chuyển trang
      Alert.alert("Thành công", "Thay đổi mật khẩu thành công.", [
        {
          text: "OK",
          onPress: () => {
            router.push("/tickets");
            setIsLoading(false);
          },
        },
      ]);
      // Toast.show({
      //   type: "success",
      //   text1: "Thành công",
      //   text2: "Thay đổi mật khẩu thành công",
      //   position: "top",
      //   visibilityTime: 2000,
      // });
      // Chuyển trang sau khi toast hiển thị
      setTimeout(() => {
        router.push("/tickets");
        setIsLoading(false); // Chỉ đặt isLoading về false sau khi chuyển trang
      }, 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data || "Thay đổi mật khẩu thất bại";
      if (errorMessage.toLowerCase().includes("incorrect old password")) {
        setChangePasswordError("Mật khẩu cũ không đúng");
      } else {
        setChangePasswordError(errorMessage);
      }
      setIsLoading(false); // Đặt isLoading về false nếu có lỗi
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
    setIsOldPasswordFocused(false);
    setIsNewPasswordFocused(false);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <LinearGradient colors={["#f5e7ff", "#dcfce7"]} style={styles.container}>
      <Pressable style={styles.backIcon} onPress={handleBack}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </Pressable>
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Thay đổi mật khẩu</Text>
          <Text style={styles.subtitle}>
            Nhập mật khẩu cũ và mật khẩu mới để cập nhật mật khẩu của bạn.
          </Text>

          {/* Trường Mật khẩu cũ */}
          <Text style={styles.label}>Mật khẩu cũ</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                { paddingRight: 40 },
                isOldPasswordFocused && styles.inputFocused,
              ]}
              placeholder="Mật khẩu cũ"
              placeholderTextColor="#B2B2B2" // Match border color
              value={oldPassword}
              onChangeText={(text) => {
                setOldPassword(text);
                if (text.trim()) setOldPasswordError(null);
              }}
              secureTextEntry={!showOldPassword}
              onFocus={() => setIsOldPasswordFocused(true)}
              onBlur={() => setIsOldPasswordFocused(false)}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowOldPassword(!showOldPassword)}
            >
              <Ionicons
                name={showOldPassword ? "eye-off" : "eye"}
                size={20}
                color="#999"
              />
            </TouchableOpacity>
          </View>
          <View style={styles.errorContainer}>
            {oldPasswordError && (
              <Text style={styles.errorText}>{oldPasswordError}</Text>
            )}
            {changePasswordError && (
              <Text style={styles.changePasswordErrorText}>
                {changePasswordError}
              </Text>
            )}
          </View>

          {/* Trường Mật khẩu mới */}
          <Text style={[styles.label, { marginTop: 10 }]}>Mật khẩu mới</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                { paddingRight: 40 },
                isNewPasswordFocused && styles.inputFocused,
              ]}
              placeholder="Mật khẩu mới"
              placeholderTextColor="#B2B2B2" // Match border color
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                if (text.trim()) setNewPasswordError(null);
              }}
              secureTextEntry={!showNewPassword}
              onFocus={() => setIsNewPasswordFocused(true)}
              onBlur={() => setIsNewPasswordFocused(false)}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowNewPassword(!showNewPassword)}
            >
              <Ionicons
                name={showNewPassword ? "eye-off" : "eye"}
                size={20}
                color="#999"
              />
            </TouchableOpacity>
          </View>
          <View style={styles.errorContainer}>
            {newPasswordError && (
              <Text style={styles.errorText}>{newPasswordError}</Text>
            )}
          </View>

          <View style={styles.serverErrorContainer}></View>

          {/* Nút Thay đổi mật khẩu */}
          <Pressable
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleChangePassword}
            disabled={isLoading}
          >
            <View style={styles.buttonContent}>
              {isLoading && (
                <ActivityIndicator
                  size="small"
                  color="#fff"
                  style={styles.loader}
                />
              )}
              <Text style={styles.buttonText}>Thay đổi mật khẩu</Text>
            </View>
          </Pressable>

          {/* Nút Quay lại */}
          <Pressable
            style={[styles.button, styles.backButton]}
            onPress={() => router.back()}
          >
            <Text style={styles.buttonText}>Quay lại</Text>
          </Pressable>
        </View>
      </TouchableWithoutFeedback>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    width: "100%",
    alignItems: "center",
  },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  backIcon: {
    position: "absolute",
    top: 65,
    left: 20,
    zIndex: 1,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 7,
    elevation: 3,
  },
  title: {
    fontSize: 26,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginBottom: 15,
    lineHeight: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 5,
  },
  inputContainer: {
    position: "relative",
    marginBottom: 0,
  },
  input: {
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#B2B2B2",
    color: "#000",
    borderRadius: 30,
    padding: 12,
    fontSize: 14,
  },
  inputFocused: {
    borderColor: "#1677ff",
  },
  eyeIcon: {
    position: "absolute",
    right: 15,
    top: "50%",
    transform: [{ translateY: -10 }],
  },
  errorContainer: {
    height: 20,
    justifyContent: "center",
  },
  errorText: {
    color: "#ff4444",
    fontSize: 12,
    marginLeft: 10,
  },
  serverErrorContainer: {
    height: 20,
    justifyContent: "center",
  },
  changePasswordErrorText: {
    color: "#ff4444",
    fontSize: 14,
    textAlign: "left",
  },
  button: {
    backgroundColor: "#000",
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#666",
  },
  backButton: {
    marginTop: 15,
    backgroundColor: "#888",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loader: {
    marginRight: 8,
  },
});

export default ChangePasswordScreen;
