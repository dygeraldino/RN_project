import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export function LoginScreen() {
  const {
    login,
    isLoading,
    error,
    rememberMe,
    setRememberMe,
    savedEmail,
    setSavedEmail,
    setMode,
  } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [obscure, setObscure] = useState(true);

  useEffect(() => {
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, [savedEmail]);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      return;
    }
    setSavedEmail(email.trim());
    await login(email.trim(), password, { remember: rememberMe });
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.title}>Bienvenido</Text>
          <View style={styles.imageWrapper}>
            <ImageBackground
              source={{
                uri: 'https://img.freepik.com/premium-photo/imagen-de-un-salon-de-clases_1134706-19.jpg?w=2000',
              }}
              style={styles.image}
              imageStyle={styles.imageRadius}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="tucorreo@ejemplo.com"
              style={styles.input}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry={obscure}
                autoCapitalize="none"
                placeholder="••••••••"
                style={[styles.input, styles.passwordInput]}
              />
              <Pressable
                onPress={() => setObscure((prev) => !prev)}
                style={styles.iconButton}
              >
                <Ionicons
                  name={obscure ? 'eye-off' : 'eye'}
                  size={20}
                  color="#1f2937"
                />
              </Pressable>
            </View>
          </View>
          <View style={styles.rememberRow}>
            <Switch
              value={rememberMe}
              onValueChange={setRememberMe}
              thumbColor={rememberMe ? '#2563eb' : '#d1d5db'}
              trackColor={{ false: '#e5e7eb', true: '#bfdbfe' }}
            />
            <Text style={styles.rememberLabel}>Recordarme</Text>
          </View>
          {error ? (
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle" size={18} color="#dc2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
          <Pressable
            style={styles.submitButton}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitLabel}>Iniciar sesión</Text>
            )}
          </Pressable>
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>¿No tienes cuenta?</Text>
            <Pressable onPress={() => setMode('signup')}>
              <Text style={styles.footerLink}>Crear una cuenta</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#eff6ff' },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
  },
  imageWrapper: {
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  image: {
    flex: 1,
  },
  imageRadius: {
    borderRadius: 16,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    paddingRight: 44,
  },
  iconButton: {
    position: 'absolute',
    right: 12,
    height: '100%',
    justifyContent: 'center',
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  rememberLabel: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  errorText: {
    color: '#b91c1c',
    fontWeight: '600',
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#2563eb',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
    gap: 6,
  },
  footerText: {
    color: '#6b7280',
  },
  footerLink: {
    color: '#2563eb',
    fontWeight: '600',
  },
});
