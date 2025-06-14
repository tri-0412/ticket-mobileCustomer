import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Delay điều hướng để đảm bảo Root Layout đã mount
    const timer = setTimeout(() => {
      router.replace("/login");
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View>
      <Text>Redirecting to Login...</Text>
    </View>
  );
}
