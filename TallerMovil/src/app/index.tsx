import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable,
  ScrollView, Text, TextInput, useWindowDimensions, View,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  API_BASE_URL, apiRequest, jsonBody, setApiToken,
  type Cliente, type Mantenimiento, type Sesion, type Vehiculo,
} from "@/api";
import { Button, BrandMark, Field, SectionHeading, Surface, TabBar } from "@/components/design";
import { ClientCard, EmptyCard, MetricCard, ServiceCard, VehicleCard } from "@/components/records";
import {
  ClientForm, ServiceForm, VehicleForm,
  type ClienteValues, type MantenimientoValues, type VehiculoValues,
} from "@/components/forms";
import { readToken, removeToken, saveToken } from "@/storage";
import { palette, workshopImage } from "@/theme";
import styles from "./styles";

type Tab = "inicio" | "clientes" | "vehiculos" | "servicios";
type AuthMode = "login" | "bootstrap";
type Overlay =
  | { type: "cliente"; item?: Cliente }
  | { type: "vehiculo"; item?: Vehiculo }
  | { type: "servicio"; vehiculoId?: number; item?: Mantenimiento }
  | { type: "historial"; vehiculo: Vehiculo }
  | null;
type AppNotice = { type: "error" | "success" | "info"; message: string };

export default function TallerHome() {
  const { width } = useWindowDimensions();
  const wide = width >= 760;
  const [token, setToken] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [userName, setUserName] = useState("Equipo");
  const [mode, setMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [tab, setTab] = useState<Tab>("inicio");
  const [clients, setClients] = useState<Cliente[]>([]);
  const [vehicles, setVehicles] = useState<Vehiculo[]>([]);
  const [services, setServices] = useState<Mantenimiento[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiIssue, setApiIssue] = useState<string | null>(null);
  const [notice, setNotice] = useState<AppNotice | null>(null);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const refreshData = useCallback(async (accessToken: string | null) => {
    if (!accessToken) return;
    setLoading(true);
    setApiIssue(null);
    try {
      const [c, v, s] = await Promise.all([
        apiRequest<Cliente[]>("/api/clientes"),
        apiRequest<Vehiculo[]>("/api/vehiculos"),
        apiRequest<Mantenimiento[]>("/api/mantenimientos"),
      ]);
      setClients(c);
      setVehicles(v);
      setServices(s);
    } catch (error) {
      setApiIssue(error instanceof Error ? error.message : "No se pudo actualizar la información.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    readToken().then(async (saved) => {
      if (!active) return;
      if (saved) {
        setApiToken(saved);
        setToken(saved);
        await refreshData(saved);
      }
      if (active) setChecking(false);
    });
    return () => { active = false; };
  }, [refreshData]);

  async function submitAuth() {
    if (!username.trim() || !password) {
      setNotice({ type: "error", message: "Escribe usuario y contraseña para continuar." });
      return;
    }
    if (mode === "bootstrap" && password.length < 12) {
      setNotice({ type: "error", message: "La contraseña inicial debe tener al menos 12 caracteres." });
      return;
    }
    setAuthBusy(true);
    setNotice(null);
    try {
      if (mode === "bootstrap") {
        await apiRequest("/api/auth/bootstrap", {
          method: "POST",
          body: jsonBody({ nombreUsuario: username.trim(), contrasena: password }),
        });
        setMode("login");
        setNotice({ type: "success", message: "Administrador creado. Ya puedes iniciar sesión." });
      } else {
        const result = await apiRequest<Sesion>("/api/auth/login", {
          method: "POST",
          body: jsonBody({ nombreUsuario: username.trim(), contrasena: password }),
        });
        setApiToken(result.token);
        setToken(result.token);
        setUserName(result.nombreUsuario || username.trim());
        try {
          await saveToken(result.token);
        } catch {
          setNotice({ type: "info", message: "Sesión iniciada; no se pudo guardar en el dispositivo." });
        }
        setPassword("");
        await refreshData(result.token);
      }
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "No fue posible iniciar sesión." });
    } finally {
      setAuthBusy(false);
    }
  }

  async function logout() {
    await removeToken();
    setApiToken(null);
    setToken(null);
    setClients([]);
    setVehicles([]);
    setServices([]);
    setTab("inicio");
    setNotice(null);
  }

  async function saved(message: string) {
    setOverlay(null);
    setNotice({ type: "success", message });
    await refreshData(token);
  }

  async function saveClient(values: ClienteValues) {
    if (!overlay || overlay.type !== "cliente") return;
    setSaving(true);
    try {
      const id = overlay.item?.id;
      await apiRequest(id ? "/api/clientes/" + id : "/api/clientes", {
        method: id ? "PUT" : "POST",
        body: jsonBody(values),
      });
      await saved(id ? "Cambios del cliente guardados." : "Cliente registrado.");
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "No se pudo guardar el cliente." });
    } finally {
      setSaving(false);
    }
  }

  async function saveVehicle(values: VehiculoValues) {
    if (!overlay || overlay.type !== "vehiculo") return;
    setSaving(true);
    try {
      const id = overlay.item?.id;
      await apiRequest(id ? "/api/vehiculos/" + id : "/api/vehiculos", {
        method: id ? "PUT" : "POST",
        body: jsonBody(values),
      });
      await saved(id ? "Vehículo actualizado." : "Vehículo registrado y vinculado al cliente.");
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "No se pudo guardar el vehículo." });
    } finally {
      setSaving(false);
    }
  }

  async function saveService(values: MantenimientoValues) {
    if (!overlay || overlay.type !== "servicio") return;
    setSaving(true);
    try {
      const id = overlay.item?.id;
      await apiRequest(id ? "/api/mantenimientos/" + id : "/api/mantenimientos", {
        method: id ? "PUT" : "POST",
        body: jsonBody({
          ...values,
          fechaServicio: values.fechaServicio + "T09:00:00",
          proximoMantenimiento: values.proximoMantenimiento
            ? values.proximoMantenimiento + "T09:00:00"
            : null,
        }),
      });
      await saved(id ? "Cambios del servicio guardados." : "Servicio agregado al historial del vehículo.");
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "No se pudo guardar el servicio." });
    } finally {
      setSaving(false);
    }
  }

  async function deleteRecord(kind: "clientes" | "vehiculos" | "mantenimientos", id: number) {
    setSaving(true);
    try {
      await apiRequest("/api/" + kind + "/" + id, { method: "DELETE" });
      const messages = {
        clientes: "Cliente eliminado.",
        vehiculos: "Vehículo eliminado.",
        mantenimientos: "Servicio eliminado del historial.",
      };
      await saved(messages[kind]);
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "No se pudo eliminar el registro." });
    } finally {
      setSaving(false);
    }
  }

  const q = search.trim().toLocaleLowerCase();
  const visibleClients = useMemo(() => clients.filter((x) =>
    !q || [x.nombreCompleto, x.telefono, x.email].filter(Boolean).some((s) => String(s).toLocaleLowerCase().includes(q))),
  [clients, q]);
  const visibleVehicles = useMemo(() => vehicles.filter((x) =>
    !q || [x.placa, x.marca, x.modelo, x.clienteNombre].filter(Boolean).some((s) => String(s).toLocaleLowerCase().includes(q))),
  [vehicles, q]);
  const visibleServices = useMemo(() => services.filter((x) =>
    !q || [x.placa, x.marca, x.modelo, x.tipoServicio, x.descripcion].filter(Boolean).some((s) => String(s).toLocaleLowerCase().includes(q))),
  [services, q]);

  if (checking) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator color={palette.success} size="large" />
        <Text style={styles.mutedText}>Preparando tu taller…</Text>
      </SafeAreaView>
    );
  }

  if (!token) {
    return (
      <AuthScreen
        mode={mode} setMode={(value) => { setMode(value); setNotice(null); }}
        username={username} setUsername={setUsername}
        password={password} setPassword={setPassword}
        notice={notice} busy={authBusy} wide={wide} onSubmit={submitAuth}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={[styles.appFrame, wide && styles.appFrameWide]}>
        <View style={styles.topBar}>
          <BrandMark />
          <View style={styles.topActions}>
            <View style={styles.userBadge}><Text style={styles.userInitial}>{userName[0]?.toUpperCase() || "T"}</Text></View>
            <Button title="Salir" variant="quiet" small onPress={logout} />
          </View>
        </View>

        {notice && !overlay && <Notice notice={notice} onClose={() => setNotice(null)} />}
        {apiIssue && (
          <View style={styles.apiIssue}>
            <Text style={styles.issueMark}>!</Text>
            <View style={styles.issueCopy}>
              <Text style={styles.issueTitle}>No se pudo actualizar la información</Text>
              <Text style={styles.issueText}>{apiIssue}</Text>
              <Text style={styles.issueUrl}>{API_BASE_URL}</Text>
            </View>
            <Pressable onPress={() => void refreshData(token)}><Text style={styles.retry}>Reintentar</Text></Pressable>
          </View>
        )}

        <View style={[styles.body, wide && styles.bodyWide]}>
          {wide && <TabBar active={tab} wide onChange={(next) => { setTab(next); setSearch(""); }} />}
          <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, wide && styles.contentWide]} keyboardShouldPersistTaps="handled">
            {tab === "inicio" && (
              <Dashboard
                clients={clients} vehicles={vehicles} services={services} loading={loading}
                onAddClient={() => setOverlay({ type: "cliente" })}
                onAddVehicle={() => setOverlay({ type: "vehiculo" })}
                onAddService={() => setOverlay({ type: "servicio" })}
                onOpenClients={() => setTab("clientes")}
                onOpenVehicles={() => setTab("vehiculos")}
                onOpenServices={() => setTab("servicios")}
                onHistory={(vehicle) => setOverlay({ type: "historial", vehiculo: vehicle })}
              />
            )}

            {tab === "clientes" && (
              <View>
                <PageHeading eyebrow="RELACIONES" title="Clientes" detail="Toda su información, en un solo lugar."
                  action="+ Nuevo cliente" onAction={() => setOverlay({ type: "cliente" })} />
                <SearchField value={search} onChange={setSearch} placeholder="Buscar nombre, teléfono o correo" />
                <SectionHeading title="Lista de clientes" action={visibleClients.length + " registros"} />
                {visibleClients.length
                  ? visibleClients.map((client) => <ClientCard key={client.id} cliente={client} onPress={() => setOverlay({ type: "cliente", item: client })} />)
                  : <EmptyCard title={q ? "No encontramos coincidencias" : "Aún no hay clientes"}
                      detail={q ? "Prueba con otro nombre, teléfono o correo." : "Registra el primer cliente para organizar el taller."}
                      action={q ? "Limpiar búsqueda" : "Registrar cliente"}
                      onPress={() => q ? setSearch("") : setOverlay({ type: "cliente" })} />}
              </View>
            )}

            {tab === "vehiculos" && (
              <View>
                <PageHeading eyebrow="GARAGE" title="Vehículos" detail="Propietario e historial, siempre a mano."
                  action="+ Nuevo vehículo" onAction={() => setOverlay({ type: "vehiculo" })} />
                <SearchField value={search} onChange={setSearch} placeholder="Buscar placa, marca o cliente" />
                <SectionHeading title="Vehículos registrados" action={visibleVehicles.length + " en el taller"} />
                {visibleVehicles.length
                  ? <View style={wide ? styles.vehicleGrid : undefined}>
                      {visibleVehicles.map((vehicle) => (
                        <View key={vehicle.id} style={wide ? styles.vehicleGridItem : undefined}>
                          <VehicleCard vehiculo={vehicle}
                            onHistory={() => setOverlay({ type: "historial", vehiculo: vehicle })}
                            onEdit={() => setOverlay({ type: "vehiculo", item: vehicle })} />
                        </View>
                      ))}
                    </View>
                  : <EmptyCard title={q ? "No encontramos coincidencias" : "Tu garage empieza aquí"}
                      detail={q ? "Prueba con otra placa o marca." : "Registra un vehículo y vincúlalo a su cliente."}
                      action={q ? "Limpiar búsqueda" : "Registrar vehículo"}
                      onPress={() => q ? setSearch("") : setOverlay({ type: "vehiculo" })} />}
              </View>
            )}

            {tab === "servicios" && (
              <View>
                <PageHeading eyebrow="MANTENIMIENTO" title="Servicios" detail="Cada visita queda guardada en el historial."
                  action="+ Registrar servicio" onAction={() => setOverlay({ type: "servicio" })} />
                <SearchField value={search} onChange={setSearch} placeholder="Buscar placa o tipo de servicio" />
                <SectionHeading title="Historial de servicios" action={visibleServices.length + " registros"} />
                {visibleServices.length
                  ? visibleServices.map((service) => (
                      <Pressable key={service.id} onPress={() => setOverlay({ type: "servicio", item: service })}>
                        <ServiceCard servicio={service} />
                      </Pressable>
                    ))
                  : <EmptyCard title={q ? "No encontramos coincidencias" : "Aún no hay servicios"}
                      detail={q ? "Prueba con otra placa o descripción." : "Registra una visita y aparecerá aquí y en el historial del vehículo."}
                      action={q ? "Limpiar búsqueda" : "Registrar servicio"}
                      onPress={() => q ? setSearch("") : setOverlay({ type: "servicio" })} />}
              </View>
            )}
          </ScrollView>
          {!wide && <TabBar active={tab} onChange={(next) => { setTab(next); setSearch(""); }} />}
        </View>
      </View>

      <EditorModal
        overlay={overlay} clients={clients} vehicles={vehicles} services={services} saving={saving}
        onClose={() => setOverlay(null)} onSaveClient={saveClient} onSaveVehicle={saveVehicle}
        onSaveService={saveService}
        notice={notice} onCloseNotice={() => setNotice(null)}
        onDeleteClient={(id) => void deleteRecord("clientes", id)}
        onDeleteVehicle={(id) => void deleteRecord("vehiculos", id)}
        onDeleteService={(id) => void deleteRecord("mantenimientos", id)}
        onAddService={(vehiculoId) => setOverlay({ type: "servicio", vehiculoId })}
      />
    </SafeAreaView>
  );
}

