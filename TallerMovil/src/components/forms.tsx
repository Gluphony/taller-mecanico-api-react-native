import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { Cliente, Vehiculo } from "@/api";
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

function FormActions({
  onCancel,
  saving,
  disabled,
  title,
}: {
  onCancel: () => void;
  saving: boolean;
  disabled?: boolean;
  title: string;
}) {
  return (
    <View style={styles.actions}>
      <Button title="Cancelar" variant="secondary" onPress={onCancel} />
      <View style={styles.actionPrimary}>
        <Button title={title} onPress={() => {}} loading={saving} disabled={disabled} />
      </View>
    </View>
  );
}

export function ClientForm({
  initial,
  onClose,
  onSave,
  saving,
}: {
  initial?: Cliente;
  onClose: () => void;
  onSave: (values: ClienteValues) => void;
  saving: boolean;
}) {
  const [nombre, setNombre] = useState(initial?.nombreCompleto || "");
  const [telefono, setTelefono] = useState(initial?.telefono || "");
  const [email, setEmail] = useState(initial?.email || "");
  const [direccion, setDireccion] = useState(initial?.direccion || "");

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
            disabled={nombre.trim().length < 2}
          />
        </View>
      </View>
    </View>
  );
}

export function VehicleForm({
  initial,
  clients,
  onClose,
  onSave,
  saving,
}: {
  initial?: Vehiculo;
  clients: Cliente[];
  onClose: () => void;
  onSave: (values: VehiculoValues) => void;
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
            disabled={!clienteId || placa.trim().length < 2 || !marca.trim() || !modelo.trim()}
          />
        </View>
      </View>
    </View>
  );
}

export function ServiceForm({
  vehicles,
  initialVehicleId,
  onClose,
  onSave,
  saving,
}: {
  vehicles: Vehiculo[];
  initialVehicleId?: number;
  onClose: () => void;
  onSave: (values: MantenimientoValues) => void;
  saving: boolean;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [vehiculoId, setVehiculoId] = useState<number | null>(
    initialVehicleId ?? vehicles[0]?.id ?? null,
  );
  const [fecha, setFecha] = useState(today);
  const [tipo, setTipo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [kilometraje, setKilometraje] = useState("");
  const [costo, setCosto] = useState("");
  const [tecnico, setTecnico] = useState("");
  const [recomendaciones, setRecomendaciones] = useState("");
  const [proximo, setProximo] = useState("");

  return (
    <View style={styles.form}>
      <Text style={styles.formIntro}>Anota el trabajo realizado y la siguiente visita recomendada.</Text>
      <Text style={styles.fieldTitle}>VEHÍCULO</Text>
      <ChoiceChips
        items={vehicles}
        selectedId={vehiculoId}
        onSelect={setVehiculoId}
        labelFor={(item) => item.placa + " · " + item.marca + " " + item.modelo}
      />
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
      <View style={styles.actions}>
        <Button title="Cancelar" variant="secondary" onPress={onClose} />
        <View style={styles.actionPrimary}>
          <Button
            title="Guardar servicio"
            onPress={() => onSave({
              vehiculoId: vehiculoId || 0,
              fechaServicio: fecha.trim(),
              tipoServicio: tipo.trim(),
              descripcion: descripcion.trim(),
              kilometraje: kilometraje.trim() ? Number(kilometraje) : null,
              costo: costo.trim() ? Number(costo) : 0,
              tecnico: tecnico.trim(),
              recomendaciones: recomendaciones.trim(),
              proximoMantenimiento: proximo.trim() || null,
            })}
            loading={saving}
            disabled={!vehiculoId || !fecha.trim() || tipo.trim().length < 2 || descripcion.trim().length < 2}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: 0 },
  formIntro: { color: palette.muted, fontSize: typeScale.body, lineHeight: 20, marginBottom: 18 },
  fieldTitle: { color: palette.inkSoft, fontSize: typeScale.label, fontWeight: "700", letterSpacing: 0.4, marginBottom: 8 },
  choiceScroll: { flexGrow: 0, marginBottom: spacing.lg },
  choice: {
    minHeight: 42, paddingHorizontal: 14, borderRadius: 14,
    marginRight: 8, alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: palette.line, backgroundColor: palette.white,
  },
  choiceSelected: { backgroundColor: palette.ink, borderColor: palette.ink },
  choiceText: { color: palette.inkSoft, fontSize: typeScale.label, fontWeight: "700" },
  choiceTextSelected: { color: palette.white },
  noChoices: { color: palette.danger, fontSize: typeScale.label, marginBottom: spacing.lg },
  formRow: { flexDirection: "row", gap: 12 },
  formHalf: { flex: 1, minWidth: 0 },
  actions: { flexDirection: "row", gap: 10, marginTop: 4, marginBottom: 12 },
  actionPrimary: { flex: 1 },
});
