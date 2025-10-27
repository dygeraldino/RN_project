import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { LoginScreen } from "./LoginScreen";
import { SignUpScreen } from "./SignUpScreen";
import { MainScreen } from "../../../core/presentation/screens/MainScreen";

export function AuthGate() {
  const { currentUser, initialising, mode, logout } = useAuth();

  if (initialising) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!currentUser) {
    return mode === "signup" ? <SignUpScreen /> : <LoginScreen />;
  }

  return (
    <MainScreen
      onLogout={logout}
      currentUserName={currentUser?.name ?? "Usuario"}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9fafb",
  },
});
