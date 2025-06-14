// screens/TicketScreen.tsx
import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  Pressable,
  Modal,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { getMyTickets } from "../api";
import { MaterialIcons } from "@expo/vector-icons";
import { debounce } from "lodash";

interface Ticket {
  id: number;
  eventName: string;
  status: string;
  createdAt: string;
  ticketType: string;
  qrCode: string;
  ticketCode: string;
}

const TicketScreen = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | "unused">("all");
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
          const ticketData = await getMyTickets(storedToken);
          setTickets(ticketData);
        } catch (error: any) {
          console.error("Error in loadTokenAndData:", error);
          if (error.response?.status === 401) {
            await AsyncStorage.removeItem("token");
            setToken(null);
            router.replace("/login");
          } else {
            alert(error.response?.data?.message || "Không thể tải dữ liệu");
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

  const onRefresh = async () => {
    if (!token) return;
    setRefreshing(true);
    try {
      const ticketData = await getMyTickets(token);
      setTickets(ticketData);
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

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Không xác định";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Không hợp lệ";
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const dataToDisplay = useMemo(() => {
    const filteredTickets = tickets.filter((ticket) =>
      ticket.eventName
        ?.toLowerCase()
        .includes(debouncedSearchQuery.toLowerCase())
    );
    return filterStatus === "all"
      ? filteredTickets
      : filteredTickets.filter((ticket) => ticket.status !== "used");
  }, [tickets, filterStatus, debouncedSearchQuery]);

  const ensureValidUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `http://${url}`;
  };
  const handleBack = () => {
    router.back();
  };

  const TicketItem = React.memo(({ item }: { item: Ticket }) => (
    <Pressable
      onPress={() => item.qrCode && setSelectedTicket(item)}
      style={({ pressed }) => [
        styles.ticketCard,
        { backgroundColor: pressed ? "#e0e0e0" : "transparent" },
      ]}
    >
      <LinearGradient colors={["#ffffff", "#e0f7fa"]} style={styles.ticketCard}>
        <View style={styles.ticketContent}>
          <View style={styles.ticketInfo}>
            <Text style={styles.ticketTitle}>
              {item.eventName || "Không xác định"}
            </Text>
            <View style={styles.ticketDetail}>
              <MaterialIcons
                name="confirmation-number"
                size={16}
                color="#222"
                style={{ marginBottom: 30 }}
              />
              <Text style={styles.ticketDetailText}>
                Mã vé: {item.ticketCode || "Không xác định"}
              </Text>
            </View>
            <View style={styles.ticketDetail}>
              <Ionicons name="ticket-outline" size={16} color="#222" />
              <Text style={styles.ticketDetailText}>
                Loại vé: {item.ticketType || "Không xác định"}
              </Text>
            </View>
            <View style={styles.ticketDetail}>
              <Ionicons
                name="checkmark-circle-outline"
                size={16}
                color={item.status === "used" ? "#00C851" : "#e74c3c"}
              />
              <Text
                style={[
                  styles.ticketDetailText,
                  { color: item.status === "used" ? "#00C851" : "#e74c3c" },
                ]}
              >
                Trạng thái:{" "}
                {item.status === "used" ? "Đã sử dụng" : "Chưa sử dụng"}
              </Text>
            </View>
            <View style={styles.ticketDetail}>
              <Ionicons name="calendar-outline" size={16} color="#222" />
              <Text style={styles.ticketDetailText}>
                Ngày mua: {formatDate(item.createdAt)}
              </Text>
            </View>
          </View>
          <View style={styles.qrContainer}>
            {item.qrCode ? (
              <Image
                source={{
                  uri: ensureValidUrl(item.qrCode),
                  cache: "reload",
                }}
                style={styles.qrImage}
                resizeMode="contain"
                onError={(error) =>
                  console.log("Image load error:", error.nativeEvent)
                }
              />
            ) : (
              <Text style={styles.noQrText}>Không có mã QR</Text>
            )}
          </View>
        </View>
        <View style={styles.perforatedLeft} />
        <View style={styles.perforatedRight} />
      </LinearGradient>
    </Pressable>
  ));

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
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

        <Modal
          visible={!!selectedTicket}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setSelectedTicket(null)}
        >
          <Pressable
            style={styles.qrModalOverlay}
            onPress={() => setSelectedTicket(null)}
          >
            <LinearGradient
              colors={["#f5e7ff", "#dcfce7"]}
              style={styles.qrModalContainer}
            >
              <Text style={styles.qrModalTitle}>Quét mã QR để kiểm tra vé</Text>
              {selectedTicket && (
                <View style={styles.qrModalInfo}>
                  <Text style={styles.qrModalInfoText}>
                    Mã vé: {selectedTicket.ticketCode || "Không xác định"}
                  </Text>
                  <Text style={styles.qrModalInfoText}>
                    Sự kiện: {selectedTicket.eventName || "Không xác định"}
                  </Text>
                  <Text style={styles.qrModalInfoText}>
                    Loại vé: {selectedTicket.ticketType || "Không xác định"}
                  </Text>
                </View>
              )}
              <Text style={styles.qrModalInstruction}>
                Đặt mã QR vào khung quét của thiết bị
              </Text>
              <View style={styles.qrFrame}>
                <Image
                  source={{
                    uri: selectedTicket
                      ? ensureValidUrl(selectedTicket.qrCode)
                      : "",
                    cache: "reload",
                  }}
                  style={styles.qrModalImage}
                  resizeMode="contain"
                  onError={(error) =>
                    console.log("QR Modal Image error:", error.nativeEvent)
                  }
                />
              </View>
              <Pressable
                style={({ pressed }) => [
                  styles.closeButton,
                  { backgroundColor: pressed ? "#e0e0e0" : "transparent" },
                ]}
                onPress={() => setSelectedTicket(null)}
              >
                <Ionicons name="close" size={35} color="#000" />
              </Pressable>
            </LinearGradient>
          </Pressable>
        </Modal>

        <Text style={styles.title}>Vé của tôi</Text>
        <View style={styles.filterContainer}>
          <Pressable
            style={[
              styles.filterButton,
              filterStatus === "all" && styles.filterButtonActive,
            ]}
            onPress={() => setFilterStatus("all")}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterStatus === "all" && styles.filterButtonTextActive,
              ]}
            >
              Tất cả
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.filterButton,
              filterStatus === "unused" && styles.filterButtonActive,
            ]}
            onPress={() => setFilterStatus("unused")}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterStatus === "unused" && styles.filterButtonTextActive,
              ]}
            >
              Chưa sử dụng
            </Text>
          </Pressable>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#888"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm sự kiện..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              handleSearch(text);
            }}
          />
        </View>

        {isLoading ? (
          <ActivityIndicator
            size="large"
            color="#007bff"
            style={{ marginTop: 20 }}
          />
        ) : dataToDisplay.length === 0 ? (
          <Text style={styles.noTickets}>Bạn chưa có vé nào.</Text>
        ) : (
          <FlatList
            data={dataToDisplay}
            keyExtractor={(item) => `ticket_${item.id}`}
            renderItem={({ item }) => <TicketItem item={item} />}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            removeClippedSubviews={true}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={15}
            getItemLayout={(data, index) => ({
              length: 200,
              offset: 200 * index,
              index,
            })}
          />
        )}
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
};

