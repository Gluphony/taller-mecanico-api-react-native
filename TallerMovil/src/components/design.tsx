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
          secondary && styles.buttonTextSecondary,
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
  maxLength,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "phone-pad" | "numeric" | "decimal-pad";
  multiline?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  maxLength?: number;
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
        autoCorrect={false}
        maxLength={maxLength}
        accessibilityLabel={label}
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
  wide = false,
}: {
  active: "inicio" | "clientes" | "vehiculos" | "servicios";
  onChange: (tab: "inicio" | "clientes" | "vehiculos" | "servicios") => void;
  wide?: boolean;
}) {
  const items = [
    { id: "inicio" as const, icon: "⌂", label: "Inicio" },
    { id: "clientes" as const, icon: "◉", label: "Clientes" },
    { id: "vehiculos" as const, icon: "▰", label: "Vehículos" },
    { id: "servicios" as const, icon: "↻", label: "Servicios" },
  ];
  return (
    <View style={[styles.tabDock, wide && styles.tabDockWide]}>
      {items.map((item) => {
        const selected = active === item.id;
        return (
          <Pressable
            key={item.id}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(item.id)}
            style={[styles.tabItem, wide && styles.tabItemWide]}
          >
            <View style={[styles.tabIcon, wide && styles.tabIconWide, selected && styles.tabIconSelected]}>
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
  brandRow: { flexDirection: "row", alignItems: "center", gap: 11 },
  brandCompact: { justifyContent: "center" },
  brandIcon: {
    height: 42, width: 42, borderRadius: 12,
    backgroundColor: palette.ink, alignItems: "center", justifyContent: "center",
  },
  brandGlyph: { color: palette.white, fontSize: 21, fontWeight: "800" },
  brandName: { color: palette.ink, fontSize: 14, fontWeight: "800", letterSpacing: 1.5 },
  brandCaption: { color: palette.muted, fontSize: 9, fontWeight: "700", letterSpacing: 1.1, marginTop: 3 },
  button: {
    minHeight: 48, paddingHorizontal: 18, borderWidth: 1, borderColor: palette.accent,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    borderRadius: 8,
  },
  buttonSmall: { minHeight: 42, paddingHorizontal: 14 },
  buttonPrimary: { backgroundColor: palette.accent },
  buttonSecondary: { backgroundColor: palette.white, borderColor: palette.line },
  buttonDanger: { backgroundColor: palette.dangerSoft, borderColor: palette.dangerSoft },
  buttonQuiet: { backgroundColor: "transparent", borderWidth: 0 },
  buttonDisabled: { opacity: 0.55 },
  buttonPressed: { opacity: 0.82 },
  buttonText: { color: palette.white, fontSize: typeScale.body, fontWeight: "700" },
  buttonTextPrimary: { color: palette.white },
  buttonTextSecondary: { color: palette.ink },
  buttonTextQuiet: { color: palette.inkSoft },
  buttonTextDanger: { color: palette.danger },
  field: { gap: 8, marginBottom: spacing.lg },
  fieldLabel: { color: palette.inkSoft, fontSize: typeScale.label, fontWeight: "700", letterSpacing: 0.25 },
  input: {
    minHeight: 50, borderWidth: 1, borderColor: palette.line,
    backgroundColor: palette.white, borderRadius: 8,
    paddingHorizontal: 16, paddingVertical: 12,
    fontSize: typeScale.body, color: palette.ink,
  },
  inputMultiline: { minHeight: 88, textAlignVertical: "top" },
  surface: {
    backgroundColor: palette.white, padding: 16,
    borderWidth: 1, borderColor: palette.line, borderRadius: 10,
    shadowColor: palette.shadow, shadowOpacity: 0.06, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 1,
  },
  sectionHeading: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 14, borderBottomWidth: 1,
    borderBottomColor: palette.line, paddingBottom: 10,
  },
  sectionTitle: { color: palette.ink, fontSize: typeScale.title, fontWeight: "700" },
  sectionAction: { color: palette.accent, fontSize: typeScale.body, fontWeight: "700" },
  tabDock: {
    flexDirection: "row", backgroundColor: palette.ink,
    paddingHorizontal: 8, paddingTop: 8, paddingBottom: 10,
  },
  tabDockWide: { width: 224, flexDirection: "column", alignItems: "stretch", paddingHorizontal: 14, paddingTop: 24, paddingBottom: 18, gap: 7 },
  tabItem: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4, minHeight: 56, borderRadius: 12 },
  tabItemWide: { flex: 0, minHeight: 52, flexDirection: "row", justifyContent: "flex-start", gap: 12, paddingHorizontal: 12 },
  tabIcon: { width: 42, height: 30, alignItems: "center", justifyContent: "center", borderRadius: 9 },
  tabIconWide: { width: 34, height: 34 },
  tabIconSelected: { backgroundColor: palette.accent },
  tabGlyph: { fontSize: 18, color: "#C5C4B9", fontWeight: "700" },
  tabGlyphSelected: { color: palette.white },
  tabLabel: { fontSize: 10, color: "#C5C4B9", fontWeight: "600", letterSpacing: 0.2 },
  tabLabelSelected: { color: palette.white, fontWeight: "700" },
});
