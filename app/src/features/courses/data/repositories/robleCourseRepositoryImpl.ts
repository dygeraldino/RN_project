import { Course } from "../../domain/models/course";
import { CourseRepository } from "../../domain/repositories/courseRepository";
import {
  RobleCourseService,
  robleCourseService,
} from "../services/robleCourseService";
import {
  RobleEnrollmentService,
  robleEnrollmentService,
} from "../services/robleEnrollmentService";
import {
  RobleUserService,
  robleUserService,
} from "../../../core/services/robleUserService";

export class RobleCourseRepositoryImpl implements CourseRepository {
  constructor(
    private readonly courseService: RobleCourseService = robleCourseService,
    private readonly enrollmentService: RobleEnrollmentService = robleEnrollmentService,
    private readonly userService: RobleUserService = robleUserService
  ) {}

  async create(course: Course): Promise<void> {
    await this.courseService.createCourse(course);
  }

  async getAll(options?: { currentUserId?: string | null }): Promise<Course[]> {
    return this.courseService.getAllCourses(options);
  }

  async getById(
    id: string,
    options?: { currentUserId?: string | null }
  ): Promise<Course | null> {
    return this.courseService.getCourseById(id, options);
  }

  async update(courseId: string, course: Course): Promise<void> {
    await this.courseService.updateCourse(courseId, course);
  }

  async delete(courseId: string): Promise<void> {
    await this.courseService.deleteCourse(courseId);
  }

  async getCoursesByProfessor(
    professorId: string,
    options?: { currentUserId?: string | null }
  ): Promise<Course[]> {
    return this.courseService.getCoursesByProfessor(professorId, options);
  }

  async getCoursesByStudent(
    studentId: string,
    options?: { currentUserId?: string | null }
  ): Promise<Course[]> {
    return this.courseService.getCoursesByStudent(studentId, options);
  }

  async getUsersByCourse(courseId: string): Promise<Record<string, any>[]> {
    return this.userService.getUsersByCourse(courseId);
  }

  async joinCourseByCode(parameters: {
    studentId: string;
    courseCode: string;
  }): Promise<void> {
    const { studentId, courseCode } = parameters;

    const course = await this.courseService.getCourseByCode(courseCode, {
      currentUserId: studentId,
    });

    if (!course || !course.id) {
      throw new Error("Curso no encontrado. Verifica el código.");
    }

    if (course.professorId === studentId) {
      return;
    }

    const alreadyEnrolled = await this.enrollmentService.isStudentEnrolled(
      studentId,
      course.id
    );

    if (alreadyEnrolled) {
      throw new Error("Ya estás inscrito en este curso.");
    }

    await this.enrollmentService.enrollStudent(studentId, course.id, "student");
  }
}

export const robleCourseRepository = new RobleCourseRepositoryImpl();
