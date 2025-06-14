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
import { useRouter } from "expo-router";
import { forgotPasswordCustomer } from "../api";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message"; // Add this import

const ForgotPasswordScreen = () => {
  const [input, setInput] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);
  const [forgotPasswordError, setForgotPasswordError] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false); // New loading state
  const router = useRouter();

  const handleForgotPassword = async () => {
    // Dismiss keyboard
    Keyboard.dismiss();

    // Reset errors before validation
    setInputError(null);
    setForgotPasswordError(null);

    // Check for empty input
    if (!input.trim()) {
      setInputError("Vui lòng nhập email hoặc tên đăng nhập");
      return;
    }

    const request = {
      emailOrUsername: input,
    };
    console.log("Input:", input);
    console.log("Request gửi lên backend:", request);

    try {
      setIsLoading(true); // Start loading
      await forgotPasswordCustomer(input);
      // Show toast notification before navigation
      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: "Gửi OTP thành công đến email của bạn",
        position: "top",
        visibilityTime: 2000,
      });
      // Navigate after toast
      setTimeout(() => {
        router.push({ pathname: "/verify-otp", params: { email: input } });
        setIsLoading(false); // Stop loading
      }, 1000); // Delay navigation to allow toast to be visible
    } catch (error: any) {
      const errorMessage = error.response?.data || "Gửi OTP thất bại";
      setIsLoading(false); // Stop loading
      if (
        errorMessage ===
        "Customer not found with the provided email or username"
      ) {
        setForgotPasswordError("Không tìm thấy tài khoản này");
      } else {
        setForgotPasswordError(errorMessage);
      }
    }
  };
  const handleBack = () => {
    router.back();
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
    setIsInputFocused(false);
  };

  return (
    <LinearGradient colors={["#f5e7ff", "#dcfce7"]} style={styles.container}>
      <Pressable style={styles.backIcon} onPress={handleBack}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </Pressable>
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Quên mật khẩu</Text>
          <Text style={styles.subtitle}>
            Nhập email hoặc tên đăng nhập để nhận mã OTP và đặt lại mật khẩu.
          </Text>

          {/* Email or Username Field */}
          <Text style={styles.label}>Email hoặc Tên đăng nhập</Text>
          <TextInput
            style={[styles.input, isInputFocused && styles.inputFocused]}
            placeholder="Email hoặc Tên đăng nhập"
            placeholderTextColor="#B2B2B2" // Match border color
            value={input}
            onChangeText={(text) => {
              setInput(text);
              if (text.trim()) setInputError(null); // Clear error on input
            }}
            keyboardType="default"
            autoCapitalize="none"
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
          />
          {/* Fixed space for input error */}
          <View style={styles.errorContainer}>
            {inputError && <Text style={styles.errorText}>{inputError}</Text>}
            {forgotPasswordError && (
              <Text style={styles.forgotPasswordErrorText}>
                {forgotPasswordError}
              </Text>
            )}
          </View>

          {/* Fixed space for server error */}
          <View style={styles.serverErrorContainer}></View>

          {/* Gửi OTP Button */}
          <Pressable
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleForgotPassword}
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
              <Text style={styles.buttonText}>Gửi OTP</Text>
            </View>
          </Pressable>

          {/* Back Button */}
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
    marginTop: 8,
    height: 20, // Fixed height for error message below input
    justifyContent: "center",
  },
  errorText: {
    color: "#ff4444",
    fontSize: 12,
    marginLeft: 10,
  },
  serverErrorContainer: {
    height: 20, // Fixed height for server error message
    justifyContent: "center",
  },
  forgotPasswordErrorText: {
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
    backgroundColor: "#666", // Grayed out when disabled
  },
  buttonContent: {
    flexDirection: "row", // Để ActivityIndicator và Text nằm ngang
    alignItems: "center",
    justifyContent: "center",
  },
  loader: {
    marginRight: 8, // Khoảng cách giữa ActivityIndicator và Text
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

export default ForgotPasswordScreen;
