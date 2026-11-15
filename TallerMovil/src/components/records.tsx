import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Cliente, Mantenimiento, Vehiculo } from "@/api";
import { palette, typeScale } from "@/theme";
import { Surface } from "./design";

export function MetricCard({
  value,
  label,
  glyph,
  tint,
}: {
  value: number;
  label: string;
  glyph: string;
  tint: string;
}) {
  return (
    <Surface style={styles.metric}>
      <View style={[styles.metricGlyph, { backgroundColor: tint }]}>
        <Text style={styles.metricGlyphText}>{glyph}</Text>
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </Surface>
  );
}

export function ClientCard({
  cliente,
  onPress,
}: {
  cliente: Cliente;
  onPress: () => void;
}) {
  const initials = cliente.nombreCompleto
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      <Surface style={styles.recordCard}>
        <View style={styles.recordIcon}>
          <Text style={styles.recordIconText}>{initials || "C"}</Text>
        </View>
        <View style={styles.recordBody}>
          <Text style={styles.recordTitle}>{cliente.nombreCompleto}</Text>
          <Text style={styles.recordSub}>
            {cliente.telefono || cliente.email || "Sin datos de contacto"}
          </Text>
          {!!cliente.email && !!cliente.telefono && (
            <Text style={styles.recordMeta}>{cliente.email}</Text>
          )}
        </View>
        <View style={styles.recordArrow}>
          <Text style={styles.recordArrowText}>›</Text>
        </View>
      </Surface>
    </Pressable>
  );
}

export function VehicleCard({
  vehiculo,
  onHistory,
  onEdit,
}: {
  vehiculo: Vehiculo;
  onHistory: () => void;
  onEdit: () => void;
}) {
  return (
    <Surface style={styles.vehicleCard}>
      <View style={styles.vehicleTop}>
        <View style={styles.vehicleGlyph}>
          <Text style={styles.vehicleGlyphText}>▰</Text>
        </View>
        <View style={styles.vehiclePlate}>
          <Text style={styles.vehiclePlateText}>{vehiculo.placa}</Text>
        </View>
      </View>
      <Text style={styles.vehicleTitle}>
        {vehiculo.marca} {vehiculo.modelo}
      </Text>
      <Text style={styles.vehicleId}>UNIDAD / {String(vehiculo.id).padStart(3, "0")}</Text>
      <Text style={styles.recordSub}>
        {vehiculo.clienteNombre || "Cliente"}{vehiculo.anio ? " · " + vehiculo.anio : ""}
      </Text>
      <View style={styles.vehicleActions}>
        <Pressable onPress={onHistory} style={styles.historyButton}>
          <Text style={styles.historyButtonText}>Ver historial  ›</Text>
        </Pressable>
        <Pressable onPress={onEdit} style={styles.editButton} hitSlop={8}>
          <Text style={styles.editButtonText}>Editar</Text>
        </Pressable>
      </View>
    </Surface>
  );
}

export function ServiceCard({ servicio }: { servicio: Mantenimiento }) {
  const date = new Date(servicio.fechaServicio);
  const day = Number.isNaN(date.getTime()) ? "--" : date.getDate().toString().padStart(2, "0");
  const month = Number.isNaN(date.getTime())
    ? "---"
    : date.toLocaleDateString("es-NI", { month: "short" }).replace(".", "");
  return (
    <Surface style={styles.serviceCard}>
      <View style={styles.dateBadge}>
        <Text style={styles.dateDay}>{day}</Text>
        <Text style={styles.dateMonth}>{month}</Text>
      </View>
      <View style={styles.recordBody}>
        <Text style={styles.recordTitle}>{servicio.tipoServicio}</Text>
        <Text style={styles.recordSub}>
          {(servicio.placa || "Vehículo") + " · " + (servicio.marca || "") + " " + (servicio.modelo || "")}
        </Text>
        <Text style={styles.recordMeta} numberOfLines={1}>{servicio.descripcion}</Text>
      </View>
      <View style={styles.costBox}>
        <Text style={styles.costLabel}>COSTO</Text>
        <Text style={styles.costValue}>
          {new Intl.NumberFormat("es-NI", { style: "currency", currency: "NIO", maximumFractionDigits: 0 }).format(servicio.costo || 0)}
        </Text>
      </View>
    </Surface>
  );
}

export function EmptyCard({
  title,
  detail,
  action,
  onPress,
}: {
  title: string;
  detail: string;
  action: string;
  onPress: () => void;
}) {
  return (
    <Surface style={styles.emptyCard}>
      <View style={styles.emptyGlyph}>
        <Text style={styles.emptyGlyphText}>+</Text>
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDetail}>{detail}</Text>
      <Pressable onPress={onPress} style={styles.emptyAction}>
        <Text style={styles.emptyActionText}>{action}  →</Text>
      </Pressable>
    </Surface>
  );
}

