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
  emptyMessage = "No hay registros disponibles.",
}: {
  items: T[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  labelFor: (item: T) => string;
  emptyMessage?: string;
}) {
  if (items.length === 0) {
    return <Text style={styles.noChoices}>{emptyMessage}</Text>;
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

function validWorkshopDate(value: string) {
  if (!validDate(value)) return false;
  const year = Number(value.slice(0, 4));
  return year >= 1886 && year <= 2100;
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
  const validName = nombre.trim().length >= 2 && nombre.trim().length <= 120;
  const phoneDigits = telefono.replace(/\D/g, "").length;
  const validPhone = !telefono.trim() || (/^\+?[0-9][0-9 ().-]*[0-9]$/.test(telefono.trim()) && phoneDigits >= 7 && phoneDigits <= 15);
  const validEmail = !email.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  return (
    <View style={styles.form}>
      <Text style={styles.formIntro}>Datos de contacto para localizar al cliente y sus vehículos.</Text>
      <Field label="Nombre completo" value={nombre} onChangeText={setNombre} placeholder="Ej. Ana López" maxLength={120} />
      <Field label="Teléfono (opcional)" value={telefono} onChangeText={setTelefono} placeholder="+505 8888-0000" keyboardType="phone-pad" maxLength={30} />
      <Field label="Correo electrónico (opcional)" value={email} onChangeText={setEmail} placeholder="ana@correo.com" keyboardType="email-address" autoCapitalize="none" maxLength={254} />
      <Field label="Dirección (opcional)" value={direccion} onChangeText={setDireccion} placeholder="Ciudad, barrio y referencia" multiline maxLength={250} />
      {!validName && <Text style={styles.validationText}>Escribe un nombre de 2 a 120 caracteres.</Text>}
      {!validPhone && <Text style={styles.validationText}>El teléfono debe tener 7 a 15 dígitos.</Text>}
      {!validEmail && <Text style={styles.validationText}>Escribe un correo electrónico válido.</Text>}
      {direccion.trim().length > 250 && <Text style={styles.validationText}>La dirección no puede superar 250 caracteres.</Text>}
      <View style={styles.actions}>
        <Button title="Cancelar" variant="secondary" onPress={onClose} />
        <View style={styles.actionPrimary}>
          <Button
            title={initial ? "Guardar cambios" : "Guardar cliente"}
            onPress={() => onSave({ nombreCompleto: nombre.trim(), telefono: telefono.trim(), email: email.trim(), direccion: direccion.trim() })}
            loading={saving}
            disabled={!validName || !validPhone || !validEmail || direccion.trim().length > 250}
          />
        </View>
      </View>
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
  const latestModelYear = new Date().getFullYear() + 1;
  const validYear = year === null || (Number.isInteger(year) && year >= 1886 && year <= latestModelYear);
  const normalizedVin = vin.trim().toUpperCase();
  const validVin = !normalizedVin || /^[A-HJ-NPR-Z0-9]{11,17}$/.test(normalizedVin);
  const validPlate = /^[A-Z0-9][A-Z0-9 -]{0,10}[A-Z0-9]$/.test(placa.trim().toUpperCase());
  const validMakeAndModel = marca.trim().length >= 1 && marca.trim().length <= 60 && modelo.trim().length >= 1 && modelo.trim().length <= 60;
  const validColor = color.trim().length <= 40;

  return (
    <View style={styles.form}>
      <Text style={styles.formIntro}>Selecciona quién es el propietario de este vehículo.</Text>
      <Text style={styles.fieldTitle}>CLIENTE</Text>
      <ChoiceChips
        items={clients}
        selectedId={clienteId}
        onSelect={setClienteId}
        labelFor={(item) => item.nombreCompleto}
        emptyMessage="Primero registra un cliente para asignar este vehículo."
      />
      <View style={styles.formRow}>
        <View style={styles.formHalf}>
          <Field label="Placa" value={placa} onChangeText={setPlaca} placeholder="M123456" autoCapitalize="characters" maxLength={12} />
        </View>
        <View style={styles.formHalf}>
          <Field label="Año del modelo" value={anio} onChangeText={setAnio} placeholder={String(new Date().getFullYear())} keyboardType="numeric" maxLength={4} />
        </View>
      </View>
      <View style={styles.formRow}>
        <View style={styles.formHalf}>
          <Field label="Marca" value={marca} onChangeText={setMarca} placeholder="Toyota" maxLength={60} />
        </View>
        <View style={styles.formHalf}>
          <Field label="Modelo" value={modelo} onChangeText={setModelo} placeholder="Corolla" maxLength={60} />
        </View>
      </View>
      <Field label="VIN (opcional)" value={vin} onChangeText={setVin} placeholder="17 letras y números" autoCapitalize="characters" maxLength={17} />
      <Field label="Color (opcional)" value={color} onChangeText={setColor} placeholder="Gris" maxLength={40} />
      {!validPlate && <Text style={styles.validationText}>La placa debe tener entre 2 y 12 letras, números, espacios o guiones.</Text>}
      {!validMakeAndModel && <Text style={styles.validationText}>La marca y el modelo son obligatorios (máximo 60 caracteres).</Text>}
      {!validYear && <Text style={styles.validationText}>El año debe estar entre 1886 y {latestModelYear}.</Text>}
      {!validVin && <Text style={styles.validationText}>El VIN debe tener 11 a 17 caracteres; no usa I, O ni Q.</Text>}
      {!validColor && <Text style={styles.validationText}>El color no puede superar 40 caracteres.</Text>}
      <View style={styles.actions}>
        <Button title="Cancelar" variant="secondary" onPress={onClose} />
        <View style={styles.actionPrimary}>
          <Button
            title={initial ? "Guardar cambios" : "Guardar vehículo"}
            onPress={() => onSave({
              clienteId: clienteId || 0,
              placa: placa.trim(),
              vin: normalizedVin,
              marca: marca.trim(),
              modelo: modelo.trim(),
              anio: anio.trim() ? Number(anio) : null,
              color: color.trim(),
            })}
            loading={saving}
            disabled={!clienteId || !validPlate || !validMakeAndModel || !validYear || !validVin || !validColor}
          />
        </View>
      </View>
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
  const validDates = validWorkshopDate(fecha) &&
    (!proximo.trim() || (validWorkshopDate(proximo) && proximo >= fecha));
  const validText = tipo.trim().length >= 2 && tipo.trim().length <= 80 && descripcion.trim().length >= 2 && descripcion.trim().length <= 2000;
  const validExtras = tecnico.trim().length <= 120 && recomendaciones.trim().length <= 2000;
  const vehicle = vehicles.find((item) => item.id === vehiculoId);

  return (
    <View style={styles.form}>
      <Text style={styles.formIntro}>Anota el trabajo realizado y la siguiente visita recomendada.</Text>
      <Text style={styles.fieldTitle}>Vehículo</Text>
      {initial ? (
        <Text style={styles.lockedVehicle}>{initial.placa || vehicle?.placa || "Vehículo"} · {initial.marca || vehicle?.marca} {initial.modelo || vehicle?.modelo} (asociación fija del historial)</Text>
      ) : <ChoiceChips
          items={vehicles}
          selectedId={vehiculoId}
          onSelect={setVehiculoId}
          labelFor={(item) => item.placa + " · " + item.marca + " " + item.modelo}
          emptyMessage="Primero registra un vehículo para agregarle un servicio."
        />}
      <Field label="Fecha del servicio" value={fecha} onChangeText={setFecha} placeholder="AAAA-MM-DD" maxLength={10} />
      <Field label="Tipo de servicio" value={tipo} onChangeText={setTipo} placeholder="Cambio de aceite" maxLength={80} />
      <Field label="Trabajo realizado" value={descripcion} onChangeText={setDescripcion} placeholder="Describe las tareas realizadas" multiline maxLength={2000} />
      <View style={styles.formRow}>
        <View style={styles.formHalf}>
          <Field label="Kilometraje (opcional)" value={kilometraje} onChangeText={setKilometraje} placeholder="50000" keyboardType="numeric" maxLength={10} />
        </View>
        <View style={styles.formHalf}>
          <Field label="Costo en córdobas" value={costo} onChangeText={setCosto} placeholder="0.00" keyboardType="decimal-pad" maxLength={12} />
        </View>
      </View>
      <Field label="Técnico (opcional)" value={tecnico} onChangeText={setTecnico} placeholder="Nombre del técnico" maxLength={120} />
      <Field label="Recomendaciones (opcional)" value={recomendaciones} onChangeText={setRecomendaciones} placeholder="Trabajo recomendado para la próxima visita" multiline maxLength={2000} />
      <Field label="Próximo mantenimiento (opcional)" value={proximo} onChangeText={setProximo} placeholder="AAAA-MM-DD" maxLength={10} />
      {!validText && <Text style={styles.validationText}>Completa el tipo (2–80 caracteres) y el trabajo (2–2000 caracteres).</Text>}
      {!validExtras && <Text style={styles.validationText}>Revisa el nombre del técnico (máximo 120) y las recomendaciones (máximo 2000 caracteres).</Text>}
      {!validDates && <Text style={styles.validationText}>Usa una fecha válida entre 1886 y 2100; la próxima visita no puede ser anterior al servicio.</Text>}
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
            disabled={!vehiculoId || !validDates || !validKm || !validCost || !validText || !validExtras}
          />
        </View>
      </View>
      {initial && <DeleteControl label="Eliminar servicio" note="Se quitará este registro del historial del vehículo." onDelete={() => onDelete(initial.id)} saving={saving} />}
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: 0 },
  formIntro: { color: palette.inkSoft, fontSize: typeScale.body, lineHeight: 20, marginBottom: 18, fontWeight: "500" },
  fieldTitle: { color: palette.accent, fontSize: typeScale.label, fontWeight: "700", letterSpacing: 0.5, marginBottom: 8 },
  choiceScroll: { flexGrow: 0, marginBottom: spacing.lg },
  choice: {
    minHeight: 44, paddingHorizontal: 14,
    marginRight: 8, alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: palette.line, backgroundColor: palette.white, borderRadius: 22,
  },
  choiceSelected: { backgroundColor: palette.accentSoft, borderColor: palette.accent },
  choiceText: { color: palette.inkSoft, fontSize: typeScale.label, fontWeight: "600" },
  choiceTextSelected: { color: palette.accent, fontWeight: "700" },
  noChoices: { color: palette.danger, fontSize: typeScale.label, marginBottom: spacing.lg },
  formRow: { flexDirection: "row", gap: 12 },
  formHalf: { flex: 1, minWidth: 0 },
  actions: { flexDirection: "row", gap: 10, marginTop: 4, marginBottom: 12, borderTopWidth: 1, borderTopColor: palette.line, paddingTop: 14 },
  actionPrimary: { flex: 1 },
  validationText: { color: palette.danger, fontSize: typeScale.label, marginTop: -8, marginBottom: spacing.md },
  lockedVehicle: { color: palette.inkSoft, fontSize: typeScale.body, marginBottom: spacing.lg, padding: 12, borderRadius: 10, backgroundColor: palette.paper },
  deleteBox: { borderTopWidth: 1, borderTopColor: palette.line, marginTop: spacing.md, paddingTop: spacing.md, gap: 10 },
  deleteNote: { color: palette.muted, fontSize: typeScale.label, fontWeight: "500" },
  deleteConfirm: { gap: 10, padding: 12, backgroundColor: palette.dangerSoft, borderRadius: 12 },
  deleteConfirmText: { color: palette.danger, fontSize: typeScale.label, fontWeight: "700" },
  deleteActions: { flexDirection: "row", gap: 8, justifyContent: "flex-end" },
});
