export interface Student {
  id?: string | number | null;
  name: string;
  email: string;
  profileImage?: string | null;
  enrolledAt: Date;
  courseId: string;
  averageGrade?: number | null;
  completedActivities: number;
  totalActivities: number;
}

export interface StudentJson {
  id?: string | number | null;
  name: string;
  email: string;
  profileImage?: string | null;
  enrolledAt: string;
  courseId: string;
  averageGrade?: number | null;
  completedActivities?: number;
  totalActivities?: number;
}

export const mapJsonToStudent = (json: StudentJson): Student => ({
  id: json.id ?? null,
  name: json.name,
  email: json.email,
  profileImage: json.profileImage ?? null,
  enrolledAt: new Date(json.enrolledAt),
  courseId: json.courseId,
  averageGrade: json.averageGrade ?? null,
  completedActivities: json.completedActivities ?? 0,
  totalActivities: json.totalActivities ?? 0,
});

export const mapStudentToJson = (student: Student): StudentJson => ({
  id: student.id ?? null,
  name: student.name,
  email: student.email,
  profileImage: student.profileImage ?? null,
  enrolledAt: student.enrolledAt.toISOString(),
  courseId: student.courseId,
  averageGrade: student.averageGrade ?? null,
  completedActivities: student.completedActivities,
  totalActivities: student.totalActivities,
});

export const getProgressPercentage = (student: Student): number => {
  if (!student.totalActivities) {
    return 0;
  }
  return (student.completedActivities / student.totalActivities) * 100;
};
