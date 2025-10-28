import { useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
  Share,
  Platform,
} from "react-native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../../auth";
import { useCourseDetailController } from "../hooks/useCourseDetailController";
import { ActionButton } from "../components/ActionButton";

export function CourseDetailScreen() {
  const { courseId } = useLocalSearchParams<{ courseId?: string }>();
  const navigation = useNavigation();
  const router = useRouter();
  const { currentUser } = useAuth();

  const effectiveCourseId = useMemo(() => {
    if (!courseId) return "";
    return Array.isArray(courseId) ? courseId[0] : courseId;
  }, [courseId]);

  const controller = useCourseDetailController(effectiveCourseId, {
    currentUserId:
      currentUser?.uuid ?? (currentUser ? String(currentUser.id) : null),
  });

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/" as any);
    }
  };

  useEffect(() => {
    if (controller.course?.title) {
      navigation.setOptions?.({ title: controller.course.title });
    }
  }, [controller.course?.title, navigation]);

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

  const handleLeaveCourse = () => {
    Alert.alert(
      "Salir del curso",
      "¿Estás seguro de que deseas salir de este curso?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Salir",
          style: "destructive",
          onPress: async () => {
            try {
              await controller.leaveCourse();
              Alert.alert(
                "Curso abandonado",
                "Has salido del curso correctamente."
              );
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/" as any);
              }
            } catch (error) {
              Alert.alert(
                "Error",
                error instanceof Error
                  ? error.message
                  : "No se pudo salir del curso."
              );
            }
          },
        },
      ]
    );
  };

  const handleDeleteCourse = () => {
    Alert.alert(
      "Eliminar curso",
      "¿Estás seguro de que deseas eliminar este curso? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await controller.deleteCourse();
              Alert.alert(
                "Curso eliminado",
                "El curso se ha eliminado correctamente."
              );
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/" as any);
              }
            } catch (error) {
              Alert.alert(
                "Error",
                error instanceof Error
                  ? error.message
                  : "No se pudo eliminar el curso."
              );
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={controller.isRefreshing}
            onRefresh={controller.refresh}
            tintColor="#2563eb"
          />
        }
      >
        <View style={styles.navRow}>
          <Pressable onPress={goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={20} color="#1f2937" />
            <Text style={styles.backLabel}>Volver</Text>
          </Pressable>
        </View>

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
          <InfoSection
            course={controller.course}
            isProfessor={controller.isProfessor}
            onDeleteCourse={handleDeleteCourse}
            isDeleting={controller.isDeleting}
            onCopyCode={handleCopyCode}
            onShareCode={handleShareCode}
            activityStats={controller.activityStats}
            studentsCount={controller.course.studentCount}
            courseCode={controller.courseCode ?? null}
            onLeaveCourse={
              controller.isProfessor ? undefined : handleLeaveCourse
            }
            isLeavingCourse={controller.isLeaving}
          />
        )}
      </ScrollView>
      <BottomTabBar
        activeTab={controller.activeTab}
        onChange={controller.changeTab}
      />
    </SafeAreaView>
  );
}

type CourseTab = "activities" | "students" | "categories" | "info";

interface BottomTabBarProps {
  activeTab: CourseTab;
  onChange: (tab: CourseTab) => void;
}

