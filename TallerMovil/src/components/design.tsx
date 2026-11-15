import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
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

export function CarSilhouette({ compact = false, style }: { compact?: boolean; style?: StyleProp<ViewStyle> }) {
  return (
    <View accessibilityLabel="Silueta de automóvil" style={[styles.car, compact && styles.carCompact, style]}>
      <View style={[styles.carRoof, compact && styles.carRoofCompact]} />
      <View style={[styles.carWindow, compact && styles.carWindowCompact]} />
      <View style={[styles.carBody, compact && styles.carBodyCompact]} />
      <View style={[styles.carLight, compact && styles.carLightCompact]} />
      <View style={[styles.carWheel, styles.carWheelLeft, compact && styles.carWheelCompact, compact && styles.carWheelCompactLeft]}>
        <View style={[styles.carWheelHub, compact && styles.carWheelHubCompact]} />
      </View>
      <View style={[styles.carWheel, styles.carWheelRight, compact && styles.carWheelCompact, compact && styles.carWheelCompactRight]}>
        <View style={[styles.carWheelHub, compact && styles.carWheelHubCompact]} />
      </View>
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
    height: 44, width: 44, borderWidth: 2, borderColor: palette.ink,
    backgroundColor: palette.accent, alignItems: "center", justifyContent: "center",
  },
  brandGlyph: { color: palette.ink, fontSize: 22, fontWeight: "800" },
  brandName: { color: palette.ink, fontSize: 14, fontWeight: "900", letterSpacing: 2 },
  brandCaption: { color: palette.muted, fontSize: 9, fontWeight: "800", letterSpacing: 1.2, marginTop: 3 },
  car: { width: 176, height: 76, position: "relative" },
  carCompact: { width: 96, height: 50 },
  carRoof: { position: "absolute", left: 42, top: 1, width: 88, height: 34, backgroundColor: palette.accent, borderWidth: 2, borderColor: palette.ink, borderBottomWidth: 0, borderTopLeftRadius: 22, borderTopRightRadius: 22 },
  carRoofCompact: { left: 23, width: 50, height: 22, borderWidth: 2, borderBottomWidth: 0 },
  carWindow: { position: "absolute", left: 51, top: 9, width: 70, height: 22, backgroundColor: palette.ink },
  carWindowCompact: { left: 29, top: 7, width: 38, height: 14 },
  carBody: { position: "absolute", left: 5, right: 5, top: 29, height: 29, backgroundColor: palette.accent, borderWidth: 2, borderColor: palette.ink, zIndex: 1 },
  carBodyCompact: { left: 3, right: 3, top: 21, height: 22, borderWidth: 2 },
  carLight: { position: "absolute", right: 7, top: 40, width: 8, height: 7, backgroundColor: palette.orange, zIndex: 2 },
  carLightCompact: { right: 5, top: 28, width: 6, height: 5 },
  carWheel: { position: "absolute", top: 47, width: 25, height: 25, borderWidth: 2, borderColor: palette.ink, backgroundColor: palette.ink, alignItems: "center", justifyContent: "center", zIndex: 3 },
  carWheelLeft: { left: 27 },
  carWheelRight: { right: 27 },
  carWheelCompact: { top: 35, width: 18, height: 18, borderWidth: 2 },
  carWheelCompactLeft: { left: 14 },
  carWheelCompactRight: { right: 14 },
  carWheelHub: { width: 9, height: 9, backgroundColor: palette.white },
  carWheelHubCompact: { width: 6, height: 6 },
  button: {
    minHeight: 50, paddingHorizontal: 18, borderWidth: 2, borderColor: palette.ink,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    shadowColor: palette.shadow, shadowOpacity: 1, shadowRadius: 0,
    shadowOffset: { width: 4, height: 4 }, elevation: 3,
  },
  buttonSmall: { minHeight: 44, paddingHorizontal: 14 },
  buttonPrimary: { backgroundColor: palette.accent },
  buttonSecondary: { backgroundColor: palette.white },
  buttonDanger: { backgroundColor: palette.dangerSoft },
  buttonQuiet: { backgroundColor: "transparent", borderWidth: 0, shadowOpacity: 0, elevation: 0 },
  buttonDisabled: { opacity: 0.62 },
  buttonPressed: { opacity: 0.9, transform: [{ translateX: 3 }, { translateY: 3 }] },
  buttonText: { color: palette.ink, fontSize: typeScale.body, fontWeight: "900", letterSpacing: 0.3 },
  buttonTextPrimary: { color: palette.inkDeep },
  buttonTextQuiet: { color: palette.inkSoft },
  buttonTextDanger: { color: palette.danger },
  field: { gap: 8, marginBottom: spacing.lg },
  fieldLabel: { color: palette.inkSoft, fontSize: typeScale.label, fontWeight: "900", letterSpacing: 1 },
  input: {
    minHeight: 52, borderWidth: 2, borderColor: palette.ink,
    backgroundColor: palette.white,
    paddingHorizontal: 16, paddingVertical: 12,
    fontSize: typeScale.body, color: palette.ink,
  },
  inputMultiline: { minHeight: 88, textAlignVertical: "top" },
  surface: {
    backgroundColor: palette.white, padding: 16,
    borderWidth: 2, borderColor: palette.ink,
    shadowColor: palette.shadow, shadowOpacity: 1, shadowRadius: 0,
    shadowOffset: { width: 4, height: 4 }, elevation: 3,
  },
  sectionHeading: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 14, borderBottomWidth: 2,
    borderBottomColor: palette.ink, paddingBottom: 10,
  },
  sectionTitle: { color: palette.ink, fontSize: typeScale.title, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.3 },
  sectionAction: { color: palette.success, fontSize: typeScale.body, fontWeight: "900" },
  tabDock: {
    flexDirection: "row", backgroundColor: palette.ink,
    paddingHorizontal: 8, paddingTop: 8, paddingBottom: 10,
    borderTopWidth: 3, borderTopColor: palette.accent,
  },
  tabItem: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4, minHeight: 56 },
  tabIcon: { width: 42, height: 30, alignItems: "center", justifyContent: "center" },
  tabIconSelected: { backgroundColor: palette.accent },
  tabGlyph: { fontSize: 18, color: palette.white, fontWeight: "900" },
  tabGlyphSelected: { color: palette.ink },
  tabLabel: { fontSize: 10, color: palette.white, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.4 },
  tabLabelSelected: { color: palette.accent, fontWeight: "900" },
});
