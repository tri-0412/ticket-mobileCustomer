import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "http://192.168.1.113:8080";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const loginCustomer = async (request: {
  username: string;
  password: string;
}) => {
  const response = await api.post("/auth/user-login", request);
  const { token } = response.data;
  await AsyncStorage.setItem("token", token);
  return response.data;
};

export const changePasswordCustomer = async (request: {
  oldPassword: string;
  newPassword: string;
}) => {
  const response = await api.post("/auth/user-change-password", request);
  return response.data;
};

export const forgotPasswordCustomer = async (input: string) => {
  const response = await api.post("/auth/user-forgot-password", {
    emailOrUsername: input,
  });
  return response.data;
};

export const verifyOtpCustomer = async (request: {
  emailOrUsername: string;
  otp: string;
}) => {
  const response = await api.post("/auth/user-verify-otp", request);
  return response.data;
};

export const resetPasswordCustomer = async (request: {
  emailOrUsername: string;
  newPassword: string;
}) => {
  const response = await api.post("/auth/user-reset-password", request);
  return response.data;
};

export const getCustomerProfile = async () => {
  const response = await api.get("/auth/user-profile");
  return response.data;
};

export const updateCustomerProfile = async (request: {
  name: string;
  phone: string;
}) => {
  const response = await api.put("/auth/user-profile", request);
  return response.data;
};

// API lấy danh sách vé của khách hàng
export const getMyTickets = async (authToken: string) => {
  const response = await api.get("/tickets/my-tickets");
  return response.data;
};

// API lấy lịch sử check-in của khách hàng
export const getCheckInLogs = async (authToken: string) => {
  const response = await api.get("/checkin/logs/customer");
  return response.data;
};
