import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Course as DomainCourse,
  CourseRepository,
  robleCourseRepository,
} from "../../../courses";

export interface HomeCourse {
  id?: string;
  title: string;
  role: string;
  createdAt: Date;
  students: number;
  description?: string;
}

export enum SortOption {
  nameAsc = "nameAsc",
  nameDesc = "nameDesc",
  dateAsc = "dateAsc",
  dateDesc = "dateDesc",
  studentsAsc = "studentsAsc",
  studentsDesc = "studentsDesc",
}

export interface HomeControllerOptions {
  initialCourses?: HomeCourse[];
  currentUserName?: string;
  currentUserId?: string | null;
  repository?: CourseRepository;
  onLogout?: () => void;
}

const DEFAULT_COURSES: HomeCourse[] = [
  {
    id: "1",
    title: "Alicia's Course",
    role: "Estudiante",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    students: 25,
    description: "Curso introductorio de programación",
  },
  {
    id: "2",
    title: "UI/UX Design",
    role: "Estudiante",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    students: 18,
    description: "Fundamentos de diseño de interfaces",
  },
  {
    id: "3",
    title: "DATA STRUCTURE II",
    role: "Estudiante",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    students: 30,
    description: "Estructuras de datos avanzadas",
  },
  {
    id: "4",
    title: "Desarrollo Móvil",
    role: "Profesor",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    students: 22,
    description: "Desarrollo de aplicaciones móviles nativas",
  },
  {
    id: "5",
    title: "Flutter Avanzado",
    role: "Profesor",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    students: 15,
    description: "Desarrollo avanzado con Flutter",
  },
  {
    id: "6",
    title: "JavaScript Básico",
    role: "Estudiante",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    students: 35,
    description: "Fundamentos de JavaScript",
  },
];

export function useHomeController(options: HomeControllerOptions = {}) {
  const {
    initialCourses = DEFAULT_COURSES,
    currentUserName = "Usuario",
    currentUserId = null,
    repository: providedRepository,
    onLogout,
  } = options;

  const repository = providedRepository ?? robleCourseRepository;

  const [courses, setCourses] = useState<HomeCourse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeRoleFilter, setActiveRoleFilter] = useState<string | null>(null);
  const [currentSort, setCurrentSort] = useState<SortOption>(
    SortOption.nameAsc
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allCoursesRef = useRef<HomeCourse[]>([]);

  const normalizeHomeCourse = useCallback(
    (course: HomeCourse): HomeCourse => ({
      ...course,
      createdAt:
        course.createdAt instanceof Date
          ? course.createdAt
          : new Date(course.createdAt),
    }),
    []
  );

  const mapDomainCourseToHomeCourse = useCallback(
    (course: DomainCourse): HomeCourse => ({
      id: course.id ?? undefined,
      title: course.title,
      role: course.role,
      createdAt: course.createdAt,
      students: course.studentCount,
      description: course.description,
    }),
    []
  );

  const activeFilters = useMemo(
    () => (activeRoleFilter ? 1 : 0),
    [activeRoleFilter]
  );

  const sortLabel = useMemo(() => {
    switch (currentSort) {
      case SortOption.nameAsc:
        return "Nombre A-Z";
      case SortOption.nameDesc:
        return "Nombre Z-A";
      case SortOption.dateAsc:
        return "Más antiguos";
      case SortOption.dateDesc:
        return "Más recientes";
      case SortOption.studentsAsc:
        return "Menos estudiantes";
      case SortOption.studentsDesc:
        return "Más estudiantes";
      default:
        return "Nombre A-Z";
    }
  }, [currentSort]);

  const applyFilters = useCallback(() => {
    const role = activeRoleFilter;
    const query = searchQuery.trim().toLowerCase();

    let filtered = [...allCoursesRef.current];

    if (role) {
      filtered = filtered.filter((course) => course.role === role);
    }

    if (query) {
      filtered = filtered.filter((course) =>
        course.title.toLowerCase().includes(query)
      );
    }

    filtered.sort((a, b) => {
      switch (currentSort) {
        case SortOption.nameAsc:
          return a.title.localeCompare(b.title);
        case SortOption.nameDesc:
          return b.title.localeCompare(a.title);
        case SortOption.dateAsc:
          return a.createdAt.getTime() - b.createdAt.getTime();
        case SortOption.dateDesc:
          return b.createdAt.getTime() - a.createdAt.getTime();
        case SortOption.studentsAsc:
          return a.students - b.students;
        case SortOption.studentsDesc:
          return b.students - a.students;
        default:
          return 0;
      }
    });

    setCourses(filtered);
  }, [activeRoleFilter, searchQuery, currentSort]);

  const loadCourses = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (currentUserId) {
        const [studentCourses, professorCourses] = await Promise.all([
          repository.getCoursesByStudent(currentUserId, {
            currentUserId,
          }),
          repository.getCoursesByProfessor(currentUserId, {
            currentUserId,
          }),
        ]);

        const merged = new Map<string, DomainCourse>();
        const register = (course: DomainCourse) => {
          const key = course.id ?? `${course.title}|${course.professorId}`;
          if (!merged.has(key)) {
            merged.set(key, course);
          }
        };

        studentCourses.forEach(register);
        professorCourses.forEach(register);

        const domainCourses = Array.from(merged.values());
        allCoursesRef.current = domainCourses.map(mapDomainCourseToHomeCourse);
      } else {
        allCoursesRef.current = initialCourses.map(normalizeHomeCourse);
      }

      applyFilters();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      allCoursesRef.current = initialCourses.map(normalizeHomeCourse);
      applyFilters();
    } finally {
      setIsLoading(false);
    }
  }, [
    applyFilters,
    currentUserId,
    initialCourses,
    mapDomainCourseToHomeCourse,
    normalizeHomeCourse,
    repository,
  ]);

  useEffect(() => {
    void loadCourses();
  }, [loadCourses]);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, activeRoleFilter, currentSort, applyFilters]);

  const setRoleFilter = useCallback((role: string | null) => {
    setActiveRoleFilter(role);
  }, []);

  const clearRoleFilter = useCallback(() => {
    setActiveRoleFilter(null);
  }, []);

  const addCourse = useCallback(
    (course: HomeCourse) => {
      const normalized = normalizeHomeCourse(course);
      allCoursesRef.current = [...allCoursesRef.current, normalized];
      applyFilters();
    },
    [applyFilters, normalizeHomeCourse]
  );

  const logout = useCallback(() => {
    onLogout?.();
  }, [onLogout]);

  const activeRoleFilterLabel = useMemo(() => {
    switch (activeRoleFilter) {
      case "Profesor":
        return "Profesor";
      case "Estudiante":
        return "Estudiante";
      default:
        return "";
    }
  }, [activeRoleFilter]);

  return {
    courses,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    activeRoleFilter,
    setRoleFilter,
    clearRoleFilter,
    activeFilters,
    currentSort,
    setSortOption: setCurrentSort,
    sortLabel,
    activeRoleFilterLabel,
    currentUserName,
    addCourse,
    logout,
    reload: loadCourses,
  };
}
