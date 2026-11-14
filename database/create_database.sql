/*
    Base de datos relacional para el sistema de taller mecánico.
    Motor: Microsoft SQL Server. Lenguaje: T-SQL.

    Script seguro para volver a ejecutar: crea objetos faltantes y no elimina datos.
    Requiere una cuenta con permiso para crear la base de datos la primera vez.
*/

IF DB_ID(N'TallerMecanicoDb') IS NULL
BEGIN
    EXEC(N'CREATE DATABASE [TallerMecanicoDb];');
END;
GO

USE [TallerMecanicoDb];
GO

/* Opciones requeridas por SQL Server para crear índices filtrados. */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
SET ANSI_PADDING ON;
SET ANSI_WARNINGS ON;
SET ARITHABORT ON;
SET CONCAT_NULL_YIELDS_NULL ON;
SET NUMERIC_ROUNDABORT OFF;
GO

/* Clientes */
IF OBJECT_ID(N'dbo.Clientes', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Clientes
    (
        ClienteId       INT IDENTITY(1,1) NOT NULL
            CONSTRAINT PK_Clientes PRIMARY KEY,
        NombreCompleto  NVARCHAR(120) NOT NULL,
        Telefono        NVARCHAR(30) NULL,
        Email           NVARCHAR(254) NULL,
        Direccion       NVARCHAR(250) NULL,
        FechaRegistro   DATETIME2(0) NOT NULL
            CONSTRAINT DF_Clientes_FechaRegistro DEFAULT SYSUTCDATETIME(),
        ActualizadoEn   DATETIME2(0) NULL,
        CONSTRAINT CK_Clientes_Nombre
            CHECK (LEN(LTRIM(RTRIM(NombreCompleto))) >= 2)
    );
END;
GO

/* Usuarios de acceso */
IF OBJECT_ID(N'dbo.Usuarios', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Usuarios
    (
        UsuarioId       INT IDENTITY(1,1) NOT NULL
            CONSTRAINT PK_Usuarios PRIMARY KEY,
        NombreUsuario   NVARCHAR(80) NOT NULL,
        PasswordHash    NVARCHAR(256) NOT NULL,
        Rol             NVARCHAR(30) NOT NULL
            CONSTRAINT DF_Usuarios_Rol DEFAULT N'Administrador',
        Activo          BIT NOT NULL
            CONSTRAINT DF_Usuarios_Activo DEFAULT 1,
        FechaRegistro   DATETIME2(0) NOT NULL
            CONSTRAINT DF_Usuarios_FechaRegistro DEFAULT SYSUTCDATETIME(),
        CONSTRAINT CK_Usuarios_Nombre
            CHECK (LEN(LTRIM(RTRIM(NombreUsuario))) >= 3)
    );
END;
GO

/* Vehículos asociados a un cliente */
IF OBJECT_ID(N'dbo.Vehiculos', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Vehiculos
    (
        VehiculoId      INT IDENTITY(1,1) NOT NULL
            CONSTRAINT PK_Vehiculos PRIMARY KEY,
        ClienteId       INT NOT NULL,
        Placa           NVARCHAR(12) NOT NULL,
        Vin             NVARCHAR(17) NULL,
        Marca           NVARCHAR(60) NOT NULL,
        Modelo          NVARCHAR(60) NOT NULL,
        Anio            SMALLINT NULL,
        Color           NVARCHAR(40) NULL,
        FechaRegistro   DATETIME2(0) NOT NULL
            CONSTRAINT DF_Vehiculos_FechaRegistro DEFAULT SYSUTCDATETIME(),
        ActualizadoEn   DATETIME2(0) NULL,
        CONSTRAINT FK_Vehiculos_Clientes
            FOREIGN KEY (ClienteId) REFERENCES dbo.Clientes(ClienteId),
        CONSTRAINT CK_Vehiculos_Placa
            CHECK (LEN(LTRIM(RTRIM(Placa))) >= 2),
        CONSTRAINT CK_Vehiculos_Anio
            CHECK (Anio IS NULL OR Anio BETWEEN 1886 AND 2100),
        CONSTRAINT CK_Vehiculos_Vin
            CHECK (Vin IS NULL OR LEN(Vin) BETWEEN 11 AND 17)
    );
END;
GO

/* Historial de servicios de mantenimiento */
IF OBJECT_ID(N'dbo.ServiciosMantenimiento', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.ServiciosMantenimiento
    (
        ServicioId             INT IDENTITY(1,1) NOT NULL
            CONSTRAINT PK_ServiciosMantenimiento PRIMARY KEY,
        VehiculoId             INT NOT NULL,
        FechaServicio          DATETIME2(0) NOT NULL,
        TipoServicio           NVARCHAR(80) NOT NULL,
        Descripcion            NVARCHAR(2000) NOT NULL,
        Kilometraje            INT NULL,
        Costo                  DECIMAL(11,2) NOT NULL
            CONSTRAINT DF_Servicios_Costo DEFAULT 0,
        Tecnico                NVARCHAR(120) NULL,
        Recomendaciones        NVARCHAR(2000) NULL,
        ProximoMantenimiento   DATETIME2(0) NULL,
        FechaRegistro          DATETIME2(0) NOT NULL
            CONSTRAINT DF_Servicios_FechaRegistro DEFAULT SYSUTCDATETIME(),
        ActualizadoEn          DATETIME2(0) NULL,
        CONSTRAINT FK_Servicios_Vehiculos
            FOREIGN KEY (VehiculoId) REFERENCES dbo.Vehiculos(VehiculoId),
        CONSTRAINT CK_Servicios_Kilometraje
            CHECK (Kilometraje IS NULL OR Kilometraje >= 0),
        CONSTRAINT CK_Servicios_Costo CHECK (Costo >= 0),
        CONSTRAINT CK_Servicios_Fecha
            CHECK (ProximoMantenimiento IS NULL OR ProximoMantenimiento >= FechaServicio)
    );
END;
GO

/* Migración no destructiva para bases creadas con una versión anterior del script. */
IF COL_LENGTH(N'dbo.ServiciosMantenimiento', N'ActualizadoEn') IS NULL
BEGIN
    ALTER TABLE dbo.ServiciosMantenimiento
        ADD ActualizadoEn DATETIME2(0) NULL;
END;
GO

/* Índices y reglas de unicidad. Se crean por separado para reparar índices faltantes. */
IF NOT EXISTS
(
    SELECT 1 FROM sys.indexes
    WHERE object_id = OBJECT_ID(N'dbo.Clientes')
      AND name = N'UX_Clientes_Email'
)
BEGIN
    CREATE UNIQUE INDEX UX_Clientes_Email
        ON dbo.Clientes(Email)
        WHERE Email IS NOT NULL;
END;
GO

IF NOT EXISTS
(
    SELECT 1 FROM sys.indexes
    WHERE object_id = OBJECT_ID(N'dbo.Usuarios')
      AND name = N'UX_Usuarios_NombreUsuario'
)
BEGIN
    CREATE UNIQUE INDEX UX_Usuarios_NombreUsuario
        ON dbo.Usuarios(NombreUsuario);
END;
GO

IF NOT EXISTS
(
    SELECT 1 FROM sys.indexes
    WHERE object_id = OBJECT_ID(N'dbo.Vehiculos')
      AND name = N'UX_Vehiculos_Placa'
)
BEGIN
    CREATE UNIQUE INDEX UX_Vehiculos_Placa
        ON dbo.Vehiculos(Placa);
END;
GO

IF NOT EXISTS
(
    SELECT 1 FROM sys.indexes
    WHERE object_id = OBJECT_ID(N'dbo.Vehiculos')
      AND name = N'UX_Vehiculos_Vin'
)
BEGIN
    CREATE UNIQUE INDEX UX_Vehiculos_Vin
        ON dbo.Vehiculos(Vin)
        WHERE Vin IS NOT NULL;
END;
GO

IF NOT EXISTS
(
    SELECT 1 FROM sys.indexes
    WHERE object_id = OBJECT_ID(N'dbo.Vehiculos')
      AND name = N'IX_Vehiculos_ClienteId'
)
BEGIN
    CREATE INDEX IX_Vehiculos_ClienteId
        ON dbo.Vehiculos(ClienteId);
END;
GO

IF NOT EXISTS
(
    SELECT 1 FROM sys.indexes
    WHERE object_id = OBJECT_ID(N'dbo.ServiciosMantenimiento')
      AND name = N'IX_Servicios_Vehiculo_Fecha'
)
BEGIN
    CREATE INDEX IX_Servicios_Vehiculo_Fecha
        ON dbo.ServiciosMantenimiento(VehiculoId, FechaServicio DESC);
END;
GO
