import { useCallback, useMemo, useState } from "react";

export function useMainNavigationController() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentTitle = useMemo(() => {
    switch (currentIndex) {
      case 0:
        return "Cursos";
      case 1:
        return "";
      case 2:
        return "Perfil";
      default:
        return "Cursos";
    }
  }, [currentIndex]);

  const changeTab = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  return {
    currentIndex,
    changeTab,
    currentTitle,
  };
}
