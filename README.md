# Taller mecánico

Aplicación de gestión de clientes, vehículos y servicios de mantenimiento. Incluye una API REST en ASP.NET Core 8, una base de datos relacional Microsoft SQL Server y un cliente multiplataforma React Native con Expo.

## Clonar el repositorio

```powershell
git clone https://github.com/Gluphony/taller-mecanico-api-react-native.git
cd taller-mecanico-api-react-native
```

Requisitos: .NET 8 SDK, Node.js 24.3 o posterior de la rama 24, npm y SQL Server local o remoto. Expo SDK 58 no recomienda Node 25.

## Base de datos

1. Abre `database/create_database.sql` en SQL Server Management Studio.
2. Ejecútalo con una cuenta que pueda crear bases de datos.
3. El script crea `TallerMecanicoDb` y sus tablas. Se puede volver a ejecutar sin borrar registros.

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

Crea el primer administrador una sola vez con `POST /api/auth/bootstrap`, usando una contraseña de al menos 12 caracteres. Después inicia sesión con `POST /api/auth/login`. Las rutas de datos usan el JWT en `Authorization: Bearer <token>`. La aplicación también incluye estos formularios.

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
