import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { palette, spacing, typeScale } from "@/theme";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <View style={[styles.brandRow, compact && styles.brandCompact]}>
      <View style={styles.brandIcon}>
        <Text style={styles.brandGlyph}>T</Text>
      </View>
      {!compact && (
        <View>
          <Text style={styles.brandName}>TALLER</Text>
          <Text style={styles.brandCaption}>GESTIÓN DE SERVICIO</Text>
        </View>
      )}
    </View>
  );
}

export function Button({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  small = false,
}: {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "quiet" | "danger";
  loading?: boolean;
  disabled?: boolean;
  small?: boolean;
}) {
  const primary = variant === "primary";
  const secondary = variant === "secondary";
  const danger = variant === "danger";
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        small && styles.buttonSmall,
        primary && styles.buttonPrimary,
        secondary && styles.buttonSecondary,
        danger && styles.buttonDanger,
        variant === "quiet" && styles.buttonQuiet,
        (disabled || loading) && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={primary ? palette.inkDeep : palette.ink} />
      ) : (
        <Text style={[
          styles.buttonText,
          primary && styles.buttonTextPrimary,
          variant === "quiet" && styles.buttonTextQuiet,
          danger && styles.buttonTextDanger,
        ]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  multiline = false,
  autoCapitalize = "sentences",
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "phone-pad" | "numeric" | "decimal-pad";
  multiline?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={palette.muted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
        autoCapitalize={autoCapitalize}
        style={[styles.input, multiline && styles.inputMultiline]}
      />
    </View>
  );
}

export function Surface({
  children,
  style,
}: {
  children: ReactNode;
  style?: object;
}) {
  return <View style={[styles.surface, style]}>{children}</View>;
}

export function SectionHeading({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {!!action && !!onAction && (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={styles.sectionAction}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}

export function TabBar({
  active,
  onChange,
}: {
  active: "inicio" | "clientes" | "vehiculos" | "servicios";
  onChange: (tab: "inicio" | "clientes" | "vehiculos" | "servicios") => void;
}) {
  const items = [
    { id: "inicio" as const, icon: "⌂", label: "Inicio" },
    { id: "clientes" as const, icon: "◉", label: "Clientes" },
    { id: "vehiculos" as const, icon: "▰", label: "Vehículos" },
    { id: "servicios" as const, icon: "↻", label: "Servicios" },
  ];
  return (
    <View style={styles.tabDock}>
      {items.map((item) => {
        const selected = active === item.id;
        return (
          <Pressable
            key={item.id}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(item.id)}
            style={styles.tabItem}
          >
            <View style={[styles.tabIcon, selected && styles.tabIconSelected]}>
              <Text style={[styles.tabGlyph, selected && styles.tabGlyphSelected]}>
                {item.icon}
              </Text>
            </View>
            <Text style={[styles.tabLabel, selected && styles.tabLabelSelected]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  brandRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  brandCompact: { justifyContent: "center" },
  brandIcon: {
    height: 40, width: 40, borderRadius: 14,
    backgroundColor: palette.accent, alignItems: "center", justifyContent: "center",
  },
  brandGlyph: { color: palette.ink, fontSize: 22, fontWeight: "800" },
  brandName: { color: palette.ink, fontSize: 14, fontWeight: "800", letterSpacing: 1.5 },
  brandCaption: { color: palette.muted, fontSize: 9, fontWeight: "700", letterSpacing: 1.2, marginTop: 2 },
  button: {
    minHeight: 48, paddingHorizontal: 18, borderRadius: 16,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
  },
  buttonSmall: { minHeight: 40, borderRadius: 14, paddingHorizontal: 14 },
  buttonPrimary: { backgroundColor: palette.accent },
  buttonSecondary: { backgroundColor: palette.white, borderWidth: 1, borderColor: palette.line },
  buttonDanger: { backgroundColor: palette.dangerSoft },
  buttonQuiet: { backgroundColor: "transparent" },
  buttonDisabled: { opacity: 0.62 },
  buttonPressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  buttonText: { color: palette.ink, fontSize: typeScale.body, fontWeight: "700" },
  buttonTextPrimary: { color: palette.inkDeep },
  buttonTextQuiet: { color: palette.inkSoft },
  buttonTextDanger: { color: palette.danger },
  field: { gap: 8, marginBottom: spacing.lg },
  fieldLabel: { color: palette.inkSoft, fontSize: typeScale.label, fontWeight: "700", letterSpacing: 0.4 },
  input: {
    minHeight: 52, borderWidth: 1, borderColor: palette.line,
    borderRadius: 15, backgroundColor: palette.white,
    paddingHorizontal: 16, paddingVertical: 12,
    fontSize: typeScale.body, color: palette.ink,
  },
  inputMultiline: { minHeight: 88, textAlignVertical: "top" },
  surface: {
    backgroundColor: palette.white, borderRadius: 22, padding: 20,
    borderWidth: 1, borderColor: "rgba(24, 53, 47, 0.05)",
    shadowColor: palette.shadow, shadowOpacity: 1, shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 }, elevation: 2,
  },
  sectionHeading: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 14,
  },
  sectionTitle: { color: palette.ink, fontSize: typeScale.title, fontWeight: "700" },
  sectionAction: { color: palette.success, fontSize: typeScale.body, fontWeight: "700" },
  tabDock: {
    flexDirection: "row", backgroundColor: palette.white,
    paddingHorizontal: 8, paddingTop: 10, paddingBottom: 12,
    borderTopWidth: 1, borderTopColor: palette.line,
  },
  tabItem: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4, minHeight: 52 },
  tabIcon: { width: 44, height: 30, alignItems: "center", justifyContent: "center", borderRadius: 12 },
  tabIconSelected: { backgroundColor: palette.accentSoft },
  tabGlyph: { fontSize: 18, color: palette.muted, fontWeight: "700" },
  tabGlyphSelected: { color: palette.ink },
  tabLabel: { fontSize: 10, color: palette.muted, fontWeight: "600" },
  tabLabelSelected: { color: palette.ink, fontWeight: "800" },
});
