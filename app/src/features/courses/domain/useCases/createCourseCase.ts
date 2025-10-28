import { Course } from "../models/course";
import { CourseRepository } from "../repositories/courseRepository";

export type Result<T> = Ok<T> | Err;

export class Ok<T> {
  constructor(public readonly value: T) {}
}

export class Err {
  constructor(public readonly message: string) {}
}

export class CreateCourse {
  constructor(private readonly repository: CourseRepository) {}

  async execute(course: Course): Promise<Result<void>> {
    try {
      const existingCourses = await this.repository.getCoursesByProfessor(
        course.professorId,
        { currentUserId: course.professorId }
      );

      if (existingCourses.length >= 3) {
        return new Err(
          "Has alcanzado el límite máximo de 3 cursos. No puedes crear más cursos."
        );
      }

      await this.repository.create(course);
      return new Ok(undefined);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : `Error desconocido: ${String(error)}`;
      return new Err(`Error al crear curso: ${message}`);
    }
  }
}