function AuthScreen({
  mode, setMode, username, setUsername, password, setPassword,
  notice, busy, wide, onSubmit,
}: {
  mode: AuthMode;
  setMode: (value: AuthMode) => void;
  username: string;
  setUsername: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  notice: AppNotice | null;
  busy: boolean;
  wide: boolean;
  onSubmit: () => void;
}) {
  return (
    <SafeAreaView style={styles.authRoot}>
      <ScrollView contentContainerStyle={styles.authScroll} keyboardShouldPersistTaps="handled">
        <View style={[styles.authLayout, wide && styles.authLayoutWide]}>
          <View style={styles.authStory}>
            <BrandMark />
            <View style={styles.storyEyebrow}><View style={styles.onlineDot} /><Text style={styles.storyEyebrowText}>GESTIÓN DE TALLER</Text></View>
            <Text style={styles.authTitle}>Precisión en cada servicio.</Text>
            <Text style={styles.authDescription}>Clientes, vehículos e historial técnico conectados en una plataforma clara para el trabajo diario.</Text>
            <View style={styles.storyCard}>
              <Image source={workshopImage} style={styles.storyImage} contentFit="cover" transition={400} accessibilityLabel="Automóvil en un taller mecánico" />
              <View style={styles.storyOverlay} />
              <View style={styles.storyCardTop}>
                <Text style={styles.storyCardEyebrow}>TALLER · SERVICIO · CONFIANZA</Text>
                <Text style={styles.storyCardIndex}>01 / 04</Text>
              </View>
              <Text style={styles.storyCardTitle}>Cada unidad, con su historia al día.</Text>
            </View>
          </View>

          <View style={styles.authPanel}>
            <Text style={styles.authEyebrow}>{mode === "login" ? "BIENVENIDO DE VUELTA" : "CONFIGURACIÓN INICIAL"}</Text>
            <Text style={styles.authPanelTitle}>{mode === "login" ? "Inicia sesión" : "Crea el acceso del taller"}</Text>
            <Text style={styles.authPanelCopy}>
              {mode === "login" ? "Entra con tu cuenta de administrador." : "Este paso crea el primer administrador y solo se realiza una vez."}
            </Text>
            {notice && <Notice notice={notice} />}
            {mode === "bootstrap" && <Text style={styles.passwordHint}>Usa una contraseña segura de al menos 12 caracteres.</Text>}
            <Field label="USUARIO" value={username} onChangeText={setUsername} placeholder="Tu nombre de usuario" autoCapitalize="none" />
            <Field label="CONTRASEÑA" value={password} onChangeText={setPassword} placeholder="Escribe tu contraseña" secureTextEntry autoCapitalize="none" />
            <Button title={mode === "login" ? "Entrar al taller" : "Crear administrador"} onPress={onSubmit} loading={busy} />
            <Pressable onPress={() => setMode(mode === "login" ? "bootstrap" : "login")} style={styles.modeLink}>
              <Text style={styles.modeLinkText}>
                {mode === "login" ? "¿Primera vez? " : "¿Ya tienes usuario? "}
                <Text style={styles.modeLinkStrong}>{mode === "login" ? "Configurar acceso" : "Volver al login"}</Text>
              </Text>
            </Pressable>
            <Text style={styles.authFootnote}>Sesión segura · Datos conectados a la API del taller</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Dashboard({
  clients, vehicles, services, loading,
  onAddClient, onAddVehicle, onAddService,
  onOpenClients, onOpenVehicles, onOpenServices, onHistory,
}: {
  clients: Cliente[];
  vehicles: Vehiculo[];
  services: Mantenimiento[];
  loading: boolean;
  onAddClient: () => void;
  onAddVehicle: () => void;
  onAddService: () => void;
  onOpenClients: () => void;
  onOpenVehicles: () => void;
  onOpenServices: () => void;
  onHistory: (vehicle: Vehiculo) => void;
}) {
  const today = new Date();
  const date = today.toLocaleDateString("es-NI", { weekday: "long", day: "numeric", month: "long" });
  return (
    <View>
      <View style={styles.dashHeading}>
        <View>
          <Text style={styles.eyebrow}>{date.toUpperCase()}</Text>
          <Text style={styles.dashTitle}>Todo en orden.</Text>
          <Text style={styles.dashSubtitle}>Un vistazo rápido al movimiento del taller.</Text>
        </View>
        {loading && <ActivityIndicator color={palette.success} />}
      </View>
      <View style={styles.hero}>
        <Image source={workshopImage} style={styles.heroImage} contentFit="cover" transition={400} accessibilityLabel="Vehículo en mantenimiento dentro del taller" />
        <View style={styles.heroShade} />
        <View style={styles.heroCopy}>
          <View style={styles.heroPill}><View style={styles.heroDot} /><Text style={styles.heroPillText}>OPERACIÓN DEL TALLER</Text></View>
          <Text style={styles.heroTitle}>Servicio preciso.{'\n'}Historial completo.</Text>
          <Text style={styles.heroText}>Consulta vehículos, registra cada visita y conserva el trabajo del taller organizado.</Text>
          <Button title="Registrar servicio" onPress={onAddService} variant="secondary" small />
        </View>
        <View style={styles.heroFoot}>
          <Text style={styles.heroFootText}>TALLER MECÁNICO · SERVICIO INTEGRAL</Text>
          <Text style={styles.heroFootText}>01 / 04</Text>
        </View>
      </View>
      <View style={styles.metrics}>
        <MetricCard value={clients.length} label="Clientes" glyph="C" tint={palette.accentSoft} />
        <MetricCard value={vehicles.length} label="Vehículos" glyph="V" tint={palette.orangeSoft} />
        <MetricCard value={services.length} label="Servicios" glyph="S" tint={palette.successSoft} />
      </View>
      <SectionHeading title="Accesos rápidos" />
      <View style={styles.quickList}>
        <QuickAction glyph="+" title="Nuevo cliente" detail="Abrir expediente" onPress={onAddClient} />
        <QuickAction glyph="▰" title="Nuevo vehículo" detail="Vincular propietario" onPress={onAddVehicle} />
        <QuickAction glyph="↻" title="Registrar servicio" detail="Actualizar historial" onPress={onAddService} />
      </View>
      <SectionHeading title="Actividad reciente" action="Ver todos" onAction={onOpenServices} />
      {services.length === 0 ? (
        <EmptyCard title="Todavía no hay movimientos" detail="Registra el primer servicio para iniciar el historial." action="Crear primer servicio" onPress={onAddService} />
      ) : services.slice(0, 3).map((service) => (
        <Pressable key={service.id} onPress={() => {
          const vehicle = vehicles.find((item) => item.id === service.vehiculoId);
          if (vehicle) onHistory(vehicle);
        }}>
          <ServiceCard servicio={service} />
        </Pressable>
      ))}
      {vehicles.length > 0 && (
        <Surface style={styles.garageNote}>
          <Text style={styles.garageCheck}>✓</Text>
          <View style={styles.garageCopy}>
            <Text style={styles.garageTitle}>Garage organizado</Text>
            <Text style={styles.garageText}>{vehicles.length} vehículo{vehicles.length === 1 ? "" : "s"} con propietario asociado.</Text>
          </View>
          <Pressable onPress={onOpenVehicles}><Text style={styles.garageArrow}>→</Text></Pressable>
        </Surface>
      )}
      <View style={styles.quickLinks}>
        <Pressable onPress={onOpenClients}><Text style={styles.quickLinkText}>Clientes →</Text></Pressable>
        <Pressable onPress={onOpenVehicles}><Text style={styles.quickLinkText}>Vehículos →</Text></Pressable>
      </View>
    </View>
  );
}

function QuickAction({ glyph, title, detail, onPress }: { glyph: string; title: string; detail: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.quickAction, pressed && styles.pressed]}>
      <View style={styles.quickGlyph}><Text style={styles.quickGlyphText}>{glyph}</Text></View>
      <View style={styles.quickCopy}><Text style={styles.quickTitle}>{title}</Text><Text style={styles.quickDetail}>{detail}</Text></View>
      <Text style={styles.quickArrow}>›</Text>
    </Pressable>
  );
}

