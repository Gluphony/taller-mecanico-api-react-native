# Taller mecánico: API y base de datos

Backend REST en ASP.NET Core 8, SQL Server y arquitectura por capas, siguiendo la separación del proyecto de referencia:

- Taller.Domain: entidades del negocio.
- Taller.Application: DTOs, contratos de repositorio y servicios.
- Taller.Infrastructure: acceso parametrizado a SQL Server y hash de contraseñas.
- Foro2_Last: API web, controladores, autenticación JWT y Swagger.
- database/create_database.sql: creación de la base y tablas.

## Requisitos

- .NET 8 SDK.
- SQL Server local o remoto.
- Una cuenta de SQL Server con permiso para crear la base de datos al ejecutar el script.

## Puesta en marcha

1. Abre database/create_database.sql en SQL Server Management Studio y ejecútalo.
2. Ajusta ConnectionStrings:TallerDb en Foro2_Last/appsettings.json si tu instancia de SQL Server no es localhost. En producción, configura la cadena como variable ConnectionStrings__TallerDb y evita guardar credenciales en el repositorio.
3. Configura Jwt__Key como variable de entorno con al menos 32 bytes. En PowerShell puedes generar una clave para la sesión actual así:

       $env:Jwt__Key = [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))

   En producción configura también Jwt__Issuer, Jwt__Audience, ConnectionStrings__TallerDb y, si corresponde, Cors__AllowedOrigins__0 como secretos o variables del entorno.
4. Desde la raíz del repositorio, ejecuta estos comandos de PowerShell:
   dotnet restore .\Foro2_Last\Foro2_Last.csproj
   dotnet run --project .\Foro2_Last\Foro2_Last.csproj
5. En desarrollo abre Swagger en la URL HTTPS indicada por la consola. El endpoint GET /health devuelve el estado de disponibilidad.

La primera cuenta administradora se crea una sola vez mediante POST /api/auth/bootstrap. Usa una contraseña de al menos 12 caracteres. Después de crearla, el endpoint queda cerrado. Inicia sesión en POST /api/auth/login y usa el token recibido como Authorization: Bearer <token> para las demás rutas.

## Rutas principales

| Método | Ruta | Uso |
|---|---|---|
| POST | /api/auth/bootstrap | Crear el primer administrador (solo una vez) |
| POST | /api/auth/login | Iniciar sesión y obtener JWT |
| GET / POST | /api/clientes | Buscar/listar y registrar clientes |
| GET / PUT | /api/clientes/{id} | Consultar y actualizar clientes |
| GET / POST | /api/vehiculos | Consultar y registrar vehículos |
| GET / PUT | /api/vehiculos/{id} | Consultar y actualizar vehículos |
| PUT | /api/vehiculos/{id}/cliente | Asociar o reasociar el vehículo a un cliente |
| GET | /api/vehiculos/{id}/historial | Consultar el historial de mantenimiento |
| GET / POST | /api/mantenimientos | Consultar y registrar mantenimientos |
| GET | /api/mantenimientos/{id} | Consultar el detalle de un mantenimiento |

Los listados aceptan filtros: GET /api/clientes?buscar=..., GET /api/vehiculos?clienteId=1&buscar=... y GET /api/mantenimientos?vehiculoId=1.

## Ejemplos de JSON

Crear cliente:
    {
      "nombreCompleto": "Ana López",
      "telefono": "8888-0000",
      "email": "ana@example.com",
      "direccion": "Managua"
    }

Crear vehículo:
    {
      "clienteId": 1,
      "placa": "M123456",
      "vin": "1HGCM82633A004352",
      "marca": "Honda",
      "modelo": "Civic",
      "anio": 2020,
      "color": "Azul"
    }

Registrar mantenimiento:
    {
      "vehiculoId": 1,
      "fechaServicio": "2026-11-13T09:00:00Z",
      "tipoServicio": "Cambio de aceite",
      "descripcion": "Cambio de aceite y filtro",
      "kilometraje": 50000,
      "costo": 1800.00,
      "tecnico": "Luis",
      "recomendaciones": "Revisar frenos en la próxima visita",
      "proximoMantenimiento": "2027-05-13T09:00:00Z"
    }

## Integridad y resguardo

Las tablas aplican claves foráneas, índices únicos para placa, VIN, correo y usuario, y restricciones de validación. Las operaciones usan parámetros SQL. Las contraseñas se guardan con PBKDF2 y sal aleatoria; las rutas de datos requieren JWT. Para conservar la información, configura copias periódicas de SQL Server según la política del entorno donde se despliegue.


## Aplicación móvil

La interfaz React Native está en la carpeta TallerMovil. Para abrir la vista de navegador, inicia primero la API y después, desde TallerMovil, ejecuta:

    npm run web

Expo mostrará la URL local de la interfaz. En el emulador Android el API predeterminado usa 10.0.2.2:5250. En un teléfono físico, configura EXPO_PUBLIC_API_URL con la IP local del equipo y ejecuta la API escuchando en 0.0.0.0:5250. La guía detallada está en TallerMovil/README.md.
