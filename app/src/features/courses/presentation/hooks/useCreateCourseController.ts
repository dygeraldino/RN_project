import { useCallback, useMemo, useState } from "react";
import { useAuth } from "../../../auth";
import {
  Course,
  CourseRepository,
  CreateCourse,
  Err,
  Ok,
  robleCourseRepository,
} from "../../index";

export interface UseCreateCourseControllerOptions {
  repository?: CourseRepository;
  onSuccess?: (course?: Course) => void;
}

interface FormState {
  title: string;
  description: string;
}

export function useCreateCourseController(
  options: UseCreateCourseControllerOptions = {}
) {
  const { repository = robleCourseRepository, onSuccess } = options;
  const { currentUser } = useAuth();

  const [form, setForm] = useState<FormState>({ title: "", description: "" });
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const useCase = useMemo(() => new CreateCourse(repository), [repository]);

  const updateField = useCallback((key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const reset = useCallback(() => {
    setForm({ title: "", description: "" });
    setError(null);
  }, []);

  const submit = useCallback(async () => {
    if (!currentUser) {
      setError("Usuario no autenticado");
      return;
    }

    const title = form.title.trim();
    const description = form.description.trim();

    if (!title) {
      setError("El nombre del curso es obligatorio");
      return;
    }

    setSubmitting(true);
    setError(null);

    const professorId =
      currentUser.uuid ?? (currentUser.id ? String(currentUser.id) : "");

    const course: Course = {
      title,
      description,
      professorId,
      role: "Profesor",
      createdAt: new Date(),
      studentCount: 0,
    };

    try {
      const result = await useCase.execute(course);
      if (result instanceof Ok) {
        onSuccess?.(course);
        reset();
      } else if (result instanceof Err) {
        setError(result.message);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }, [currentUser, form.description, form.title, onSuccess, reset, useCase]);

  const canSubmit = useMemo(() => {
    return Boolean(form.title.trim()) && !isSubmitting;
  }, [form.title, isSubmitting]);

  return {
    form,
    updateField,
    submit,
    reset,
    canSubmit,
    isSubmitting,
    error,
  };
}
