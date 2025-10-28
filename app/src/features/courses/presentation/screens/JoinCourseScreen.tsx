import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useJoinCourseController } from "../hooks/useJoinCourseController";
import { ActionButton } from "../components/ActionButton";

export function JoinCourseScreen() {
  const router = useRouter();

  const controller = useJoinCourseController({
    onSuccess: () => {
      router.back();
    },
  });

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.navRow}>
          <Pressable onPress={goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={20} color="#1f2937" />
            <Text style={styles.backLabel}>Volver</Text>
          </Pressable>
        </View>
        <View style={styles.header}>
          <Text style={styles.title}>Unirme a un curso</Text>
          <Text style={styles.subtitle}>
            Ingresa el código compartido por el profesor para acceder al
            contenido del curso.
          </Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Código del curso</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: CR-ABC123"
            value={controller.code}
            onChangeText={controller.setCode}
            placeholderTextColor="#9ca3af"
            autoCapitalize="characters"
            autoCorrect={false}
          />
        </View>

        {controller.error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{controller.error}</Text>
          </View>
        )}

        <ActionButton
          label={controller.isSubmitting ? "Uniéndote..." : "Unirme"}
          onPress={controller.submit}
          disabled={!controller.canSubmit}
        />

        <ActionButton
          label="Cancelar"
          onPress={router.back}
          variant="secondary"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 20,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
  },
  backLabel: {
    color: "#1f2937",
    fontWeight: "600",
  },
  header: {
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 15,
    color: "#4b5563",
    lineHeight: 22,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    fontSize: 16,
    color: "#111827",
  },
  errorContainer: {
    borderRadius: 12,
    backgroundColor: "#fee2e2",
    padding: 12,
  },
  errorText: {
    color: "#991b1b",
    fontWeight: "500",
  },
});