function PageHeading({ eyebrow, title, detail, action, onAction }: {
  eyebrow: string; title: string; detail: string; action: string; onAction: () => void;
}) {
  return (
    <View style={styles.pageHeading}>
      <View style={styles.pageCopy}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.pageTitle}>{title}</Text>
        <Text style={styles.dashSubtitle}>{detail}</Text>
      </View>
      <Button title={action} onPress={onAction} small />
    </View>
  );
}

function SearchField({ value, onChange, placeholder }: {
  value: string; onChange: (value: string) => void; placeholder: string;
}) {
  return (
    <View style={styles.searchBox}>
      <Text style={styles.searchIcon}>⌕</Text>
      <TextInput value={value} onChangeText={onChange} placeholder={placeholder}
        placeholderTextColor={palette.muted} style={styles.searchInput}
        returnKeyType="search" clearButtonMode="while-editing" />
      {!!value && Platform.OS !== "ios" && <Pressable onPress={() => onChange("")}><Text style={styles.searchClear}>×</Text></Pressable>}
    </View>
  );
}

function Notice({ notice, onClose }: { notice: AppNotice; onClose?: () => void }) {
  const color = notice.type === "error" ? palette.danger : notice.type === "success" ? palette.success : palette.ink;
  const backgroundColor = notice.type === "error" ? palette.dangerSoft : notice.type === "success" ? palette.successSoft : palette.accentSoft;
  return (
    <View style={[styles.notice, { backgroundColor }]}>
      <View style={[styles.noticeDot, { backgroundColor: color }]} />
      <Text style={[styles.noticeText, { color }]}>{notice.message}</Text>
      {!!onClose && <Pressable onPress={onClose}><Text style={[styles.noticeX, { color }]}>×</Text></Pressable>}
    </View>
  );
}

