# Taller mecánico: API, SQL Server y React Native

Sistema organizado por capas: dominio, aplicación, infraestructura y API ASP.NET Core 8. La base de datos es **relacional**, implementada en **Microsoft SQL Server**; el script de creación está escrito en **T-SQL**. No es una base NoSQL.

## Estructura

- `Taller.Domain`: entidades del negocio.
- `Taller.Application`: contratos, DTOs y reglas de aplicación.
- `Taller.Infrastructure`: repositorios SQL parametrizados y seguridad de contraseñas.
- `Foro2_Last`: API REST, JWT y Swagger.
- `database/create_database.sql`: creación/migración segura de tablas e índices.
- `TallerMovil`: interfaz React Native que también puede ejecutarse en navegador con Expo.

## Requisitos y base de datos

- .NET 8 SDK.
- SQL Server local o remoto.
- Para la instancia que usa este equipo: `localhost\SQLEXPRESS01`.

Ejecuta `database/create_database.sql` en SQL Server Management Studio usando una cuenta que pueda crear la base la primera vez. El script se puede volver a ejecutar: crea objetos faltantes y añade la columna de migración requerida, sin borrar tablas ni registros.

La cadena local ya está configurada en `Foro2_Last/appsettings.json`. Si usas otra instancia, modifica `ConnectionStrings:TallerDb` o configura la variable `ConnectionStrings__TallerDb`. Ejemplo de cadena para PowerShell:

```powershell
$env:ConnectionStrings__TallerDb = 'Server=localhost\SQLEXPRESS01;Database=TallerMecanicoDb;Integrated Security=True;Encrypt=True;TrustServerCertificate=True'
```

## Iniciar la API

Desde la raíz del repositorio:

```powershell
dotnet restore .\Foro2_Last\Foro2_Last.csproj
dotnet run --project .\Foro2_Last\Foro2_Last.csproj
```

Swagger se abre en `http://localhost:5250/swagger`. `GET /health` confirma que la API responde; `GET /health/ready` confirma también la conexión a SQL Server. Si falla este último, revisa que el servicio `SQLEXPRESS01` esté iniciado y que la cadena apunte a la instancia correcta.

En Development, si falta `Jwt:Key`, la API genera una clave temporal al iniciar; los tokens anteriores dejan de ser válidos al reiniciar. Para producción configura `Jwt__Key` como secreto con al menos 32 bytes, además de `Jwt__Issuer`, `Jwt__Audience`, `ConnectionStrings__TallerDb` y `Cors__AllowedOrigins__0` cuando corresponda.

## Acceso inicial

La primera cuenta administradora se crea una sola vez mediante `POST /api/auth/bootstrap`, con contraseña de al menos 12 caracteres. Luego usa `POST /api/auth/login`; las rutas de datos requieren el JWT recibido en `Authorization: Bearer <token>`. El formulario inicial de Expo permite crear esa cuenta cuando no existe un usuario.

## Operaciones CRUD

| Recurso | Crear | Consultar/buscar | Actualizar | Eliminar |
|---|---|---|---|---|
| Clientes | `POST /api/clientes` | `GET /api/clientes`, `GET /api/clientes/{id}` | `PUT /api/clientes/{id}` | `DELETE /api/clientes/{id}` |
| Vehículos | `POST /api/vehiculos` | `GET /api/vehiculos`, `GET /api/vehiculos/{id}` | `PUT /api/vehiculos/{id}` | `DELETE /api/vehiculos/{id}` |
| Mantenimientos | `POST /api/mantenimientos` | `GET /api/mantenimientos`, `GET /api/mantenimientos/{id}`, `GET /api/vehiculos/{id}/historial` | `PUT /api/mantenimientos/{id}` | `DELETE /api/mantenimientos/{id}` |

También puedes asociar/reasociar un vehículo mediante `PUT /api/vehiculos/{id}/cliente`. Los filtros son `GET /api/clientes?buscar=...`, `GET /api/vehiculos?clienteId=1&buscar=...` y `GET /api/mantenimientos?vehiculoId=1`.

Reglas de integridad: placas, VIN informados, correos informados y nombres de usuario son únicos. Un cliente no se puede eliminar si tiene vehículos; un vehículo no se puede eliminar si tiene servicios. Para eliminar un servicio se solicita confirmación en la app. Las validaciones también se aplican en el servidor y la base de datos; los conflictos de unicidad o relaciones devuelven HTTP 409.

## Aplicación React Native / web

Desde la carpeta `TallerMovil`:

```powershell
npm install
npm run web
```

La app web llama por defecto a `http://localhost:5250`. Para Android emulado usa `http://10.0.2.2:5250`; en un teléfono, configura `EXPO_PUBLIC_API_URL` con la IP local del equipo. Más detalles en `TallerMovil/README.md`.
