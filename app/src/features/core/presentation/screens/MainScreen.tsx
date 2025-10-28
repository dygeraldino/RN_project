import { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { HomeScreen } from "./HomeScreen";
import { HomeCourse } from "../controllers/useHomeController";

interface MainScreenProps {
  onLogout?: () => void;
  onNavigateToSettings?: () => void;
  currentUserName?: string;
  currentUserId?: string | null;
}

export function MainScreen({
  onLogout,
  onNavigateToSettings,
  currentUserName,
  currentUserId,
}: MainScreenProps) {
  const router = useRouter();

  const handleCreateCourse = useCallback(() => {
    router.push("/courses/create" as any);
  }, [router]);

  const handleJoinCourse = useCallback(() => {
    router.push("/courses/join" as any);
  }, [router]);

  const handleSelectCourse = useCallback(
    (course: HomeCourse) => {
      if (!course.id) return;
      router.push({
        pathname: "/courses/[courseId]",
        params: { courseId: course.id },
      } as any);
    },
    [router]
  );

  return (
    <View style={styles.container}>
      <View style={styles.appBar}>
        <Pressable style={styles.leadingAvatar}>
          <Ionicons name="person" size={24} color="#2563eb" />
        </Pressable>
        <Text style={styles.title}>Explorar</Text>
        <Pressable style={styles.menuButton} onPress={onLogout}>
          <Ionicons name="log-out-outline" size={22} color="#1f2937" />
        </Pressable>
      </View>
      <HomeScreen
        onLogout={onLogout}
        onCreateCourse={handleCreateCourse}
        onJoinCourse={handleJoinCourse}
        onSelectCourse={handleSelectCourse}
        onNavigateToSettings={onNavigateToSettings}
        currentUserName={currentUserName}
        currentUserId={currentUserId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  appBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  leadingAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  menuButton: {
    padding: 8,
  },
});