// Giữ nguyên các styles từ mã gốc
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
    marginBottom: 30,
    color: "#222",
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 15,
    marginTop: 10,
  },
  filterButton: {
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: "#ddd",
    marginHorizontal: 5,
  },
  filterButtonActive: {
    backgroundColor: "#00bcd4",
  },
  filterButtonText: {
    color: "#222",
    fontSize: 14,
    fontWeight: "600",
  },
  filterButtonTextActive: {
    color: "#fff",
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
  ticketCard: {
    borderRadius: 10,
    marginBottom: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  ticketContent: {
    flexDirection: "row",
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  ticketInfo: {
    flex: 1,
    flexShrink: 1,
    maxWidth: "60%",
    marginRight: 10,
  },
  ticketTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 6,
    flexWrap: "wrap",
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    fontStyle: "italic",
  },
  ticketDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  ticketDetailText: {
    fontSize: 14,
    color: "#222",
    marginLeft: 5,
    flexWrap: "wrap",
    flex: 1,
  },
  qrContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 5,
    width: 110,
    height: 110,
    borderWidth: 2,
    borderColor: "#cdc4cc",
  },
  qrImage: {
    width: 100,
    height: 100,
  },
  noQrText: {
    fontSize: 14,
    color: "#999",
  },
  perforatedLeft: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 15,
    backgroundColor: "#fff",
    borderRightWidth: 2,
    borderStyle: "dashed",
    borderColor: "#ccc",
  },
  perforatedRight: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 15,
    backgroundColor: "#fff",
    borderLeftWidth: 2,
    borderStyle: "dashed",
    borderColor: "#ccc",
  },
  qrModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  qrModalContainer: {
    borderRadius: 15,
    padding: 20,
    paddingBottom: 40,
    alignItems: "center",
    elevation: 5,
    width: "90%",
    maxWidth: 400,
  },
  qrModalTitle: {
    fontWeight: "600",
    fontSize: 20,
    color: "#222",
    marginBottom: 10,
    textAlign: "center",
  },
  qrModalInfo: {
    marginBottom: 15,
    alignItems: "center",
  },
  qrModalInfoText: {
    fontSize: 16,
    color: "#222",
    paddingHorizontal: 10,
    textAlign: "center",
  },
  qrModalInstruction: {
    fontSize: 14,
    color: "#888",
    marginBottom: 15,
    textAlign: "center",
  },
  qrFrame: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    borderWidth: 2,
    borderColor: "#ddd",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  qrModalImage: {
    width: 250,
    height: 250,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 4,
    padding: 5,
  },
  noTickets: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginTop: 20,
  },
});

export default TicketScreen;
