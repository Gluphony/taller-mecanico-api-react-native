# Taller mecánico

Aplicación de gestión de clientes, vehículos y servicios de mantenimiento. Incluye una API REST en ASP.NET Core 8, una base de datos relacional Microsoft SQL Server y un cliente multiplataforma React Native con Expo.

La base se divide en esquema (`database/create_database.sql`) y operaciones (`database/create_procedures.sql`). La API llama esos procedimientos desde sus repositorios; no contiene consultas CRUD SQL pegadas en C#.

## Clonar el repositorio

```powershell
git clone https://github.com/Gluphony/taller-mecanico-api-react-native.git
cd taller-mecanico-api-react-native
```

Requisitos: .NET 8 SDK, Node.js 24.3 o posterior de la rama 24, npm y SQL Server local o remoto. Expo SDK 58 no recomienda Node 25.

## Base de datos

1. Ejecuta `database/create_database.sql` una sola vez en SQL Server Management Studio con una cuenta que pueda crear bases de datos. Crea las tablas e índices en `TallerMecanicoDb`; no carga registros de ejemplo.
2. Ejecuta `database/create_procedures.sql` en la misma instancia. Sus procedimientos se pueden volver a ejecutar para instalarlos o actualizarlos.

El instalador de esquema es para una base nueva y vacía; no lo uses para actualizar una base con datos. El script no crea usuarios predeterminados ni inserta el usuario `string`.

Si ya tienes una base creada con una versión anterior, no vuelvas a ejecutar el instalador. Ejecuta `database/create_procedures.sql` y luego `database/upgrade_constraints.sql`; la migración valida primero los registros existentes y agrega reglas `CHECK` sin borrar ni reescribir datos.

La configuración compartida usa la instancia local predeterminada (`localhost`). Si tu servidor usa una instancia con nombre, configura la variable para la sesión actual de PowerShell antes de iniciar la API:

```powershell
$env:ConnectionStrings__TallerDb = 'Server=localhost\SQLEXPRESS;Database=TallerMecanicoDb;Integrated Security=True;Encrypt=True;TrustServerCertificate=True'
```

Cambia `SQLEXPRESS` por el nombre de tu instancia. También puedes guardar la cadena local en `Foro2_Last/appsettings.Development.json`, archivo ignorado por Git. El repositorio no guarda bases de datos ni credenciales.

Para usar la plantilla incluida para desarrollo local, copia el archivo y ajusta el nombre de instancia si es distinto:

```powershell
Copy-Item .\Foro2_Last\appsettings.Development.example.json .\Foro2_Last\appsettings.Development.json
```

## Iniciar la API

Desde la raíz del repositorio:

```powershell
dotnet restore .\Foro2_Last\Foro2_Last.csproj
dotnet run --project .\Foro2_Last\Foro2_Last.csproj
```

Swagger: `http://localhost:5250/swagger`. `GET /health` verifica la API y `GET /health/ready` verifica también la conexión con SQL Server.

En Development, si no defines `Jwt:Key`, se crea una clave temporal al iniciar; al reiniciar la API, los tokens anteriores dejan de ser válidos. En producción configura `Jwt__Key` como secreto de al menos 32 bytes, además de `Jwt__Issuer`, `Jwt__Audience`, `ConnectionStrings__TallerDb` y los orígenes permitidos en `Cors__AllowedOrigins__0`.

### Error MSB3021 o MSB3027 en Visual Studio

Si la salida de compilación dice que `Taller.Application.dll` o `Taller.Infrastructure.dll` están en uso, detén la depuración con **Mayús+F5** y vuelve a compilar. La API debe detenerse para que Visual Studio reemplace los archivos que usa.

## Primer acceso

La app consulta `GET /api/auth/status`: si la base no tiene cuentas, muestra el formulario para crear el primer administrador; si ya tiene una, muestra el inicio de sesión. `POST /api/auth/bootstrap` crea ese primer acceso una sola vez y pide una contraseña de 12 a 200 caracteres. Después se inicia sesión con `POST /api/auth/login`. No hay usuario ni contraseña de demostración. Las rutas de datos usan el JWT en `Authorization: Bearer <token>`.

Para registrar otra cuenta, inicia sesión con el administrador y envía `POST /api/auth/usuarios` con ese JWT:

```json
{
  "nombreUsuario": "mecanico1",
  "contrasena": "una-contrasena-segura"
}
```

Solo un token con rol `Administrador` puede llamar el endpoint. La cuenta nueva se registra como `Empleado`. El nombre debe tener entre 3 y 80 caracteres y la contraseña entre 12 y 200. Una cuenta de empleado no puede crear otras; los nombres duplicados devuelven HTTP 409.

## CRUD disponible

El CRUD también está definido en SQL Server: `Clientes_Listar`, `Clientes_ObtenerPorId`, `Clientes_Crear`, `Clientes_Actualizar` y `Clientes_Eliminar`; los procedimientos de vehículos y mantenimientos siguen el mismo patrón. Las búsquedas y el historial usan parámetros, y las eliminaciones respetan las relaciones.

## API disponible

| Recurso | Crear | Consultar y buscar | Actualizar | Eliminar |
|---|---|---|---|---|
| Clientes | `POST /api/clientes` | `GET /api/clientes`, `GET /api/clientes/{id}` | `PUT /api/clientes/{id}` | `DELETE /api/clientes/{id}` |
| Vehículos | `POST /api/vehiculos` | `GET /api/vehiculos`, `GET /api/vehiculos/{id}` | `PUT /api/vehiculos/{id}` | `DELETE /api/vehiculos/{id}` |
| Mantenimientos | `POST /api/mantenimientos` | `GET /api/mantenimientos`, `GET /api/mantenimientos/{id}`, `GET /api/vehiculos/{id}/historial` | `PUT /api/mantenimientos/{id}` | `DELETE /api/mantenimientos/{id}` |

Un vehículo se puede asociar o reasociar con `PUT /api/vehiculos/{id}/cliente`. Filtros: `GET /api/clientes?buscar=...`, `GET /api/vehiculos?clienteId=1&buscar=...` y `GET /api/mantenimientos?vehiculoId=1`.

Placas, VIN informados, correos informados y nombres de usuario son únicos. No se elimina un cliente con vehículos asociados ni un vehículo con servicios registrados; esos conflictos devuelven HTTP 409.

## Aplicación React Native / web

Desde la raíz del repositorio:

```powershell
cd .\TallerMovil
npm ci
npm run web
```

La versión web apunta por defecto a `http://localhost:5250`. Android emulado apunta a `http://10.0.2.2:5250`. Para un teléfono físico, copia `.env.example` como `.env`, define `EXPO_PUBLIC_API_URL` con la IP del equipo y ejecuta la API escuchando en `0.0.0.0:5250`; ambos dispositivos deben compartir la red.

La foto de portada es de Lorenzo Hamers, publicada bajo la licencia de Unsplash. Se descarga desde Unsplash al mostrarla; el resto de la interfaz funciona si no hay conexión a esa imagen.
