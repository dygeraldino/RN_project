export type CourseRole = "Profesor" | "Estudiante";

export interface Course {
  id?: string;
  title: string;
  description: string;
  code?: string | null;
  professorId: string;
  role: CourseRole;
  createdAt: Date;
  studentCount: number;
}

export interface CourseMapperOptions {
  currentUserId?: string | null;
  enrollmentCount?: number;
}

export type RawCourseRecord = Record<string, any>;

export const mapRobleCourseToDomain = (
  record: RawCourseRecord,
  options: CourseMapperOptions = {}
): Course => {
  const {
    currentUserId,
    enrollmentCount = typeof record["student_count"] === "number"
      ? (record["student_count"] as number)
      : 0,
  } = options;

  const id = typeof record["_id"] === "string" ? record["_id"] : undefined;
  const professorId =
    typeof record["professor_id"] === "string"
      ? (record["professor_id"] as string)
      : "";

  const role: CourseRole =
    currentUserId && professorId && currentUserId === professorId
      ? "Profesor"
      : "Estudiante";

  let createdAt: Date;
  const createdAtValue = record["created_at"] ?? record["createdAt"];
  if (createdAtValue) {
    const parsed = new Date(createdAtValue);
    createdAt = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  } else {
    createdAt = new Date();
  }

  return {
    id,
    title: typeof record["title"] === "string" ? record["title"] : "",
    description:
      typeof record["description"] === "string"
        ? record["description"]
        : "",
    code: typeof record["code"] === "string" ? record["code"] : null,
    professorId,
    role,
    createdAt,
    studentCount: enrollmentCount,
  };
};

export const mapCourseToRobleRecord = (course: Course): RawCourseRecord => {
  const payload: RawCourseRecord = {
    title: course.title,
    description: course.description,
    professor_id: course.professorId,
  };

  if (course.id) {
    payload["_id"] = course.id;
  }
  if (course.code) {
    payload["code"] = course.code;
  }

  return payload;
};
