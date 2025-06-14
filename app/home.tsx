import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import Swiper from "react-native-swiper";

const { width } = Dimensions.get("window");

const HomeScreen = () => {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [buttonScale] = useState(new Animated.Value(1));
  const [buttonScaleHistory] = useState(new Animated.Value(1));

  const banners = [
    {
      id: 1,
      text: "Concert Soobin Hoàng Sơn sắp diễn ra!",
      image:
        "https://instagram.fsgn5-15.fna.fbcdn.net/v/t51.2885-15/491456546_18059485925107463_458649135876036989_n.jpg?stp=dst-jpg_e35_p750x750_sh0.08_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMDgweDEzNTAuc2RyLmY3NTc2MS5kZWZhdWx0X2ltYWdlIn0&_nc_ht=instagram.fsgn5-15.fna.fbcdn.net&_nc_cat=111&_nc_oc=Q6cZ2QGdigesHioLIJrVjEC4fkms4DLnkE8swJUFNVTsM5aCRMUaEzJTf9yBVJNFyZ1V9hE&_nc_ohc=QSnR-9hh5z8Q7kNvwEvklln&_nc_gid=ayuoT6IhAHjG-lYVlYwkZw&edm=ANTKIIoBAAAA&ccb=7-5&oh=00_AfOFHwniTtZRmDvVPaDSP6LbiZ4ZyA5ypX5RcunsvRWttw&oe=685332F6&_nc_sid=d885a2",
    },
    {
      id: 2,
      text: "Anh trai Say Hi tổ chức Concert tại Mỹ!",
      image:
        "https://media.vov.vn/sites/default/files/styles/large/public/2025-05/anh_trai_say_hi.jpeg.jpg",
    },
    {
      id: 3,
      text: "VPBANK Presents K-STAR SPARK IN VIETNAM - MEGA CONCERT 2025",
      image:
        "https://image.ajunews.com/content/image/2025/05/16/20250516165947124835.jpg",
    },
    {
      id: 4,
      text: "Những Thành Phố Mơ Màng Summer 2025",
      image:
        "https://scontent.fsgn5-8.fna.fbcdn.net/v/t39.30808-6/482242501_1209258354095323_3941470718125113716_n.jpg?stp=dst-jpg_s640x640_tt6&_nc_cat=109&ccb=1-7&_nc_sid=833d8c&_nc_ohc=Q7-b4ANrgYkQ7kNvwERCu9_&_nc_oc=AdkaCcCs_TZI_ktAGxWa-kWc_U-GO0wX1ldHQHYEXxkktHgYagIcJZiMQBr2ZzALWMY&_nc_zt=23&_nc_ht=scontent.fsgn5-8.fna&_nc_gid=yXogHFLfhWWaEVfr0fEPtA&oh=00_AfOOJShVr52UpmvZ_xnFAY1XRSjeOBsD0HtLEy1NOHjuoA&oe=6853225E",
    },
    {
      id: 5,
      text: 'Lễ hội âm nhạc & sáng tạo Tràng An - Ninh Bình "FORESTIVAL" 2025',
      image:
        "https://backstage.vn/storage/2025/03/486251888_1199110662214971_801214891098320310_n.jpg",
    },
    {
      id: 6,
      text: "2025 BABYMONSTER 1st WORLD TOUR <HELLO MONSTERS> IN HO CHI MINH",
      image: "https://i.redd.it/61dyb5tfjnce1.jpeg",
    },
  ];

  const handlePressIn = (scale: Animated.Value) => {
    Animated.spring(scale, {
      toValue: 0.95,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (scale: Animated.Value) => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
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
    setShowMenu(false);
    router.replace("/login");
  };

  return (
    <LinearGradient
      colors={["#e0e4f0", "#d0d8e8"]} // Adjusted to a slightly darker gradient
      style={viewStyles.container}
    >
      <Pressable
        style={viewStyles.menuButton}
        onPress={() => setShowMenu(true)}
      >
        <Ionicons name="menu" size={28} color="#333333" />
      </Pressable>

      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <Pressable
          style={viewStyles.modalOverlay}
          onPress={() => setShowMenu(false)}
        >
          <LinearGradient
            colors={["#ffffff", "#f0f0f0"]}
            style={viewStyles.menuContainer}
          >
            <Pressable
              style={({ pressed }) => [
                viewStyles.menuItem,
                pressed && { backgroundColor: "#e0e0e0" },
              ]}
              onPress={handleProfile}
            >
              <Ionicons
                name="person-outline"
                size={20}
                color="#222"
                style={viewStyles.menuIcon}
              />
              <Text style={textStyles.menuText}>Profile</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                viewStyles.menuItem,
                pressed && { backgroundColor: "#e0e0e0" },
              ]}
              onPress={handleChangePassword}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#222"
                style={viewStyles.menuIcon}
              />
              <Text style={textStyles.menuText}>Đổi mật khẩu</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                viewStyles.menuItem,
                pressed && { backgroundColor: "#e0e0e0" },
              ]}
              onPress={handleLogout}
            >
              <Ionicons
                name="log-out-outline"
                size={20}
                color="#e74c3c"
                style={viewStyles.menuIcon}
              />
              <Text style={[textStyles.menuText, { color: "#e74c3c" }]}>
                Đăng xuất
              </Text>
            </Pressable>
          </LinearGradient>
        </Pressable>
      </Modal>

      <Animatable.View
        animation="bounceInDown"
        duration={1500}
        style={viewStyles.header}
      >
        <View style={viewStyles.logoContainer}>
          <Image
            source={require("../assets/images/snapedit.png")}
            style={imageStyles.logo}
            resizeMode="contain"
          />
          <Text style={textStyles.subtitle}>Búng tay, check ngay!</Text>
        </View>
      </Animatable.View>

      <Swiper
        style={viewStyles.bannerContainer}
        autoplay
        autoplayTimeout={4}
        showsPagination
        paginationStyle={viewStyles.pagination}
        dotColor="rgba(255, 255, 255, 0.5)"
        activeDotColor="#fff"
      >
        {banners.map((banner) => (
          <View key={banner.id} style={viewStyles.banner}>
            <View style={viewStyles.bannerOverlayWrapper}>
              <LinearGradient
                colors={["rgba(0, 0, 0, 0.85)", "rgba(0, 0, 0, 0.65)"]} // Adjusted for better harmony
                style={viewStyles.bannerOverlay}
              >
                <Text style={textStyles.bannerText}>{banner.text}</Text>
              </LinearGradient>
            </View>
            <Image
              source={{ uri: banner.image }}
              style={imageStyles.bannerImage}
              resizeMode="cover"
            />
          </View>
        ))}
      </Swiper>

      <View style={viewStyles.buttonContainer}>
        <Animatable.View style={{ transform: [{ scale: buttonScale }] }}>
          <Pressable
            onPressIn={() => handlePressIn(buttonScale)}
            onPressOut={() => handlePressOut(buttonScale)}
            onPress={() => router.push("/tickets")}
            style={viewStyles.button}
          >
            <LinearGradient
              colors={["#ff7f7f", "#ff9999"]}
              style={viewStyles.buttonGradient}
            >
              <Ionicons name="ticket-outline" size={30} color="#fff" />
              <Text style={textStyles.buttonText}>Vé của tôi</Text>
            </LinearGradient>
          </Pressable>
        </Animatable.View>

        <Animatable.View style={{ transform: [{ scale: buttonScaleHistory }] }}>
          <Pressable
            onPressIn={() => handlePressIn(buttonScaleHistory)}
            onPressOut={() => handlePressOut(buttonScaleHistory)}
            onPress={() => router.push("/checkin-history")}
            style={viewStyles.button}
          >
            <LinearGradient
              colors={["#1a4066", "#4682b4"]}
              style={viewStyles.buttonGradient}
            >
              <Ionicons name="time-outline" size={30} color="#fff" />
              <Text style={textStyles.buttonText}>Lịch sử check-in</Text>
            </LinearGradient>
          </Pressable>
        </Animatable.View>
      </View>

      <Animatable.View
        animation="fadeInUp"
        duration={1500}
        style={viewStyles.footer}
      >
        <LinearGradient
          colors={["rgba(0, 0, 0, 0.5)", "rgba(0, 0, 0, 0.2)"]}
          style={viewStyles.footerGradient}
        >
          <Text style={textStyles.footerText}>
            Cùng cháy hết mình tại mọi sự kiện! 🎉
          </Text>
        </LinearGradient>
      </Animatable.View>
    </LinearGradient>
  );
};

const viewStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 30,
  },
  menuButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 50,
    padding: 8,
    elevation: 5,
    shadowColor: "#000",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 95,
    paddingRight: 15,
  },
  menuContainer: {
    borderRadius: 10,
    padding: 20,
    width: "100%",
    maxWidth: 230,
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
  logoContainer: {
    position: "relative",
    alignItems: "center",
    width: 140,
    height: 140,
    marginBottom: 20,
  },
  header: {
    alignItems: "center",
  },
  bannerContainer: {
    height: 510,
    marginBottom: 30,
  },
  banner: {
    borderRadius: 15,
    overflow: "hidden",
    marginHorizontal: 10,
    backgroundColor: "rgba(255, 255, 0.2)",
  },
  bannerOverlayWrapper: {
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    overflow: "hidden",
  },
  bannerOverlay: {
    padding: 10,
    alignItems: "center",
    height: 60,
    justifyContent: "center",
  },
  pagination: {
    bottom: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
  },
  button: {
    width: "95%",
    marginBottom: 15,
    borderRadius: 25,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  footer: {
    alignItems: "center",
    marginVertical: 4,
  },
  footerGradient: {
    padding: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  menuIcon: {
    marginRight: 10,
  },
});

const textStyles = StyleSheet.create({
  menuText: {
    fontSize: 16,
    color: "#222",
    marginLeft: 10,
  },
  subtitle: {
    fontSize: 13,
    bottom: 0,
    position: "absolute",
    color: "#00961f",
    textAlign: "center",
    fontWeight: "600",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  bannerText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 10,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  footerText: {
    fontSize: 14,
    color: "#ffe066",
    textAlign: "center",
    fontStyle: "italic",
    textShadowColor: "rgba(0, 0, 0, 0.7)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

const imageStyles = StyleSheet.create({
  logo: {
    maxWidth: 300,
    width: 140,
    height: 140,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  bannerImage: {
    width: width - 40,
    height: 480,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
});

export default HomeScreen;
