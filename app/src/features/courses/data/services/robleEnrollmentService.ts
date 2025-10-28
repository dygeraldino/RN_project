import { robleDatabaseService } from "../../../core/services/robleDatabaseService";

export class RobleEnrollmentService {
  constructor(private readonly database = robleDatabaseService) {}

  async getCourseIdsByStudent(studentId: string): Promise<string[]> {
    try {
      const enrollments = await this.database.read("enrollments");
      return enrollments
        .filter((enrollment) => enrollment["student_id"] === studentId)
        .map((enrollment) => enrollment["course_id"])
        .filter((courseId): courseId is string => typeof courseId === "string");
    } catch (error) {
      console.warn("Error obteniendo inscripciones del estudiante", error);
      return [];
    }
  }

  async getStudentIdsByCourse(courseId: string): Promise<string[]> {
    try {
      const enrollments = await this.database.read("enrollments");
      return enrollments
        .filter((enrollment) => enrollment["course_id"] === courseId)
        .map((enrollment) => enrollment["student_id"])
        .filter(
          (studentId): studentId is string => typeof studentId === "string"
        );
    } catch (error) {
      console.warn("Error obteniendo estudiantes del curso", error);
      return [];
    }
  }

  async enrollStudent(
    studentId: string,
    courseId: string,
    role: string = "student"
  ): Promise<void> {
    try {
      await this.database.insert("enrollments", [
        { student_id: studentId, course_id: courseId, role },
      ]);
    } catch (error) {
      console.warn("Error inscribiendo estudiante al curso", error);
      throw error;
    }
  }

  async unenrollStudent(studentId: string, courseId: string): Promise<void> {
    try {
      const enrollments = await this.database.read("enrollments");
      const enrollment = enrollments.find(
        (current) =>
          current["student_id"] === studentId &&
          current["course_id"] === courseId
      );

      if (enrollment && typeof enrollment["_id"] === "string") {
        await this.database.delete("enrollments", enrollment["_id"]);
      }
    } catch (error) {
      console.warn("Error desinscribiendo estudiante del curso", error);
      throw error;
    }
  }

  async isStudentEnrolled(
    studentId: string,
    courseId: string
  ): Promise<boolean> {
    try {
      const enrollments = await this.database.read("enrollments");
      return enrollments.some(
        (enrollment) =>
          enrollment["student_id"] === studentId &&
          enrollment["course_id"] === courseId
      );
    } catch (error) {
      console.warn("Error verificando inscripción del estudiante", error);
      return false;
    }
  }
}

export const robleEnrollmentService = new RobleEnrollmentService();
