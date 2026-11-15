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
  metric: { flex: 1, minWidth: 92, padding: 16, minHeight: 120, borderRadius: 15 },
  metricGlyph: {
    width: 34, height: 34, borderRadius: 11,
    justifyContent: "center", alignItems: "center",
  },
  metricGlyphText: { color: palette.inkSoft, fontSize: 15, fontWeight: "800" },
  metricValue: { color: palette.ink, fontSize: 26, fontWeight: "800", marginTop: 12, fontVariant: ["tabular-nums"] },
  metricLabel: { color: palette.muted, fontSize: typeScale.label, fontWeight: "600", marginTop: 2 },
  recordCard: {
    flexDirection: "row", alignItems: "center", padding: 14, marginBottom: 12,
    gap: 12, borderRadius: 14,
  },
  recordIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: palette.accentSoft, alignItems: "center", justifyContent: "center",
  },
  recordIconText: { color: palette.accent, fontSize: 14, fontWeight: "800" },
  recordBody: { flex: 1, minWidth: 0 },
  recordTitle: { color: palette.ink, fontSize: typeScale.body, fontWeight: "700" },
  recordSub: { color: palette.inkSoft, fontSize: typeScale.label, marginTop: 4, fontWeight: "500" },
  recordMeta: { color: palette.muted, fontSize: typeScale.label, marginTop: 5 },
  recordArrow: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: "center", justifyContent: "center", backgroundColor: palette.paper,
  },
  recordArrowText: { color: palette.inkSoft, fontSize: 21, fontWeight: "500", marginTop: -2 },
  pressed: { opacity: 0.8 },
  vehicleCard: { marginBottom: 12, padding: 16, borderRadius: 15 },
  vehicleTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  vehicleGlyph: {
    width: 38, height: 38, borderRadius: 12, backgroundColor: palette.accentSoft,
    alignItems: "center", justifyContent: "center",
  },
  vehicleGlyphText: { fontSize: 17, color: palette.accent, fontWeight: "800" },
  vehiclePlate: {
    paddingVertical: 6, paddingHorizontal: 10,
    backgroundColor: palette.paper, borderRadius: 7,
  },
  vehiclePlateText: { fontSize: 11, fontWeight: "800", letterSpacing: 1.2, color: palette.ink, fontVariant: ["tabular-nums"] },
  vehicleTitle: { fontSize: typeScale.title, fontWeight: "700", color: palette.ink, marginTop: 14 },
  vehicleId: { color: palette.muted, fontSize: 10, fontWeight: "700", letterSpacing: 0.8, marginTop: 5 },
  vehicleActions: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    borderTopWidth: 1, borderTopColor: palette.line, marginTop: 16, paddingTop: 10,
  },
  historyButton: { minHeight: 44, justifyContent: "center", paddingRight: 12 },
  historyButtonText: { color: palette.accent, fontSize: typeScale.body, fontWeight: "700" },
  editButton: { minHeight: 40, justifyContent: "center", paddingHorizontal: 12, backgroundColor: palette.accentSoft, borderRadius: 9 },
  editButtonText: { color: palette.accent, fontSize: typeScale.label, fontWeight: "700" },
  serviceCard: {
    flexDirection: "row", alignItems: "center", gap: 12, padding: 14,
    marginBottom: 12, borderRadius: 14,
  },
  dateBadge: {
    width: 48, height: 54, borderRadius: 12, alignItems: "center",
    justifyContent: "center", backgroundColor: palette.orangeSoft,
  },
  dateDay: { color: palette.ink, fontSize: 18, fontWeight: "800", lineHeight: 20, fontVariant: ["tabular-nums"] },
  dateMonth: { color: palette.inkSoft, fontSize: 10, fontWeight: "700", textTransform: "uppercase" },
  costBox: { alignItems: "flex-end", marginLeft: 4, backgroundColor: palette.paper, padding: 8, borderRadius: 9 },
  costLabel: { color: palette.muted, fontSize: 9, fontWeight: "700", letterSpacing: 0.8 },
  costValue: { color: palette.ink, fontSize: 12, fontWeight: "700", marginTop: 4 },
  emptyCard: { alignItems: "center", paddingVertical: 30, borderRadius: 14 },
  emptyGlyph: {
    width: 46, height: 46, borderRadius: 23, backgroundColor: palette.accentSoft,
    justifyContent: "center", alignItems: "center",
  },
  emptyGlyphText: { color: palette.accent, fontSize: 24, fontWeight: "700" },
  emptyTitle: { color: palette.ink, fontWeight: "700", fontSize: typeScale.body, marginTop: 12 },
  emptyDetail: { color: palette.muted, fontSize: typeScale.label, textAlign: "center", marginTop: 6, maxWidth: 250 },
  emptyAction: { minHeight: 44, paddingHorizontal: 14, justifyContent: "center", marginTop: 8 },
  emptyActionText: { color: palette.accent, fontWeight: "700", fontSize: typeScale.body },
});
