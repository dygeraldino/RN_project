import { AuthGate, AuthProvider } from "./src/features/auth";

export default function Index() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
