import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface CreateScreenProps {
  onCreateCourse?: () => void;
  onJoinCourse?: () => void;
}

export function CreateScreen({
  onCreateCourse,
  onJoinCourse,
}: CreateScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crea o ingresa a un curso nuevo</Text>

      <ActionCard
        icon="school"
        title="Crear Curso"
        description="Crea un nuevo curso con contenido y actividades"
        background="#bfdbfe"
        iconColor="#1d4ed8"
        onPress={onCreateCourse}
      />

      <ActionCard
        icon="layers"
        title="Ingresar a un curso"
        description="Ingresa a un nuevo curso para descubrir sus maravillas"
        background="#bbf7d0"
        iconColor="#15803d"
        onPress={onJoinCourse}
      />
    </View>
  );
}

interface ActionCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  background: string;
  iconColor: string;
  onPress?: () => void;
}

function ActionCard({
  icon,
  title,
  description,
  background,
  iconColor,
  onPress,
}: ActionCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={[styles.cardIconContainer, { backgroundColor: background }]}>
        <Ionicons name={icon} size={28} color={iconColor} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 32,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#0f172a",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardIconContainer: {
    padding: 12,
    borderRadius: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  cardDescription: {
    marginTop: 4,
    fontSize: 14,
    color: "#6b7280",
  },
});
