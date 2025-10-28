import { useMemo } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
  Share,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { useAuth } from "../../../auth";
import { useCourseDetailController } from "../hooks/useCourseDetailController";
import { ActionButton } from "../components/ActionButton";

export function CourseDetailScreen() {
  const { courseId } = useLocalSearchParams<{ courseId?: string }>();
  const { currentUser } = useAuth();

  const effectiveCourseId = useMemo(() => {
    if (!courseId) return "";
    return Array.isArray(courseId) ? courseId[0] : courseId;
  }, [courseId]);

  const controller = useCourseDetailController(effectiveCourseId, {
    currentUserId:
      currentUser?.uuid ?? (currentUser ? String(currentUser.id) : null),
  });

  if (!effectiveCourseId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>No se proporcionó el curso.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (controller.isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </SafeAreaView>
    );
  }

  if (controller.error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{controller.error}</Text>
          <ActionButton label="Reintentar" onPress={controller.refresh} />
        </View>
      </SafeAreaView>
    );
  }

  if (!controller.course) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Curso no encontrado.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleCopyCode = async () => {
    const code = controller.courseCode;
    if (!code) {
      Alert.alert("Código no disponible", "Este curso aún no tiene código.");
      return;
    }

    try {
      await Clipboard.setStringAsync(code);
      Alert.alert(
        "Código copiado",
        "Comparte este código con tus estudiantes."
      );
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "No se pudo copiar el código."
      );
    }
  };

  const handleShareCode = async () => {
    const code = controller.courseCode;
    if (!code) {
      Alert.alert("Código no disponible", "Este curso aún no tiene código.");
      return;
    }

    try {
      await Share.share({
        message: `Únete a mi curso usando el código ${code}.`,
      });
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "No se pudo compartir el código."
      );
    }
  };

  const handleCreateActivity = () => {
    Alert.alert(
      "Próximamente",
      "Estamos preparando la creación de actividades desde esta pantalla."
    );
  };

  const handleCreateCategory = () => {
    Alert.alert(
      "Próximamente",
      "Muy pronto podrás gestionar categorías directamente aquí."
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={controller.isRefreshing}
            onRefresh={controller.refresh}
            tintColor="#2563eb"
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>{controller.course.title}</Text>
          <Text style={styles.subtitle}>{controller.course.description}</Text>
          <View style={styles.headerPills}>
            <View style={styles.pill}>
              <Text style={styles.pillText}>{controller.course.role}</Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillText}>
                Código: {controller.courseCode ?? "-"}
              </Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillText}>
                Estudiantes: {controller.course.studentCount}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actionRow}>
          <ActionButton
            label="Actualizar datos"
            onPress={controller.refresh}
            disabled={controller.isRefreshing}
          />
          <ActionButton
            label="Copiar código"
            onPress={handleCopyCode}
            variant="secondary"
          />
          <ActionButton
            label="Compartir código"
            onPress={handleShareCode}
            variant="secondary"
          />
        </View>

        {controller.isProfessor && (
          <View style={styles.actionRow}>
            <ActionButton
              label="Crear actividad"
              onPress={handleCreateActivity}
            />
            <ActionButton
              label="Nueva categoría"
              onPress={handleCreateCategory}
              variant="secondary"
            />
          </View>
        )}

        <TabSelector
          activeTab={controller.activeTab}
          onChange={controller.changeTab}
        />

        {controller.activeTab === "activities" && (
          <ActivitiesSection
            activities={controller.activities}
            stats={controller.activityStats}
            isProfessor={controller.isProfessor}
            onCreateActivity={handleCreateActivity}
          />
        )}

        {controller.activeTab === "students" && (
          <StudentsSection
            students={controller.students}
            isProfessor={controller.isProfessor}
            onInvite={handleCopyCode}
            onShare={handleShareCode}
          />
        )}

        {controller.activeTab === "categories" && (
          <CategoriesSection
            categories={controller.categories}
            isProfessor={controller.isProfessor}
            onCreateCategory={handleCreateCategory}
          />
        )}

        {controller.activeTab === "info" && (
          <InfoSection course={controller.course} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

interface TabSelectorProps {
  activeTab: "activities" | "students" | "categories" | "info";
  onChange: (tab: "activities" | "students" | "categories" | "info") => void;
}

function TabSelector({ activeTab, onChange }: TabSelectorProps) {
  const tabs: { key: TabSelectorProps["activeTab"]; label: string }[] = [
    { key: "activities", label: "Actividades" },
    { key: "students", label: "Estudiantes" },
    { key: "categories", label: "Categorías" },
    { key: "info", label: "Información" },
  ];

  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <Text
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={[styles.tabItem, isActive ? styles.tabItemActive : null]}
          >
            {tab.label}
          </Text>
        );
      })}
    </View>
  );
}

