import { Course } from "../models/course";

export interface CourseRepository {
  create(course: Course): Promise<void>;
  getAll(options?: { currentUserId?: string | null }): Promise<Course[]>;
  getById(
    id: string,
    options?: { currentUserId?: string | null }
  ): Promise<Course | null>;
  update(courseId: string, course: Course): Promise<void>;
  delete(courseId: string): Promise<void>;
  getCoursesByProfessor(
    professorId: string,
    options?: { currentUserId?: string | null }
  ): Promise<Course[]>;
  getCoursesByStudent(
    studentId: string,
    options?: { currentUserId?: string | null }
  ): Promise<Course[]>;
  getUsersByCourse(courseId: string): Promise<Record<string, any>[]>;
  joinCourseByCode(parameters: {
    studentId: string;
    courseCode: string;
  }): Promise<void>;
  leaveCourse(parameters: {
    studentId: string;
    courseId: string;
  }): Promise<void>;
}