function BottomTabBar({ activeTab, onChange }: BottomTabBarProps) {
  const tabs: { key: CourseTab; label: string }[] = [
    { key: "activities", label: "Actividades" },
    { key: "students", label: "Estudiantes" },
    { key: "categories", label: "Categorías" },
    { key: "info", label: "Información" },
  ];

  return (
    <View style={styles.bottomBar}>
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <Text
            key={tab.key}
            style={[
              styles.bottomTabItem,
              isActive ? styles.bottomTabItemActive : null,
            ]}
            onPress={() => onChange(tab.key)}
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
  isProfessor: boolean;
  onDeleteCourse: () => void;
  isDeleting: boolean;
  onCopyCode: () => void;
  onShareCode: () => void;
  activityStats: { total: number; pending: number; overdue: number };
  studentsCount: number;
  courseCode: string | null;
  onLeaveCourse?: () => void;
  isLeavingCourse?: boolean;
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

function InfoSection({
  course,
  isProfessor,
  onDeleteCourse,
  isDeleting,
  onCopyCode,
  onShareCode,
  activityStats,
  studentsCount,
  courseCode,
  onLeaveCourse,
  isLeavingCourse,
}: InfoSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.infoCard}>
        <Text style={styles.infoCardHeading}>Información del curso</Text>
        <View style={styles.infoFieldGroup}>
          <InfoField label="Nombre" value={course.title} emphasized />
          <InfoField
            label="Descripción"
            value={course.description || "Sin descripción"}
          />
          <InfoField label="Tu rol" value={course.role} />
          <InfoField
            label="Total de estudiantes"
            value={String(studentsCount)}
          />
          <InfoField
            label="Fecha de creación"
            value={formatDate(course.createdAt)}
          />
          <InfoField label="Código" value={courseCode ?? "-"} code />
          <InfoField label="Profesor ID" value={course.professorId} />
        </View>
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.statsHeading}>Estadísticas</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total de actividades</Text>
            <Text style={styles.statValue}>{activityStats.total}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Estudiantes inscritos</Text>
            <Text style={styles.statValue}>{studentsCount}</Text>
          </View>
        </View>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.quickActionsHeading}>Acciones rápidas</Text>
        <View style={styles.quickActionsRow}>
          <ActionButton
            label="Copiar código"
            onPress={onCopyCode}
            variant="secondary"
          />
          <ActionButton
            label="Compartir código"
            onPress={onShareCode}
            variant="secondary"
          />
        </View>
      </View>

      {isProfessor ? (
        <View style={styles.deleteBlock}>
          <Text style={styles.deleteHeading}>Administración del curso</Text>
          <ActionButton
            label={isDeleting ? "Eliminando..." : "Eliminar curso"}
            onPress={onDeleteCourse}
            disabled={isDeleting}
            variant="danger"
          />
          <Text style={styles.deleteHint}>
            Esta acción eliminará el curso y sus inscripciones asociadas.
          </Text>
        </View>
      ) : onLeaveCourse ? (
        <View style={styles.leaveBlock}>
          <Text style={styles.leaveHeading}>Opciones del estudiante</Text>
          <ActionButton
            label={isLeavingCourse ? "Saliendo..." : "Salir del curso"}
            onPress={onLeaveCourse}
            disabled={isLeavingCourse}
            variant="danger"
          />
          <Text style={styles.leaveHint}>
            Perderás el acceso a las actividades y necesitarás un nuevo código
            para volver a unirte.
          </Text>
        </View>
      ) : null}
    </View>
  );
}

interface InfoFieldProps {
  label: string;
  value: string;
  emphasized?: boolean;
  code?: boolean;
}

function InfoField({ label, value, emphasized, code }: InfoFieldProps) {
  return (
    <View style={styles.infoField}>
      <Text style={styles.infoFieldLabel}>{label}</Text>
      <Text
        style={[
          styles.infoFieldValue,
          emphasized ? styles.infoFieldValueEmphasized : null,
          code ? styles.infoFieldValueCode : null,
        ]}
        numberOfLines={code ? 1 : undefined}
      >
        {value}
      </Text>
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
  scroll: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 24,
    paddingBottom: 140,
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
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  bottomTabItem: {
    flex: 1,
    textAlign: "center",
    fontWeight: "600",
    color: "#6b7280",
    paddingVertical: 6,
  },
  bottomTabItemActive: {
    color: "#1d4ed8",
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
  infoCard: {
    backgroundColor: "#fdf2f8",
    borderRadius: 18,
    padding: 20,
    gap: 16,
  },
  infoCardHeading: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },
  infoFieldGroup: {
    gap: 12,
  },
  infoField: {
    gap: 4,
  },
  infoFieldLabel: {
    color: "#6b7280",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  infoFieldValue: {
    color: "#111827",
    fontSize: 16,
    lineHeight: 22,
  },
  infoFieldValueEmphasized: {
    fontWeight: "700",
    fontSize: 18,
  },
  infoFieldValueCode: {
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    letterSpacing: 0.6,
  },
  statsCard: {
    backgroundColor: "#eef2ff",
    borderRadius: 18,
    padding: 20,
    gap: 16,
  },
  statsHeading: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap",
  },
  statItem: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    gap: 8,
    shadowColor: "#1f2937",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  statLabel: {
    color: "#4b5563",
    fontWeight: "600",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1d4ed8",
  },
  quickActions: {
    backgroundColor: "#ecfeff",
    borderRadius: 18,
    padding: 20,
    gap: 16,
  },
  quickActionsHeading: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  quickActionsRow: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  deleteBlock: {
    marginTop: 24,
    gap: 8,
  },
  deleteHeading: {
    fontSize: 18,
    fontWeight: "700",
    color: "#7f1d1d",
  },
  deleteHint: {
    color: "#6b7280",
    fontSize: 13,
  },
  leaveBlock: {
    marginTop: 24,
    gap: 8,
  },
  leaveHeading: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1d4ed8",
  },
  leaveHint: {
    color: "#6b7280",
    fontSize: 13,
  },
  errorText: {
    color: "#991b1b",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