interface ActivitiesSectionProps {
  activities: Record<string, any>[];
  stats: { total: number; pending: number; overdue: number };
  isProfessor: boolean;
  onCreateActivity: () => void;
}

function ActivitiesSection({
  activities,
  stats,
  isProfessor,
  onCreateActivity,
}: ActivitiesSectionProps) {
  if (!activities.length) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actividades</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            No hay actividades registradas en este curso.
          </Text>
          {isProfessor ? (
            <ActionButton label="Crear actividad" onPress={onCreateActivity} />
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Actividades ({stats.total})</Text>
      <Text style={styles.sectionSubtitle}>
        Pendientes: {stats.pending} · Vencidas: {stats.overdue}
      </Text>
      {isProfessor ? (
        <ActionButton
          label="Crear nueva actividad"
          onPress={onCreateActivity}
          variant="secondary"
        />
      ) : null}
      <View style={styles.cardList}>
        {activities.map((activity) => {
          const id = (activity["_id"] ?? activity["id"]) as string;
          const title = (activity["title"] ??
            activity["name"] ??
            "Actividad") as string;
          const due =
            activity["formatted_due_date"] ?? formatDate(activity["due_date"]);
          const category = activity["category_name"] ?? "Sin categoría";
          return (
            <View key={id} style={styles.card}>
              <Text style={styles.cardTitle}>{title}</Text>
              <Text style={styles.cardMeta}>Categoría: {category}</Text>
              <Text style={styles.cardMeta}>Entrega: {due ?? "-"}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

interface StudentsSectionProps {
  students: Record<string, any>[];
  isProfessor: boolean;
  onInvite: () => void;
  onShare: () => void;
}

function StudentsSection({
  students,
  isProfessor,
  onInvite,
  onShare,
}: StudentsSectionProps) {
  if (!students.length) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Participantes</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            Aún no hay estudiantes inscritos en este curso.
          </Text>
          {isProfessor ? (
            <View style={styles.emptyStateActions}>
              <ActionButton label="Copiar código" onPress={onInvite} />
              <ActionButton
                label="Compartir"
                onPress={onShare}
                variant="secondary"
              />
            </View>
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Participantes ({students.length})</Text>
      {isProfessor ? (
        <View style={styles.sectionActions}>
          <ActionButton label="Copiar código" onPress={onInvite} />
          <ActionButton
            label="Compartir"
            onPress={onShare}
            variant="secondary"
          />
        </View>
      ) : null}
      <View style={styles.cardList}>
        {students.map((student) => {
          const id = (student["_id"] ??
            student["id"] ??
            Math.random().toString()) as string;
          const name = (student["name"] ??
            student["email"] ??
            "Estudiante") as string;
          const role = (student["role"] ?? "estudiante") as string;

          const initials = name
            .split(" ")
            .map((part) => part.trim())
            .filter(Boolean)
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          return (
            <View key={id} style={[styles.card, styles.studentCard]}>
              <View style={styles.studentAvatar}>
                <Text style={styles.studentAvatarText}>{initials || "?"}</Text>
              </View>
              <View style={styles.studentInfo}>
                <View style={styles.studentHeader}>
                  <Text style={styles.cardTitle}>{name}</Text>
                  <View style={styles.roleChip}>
                    <Text style={styles.roleChipText}>
                      {role.toLowerCase() === "profesor"
                        ? "Profesor"
                        : "Estudiante"}
                    </Text>
                  </View>
                </View>
                <Text style={styles.cardMeta}>{student["email"] ?? ""}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

interface CategoriesSectionProps {
  categories: Record<string, any>[];
  isProfessor: boolean;
  onCreateCategory: () => void;
}

function CategoriesSection({
  categories,
  isProfessor,
  onCreateCategory,
}: CategoriesSectionProps) {
  if (!categories.length) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categorías</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            Todavía no se han configurado categorías.
          </Text>
          {isProfessor ? (
            <ActionButton label="Crear categoría" onPress={onCreateCategory} />
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Categorías ({categories.length})</Text>
      {isProfessor ? (
        <ActionButton
          label="Nueva categoría"
          onPress={onCreateCategory}
          variant="secondary"
        />
      ) : null}
      <View style={styles.cardList}>
        {categories.map((category) => {
          const id = (category["_id"] ?? category["id"]) as string;
          const name = (category["name"] ?? "Categoría") as string;
          const activityCount = category["activity_count"] ?? 0;
          const groupCount = category["group_count"] ?? 0;
          return (
            <View key={id} style={styles.card}>
              <Text style={styles.cardTitle}>{name}</Text>
              <Text style={styles.cardMeta}>
                Actividades: {activityCount} · Grupos: {groupCount}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

interface InfoSectionProps {
  course: CourseDetail;
}

interface CourseDetail {
  title: string;
  description: string;
  professorId: string;
  role: string;
  createdAt: Date;
  studentCount: number;
  id?: string;
}

function InfoSection({ course }: InfoSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Información del curso</Text>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Profesor ID</Text>
        <Text style={styles.infoValue}>{course.professorId}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Rol asignado</Text>
        <Text style={styles.infoValue}>{course.role}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Código</Text>
        <Text style={styles.infoValue}>{course.id ?? "-"}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Registrados</Text>
        <Text style={styles.infoValue}>{course.studentCount}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Creado el</Text>
        <Text style={styles.infoValue}>{formatDate(course.createdAt)}</Text>
      </View>
    </View>
  );
}

function formatDate(value: unknown): string {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value as any);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  container: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 24,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  header: {
    gap: 12,
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
  headerPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  pill: {
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pillText: {
    color: "#075985",
    fontWeight: "600",
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#e5e7eb",
    borderRadius: 12,
    padding: 4,
  },
  tabItem: {
    flex: 1,
    textAlign: "center",
    borderRadius: 10,
    paddingVertical: 10,
    fontWeight: "600",
    color: "#4b5563",
  },
  tabItemActive: {
    backgroundColor: "#fff",
    color: "#1f2937",
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  sectionSubtitle: {
    color: "#4b5563",
  },
  sectionActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 12,
  },
  cardList: {
    gap: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    gap: 6,
    flexDirection: "column",
  },
  studentCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  studentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#bfdbfe",
    alignItems: "center",
    justifyContent: "center",
  },
  studentAvatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1d4ed8",
  },
  studentInfo: {
    flex: 1,
    gap: 4,
  },
  studentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  roleChip: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleChipText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
    textTransform: "uppercase",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  cardMeta: {
    color: "#4b5563",
    fontSize: 14,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 16,
  },
  emptyStateText: {
    color: "#6b7280",
  },
  emptyStateActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
  },
  infoLabel: {
    fontWeight: "600",
    color: "#4b5563",
  },
  infoValue: {
    color: "#111827",
    fontWeight: "600",
  },
  errorText: {
    color: "#991b1b",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
