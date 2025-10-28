import { useCallback, useMemo, useState } from "react";
import { useAuth } from "../../../auth";
import { CourseRepository, robleCourseRepository } from "../../index";

export interface UseJoinCourseControllerOptions {
  repository?: CourseRepository;
  onSuccess?: () => void;
}

export function useJoinCourseController(
  options: UseJoinCourseControllerOptions = {}
) {
  const { repository = robleCourseRepository, onSuccess } = options;
  const { currentUser } = useAuth();

  const [code, setCode] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmedCode = useMemo(() => code.trim(), [code]);

  const reset = useCallback(() => {
    setCode("");
    setError(null);
  }, []);

  const submit = useCallback(async () => {
    if (!currentUser) {
      setError("Usuario no autenticado");
      return;
    }

    if (!trimmedCode) {
      setError("Ingresa el código del curso");
      return;
    }

    const studentId =
      currentUser.uuid ?? (currentUser.id ? String(currentUser.id) : "");

    if (!studentId) {
      setError("No se pudo determinar el identificador del usuario");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await repository.joinCourseByCode({
        studentId,
        courseCode: trimmedCode,
      });
      onSuccess?.();
      reset();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }, [currentUser, trimmedCode, repository, onSuccess, reset]);

  return {
    code,
    setCode,
    submit,
    reset,
    isSubmitting,
    error,
    canSubmit: Boolean(trimmedCode) && !isSubmitting,
  };
}
