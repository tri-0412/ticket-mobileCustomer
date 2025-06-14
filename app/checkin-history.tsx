import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { debounce } from "lodash";

interface CheckInLog {
  id?: number;
  userId?: number;
  userName?: string;
  eventName?: string;
  ticketCode: string;
  ticketType: string;
  customerName?: string;
  status: string;
  checkInTime: string;
}

const CheckInHistoryScreen = () => {
  const [checkInLogs, setCheckInLogs] = useState<CheckInLog[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
  const router = useRouter();

  const handleSearch = debounce((text: string) => {
    setDebouncedSearchQuery(text);
  }, 300);

  useEffect(() => {
    const loadTokenAndData = async () => {
      const storedToken = await AsyncStorage.getItem("token");
      setToken(storedToken);
      if (storedToken) {
        setIsLoading(true);
        try {
          const checkInData = await fetchCheckInHistory(storedToken);
          setCheckInLogs(checkInData);
        } catch (error: any) {
          console.error("Error in loadTokenAndData:", error);
          if (error.response?.status === 401) {
            await AsyncStorage.removeItem("token");
            setToken(null);
            router.replace("/login");
          } else {
            alert(error.message || "Không thể tải lịch sử check-in");
          }
        } finally {
          setIsLoading(false);
        }
      } else {
        router.push("/login");
      }
    };
    loadTokenAndData();
  }, []);

  const fetchCheckInHistory = async (
    authToken: string
  ): Promise<CheckInLog[]> => {
    try {
      const response = await fetch(
        "http://192.168.1.113:8080/checkin/logs/customer",
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch check-in history");
      const data = await response.json();
      return data.map((log: any) => ({
        id: log.id,
        userId: log.userId,
        eventName: log.eventName,
        userName: log.userName,
        ticketCode: log.ticketCode,
        ticketType: log.ticketType,
        customerName: log.customerName,
        status: log.status,
        checkInTime: log.checkinTime,
      }));
    } catch (error: any) {
      console.error("Error in fetchCheckInHistory:", error);
      throw new Error(error.message || "Không thể tải lịch sử check-in");
    }
  };

  const onRefresh = async () => {
    if (!token) return;
    setRefreshing(true);
    try {
      const checkInData = await fetchCheckInHistory(token);
      setCheckInLogs(checkInData);
    } catch (error: any) {
      console.error("Error in onRefresh:", error);
      alert(error.message || "Không thể làm mới dữ liệu");
    } finally {
      setRefreshing(false);
    }
  };

  const handleProfile = () => {
    setShowMenu(false);
    router.push("/profile");
  };

  const handleChangePassword = () => {
    setShowMenu(false);
    router.push("/change-password");
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    setToken(null);
    setShowMenu(false);
    router.replace("/login");
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const dataToDisplay = useMemo(() => {
    return checkInLogs.filter((log) =>
      log.ticketCode?.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    );
  }, [checkInLogs, debouncedSearchQuery]);

  const CheckInLogItem = React.memo(({ item }: { item: CheckInLog }) => (
    <View style={styles.logCard}>
      <View style={styles.logInfo}>
        <Text style={styles.logTitle}>🎟️ Mã vé: {item.ticketCode}</Text>
        <View style={styles.logDetail}>
          <Ionicons name="calendar-outline" size={14} color="#222" />
          <Text style={styles.logDetailText}>
            Sự kiện: {item.eventName || "Không xác định"}
          </Text>
        </View>
        <View style={styles.logDetail}>
          <Ionicons name="person-outline" size={14} color="#222" />
          <Text style={styles.logDetailText}>
            Khách hàng: {item.customerName || "Không xác định"} | Loại vé:{" "}
            {item.ticketType || "Không xác định"}
          </Text>
        </View>
        <View style={styles.logDetail}>
          <Ionicons
            name="checkmark-circle-outline"
            size={14}
            color={item.status === "used" ? "#2ecc71" : "#e74c3c"}
          />
          <Text
            style={[
              styles.logDetailText,
              {
                fontWeight: "600",
                color: item.status === "used" ? "#2ecc71" : "#e74c3c",
              },
            ]}
          >
            Trạng thái: {item.status === "used" ? "Thành công" : "Thất bại"}
          </Text>
        </View>
        <View style={styles.logDetail}>
          <Ionicons name="time-outline" size={14} color="#222" />
          <Text style={styles.logDetailText}>
            Thời gian: {formatDateTime(item.checkInTime)}
          </Text>
        </View>
        <View style={styles.logDetail}>
          <Ionicons name="person-circle-outline" size={16} color="#222" />
          <Text style={styles.logDetailText}>
            Nhân viên: {item.userName || "Không xác định"}
          </Text>
        </View>
      </View>
    </View>
  ));

  const handleBack = () => {
    router.back();
  };

  return (
    <LinearGradient colors={["#f5e7ff", "#dcfce7"]} style={styles.container}>
      <Pressable style={styles.backIcon} onPress={handleBack}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </Pressable>
      <Pressable style={styles.menuButton} onPress={() => setShowMenu(true)}>
        <Ionicons name="menu" size={24} color="#000" />
      </Pressable>

      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowMenu(false)}
        >
          <LinearGradient
            colors={["#ffffff", "#f5f5f5"]}
            style={styles.menuContainer}
          >
            <Pressable
              style={({ pressed }) => [
                styles.menuItem,
                { backgroundColor: pressed ? "#e0e0e0" : "transparent" },
              ]}
              onPress={handleProfile}
            >
              <Ionicons
                name="person-outline"
                size={20}
                color="#222"
                style={styles.menuIcon}
              />
              <Text style={styles.menuText}>Profile</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.menuItem,
                { backgroundColor: pressed ? "#e0e0e0" : "transparent" },
              ]}
              onPress={handleChangePassword}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#222"
                style={styles.menuIcon}
              />
              <Text style={styles.menuText}>Đổi mật khẩu</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.menuItem,
                { backgroundColor: pressed ? "#e0e0e0" : "transparent" },
              ]}
              onPress={handleLogout}
            >
              <Ionicons
                name="log-out-outline"
                size={20}
                color="#e74c3c"
                style={styles.menuIcon}
              />
              <Text style={[styles.menuText, { color: "#e74c3c" }]}>
                Đăng xuất
              </Text>
            </Pressable>
          </LinearGradient>
        </Pressable>
      </Modal>

      <Text style={styles.title}>Lịch sử check-in</Text>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#888"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm mã vé..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              handleSearch(text);
            }}
          />
        </View>
      </TouchableWithoutFeedback>

      {isLoading ? (
        <ActivityIndicator
          size="large"
          color="#007bff"
          style={{ marginTop: 20 }}
        />
      ) : dataToDisplay.length === 0 ? (
        <Text style={styles.noTickets}>Không có lịch sử check-in.</Text>
      ) : (
        <FlatList
          data={dataToDisplay}
          keyExtractor={(item) =>
            item.id?.toString() || `log_${item.ticketCode}_${item.checkInTime}`
          }
          renderItem={({ item }) => <CheckInLogItem item={item} />}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          removeClippedSubviews={false}
          initialNumToRender={20}
          maxToRenderPerBatch={20}
          windowSize={5}
        />
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    padding: 20,
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
  menuButton: {
    position: "absolute",
    top: 55,
    right: 20,
    zIndex: 1,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 5,
    elevation: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 92,
    paddingRight: 15,
  },
  menuContainer: {
    borderRadius: 10,
    padding: 15,
    width: "100%",
    maxWidth: 200,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    alignItems: "center",
  },
  menuText: {
    fontSize: 16,
    color: "#222",
    marginLeft: 10,
  },
  menuIcon: {
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 30,
    color: "#222",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 35,
    fontSize: 16,
    color: "#222",
  },
  logCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 15,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  logInfo: {
    flex: 1,
  },
  logTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4B2995",
    marginBottom: 10,
  },
  logDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  logDetailText: {
    fontSize: 14,
    color: "#222",
    marginLeft: 8,
  },
  noTickets: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginTop: 20,
  },
});

export default CheckInHistoryScreen;
