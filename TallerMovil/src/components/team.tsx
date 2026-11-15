import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button, Field, Surface } from "@/components/design";
import { palette, spacing, typeScale } from "@/theme";

export function EmployeeAccessScreen({
  saving,
  wide,
  onCreate,
}: {
  saving: boolean;
  wide: boolean;
  onCreate: (nombreUsuario: string, contrasena: string) => Promise<boolean>;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");

  const normalizedUsername = username.trim();
  const validUsername = /^[A-Za-z0-9][A-Za-z0-9._-]{2,79}$/.test(normalizedUsername);
  const validPassword = password.trim().length > 0 && password.length >= 12 && password.length <= 200;
  const matchingPasswords = password === confirmation && confirmation.length > 0;
  const canCreate = validUsername && validPassword && matchingPasswords;

  async function submit() {
    if (!canCreate || saving) return;
    const created = await onCreate(normalizedUsername, password);
    if (!created) return;
    setUsername("");
    setPassword("");
    setConfirmation("");
  }

  return (
    <View style={styles.screen}>
      <View style={styles.heading}>
        <Text style={styles.eyebrow}>ADMINISTRACIÓN DEL TALLER</Text>
        <Text style={styles.title}>Acceso del equipo</Text>
        <Text style={styles.subtitle}>Crea una cuenta de empleado para que otra persona pueda registrar el trabajo diario.</Text>
      </View>

      <View style={[styles.content, wide && styles.contentWide]}>
        <Surface style={[styles.formCard, wide && styles.formCardWide]}>
          <View style={styles.formHeading}>
            <View style={styles.formGlyph}><Text style={styles.formGlyphText}>+</Text></View>
            <View style={styles.formHeadingCopy}>
              <Text style={styles.formEyebrow}>NUEVA CUENTA</Text>
              <Text style={styles.formTitle}>Empleado</Text>
            </View>
            <View style={styles.roleBadge}><Text style={styles.roleBadgeText}>ACCESO OPERATIVO</Text></View>
          </View>

          <Text style={styles.formIntro}>La persona podrá trabajar con clientes, vehículos y servicios. Solo el administrador puede crear cuentas.</Text>

          <Field
            label="Nombre de usuario"
            value={username}
            onChangeText={setUsername}
            placeholder="Ej. mecanico1"
            autoCapitalize="none"
            maxLength={80}
          />
          <Text style={styles.helper}>3–80 caracteres: letras, números, punto, guion o guion bajo.</Text>

          <Field
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            placeholder="Mínimo 12 caracteres"
            secureTextEntry
            autoCapitalize="none"
            maxLength={200}
          />
          <Field
            label="Repite la contraseña"
            value={confirmation}
            onChangeText={setConfirmation}
            placeholder="Confirma la contraseña"
            secureTextEntry
            autoCapitalize="none"
            maxLength={200}
          />
          {!!confirmation && !matchingPasswords && (
            <Text style={styles.validation}>Las contraseñas no coinciden.</Text>
          )}

          <Button title="Crear cuenta de empleado" onPress={() => void submit()} loading={saving} disabled={!canCreate} />
          <Text style={styles.footnote}>La contraseña se protege antes de guardarse. No se puede consultar después.</Text>
        </Surface>

        <Surface style={[styles.infoCard, wide && styles.infoCardWide]}>
          <Text style={styles.infoEyebrow}>PERMISOS</Text>
          <Text style={styles.infoTitle}>Tu acceso de administrador permanece privado.</Text>
          <Text style={styles.infoBody}>Las cuentas nuevas se crean con permisos de empleado. No pueden registrar otras cuentas.</Text>
          <View style={styles.rule} />
          <View style={styles.ruleRow}>
            <Text style={styles.ruleMark}>01</Text>
            <Text style={styles.ruleText}>Nombre de usuario único en el taller</Text>
          </View>
          <View style={styles.ruleRow}>
            <Text style={styles.ruleMark}>02</Text>
            <Text style={styles.ruleText}>Contraseña de 12 caracteres o más</Text>
          </View>
        </Surface>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { gap: spacing.xl },
  heading: { marginBottom: spacing.xs },
  eyebrow: { color: palette.accent, fontSize: typeScale.label, fontWeight: "800", letterSpacing: 1 },
  title: { color: palette.ink, fontSize: 30, lineHeight: 36, fontWeight: "800", marginTop: 6, letterSpacing: -0.8 },
  subtitle: { color: palette.muted, fontSize: typeScale.body, lineHeight: 21, marginTop: 6, maxWidth: 560 },
  content: { gap: spacing.lg },
  contentWide: { flexDirection: "row", alignItems: "flex-start" },
  formCard: { padding: spacing.xl },
  formCardWide: { flex: 1 },
  formHeading: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.md },
  formGlyph: { width: 42, height: 42, borderRadius: 10, backgroundColor: palette.accentSoft, alignItems: "center", justifyContent: "center" },
  formGlyphText: { color: palette.accent, fontSize: 26, lineHeight: 30, fontWeight: "700" },
  formHeadingCopy: { flex: 1 },
  formEyebrow: { color: palette.muted, fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  formTitle: { color: palette.ink, fontSize: typeScale.title, fontWeight: "800", marginTop: 2 },
  roleBadge: { paddingHorizontal: 9, paddingVertical: 7, borderRadius: 6, backgroundColor: palette.successSoft },
  roleBadgeText: { color: palette.success, fontSize: 9, fontWeight: "800", letterSpacing: 0.5 },
  formIntro: { color: palette.inkSoft, fontSize: typeScale.body, lineHeight: 20, marginBottom: spacing.lg },
  helper: { color: palette.muted, fontSize: typeScale.label, lineHeight: 17, marginTop: -10, marginBottom: spacing.md },
  validation: { color: palette.danger, fontSize: typeScale.label, marginTop: -10, marginBottom: spacing.md },
  footnote: { color: palette.muted, fontSize: typeScale.label, lineHeight: 18, marginTop: spacing.md },
  infoCard: { backgroundColor: palette.ink, borderColor: palette.ink, padding: spacing.xl, gap: spacing.md },
  infoCardWide: { flex: 0.8 },
  infoEyebrow: { color: palette.orange, fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  infoTitle: { color: palette.white, fontSize: typeScale.title, lineHeight: 25, fontWeight: "800" },
  infoBody: { color: palette.white, opacity: 0.78, fontSize: typeScale.body, lineHeight: 20 },
  rule: { height: 1, backgroundColor: "rgba(251, 250, 245, 0.2)", marginVertical: spacing.xs },
  ruleRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  ruleMark: { color: palette.orange, fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  ruleText: { flex: 1, color: palette.white, fontSize: typeScale.label, fontWeight: "600" },
});
