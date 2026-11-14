import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Cliente, Mantenimiento, Vehiculo } from "@/api";
import { palette, spacing, typeScale } from "@/theme";
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
  metric: { flex: 1, minWidth: 105, padding: 16, borderRadius: 20, minHeight: 126 },
  metricGlyph: {
    width: 34, height: 34, borderRadius: 12,
    justifyContent: "center", alignItems: "center",
  },
  metricGlyphText: { color: palette.ink, fontSize: 17, fontWeight: "700" },
  metricValue: { color: palette.ink, fontSize: 26, fontWeight: "800", marginTop: 12 },
  metricLabel: { color: palette.muted, fontSize: typeScale.label, fontWeight: "600", marginTop: 2 },
  recordCard: {
    flexDirection: "row", alignItems: "center", padding: 14, marginBottom: 10,
    borderRadius: 18, gap: 12, shadowOpacity: 0.4,
  },
  recordIcon: {
    width: 44, height: 44, borderRadius: 15,
    backgroundColor: palette.accentSoft, alignItems: "center", justifyContent: "center",
  },
  recordIconText: { color: palette.ink, fontSize: 14, fontWeight: "800" },
  recordBody: { flex: 1, minWidth: 0 },
  recordTitle: { color: palette.ink, fontSize: typeScale.body, fontWeight: "700" },
  recordSub: { color: palette.muted, fontSize: typeScale.label, marginTop: 4 },
  recordMeta: { color: palette.inkSoft, fontSize: typeScale.label, marginTop: 5 },
  recordArrow: {
    width: 30, height: 30, borderRadius: 10,
    alignItems: "center", justifyContent: "center", backgroundColor: palette.paper,
  },
  recordArrowText: { color: palette.ink, fontSize: 22, marginTop: -2 },
  pressed: { opacity: 0.8 },
  vehicleCard: { marginBottom: 12, padding: 18, borderRadius: 20 },
  vehicleTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  vehicleGlyph: {
    width: 38, height: 38, backgroundColor: palette.accentSoft,
    borderRadius: 13, alignItems: "center", justifyContent: "center",
  },
  vehicleGlyphText: { fontSize: 17, color: palette.ink },
  vehiclePlate: {
    paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8,
    backgroundColor: palette.paper, borderWidth: 1, borderColor: palette.line,
  },
  vehiclePlateText: { fontSize: 11, fontWeight: "800", letterSpacing: 1.2, color: palette.ink },
  vehicleTitle: { fontSize: typeScale.title, fontWeight: "700", color: palette.ink, marginTop: 14 },
  vehicleActions: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    borderTopWidth: 1, borderTopColor: palette.line, marginTop: 16, paddingTop: 12,
  },
  historyButton: { minHeight: 36, justifyContent: "center", paddingRight: 12 },
  historyButtonText: { color: palette.success, fontSize: typeScale.body, fontWeight: "700" },
  editButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: palette.paper },
  editButtonText: { color: palette.inkSoft, fontSize: typeScale.label, fontWeight: "700" },
  serviceCard: {
    flexDirection: "row", alignItems: "center", gap: 12, padding: 14,
    marginBottom: 10, borderRadius: 18,
  },
  dateBadge: {
    width: 46, height: 52, borderRadius: 14, alignItems: "center",
    justifyContent: "center", backgroundColor: palette.orangeSoft,
  },
  dateDay: { color: palette.ink, fontSize: 18, fontWeight: "800", lineHeight: 20 },
  dateMonth: { color: palette.muted, fontSize: 10, fontWeight: "700", textTransform: "uppercase" },
  costBox: { alignItems: "flex-end", marginLeft: 4 },
  costLabel: { color: palette.muted, fontSize: 9, fontWeight: "700", letterSpacing: 0.8 },
  costValue: { color: palette.ink, fontSize: 12, fontWeight: "800", marginTop: 4 },
  emptyCard: { alignItems: "center", paddingVertical: 28, borderRadius: 20 },
  emptyGlyph: {
    width: 42, height: 42, borderRadius: 15, backgroundColor: palette.accentSoft,
    justifyContent: "center", alignItems: "center",
  },
  emptyGlyphText: { color: palette.ink, fontSize: 24, fontWeight: "500" },
  emptyTitle: { color: palette.ink, fontWeight: "700", fontSize: typeScale.body, marginTop: 12 },
  emptyDetail: { color: palette.muted, fontSize: typeScale.label, textAlign: "center", marginTop: 6, maxWidth: 250 },
  emptyAction: { minHeight: 44, paddingHorizontal: 14, justifyContent: "center", marginTop: 8 },
  emptyActionText: { color: palette.success, fontWeight: "800", fontSize: typeScale.body },
});
