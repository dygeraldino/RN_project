import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { HomeScreen } from "./HomeScreen";

interface MainScreenProps {
  onLogout?: () => void;
  onNavigateToSettings?: () => void;
  onCreateCourse?: () => void;
  currentUserName?: string;
}

export function MainScreen({
  onLogout,
  onNavigateToSettings,
  onCreateCourse,
  currentUserName,
}: MainScreenProps) {
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
        onCreateCourse={onCreateCourse}
        onNavigateToSettings={onNavigateToSettings}
        currentUserName={currentUserName}
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
