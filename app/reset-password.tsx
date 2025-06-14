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
import { useRouter, useLocalSearchParams } from "expo-router";
import { resetPasswordCustomer } from "../api";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-toast-message";

const ResetPasswordScreen = () => {
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [resetPasswordError, setResetPasswordError] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false); // New loading state
  const router = useRouter();
  const { email, otp } = useLocalSearchParams<{ email: string; otp: string }>();

  const handleResetPassword = async () => {
    // Dismiss keyboard
    Keyboard.dismiss();

    // Reset errors before validation
    setPasswordError(null);
    setResetPasswordError(null);

    // Check for empty password
    if (!newPassword.trim()) {
      setPasswordError("Vui lòng nhập mật khẩu mới");
      return;
    }

    // Call API to reset password
    try {
      setIsLoading(true); // Start loading
      await resetPasswordCustomer({ emailOrUsername: email!, newPassword });
      // Show toast notification before navigation
      console.log("Showing toast"); // Debug log
      Alert.alert("Thành công", "Đặt lại mật khẩu thành công.", [
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
      //   text2: "Đặt lại mật khẩu thành công",
      //   position: "top",
      //   visibilityTime: 2000,
      // });
      // Navigate after toast
      setTimeout(() => {
        router.push("/login");
      }, 2000); // Delay navigation to allow toast to be visible
    } catch (error: any) {
      const errorMessage = error.response?.data || "Đặt lại mật khẩu thất bại";
      setResetPasswordError(errorMessage);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };
  const handleBack = () => {
    router.back();
  };
  const dismissKeyboard = () => {
    Keyboard.dismiss();
    setIsPasswordFocused(false);
  };

  return (
    <LinearGradient colors={["#f5e7ff", "#dcfce7"]} style={styles.container}>
      <Pressable style={styles.backIcon} onPress={handleBack}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </Pressable>
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Đặt lại mật khẩu</Text>
          <Text style={styles.subtitle}>
            Nhập mật khẩu mới để tiếp tục sử dụng tài khoản của bạn.
          </Text>

          {/* Trường Mật khẩu mới */}
          <Text style={styles.label}>Mật khẩu mới</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                { paddingRight: 40 },
                isPasswordFocused && styles.inputFocused,
              ]}
              placeholder="Mật khẩu mới"
              placeholderTextColor="#B2B2B2" // Match border color
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                if (text.trim()) setPasswordError(null); // Xóa lỗi khi người dùng nhập
              }}
              secureTextEntry={!showPassword}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color="#999"
              />
            </TouchableOpacity>
          </View>
          {/* Không gian cố định cho thông báo lỗi dưới ô input */}
          <View style={styles.errorContainer}>
            {passwordError && (
              <Text style={styles.errorText}>{passwordError}</Text>
            )}
            {resetPasswordError && (
              <Text style={styles.resetPasswordErrorText}>
                {resetPasswordError}
              </Text>
            )}
          </View>

          {/* Không gian cố định cho thông báo lỗi từ server */}
          <View style={styles.serverErrorContainer}></View>

          {/* Nút Đặt lại mật khẩu */}
          <Pressable
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleResetPassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Đặt lại mật khẩu</Text>
            )}
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
  backIcon: {
    position: "absolute",
    top: 75,
    left: 20,
    zIndex: 1,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 7,
    elevation: 3,
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
    marginBottom: 25,
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
    marginBottom: 0, // Không cần marginBottom vì đã có errorContainer
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
    marginTop: 8, // Khoảng cách giữa ô input và thông báo lỗi
    height: 20, // Chiều cao cố định cho thông báo lỗi dưới ô input
    justifyContent: "center",
  },
  errorText: {
    color: "#ff4444",
    fontSize: 12,
    marginLeft: 10,
  },
  serverErrorContainer: {
    height: 20, // Chiều cao cố định cho thông báo lỗi từ server
    justifyContent: "center",
  },
  resetPasswordErrorText: {
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
    backgroundColor: "#666", // Grayed out when disabled
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
});

export default ResetPasswordScreen;
