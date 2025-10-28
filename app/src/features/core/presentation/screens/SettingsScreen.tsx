import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSettingsController } from "../controllers/useSettingsController";

interface SettingsScreenProps {
  onLogout?: () => void;
}

const OPTIONS = [
  { icon: "person-outline", title: "Cuenta" },
  { icon: "time-outline", title: "Actividad reciente" },
  { icon: "phone-portrait-outline", title: "Dispositivos" },
  { icon: "notifications-outline", title: "Notificaciones" },
  { icon: "language-outline", title: "Idioma" },
  { icon: "lock-closed-outline", title: "Privacidad y seguridad" },
  { icon: "server-outline", title: "Almacenamiento" },
  { icon: "log-out-outline", title: "Cerrar sesión" },
] as const;

type Option = (typeof OPTIONS)[number];

export function SettingsScreen({ onLogout }: SettingsScreenProps) {
  const controller = useSettingsController({ onLogout });

  return (
    <FlatList
      style={styles.container}
      data={OPTIONS}
      keyExtractor={(item) => item.title}
      ListHeaderComponent={
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={32} color="#fff" />
          </View>
          <View>
            <Text style={styles.profileName}>Jhonayker Echeverria</Text>
            <Text style={styles.profileHandle}>@jhonay_ker</Text>
          </View>
        </View>
      }
      renderItem={({ item }) => (
        <OptionItem option={item} onPress={controller.selectOption} />
      )}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      contentContainerStyle={styles.listContent}
    />
  );
}

interface OptionItemProps {
  option: Option;
  onPress: (title: string) => void;
}

function OptionItem({ option, onPress }: OptionItemProps) {
  return (
    <Pressable style={styles.optionCard} onPress={() => onPress(option.title)}>
      <View style={styles.optionIconContainer}>
        <Ionicons name={option.icon} size={22} color="#2563eb" />
      </View>
      <Text style={styles.optionTitle}>{option.title}</Text>
      <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  listContent: {
    paddingBottom: 24,
    gap: 12,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
  },
  profileName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  profileHandle: {
    fontSize: 14,
    color: "#6b7280",
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    shadowColor: "#0f172a",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#dbeafe",
    justifyContent: "center",
    alignItems: "center",
  },
  optionTitle: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    fontWeight: "600",
  },
  separator: {
    height: 12,
  },
});
