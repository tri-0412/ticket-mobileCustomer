import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Keyboard,
  Pressable,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { verifyOtpCustomer } from "../api";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

const VerifyOtpScreen = () => {
  const [otp, setOtp] = useState("");
  const [isOtpFocused, setIsOtpFocused] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [verifyOtpError, setVerifyOtpError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Thêm trạng thái loading
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();

  const handleVerifyOtp = async () => {
    // Reset errors trước khi validate
    setOtpError(null);
    setVerifyOtpError(null);

    // Kiểm tra OTP rỗng
    if (!otp.trim()) {
      setOtpError("Vui lòng nhập mã OTP");
      return;
    }

    // Kiểm tra định dạng OTP
    const otpRegex = /^\d{6}$/;
    if (!otpRegex.test(otp)) {
      setOtpError("Mã OTP phải gồm 6 số");
      return;
    }

    // Gọi API để xác minh OTP
    try {
      setIsLoading(true); // Bắt đầu loading
      await verifyOtpCustomer({ emailOrUsername: email!, otp });
      // Hiển thị toast trước khi chuyển trang
      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: "Xác minh OTP thành công",
        position: "top",
        visibilityTime: 2000,
      });
      // Chuyển trang sau khi toast hiển thị
      setTimeout(() => {
        router.push({ pathname: "/reset-password", params: { email, otp } });
        setIsLoading(false); // Đặt isLoading về false nếu có lỗi
      }, 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data || "Xác minh OTP thất bại";
      setVerifyOtpError(errorMessage);
      setIsLoading(false); // Đặt isLoading về false nếu có lỗi
    }
  };

  const handleBack = () => {
    router.back();
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
    setIsOtpFocused(false);
  };

  return (
    <LinearGradient colors={["#f5e7ff", "#dcfce7"]} style={styles.container}>
      <Pressable style={styles.backIcon} onPress={handleBack}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </Pressable>
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Xác minh OTP</Text>
          <Text style={styles.subtitle}>
            Nhập mã OTP đã được gửi đến email của bạn để tiếp tục.
          </Text>

          {/* Trường OTP */}
          <Text style={styles.label}>Mã OTP</Text>
          <TextInput
            style={[styles.input, isOtpFocused && styles.inputFocused]}
            placeholder="Mã OTP"
            placeholderTextColor="#B2B2B2"
            value={otp}
            onChangeText={(text) => {
              const numericText = text.replace(/[^0-9]/g, "");
              setOtp(numericText);
              if (numericText.trim()) setOtpError(null);
            }}
            keyboardType="numeric"
            maxLength={6}
            onFocus={() => setIsOtpFocused(true)}
            onBlur={() => setIsOtpFocused(false)}
          />
          <View style={styles.errorContainer}>
            {otpError && <Text style={styles.errorText}>{otpError}</Text>}
            {verifyOtpError && (
              <Text style={styles.verifyOtpErrorText}>{verifyOtpError}</Text>
            )}
          </View>
          <View style={styles.serverErrorContainer}></View>

          {/* Nút Xác minh OTP */}
          <Pressable
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleVerifyOtp}
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
              <Text style={styles.buttonText}>Xác minh OTP</Text>
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
    top: 75,
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
    marginBottom: 25,
    lineHeight: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 5,
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
  verifyOtpErrorText: {
    color: "#ff4444",
    fontSize: 14,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#000",
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#666", // Màu nhạt hơn khi disable
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
    flexDirection: "row", // Sắp xếp ActivityIndicator và Text theo hàng ngang
    alignItems: "center",
    justifyContent: "center",
  },
  loader: {
    marginRight: 8, // Khoảng cách giữa ActivityIndicator và Text
  },
});

export default VerifyOtpScreen;
