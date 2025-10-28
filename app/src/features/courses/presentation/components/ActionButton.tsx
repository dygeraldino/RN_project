import { Pressable, StyleSheet, Text } from "react-native";

export type ActionButtonVariant = "primary" | "secondary" | "danger";

export interface ActionButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: ActionButtonVariant;
}

export function ActionButton({
  label,
  onPress,
  disabled,
  variant = "primary",
}: ActionButtonProps) {
  const isSecondary = variant === "secondary";
  const isDanger = variant === "danger";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        isDanger
          ? styles.danger
          : isSecondary
          ? styles.secondary
          : styles.primary,
        disabled ? styles.disabled : undefined,
        pressed ? styles.pressed : undefined,
      ]}
    >
      <Text
        style={[
          styles.label,
          isDanger
            ? styles.labelDanger
            : isSecondary
            ? styles.labelSecondary
            : styles.labelPrimary,
          disabled ? styles.labelDisabled : undefined,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  primary: {
    backgroundColor: "#2563eb",
  },
  secondary: {
    backgroundColor: "#e0f2fe",
  },
  danger: {
    backgroundColor: "#ef4444",
  },
  disabled: {
    backgroundColor: "#cbd5f5",
  },
  pressed: {
    opacity: 0.9,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
  labelPrimary: {
    color: "#fff",
  },
  labelSecondary: {
    color: "#075985",
  },
  labelDanger: {
    color: "#fff",
  },
  labelDisabled: {
    color: "#f3f4f6",
  },
});
