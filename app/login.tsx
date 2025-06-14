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
} from "react-native";
import { useRouter } from "expo-router";
import { loginCustomer } from "../api";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";

const LoginScreen = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isUsernameFocused, setIsUsernameFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Thêm trạng thái loading
  const router = useRouter();

  const handleLogin = async () => {
    setUsernameError(null);
    setPasswordError(null);
    setLoginError(null);

    let hasError = false;
    if (!username.trim()) {
      setUsernameError("Vui lòng nhập tên đăng nhập");
      hasError = true;
    }
    if (!password.trim()) {
      setPasswordError("Vui lòng nhập mật khẩu");
      hasError = true;
    }

    if (hasError) return;

    setIsLoading(true);
    try {
      await loginCustomer({ username, password });
      router.push("/home");
    } catch (error: any) {
      const errorMessage = error.response?.data?.message?.toLowerCase() || "";
      if (
        errorMessage.includes("user not found") ||
        error.response?.status === 404
      ) {
        setLoginError("Tài khoản không tồn tại");
      } else if (
        errorMessage.includes("invalid credentials") ||
        errorMessage.includes("invalid password") ||
        error.response?.status === 401
      ) {
        setLoginError("Tên đăng nhập hoặc mật khẩu không chính xác");
      } else if (errorMessage.includes("user already exists")) {
        setLoginError("Tài khoản đã tồn tại");
      } else {
        setLoginError("Đã xảy ra lỗi. Vui lòng thử lại.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
    setIsUsernameFocused(false);
    setIsPasswordFocused(false);
  };

  return (
    <LinearGradient colors={["#f5e7ff", "#dcfce7"]} style={styles.container}>
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Đăng nhập</Text>
          <Text style={styles.subtitle}>
            Đăng nhập để cập nhật tất cả các nội dung và phương thức của bạn.
          </Text>

          {/* Trường Username */}
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={[styles.input, isUsernameFocused && styles.inputFocused]}
            placeholder="Tên đăng nhập"
            placeholderTextColor="#B2B2B2"
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              if (text.trim()) setUsernameError(null);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            onFocus={() => setIsUsernameFocused(true)}
            onBlur={() => setIsUsernameFocused(false)}
          />
          <View style={styles.errorContainer}>
            {usernameError && (
              <Text style={styles.errorText}>{usernameError}</Text>
            )}
          </View>

          {/* Trường Mật khẩu */}
          <Text style={[styles.label, { marginTop: 10 }]}>Mật khẩu</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                { paddingRight: 40 },
                isPasswordFocused && styles.inputFocused,
              ]}
              placeholder="Mật khẩu"
              placeholderTextColor="#B2B2B2"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (text.trim()) setPasswordError(null);
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
          <View style={styles.errorContainer}>
            {passwordError && (
              <Text style={styles.errorText}>{passwordError}</Text>
            )}
            {loginError && (
              <Text style={styles.loginErrorText}>{loginError}</Text>
            )}
          </View>

          <View style={styles.serverErrorContainer}></View>

          {/* Nút Đăng nhập */}
          <Pressable
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={styles.buttonContent}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={[styles.buttonText, { marginLeft: 8 }]}>
                  Đang đăng nhập...
                </Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>Đăng nhập</Text>
            )}
          </Pressable>
          {/* Quên mật khẩu */}
          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => router.push("/forgot-password")}
          >
            <Text style={styles.forgotPasswordText}>Quên mật khẩu ư?</Text>
          </TouchableOpacity>
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
    width: "90%",
    maxWidth: 400,
    maxHeight: 600,
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
  forgotPassword: {
    alignSelf: "center",
    marginTop: 20,
  },
  forgotPasswordText: {
    color: "#1677ff",
    fontSize: 15,
    fontWeight: "500",
    textDecorationLine: "underline",
  },
  errorContainer: {
    marginTop: 5,
    height: 20,
    justifyContent: "center",
  },
  errorText: {
    color: "#ff4444",
    fontSize: 12,
    marginLeft: 10,
  },
  serverErrorContainer: {
    height: 10,
    justifyContent: "center",
  },
  loginErrorText: {
    color: "#ff4444",
    fontSize: 14,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#000",
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  buttonDisabled: {
    backgroundColor: "#666",
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default LoginScreen;
