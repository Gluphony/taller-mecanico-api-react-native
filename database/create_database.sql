/* Instalador de una base nueva. Ejecutar una sola vez con permisos de creación. */
IF DB_ID(N'TallerMecanicoDb') IS NULL
    EXEC(N'CREATE DATABASE [TallerMecanicoDb]');
GO

USE [TallerMecanicoDb];
GO

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
SET ANSI_PADDING ON;
SET ANSI_WARNINGS ON;
SET ARITHABORT ON;
SET CONCAT_NULL_YIELDS_NULL ON;
SET NUMERIC_ROUNDABORT OFF;
GO

CREATE TABLE dbo.Clientes
(
    ClienteId       INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Clientes PRIMARY KEY,
    NombreCompleto  NVARCHAR(120) NOT NULL,
    Telefono        NVARCHAR(30) NULL,
    Email           NVARCHAR(254) NULL,
    Direccion       NVARCHAR(250) NULL,
    FechaRegistro   DATETIME2(0) NOT NULL CONSTRAINT DF_Clientes_FechaRegistro DEFAULT SYSUTCDATETIME(),
    ActualizadoEn   DATETIME2(0) NULL,
    CONSTRAINT CK_Clientes_Nombre CHECK (LEN(LTRIM(RTRIM(NombreCompleto))) BETWEEN 2 AND 120)
);
GO

CREATE TABLE dbo.Usuarios
(
    UsuarioId      INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Usuarios PRIMARY KEY,
    NombreUsuario  NVARCHAR(80) NOT NULL,
    PasswordHash   NVARCHAR(256) NOT NULL,
    Rol            NVARCHAR(30) NOT NULL CONSTRAINT DF_Usuarios_Rol DEFAULT N'Administrador',
    Activo         BIT NOT NULL CONSTRAINT DF_Usuarios_Activo DEFAULT 1,
    FechaRegistro  DATETIME2(0) NOT NULL CONSTRAINT DF_Usuarios_FechaRegistro DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_Usuarios_Nombre CHECK (LEN(LTRIM(RTRIM(NombreUsuario))) BETWEEN 3 AND 80)
);
GO

CREATE TABLE dbo.Vehiculos
(
    VehiculoId     INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Vehiculos PRIMARY KEY,
    ClienteId      INT NOT NULL,
    Placa          NVARCHAR(12) NOT NULL,
    Vin            NVARCHAR(17) NULL,
    Marca          NVARCHAR(60) NOT NULL,
    Modelo         NVARCHAR(60) NOT NULL,
    Anio           SMALLINT NULL,
    Color          NVARCHAR(40) NULL,
    FechaRegistro  DATETIME2(0) NOT NULL CONSTRAINT DF_Vehiculos_FechaRegistro DEFAULT SYSUTCDATETIME(),
    ActualizadoEn  DATETIME2(0) NULL,
    CONSTRAINT FK_Vehiculos_Clientes FOREIGN KEY (ClienteId) REFERENCES dbo.Clientes(ClienteId),
    CONSTRAINT CK_Vehiculos_Placa CHECK (LEN(LTRIM(RTRIM(Placa))) BETWEEN 2 AND 12),
    CONSTRAINT CK_Vehiculos_PlacaFormato CHECK
        (Placa NOT LIKE N'%[^A-Z0-9 -]%'
         AND LEFT(LTRIM(RTRIM(Placa)), 1) LIKE N'[A-Z0-9]'
         AND RIGHT(LTRIM(RTRIM(Placa)), 1) LIKE N'[A-Z0-9]'),
    CONSTRAINT CK_Vehiculos_Marca CHECK (LEN(LTRIM(RTRIM(Marca))) BETWEEN 1 AND 60),
    CONSTRAINT CK_Vehiculos_Modelo CHECK (LEN(LTRIM(RTRIM(Modelo))) BETWEEN 1 AND 60),
    CONSTRAINT CK_Vehiculos_Anio CHECK (Anio IS NULL OR Anio BETWEEN 1886 AND 2100),
    CONSTRAINT CK_Vehiculos_Vin CHECK
        (Vin IS NULL OR (LEN(LTRIM(RTRIM(Vin))) BETWEEN 11 AND 17
         AND UPPER(Vin) NOT LIKE N'%[^A-Z0-9]%'
         AND UPPER(Vin) NOT LIKE N'%[IOQ]%'))
);
GO

CREATE TABLE dbo.ServiciosMantenimiento
(
    ServicioId            INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_ServiciosMantenimiento PRIMARY KEY,
    VehiculoId            INT NOT NULL,
    FechaServicio         DATETIME2(0) NOT NULL,
    TipoServicio          NVARCHAR(80) NOT NULL,
    Descripcion           NVARCHAR(2000) NOT NULL,
    Kilometraje           INT NULL,
    Costo                 DECIMAL(11,2) NOT NULL CONSTRAINT DF_Servicios_Costo DEFAULT 0,
    Tecnico               NVARCHAR(120) NULL,
    Recomendaciones       NVARCHAR(2000) NULL,
    ProximoMantenimiento  DATETIME2(0) NULL,
    FechaRegistro         DATETIME2(0) NOT NULL CONSTRAINT DF_Servicios_FechaRegistro DEFAULT SYSUTCDATETIME(),
    ActualizadoEn         DATETIME2(0) NULL,
    CONSTRAINT FK_Servicios_Vehiculos FOREIGN KEY (VehiculoId) REFERENCES dbo.Vehiculos(VehiculoId),
    CONSTRAINT CK_Servicios_Tipo CHECK (LEN(LTRIM(RTRIM(TipoServicio))) BETWEEN 2 AND 80),
    CONSTRAINT CK_Servicios_Descripcion CHECK (LEN(LTRIM(RTRIM(Descripcion))) BETWEEN 2 AND 2000),
    CONSTRAINT CK_Servicios_Kilometraje CHECK (Kilometraje IS NULL OR Kilometraje >= 0),
    CONSTRAINT CK_Servicios_Costo CHECK (Costo BETWEEN 0 AND 999999999.99),
    CONSTRAINT CK_Servicios_Fecha CHECK (ProximoMantenimiento IS NULL OR ProximoMantenimiento >= FechaServicio)
);
GO

CREATE UNIQUE INDEX UX_Clientes_Email
    ON dbo.Clientes(Email)
    WHERE Email IS NOT NULL;

CREATE UNIQUE INDEX UX_Usuarios_NombreUsuario
    ON dbo.Usuarios(NombreUsuario);

CREATE UNIQUE INDEX UX_Vehiculos_Placa
    ON dbo.Vehiculos(Placa);

CREATE UNIQUE INDEX UX_Vehiculos_Vin
    ON dbo.Vehiculos(Vin)
    WHERE Vin IS NOT NULL;

CREATE INDEX IX_Vehiculos_ClienteId
    ON dbo.Vehiculos(ClienteId);

CREATE INDEX IX_Servicios_Vehiculo_Fecha
    ON dbo.ServiciosMantenimiento(VehiculoId, FechaServicio DESC);
GO
