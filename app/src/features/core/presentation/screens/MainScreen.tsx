import { useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { HomeScreen } from "./HomeScreen";
import { HomeCourse } from "../controllers/useHomeController";

interface MainScreenProps {
  onLogout?: () => void;
  currentUserName?: string;
  currentUserId?: string | null;
}

export function MainScreen({
  onLogout,
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
        <Text style={styles.title}>Explorar</Text>
      </View>
      <HomeScreen
        onLogout={onLogout}
        onCreateCourse={handleCreateCourse}
        onJoinCourse={handleJoinCourse}
        onSelectCourse={handleSelectCourse}
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
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
});