const styles = StyleSheet.create({
  metric: { flex: 1, minWidth: 92, padding: 14, minHeight: 126, borderBottomWidth: 5, borderBottomColor: palette.accent },
  metricGlyph: {
    width: 34, height: 34, borderWidth: 2, borderColor: palette.ink,
    justifyContent: "center", alignItems: "center",
  },
  metricGlyphText: { color: palette.ink, fontSize: 17, fontWeight: "900" },
  metricValue: { color: palette.ink, fontSize: 26, fontWeight: "900", marginTop: 12, fontVariant: ["tabular-nums"] },
  metricLabel: { color: palette.muted, fontSize: typeScale.label, fontWeight: "800", marginTop: 2, textTransform: "uppercase" },
  recordCard: {
    flexDirection: "row", alignItems: "center", padding: 14, marginBottom: 12,
    gap: 12,
  },
  recordIcon: {
    width: 44, height: 44, borderWidth: 2, borderColor: palette.ink,
    backgroundColor: palette.accent, alignItems: "center", justifyContent: "center",
  },
  recordIconText: { color: palette.ink, fontSize: 14, fontWeight: "900" },
  recordBody: { flex: 1, minWidth: 0 },
  recordTitle: { color: palette.ink, fontSize: typeScale.body, fontWeight: "900", textTransform: "uppercase" },
  recordSub: { color: palette.muted, fontSize: typeScale.label, marginTop: 4, fontWeight: "700" },
  recordMeta: { color: palette.inkSoft, fontSize: typeScale.label, marginTop: 5 },
  recordArrow: {
    width: 32, height: 32, borderWidth: 2, borderColor: palette.ink,
    alignItems: "center", justifyContent: "center", backgroundColor: palette.accent,
  },
  recordArrowText: { color: palette.ink, fontSize: 22, fontWeight: "900", marginTop: -2 },
  pressed: { opacity: 0.8 },
  vehicleCard: { marginBottom: 12, padding: 16, borderBottomWidth: 5, borderBottomColor: palette.orange },
  vehicleTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  vehicleGlyph: {
    width: 38, height: 38, backgroundColor: palette.ink,
    alignItems: "center", justifyContent: "center",
  },
  vehicleGlyphText: { fontSize: 17, color: palette.accent, fontWeight: "900" },
  vehiclePlate: {
    paddingVertical: 6, paddingHorizontal: 10,
    backgroundColor: palette.white, borderWidth: 2, borderColor: palette.ink,
  },
  vehiclePlateText: { fontSize: 11, fontWeight: "900", letterSpacing: 1.2, color: palette.ink, fontVariant: ["tabular-nums"] },
  vehicleTitle: { fontSize: typeScale.title, fontWeight: "900", color: palette.ink, marginTop: 14, textTransform: "uppercase" },
  vehicleId: { color: palette.orange, fontSize: 10, fontWeight: "900", letterSpacing: 1, marginTop: 5 },
  vehicleActions: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    borderTopWidth: 2, borderTopColor: palette.ink, marginTop: 16, paddingTop: 12,
  },
  historyButton: { minHeight: 44, justifyContent: "center", paddingRight: 12 },
  historyButtonText: { color: palette.success, fontSize: typeScale.body, fontWeight: "900", textTransform: "uppercase" },
  editButton: { minHeight: 40, justifyContent: "center", paddingHorizontal: 12, backgroundColor: palette.accent, borderWidth: 2, borderColor: palette.ink },
  editButtonText: { color: palette.ink, fontSize: typeScale.label, fontWeight: "900", textTransform: "uppercase" },
  serviceCard: {
    flexDirection: "row", alignItems: "center", gap: 12, padding: 14,
    marginBottom: 12,
  },
  dateBadge: {
    width: 48, height: 54, borderWidth: 2, borderColor: palette.ink, alignItems: "center",
    justifyContent: "center", backgroundColor: palette.orange,
  },
  dateDay: { color: palette.ink, fontSize: 18, fontWeight: "900", lineHeight: 20, fontVariant: ["tabular-nums"] },
  dateMonth: { color: palette.ink, fontSize: 10, fontWeight: "900", textTransform: "uppercase" },
  costBox: { alignItems: "flex-end", marginLeft: 4, backgroundColor: palette.accent, padding: 8, borderWidth: 2, borderColor: palette.ink },
  costLabel: { color: palette.inkSoft, fontSize: 9, fontWeight: "900", letterSpacing: 0.8 },
  costValue: { color: palette.ink, fontSize: 12, fontWeight: "900", marginTop: 4 },
  emptyCard: { alignItems: "center", paddingVertical: 28 },
  emptyGlyph: {
    width: 46, height: 46, borderWidth: 2, borderColor: palette.ink, backgroundColor: palette.accent,
    justifyContent: "center", alignItems: "center",
  },
  emptyGlyphText: { color: palette.ink, fontSize: 24, fontWeight: "900" },
  emptyTitle: { color: palette.ink, fontWeight: "900", fontSize: typeScale.body, marginTop: 12, textTransform: "uppercase" },
  emptyDetail: { color: palette.muted, fontSize: typeScale.label, textAlign: "center", marginTop: 6, maxWidth: 250 },
  emptyAction: { minHeight: 44, paddingHorizontal: 14, justifyContent: "center", marginTop: 8, backgroundColor: palette.ink },
  emptyActionText: { color: palette.accent, fontWeight: "900", fontSize: typeScale.body, textTransform: "uppercase" },
});
