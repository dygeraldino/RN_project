import { Alert } from "react-native";
import { MainScreen } from "./src/features/core";

export default function Index() {
  const handleLogout = () => {
    Alert.alert("Cerrar sesión", "Funcionalidad pendiente de implementación.");
  };

  return (
    <MainScreen
      onLogout={handleLogout}
      onCreateCourse={() => {
        Alert.alert("Crear curso", "Navegación pendiente de implementación.");
      }}
      onNavigateToSettings={() => {
        Alert.alert("Configuración", "Navegación pendiente de implementación.");
      }}
    />
  );
}
