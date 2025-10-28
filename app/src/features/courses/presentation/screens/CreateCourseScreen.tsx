import { useCallback } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useCreateCourseController } from "../hooks/useCreateCourseController";
import { ActionButton } from "../components/ActionButton";

export function CreateCourseScreen() {
  const router = useRouter();

  const controller = useCreateCourseController({
    onSuccess: () => {
      router.back();
    },
  });

  const goToJoinCourse = useCallback(() => {
    router.replace("/courses/join" as any);
  }, [router]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Crear curso</Text>
          <Text style={styles.subtitle}>
            Define el nombre y la descripción del curso para comenzar.
          </Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Nombre del curso</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingresa el nombre"
            value={controller.form.title}
            onChangeText={(value) => controller.updateField("title", value)}
            placeholderTextColor="#9ca3af"
            autoCapitalize="sentences"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            placeholder="Cuenta brevemente de qué trata el curso"
            value={controller.form.description}
            onChangeText={(value) =>
              controller.updateField("description", value)
            }
            placeholderTextColor="#9ca3af"
            autoCapitalize="sentences"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {controller.error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{controller.error}</Text>
          </View>
        )}

        <ActionButton
          label={controller.isSubmitting ? "Creando..." : "Crear curso"}
          onPress={controller.submit}
          disabled={!controller.canSubmit}
        />

        <View style={styles.sectionDivider}>
          <View style={styles.divider} />
          <Text style={styles.dividerLabel}>o</Text>
          <View style={styles.divider} />
        </View>

        <ActionButton
          label="Unirme a un curso existente"
          onPress={goToJoinCourse}
          variant="secondary"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  container: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 20,
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
  multiline: {
    minHeight: 120,
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
  sectionDivider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 8,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  dividerLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
});