function EditorModal({
  overlay, clients, vehicles, services, saving, notice, onClose, onCloseNotice,
  onSaveClient, onSaveVehicle, onSaveService, onAddService,
  onDeleteClient, onDeleteVehicle, onDeleteService,
}: {
  overlay: Overlay;
  clients: Cliente[];
  vehicles: Vehiculo[];
  services: Mantenimiento[];
  saving: boolean;
  notice: AppNotice | null;
  onClose: () => void;
  onCloseNotice: () => void;
  onSaveClient: (values: ClienteValues) => void;
  onSaveVehicle: (values: VehiculoValues) => void;
  onSaveService: (values: MantenimientoValues) => void;
  onAddService: (vehicleId: number) => void;
  onDeleteClient: (id: number) => void;
  onDeleteVehicle: (id: number) => void;
  onDeleteService: (id: number) => void;
}) {
  if (!overlay) return null;
  const title = overlay.type === "cliente" ? (overlay.item ? "Editar cliente" : "Nuevo cliente")
    : overlay.type === "vehiculo" ? (overlay.item ? "Editar vehículo" : "Nuevo vehículo")
      : overlay.type === "servicio" ? (overlay.item ? "Editar servicio" : "Registrar servicio") : "Historial del vehículo";
  const subtitle = overlay.type === "historial"
    ? overlay.vehiculo.placa + " · " + overlay.vehiculo.marca + " " + overlay.vehiculo.modelo
    : "Completa los datos para mantener el registro al día.";
  const history = overlay.type === "historial"
    ? services.filter((service) => service.vehiculoId === overlay.vehiculo.id)
    : [];
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <KeyboardAvoidingView style={styles.modalKeyboard} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeading}>
              <View style={styles.pageCopy}>
                <Text style={styles.sheetEyebrow}>TALLER · REGISTRO</Text>
                <Text style={styles.sheetTitle}>{title}</Text>
                <Text style={styles.sheetSubtitle}>{subtitle}</Text>
              </View>
              <Pressable onPress={onClose} style={styles.closeButton}><Text style={styles.closeGlyph}>×</Text></Pressable>
            </View>
            <ScrollView style={styles.sheetScroll} contentContainerStyle={styles.sheetContent} keyboardShouldPersistTaps="handled">
              {notice && <Notice notice={notice} onClose={onCloseNotice} />}
              {overlay.type === "cliente" && <ClientForm key={overlay.item?.id || "new-client"} initial={overlay.item} onClose={onClose} onSave={onSaveClient} onDelete={onDeleteClient} saving={saving} />}
              {overlay.type === "vehiculo" && <VehicleForm key={overlay.item?.id || "new-vehicle"} initial={overlay.item} clients={clients} onClose={onClose} onSave={onSaveVehicle} onDelete={onDeleteVehicle} saving={saving} />}
              {overlay.type === "servicio" && <ServiceForm key={overlay.item?.id || overlay.vehiculoId || "new-service"} initial={overlay.item} vehicles={vehicles} initialVehicleId={overlay.vehiculoId} onClose={onClose} onSave={onSaveService} onDelete={onDeleteService} saving={saving} />}
              {overlay.type === "historial" && (
                <View>
                  <View style={styles.historyCountRow}><Text style={styles.historyCount}>{history.length}</Text><Text style={styles.historyLabel}>{history.length === 1 ? "servicio registrado" : "servicios registrados"}</Text></View>
                  {history.length ? history.map((service) => <ServiceCard key={service.id} servicio={service} />) : (
                    <EmptyCard title="Sin visitas registradas" detail="El historial se llenará al guardar el primer servicio." action="Registrar servicio" onPress={() => onAddService(overlay.vehiculo.id)} />
                  )}
                  <View style={styles.historyAction}><Button title="Registrar servicio" onPress={() => onAddService(overlay.vehiculo.id)} /></View>
                </View>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

