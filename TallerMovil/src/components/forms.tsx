import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { Cliente, Mantenimiento, Vehiculo } from "@/api";
import { palette, spacing, typeScale } from "@/theme";
import { Button, Field } from "./design";

export type ClienteValues = {
  nombreCompleto: string;
  telefono: string;
  email: string;
  direccion: string;
};

export type VehiculoValues = {
  clienteId: number;
  placa: string;
  vin: string;
  marca: string;
  modelo: string;
  anio: number | null;
  color: string;
};

export type MantenimientoValues = {
  vehiculoId: number;
  fechaServicio: string;
  tipoServicio: string;
  descripcion: string;
  kilometraje: number | null;
  costo: number;
  tecnico: string;
  recomendaciones: string;
  proximoMantenimiento: string | null;
};

function ChoiceChips<T extends { id: number }>({
  items,
  selectedId,
  onSelect,
  labelFor,
}: {
  items: T[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  labelFor: (item: T) => string;
}) {
  if (items.length === 0) {
    return <Text style={styles.noChoices}>Primero registra un cliente.</Text>;
  }
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.choiceScroll}>
      {items.map((item) => {
        const selected = selectedId === item.id;
        return (
          <Pressable
            key={item.id}
            onPress={() => onSelect(item.id)}
            style={[styles.choice, selected && styles.choiceSelected]}
          >
            <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>
              {labelFor(item)}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function DeleteControl({
  label,
  note,
  onDelete,
  saving,
}: {
  label: string;
  note: string;
  onDelete: () => void;
  saving: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  return (
    <View style={styles.deleteBox}>
      <Text style={styles.deleteNote}>{note}</Text>
      {confirming ? (
        <View style={styles.deleteConfirm}>
          <Text style={styles.deleteConfirmText}>¿Confirmas eliminar este registro? No se puede deshacer.</Text>
          <View style={styles.deleteActions}>
            <Button title="Conservar" variant="secondary" small onPress={() => setConfirming(false)} disabled={saving} />
            <Button title="Sí, eliminar" variant="danger" small onPress={onDelete} loading={saving} />
          </View>
        </View>
      ) : (
        <Button title={label} variant="danger" small onPress={() => setConfirming(true)} disabled={saving} />
      )}
    </View>
  );
}

function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + "T00:00:00Z");
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function ClientForm({
  initial,
  onClose,
  onSave,
  onDelete,
  saving,
}: {
  initial?: Cliente;
  onClose: () => void;
  onSave: (values: ClienteValues) => void;
  onDelete: (id: number) => void;
  saving: boolean;
}) {
  const [nombre, setNombre] = useState(initial?.nombreCompleto || "");
  const [telefono, setTelefono] = useState(initial?.telefono || "");
  const [email, setEmail] = useState(initial?.email || "");
  const [direccion, setDireccion] = useState(initial?.direccion || "");
  const validEmail = !email.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  return (
    <View style={styles.form}>
      <Text style={styles.formIntro}>Los campos se guardan en el expediente del cliente.</Text>
      <Field label="NOMBRE COMPLETO" value={nombre} onChangeText={setNombre} placeholder="Ej. Ana López" />
      <Field label="TELÉFONO" value={telefono} onChangeText={setTelefono} placeholder="8888-0000" keyboardType="phone-pad" />
      <Field label="CORREO ELECTRÓNICO" value={email} onChangeText={setEmail} placeholder="ana@correo.com" keyboardType="email-address" autoCapitalize="none" />
      <Field label="DIRECCIÓN" value={direccion} onChangeText={setDireccion} placeholder="Ciudad, barrio y referencia" multiline />
      <View style={styles.actions}>
        <Button title="Cancelar" variant="secondary" onPress={onClose} />
        <View style={styles.actionPrimary}>
          <Button
            title={initial ? "Guardar cambios" : "Guardar cliente"}
            onPress={() => onSave({ nombreCompleto: nombre.trim(), telefono: telefono.trim(), email: email.trim(), direccion: direccion.trim() })}
            loading={saving}
            disabled={nombre.trim().length < 2 || !validEmail}
          />
        </View>
      </View>
      {!validEmail && <Text style={styles.validationText}>Escribe un correo electrónico válido.</Text>}
      {initial && <DeleteControl label="Eliminar cliente" note="Solo se puede eliminar si no tiene vehículos asociados." onDelete={() => onDelete(initial.id)} saving={saving} />}
    </View>
  );
}

export function VehicleForm({
  initial,
  clients,
  onClose,
  onSave,
  onDelete,
  saving,
}: {
  initial?: Vehiculo;
  clients: Cliente[];
  onClose: () => void;
  onSave: (values: VehiculoValues) => void;
  onDelete: (id: number) => void;
  saving: boolean;
}) {
  const [clienteId, setClienteId] = useState<number | null>(
    initial?.clienteId ?? clients[0]?.id ?? null,
  );
  const [placa, setPlaca] = useState(initial?.placa || "");
  const [vin, setVin] = useState(initial?.vin || "");
  const [marca, setMarca] = useState(initial?.marca || "");
  const [modelo, setModelo] = useState(initial?.modelo || "");
  const [anio, setAnio] = useState(initial?.anio ? String(initial.anio) : "");
  const [color, setColor] = useState(initial?.color || "");
  const year = anio.trim() ? Number(anio) : null;
  const validYear = year === null || (Number.isInteger(year) && year >= 1886 && year <= 2100);
  const validVin = !vin.trim() || (vin.trim().length >= 11 && vin.trim().length <= 17);

  return (
    <View style={styles.form}>
      <Text style={styles.formIntro}>Selecciona quién es el propietario de este vehículo.</Text>
      <Text style={styles.fieldTitle}>CLIENTE</Text>
      <ChoiceChips
        items={clients}
        selectedId={clienteId}
        onSelect={setClienteId}
        labelFor={(item) => item.nombreCompleto}
      />
      <View style={styles.formRow}>
        <View style={styles.formHalf}>
          <Field label="PLACA" value={placa} onChangeText={setPlaca} placeholder="M123456" autoCapitalize="characters" />
        </View>
        <View style={styles.formHalf}>
          <Field label="AÑO" value={anio} onChangeText={setAnio} placeholder="2020" keyboardType="numeric" />
        </View>
      </View>
      <View style={styles.formRow}>
        <View style={styles.formHalf}>
          <Field label="MARCA" value={marca} onChangeText={setMarca} placeholder="Toyota" />
        </View>
        <View style={styles.formHalf}>
          <Field label="MODELO" value={modelo} onChangeText={setModelo} placeholder="Corolla" />
        </View>
      </View>
      <Field label="VIN (OPCIONAL)" value={vin} onChangeText={setVin} placeholder="Número de chasis" autoCapitalize="characters" />
      <Field label="COLOR" value={color} onChangeText={setColor} placeholder="Gris" />
      <View style={styles.actions}>
        <Button title="Cancelar" variant="secondary" onPress={onClose} />
        <View style={styles.actionPrimary}>
          <Button
            title={initial ? "Guardar cambios" : "Guardar vehículo"}
            onPress={() => onSave({
              clienteId: clienteId || 0,
              placa: placa.trim(),
              vin: vin.trim(),
              marca: marca.trim(),
              modelo: modelo.trim(),
              anio: anio.trim() ? Number(anio) : null,
              color: color.trim(),
            })}
            loading={saving}
            disabled={!clienteId || placa.trim().length < 2 || placa.trim().length > 12 || !marca.trim() || marca.trim().length > 60 || !modelo.trim() || modelo.trim().length > 60 || !validYear || !validVin}
          />
        </View>
      </View>
      {!validYear && <Text style={styles.validationText}>El año debe estar entre 1886 y 2100.</Text>}
      {!validVin && <Text style={styles.validationText}>El VIN debe tener entre 11 y 17 caracteres.</Text>}
      {initial && <DeleteControl label="Eliminar vehículo" note="El vehículo debe quedar sin servicios registrados para eliminarse." onDelete={() => onDelete(initial.id)} saving={saving} />}
    </View>
  );
}

export function ServiceForm({
  initial,
  vehicles,
  initialVehicleId,
  onClose,
  onSave,
  onDelete,
  saving,
}: {
  initial?: Mantenimiento;
  vehicles: Vehiculo[];
  initialVehicleId?: number;
  onClose: () => void;
  onSave: (values: MantenimientoValues) => void;
  onDelete: (id: number) => void;
  saving: boolean;
}) {
  const now = new Date();
  const today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-");
  const [vehiculoId, setVehiculoId] = useState<number | null>(
    initial?.vehiculoId ?? initialVehicleId ?? vehicles[0]?.id ?? null,
  );
  const [fecha, setFecha] = useState(initial?.fechaServicio.slice(0, 10) || today);
  const [tipo, setTipo] = useState(initial?.tipoServicio || "");
  const [descripcion, setDescripcion] = useState(initial?.descripcion || "");
  const [kilometraje, setKilometraje] = useState(initial?.kilometraje == null ? "" : String(initial.kilometraje));
  const [costo, setCosto] = useState(initial ? String(initial.costo) : "");
  const [tecnico, setTecnico] = useState(initial?.tecnico || "");
  const [recomendaciones, setRecomendaciones] = useState(initial?.recomendaciones || "");
  const [proximo, setProximo] = useState(initial?.proximoMantenimiento?.slice(0, 10) || "");
  const numericKm = kilometraje.trim() ? Number(kilometraje) : null;
  const numericCost = costo.trim() ? Number(costo) : 0;
  const validKm = numericKm === null || (Number.isInteger(numericKm) && numericKm >= 0);
  const validCost = Number.isFinite(numericCost) && numericCost >= 0 && numericCost <= 999999999.99;
  const validDates = validDate(fecha) && (!proximo.trim() || (validDate(proximo) && proximo >= fecha));
  const vehicle = vehicles.find((item) => item.id === vehiculoId);

  return (
    <View style={styles.form}>
      <Text style={styles.formIntro}>Anota el trabajo realizado y la siguiente visita recomendada.</Text>
      <Text style={styles.fieldTitle}>VEHÍCULO</Text>
      {initial ? (
        <Text style={styles.lockedVehicle}>{initial.placa || vehicle?.placa || "Vehículo"} · {initial.marca || vehicle?.marca} {initial.modelo || vehicle?.modelo} (asociación fija del historial)</Text>
      ) : <ChoiceChips
          items={vehicles}
          selectedId={vehiculoId}
          onSelect={setVehiculoId}
          labelFor={(item) => item.placa + " · " + item.marca + " " + item.modelo}
        />}
      <Field label="FECHA DEL SERVICIO" value={fecha} onChangeText={setFecha} placeholder="AAAA-MM-DD" />
      <Field label="TIPO DE SERVICIO" value={tipo} onChangeText={setTipo} placeholder="Cambio de aceite" />
      <Field label="DETALLE DEL TRABAJO" value={descripcion} onChangeText={setDescripcion} placeholder="Describe las tareas realizadas" multiline />
      <View style={styles.formRow}>
        <View style={styles.formHalf}>
          <Field label="KILOMETRAJE" value={kilometraje} onChangeText={setKilometraje} placeholder="50000" keyboardType="numeric" />
        </View>
        <View style={styles.formHalf}>
          <Field label="COSTO (NIO)" value={costo} onChangeText={setCosto} placeholder="0.00" keyboardType="decimal-pad" />
        </View>
      </View>
      <Field label="TÉCNICO" value={tecnico} onChangeText={setTecnico} placeholder="Nombre del técnico" />
      <Field label="RECOMENDACIONES" value={recomendaciones} onChangeText={setRecomendaciones} placeholder="Trabajo recomendado para la próxima visita" multiline />
      <Field label="PRÓXIMO MANTENIMIENTO (OPCIONAL)" value={proximo} onChangeText={setProximo} placeholder="AAAA-MM-DD" />
      {!validDates && <Text style={styles.validationText}>Revisa las fechas: deben ser válidas y la próxima no puede ser anterior al servicio.</Text>}
      {!validKm && <Text style={styles.validationText}>El kilometraje debe ser un entero mayor o igual a cero.</Text>}
      {!validCost && <Text style={styles.validationText}>El costo debe estar entre 0 y 999,999,999.99.</Text>}
      <View style={styles.actions}>
        <Button title="Cancelar" variant="secondary" onPress={onClose} />
        <View style={styles.actionPrimary}>
          <Button
            title={initial ? "Guardar cambios" : "Guardar servicio"}
            onPress={() => onSave({
              vehiculoId: vehiculoId || 0,
              fechaServicio: fecha.trim(),
              tipoServicio: tipo.trim(),
              descripcion: descripcion.trim(),
              kilometraje: numericKm,
              costo: numericCost,
              tecnico: tecnico.trim(),
              recomendaciones: recomendaciones.trim(),
              proximoMantenimiento: proximo.trim() || null,
            })}
            loading={saving}
            disabled={!vehiculoId || !validDates || !validKm || !validCost || tipo.trim().length < 2 || tipo.trim().length > 80 || descripcion.trim().length < 2 || descripcion.trim().length > 2000 || tecnico.length > 120 || recomendaciones.length > 2000}
          />
        </View>
      </View>
      {initial && <DeleteControl label="Eliminar servicio" note="Se quitará este registro del historial del vehículo." onDelete={() => onDelete(initial.id)} saving={saving} />}
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: 0 },
  formIntro: { color: palette.inkSoft, fontSize: typeScale.body, lineHeight: 20, marginBottom: 18, fontWeight: "600" },
  fieldTitle: { color: palette.orange, fontSize: typeScale.label, fontWeight: "900", letterSpacing: 1, marginBottom: 8 },
  choiceScroll: { flexGrow: 0, marginBottom: spacing.lg },
  choice: {
    minHeight: 44, paddingHorizontal: 14,
    marginRight: 8, alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: palette.ink, backgroundColor: palette.white,
  },
  choiceSelected: { backgroundColor: palette.accent, borderColor: palette.ink },
  choiceText: { color: palette.inkSoft, fontSize: typeScale.label, fontWeight: "800" },
  choiceTextSelected: { color: palette.ink, fontWeight: "900" },
  noChoices: { color: palette.danger, fontSize: typeScale.label, marginBottom: spacing.lg },
  formRow: { flexDirection: "row", gap: 12 },
  formHalf: { flex: 1, minWidth: 0 },
  actions: { flexDirection: "row", gap: 10, marginTop: 4, marginBottom: 12, borderTopWidth: 2, borderTopColor: palette.ink, paddingTop: 14 },
  actionPrimary: { flex: 1 },
  validationText: { color: palette.danger, fontSize: typeScale.label, marginTop: -8, marginBottom: spacing.md },
  lockedVehicle: { color: palette.inkSoft, fontSize: typeScale.body, marginBottom: spacing.lg },
  deleteBox: { borderTopWidth: 2, borderTopColor: palette.ink, marginTop: spacing.md, paddingTop: spacing.md, gap: 10 },
  deleteNote: { color: palette.muted, fontSize: typeScale.label, fontWeight: "700" },
  deleteConfirm: { gap: 10, padding: 12, backgroundColor: palette.dangerSoft, borderWidth: 2, borderColor: palette.danger },
  deleteConfirmText: { color: palette.danger, fontSize: typeScale.label, fontWeight: "800" },
  deleteActions: { flexDirection: "row", gap: 8, justifyContent: "flex-end" },
});
